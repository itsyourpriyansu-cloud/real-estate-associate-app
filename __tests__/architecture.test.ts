import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const rel = (file: string) => path.relative(root, file).split(path.sep).join('/');
const read = (file: string) => fs.readFileSync(file, 'utf8');

/** Files that render UI or orchestrate it — the layers that must never see raw seed data. */
const presentationFiles = ['app', 'src/features', 'src/components', 'src/hooks'].flatMap((dir) =>
  walk(path.join(root, dir)),
);

const importsOf = (source: string) =>
  [...source.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((m) => m[1] ?? '');

describe('architecture rules', () => {
  it('scans a non-trivial number of presentation files (guards against a silently empty scan)', () => {
    expect(presentationFiles.length).toBeGreaterThan(15);
  });

  it('NO screen, feature, component or hook imports seed fixtures', () => {
    const offenders = presentationFiles.filter((file) =>
      importsOf(read(file)).some((spec) => /(^|\/)seed(\/|$)/.test(spec)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('NO screen, feature, component or hook imports a mock repository directly', () => {
    const offenders = presentationFiles.filter((file) =>
      importsOf(read(file)).some((spec) => /repositories\/mock/.test(spec)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('repository contracts depend on the domain only — never on mocks, seeds or services', () => {
    const offenders = walk(path.join(root, 'src/repositories/contracts')).filter((file) =>
      importsOf(read(file)).some((spec) => /seed|mock|services|store/.test(spec)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('only the mock layer and the seed layer import seed fixtures', () => {
    const allowed = /^src\/(seed|repositories\/mock)\//;
    const offenders = walk(path.join(root, 'src'))
      .filter((file) => importsOf(read(file)).some((spec) => /(^|\/)seed(\/|$)/.test(spec)))
      .map(rel)
      .filter((file) => !allowed.test(file));
    expect(offenders).toEqual([]);
  });

  it('every repository contract has a mock implementation', () => {
    const contracts = fs
      .readdirSync(path.join(root, 'src/repositories/contracts'))
      .filter((f) => /^[A-Z]\w+Repository\.ts$/.test(f))
      .map((f) => f.replace('.ts', ''));
    expect(contracts.sort()).toEqual([
      'ConversationRepository',
      'LeadRepository',
      'NotificationRepository',
      'PlotRepository',
      'ProjectRepository',
      'SalesRepository',
      'SummaryRepository',
      'TaskRepository',
      'TeamRepository',
      'UserRepository',
      'VisitRepository',
    ]);
    for (const name of contracts) {
      const mockFile = path.join(root, 'src/repositories/mock', `Mock${name}.ts`);
      expect(fs.existsSync(mockFile)).toBe(true);
      expect(read(mockFile)).toContain(`implements ${name}`);
    }
  });

  it('keeps raw hex colours inside the design-system colour tokens only', () => {
    const hex = /['"`]#[0-9a-fA-F]{3,8}['"`]/;
    const offenders = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))]
      .filter((file) => rel(file) !== 'src/design-system/colors.ts')
      .filter((file) => hex.test(read(file)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('does not use `any` in application code', () => {
    const offenders = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
      (file) => /:\s*any\b|\bas any\b|<any>/.test(read(file)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });
});

describe('design-system rules (Stage 2)', () => {
  const uiFiles = ['app', 'src/features', 'src/components'].flatMap((dir) =>
    walk(path.join(root, dir)),
  );

  it('scans the UI layer (guards against a silently empty scan)', () => {
    expect(uiFiles.length).toBeGreaterThan(80);
  });

  it('has no literal radius, spacing, type, shadow or animation values — everything is a token', () => {
    // Widths, heights and other component *dimensions* are allowed; the design tokens govern the rest.
    // 0 is not an arbitrary value, so it is allowed (e.g. paddingVertical: 0).
    const literal =
      /\b(borderRadius|border(Top|Bottom)(Left|Right)Radius|padding\w*|margin\w*|gap|rowGap|columnGap|fontSize|lineHeight|letterSpacing|shadow(Radius|Opacity|Offset)|elevation|duration)\s*:\s*-?[1-9]/;
    const offenders = uiFiles
      .flatMap((file) =>
        read(file)
          .split('\n')
          .map((line, index) => ({ file: rel(file), line: index + 1, text: line.trim() }))
          .filter(
            ({ text }) => literal.test(text) && !text.startsWith('//') && !text.startsWith('*'),
          ),
      )
      .map(({ file, line, text }) => `${file}:${line}  ${text.slice(0, 80)}`);
    expect(offenders).toEqual([]);
  });

  it('never imports repositories (other than contracts), stores or seeds inside src/components', () => {
    const offenders = walk(path.join(root, 'src/components')).filter((file) =>
      importsOf(read(file)).some(
        (spec) =>
          /^@\/(store|seed)/.test(spec) ||
          (/^@\/repositories/.test(spec) && !/contracts/.test(spec)),
      ),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('never uses raw React Native Text / Pressable / Switch / TextInput in screens or features', () => {
    const raw =
      /import\s*\{[^}]*\b(Text|Pressable|TouchableOpacity|TouchableHighlight|Switch|TextInput)\b[^}]*\}\s*from\s*'react-native'/;
    const offenders = [
      ...walk(path.join(root, 'app')),
      ...walk(path.join(root, 'src/features')),
    ].filter((file) => raw.test(read(file)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('gives every interactive primitive a role: no bare Pressable without accessibilityRole in components', () => {
    const offenders = walk(path.join(root, 'src/components')).filter((file) => {
      const source = read(file);
      return [...source.matchAll(/<Pressable\b(?:=>|[^>])*>/g)].some(
        (match) => !/accessibilityRole|accessible=\{false\}/.test(match[0]),
      );
    });
    expect(offenders.map(rel)).toEqual([]);
  });

  it('registers the design-system gallery only for development builds', () => {
    const layout = read(path.join(root, 'app/_layout.tsx'));
    expect(layout).toMatch(/<Stack\.Protected guard=\{__DEV__\}>[\s\S]*dev\/design-system/);
    expect(read(path.join(root, 'app/dev/design-system.tsx'))).toContain('if (!__DEV__)');
  });
});

describe('route tree (docs/SCREEN_MAP.md)', () => {
  const routeFiles = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/+not-found.tsx',
    'app/dev/design-system.tsx',
    // (public): signed out
    'app/(public)/_layout.tsx',
    'app/(public)/home.tsx',
    'app/(public)/associate-login.tsx',
    'app/(public)/otp.tsx',
    // (guest): guest only
    'app/(guest)/_layout.tsx',
    'app/(guest)/guest-home.tsx',
    // (associate): dashboard + the seven sections
    'app/(associate)/_layout.tsx',
    'app/(associate)/dashboard.tsx',
    'app/(associate)/live-booking/index.tsx',
    'app/(associate)/live-booking/[plotId].tsx',
    'app/(associate)/price-calculator.tsx',
    'app/(associate)/site-visits/index.tsx',
    'app/(associate)/site-visits/[visitId].tsx',
    'app/(associate)/team-sales.tsx',
    'app/(associate)/team/index.tsx',
    'app/(associate)/team/add.tsx',
    'app/(associate)/team/[memberId].tsx',
    'app/(associate)/profile.tsx',
    'app/(associate)/settings.tsx',
    // shared by every session except signed out
    'app/projects/index.tsx',
    'app/projects/[projectId].tsx',
    'app/projects/[projectId]/inventory.tsx',
    'app/projects/[projectId]/gallery.tsx',
    'app/plots/[plotId].tsx',
    'app/prototype-controls.tsx',
  ];

  it.each(routeFiles)('has %s', (file) => {
    expect(fs.existsSync(path.join(root, file))).toBe(true);
  });

  it('has no tab shell: the CRM routes are parked, not routed', () => {
    for (const parked of [
      'app/(tabs)',
      'app/(auth)',
      'app/leads',
      'app/visits',
      'app/conversations',
      'app/notifications.tsx',
      'app/search.tsx',
      'app/profile.tsx',
      'app/settings.tsx',
    ]) {
      expect({ parked, exists: fs.existsSync(path.join(root, parked)) }).toEqual({
        parked,
        exists: false,
      });
    }
    expect(walk(path.join(root, 'app')).some((file) => /Tabs/.test(read(file)))).toBe(false);
  });

  it('guards each group in the root layout with its own session access flag', () => {
    const layout = read(path.join(root, 'app/_layout.tsx'));
    const blocks = new Map(
      [
        ...layout.matchAll(/<Stack\.Protected guard=\{([^}]+)\}>([\s\S]*?)<\/Stack\.Protected>/g),
      ].map(
        (m) =>
          [m[1] ?? '', [...(m[2] ?? '').matchAll(/name="([^"]+)"/g)].map((n) => n[1])] as const,
      ),
    );
    expect(Object.fromEntries(blocks)).toEqual({
      'access.public': ['(public)'],
      'access.guest': ['(guest)'],
      'access.associate': ['(associate)'],
      'access.shared': [
        'projects/index',
        'projects/[projectId]',
        'projects/[projectId]/inventory',
        'projects/[projectId]/gallery',
        'plots/[plotId]',
        'prototype-controls',
      ],
      __DEV__: ['dev/design-system'],
    });
  });

  it('registers every top-level route file in the root layout (nothing is silently unguarded)', () => {
    const layout = read(path.join(root, 'app/_layout.tsx'));
    const appDir = path.join(root, 'app');
    const topLevel = walk(appDir)
      .map((file) => path.relative(appDir, file).split(path.sep).join('/'))
      .filter((file) => !/^\(.*?\)\//.test(file)) // group contents are guarded by their group
      .filter((file) => !/(^|\/)_layout\.tsx$/.test(file) && !file.startsWith('+'))
      .map((file) => file.replace(/\.tsx$/, ''));

    for (const name of topLevel) {
      if (name === 'index') continue;
      expect({ name, registered: layout.includes(`name="${name}"`) }).toEqual({
        name,
        registered: true,
      });
    }
  });
});

describe('spec folder structure', () => {
  const dirs = [
    'src/components/primitives',
    'src/components/feedback',
    'src/components/navigation',
    'src/components/domain',
    'src/design-system',
    'src/domain',
    'src/repositories/contracts',
    'src/repositories/mock',
    'src/seed',
    'src/services',
    'src/store',
    'src/hooks',
    'src/utils',
    'src/constants',
    'src/types',
    'assets/images',
    'assets/project-placeholders',
    'assets/fonts',
    'docs',
    '__tests__',
    ...[
      'auth',
      'home',
      'leads',
      'projects',
      'inventory',
      'tasks',
      'visits',
      'inbox',
      'notifications',
      'search',
      'profile',
    ].map((f) => `src/features/${f}`),
  ];

  it.each(dirs)('has %s', (dir) => {
    expect(fs.existsSync(path.join(root, dir))).toBe(true);
  });

  it.each(['colors', 'spacing', 'typography', 'radius', 'elevation', 'motion', 'theme', 'index'])(
    'has design-system/%s.ts',
    (name) => {
      expect(fs.existsSync(path.join(root, `src/design-system/${name}.ts`))).toBe(true);
    },
  );
});
