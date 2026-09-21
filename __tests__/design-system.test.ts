import { plotStatusSchema } from '@/domain';
import {
  colors,
  duration,
  iconSize,
  layout,
  motion,
  opacity,
  plotStatusTokens,
  radius,
  space,
  theme,
  toneColors,
  typography,
} from '@/design-system';
import { interFontAssets } from '@/design-system/fonts';
import { fontFamily } from '@/design-system/typography';

/** WCAG 2.x relative luminance / contrast for `#RRGGBB` colours. */
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

describe('colour tokens', () => {
  it('match the Stage 2 palette exactly', () => {
    expect(colors).toMatchObject({
      backgroundPrimary: '#070707',
      backgroundSecondary: '#0D0D0D',
      backgroundTertiary: '#121212',
      surfacePrimary: '#111111',
      surfaceSecondary: '#171717',
      surfaceElevated: '#1D1D1D',
      surfacePressed: '#232323',
      whitePrimary: '#F7F7F5',
      whiteSecondary: '#E8E8E5',
      textPrimary: '#F5F5F3',
      textSecondary: '#A7A7A2',
      textTertiary: '#72726E',
      textDisabled: '#51514E',
      borderSubtle: 'rgba(255,255,255,0.08)',
      borderMedium: 'rgba(255,255,255,0.14)',
      borderStrong: 'rgba(255,255,255,0.22)',
    });
  });

  const backgrounds = [
    'backgroundPrimary',
    'backgroundSecondary',
    'backgroundTertiary',
    'surfacePrimary',
    'surfaceSecondary',
    'surfaceElevated',
  ] as const;

  it.each(backgrounds)('primary text is AAA (>= 7:1) on %s', (bg) => {
    expect(contrast(colors.textPrimary, colors[bg])).toBeGreaterThanOrEqual(7);
  });

  it.each(backgrounds)('secondary text is AA (>= 4.5:1) on %s', (bg) => {
    expect(contrast(colors.textSecondary, colors[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('tertiary text is documented as below AA and only for non-essential text: >= 3:1 (WCAG non-text minimum)', () => {
    // #72726E is the brief's value. It does NOT reach 4.5:1, so essential text (timestamps, counts,
    // labels) uses textSecondary; tertiary is limited to placeholders, chevrons and completed items.
    for (const bg of backgrounds) {
      const ratio = contrast(colors.textTertiary, colors[bg]);
      expect(ratio).toBeGreaterThanOrEqual(3);
      expect(ratio).toBeLessThan(4.5);
    }
  });

  it('button labels are AAA: inverse text on the white primary button', () => {
    expect(contrast(colors.textInverse, colors.whitePrimary)).toBeGreaterThanOrEqual(7);
    expect(contrast(colors.textInverse, colors.whiteSecondary)).toBeGreaterThanOrEqual(7);
  });

  it.each(['success', 'warning', 'danger', 'info'] as const)(
    'semantic %s is AA on the page and on cards',
    (key) => {
      expect(contrast(colors[key], colors.backgroundPrimary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors[key], colors.surfaceSecondary)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps semantic colours out of the neutral surfaces and text', () => {
    const semantic = new Set<string>([colors.success, colors.warning, colors.danger, colors.info]);
    const neutral = [
      'backgroundPrimary',
      'backgroundSecondary',
      'backgroundTertiary',
      'surfacePrimary',
      'surfaceSecondary',
      'surfaceElevated',
      'surfacePressed',
      'whitePrimary',
      'whiteSecondary',
      'textPrimary',
      'textSecondary',
      'textTertiary',
      'textDisabled',
    ] as const;
    for (const key of neutral) expect(semantic.has(colors[key])).toBe(false);
  });

  it('gives every tone a foreground, background and border', () => {
    for (const tone of ['neutral', 'success', 'warning', 'danger', 'info'] as const) {
      expect(toneColors[tone]).toEqual({
        fg: expect.any(String),
        bg: expect.any(String),
        border: expect.any(String),
      });
    }
  });
});

describe('spacing, radius, elevation, motion', () => {
  it('spacing is a 4-point scale keyed by its pixel value', () => {
    expect(Object.keys(space).map(Number)).toEqual([2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64]);
    for (const [key, value] of Object.entries(space)) expect(value).toBe(Number(key));
  });

  it('page gutter is 20 and section gaps are 32–40', () => {
    expect(layout.screenPaddingX).toBe(20);
    expect(layout.sectionGap).toBe(32);
    expect(layout.sectionGapLarge).toBe(40);
  });

  it('interactive targets are at least 44', () => {
    expect(layout.minTapTarget).toBeGreaterThanOrEqual(44);
  });

  it('radius is restrained', () => {
    expect(radius).toEqual({ xs: 6, sm: 10, md: 14, lg: 18, xl: 24, pill: 999 });
  });

  it('icons: 18–22 is the working range', () => {
    expect([iconSize.md, iconSize.lg, iconSize.xl]).toEqual([18, 20, 22]);
  });

  it('durations sit in the specified windows', () => {
    expect(duration.fast).toBeGreaterThanOrEqual(120);
    expect(duration.fast).toBeLessThanOrEqual(160);
    expect(duration.standard).toBeGreaterThanOrEqual(180);
    expect(duration.standard).toBeLessThanOrEqual(240);
    expect(duration.slow).toBeGreaterThanOrEqual(280);
    expect(duration.slow).toBeLessThanOrEqual(360);
    expect(duration.instant).toBeLessThan(duration.fast);
  });

  it('press scales are subtle and disabled is visibly dimmer than pressed', () => {
    for (const scale of [motion.pressScaleCard, motion.pressScaleButton, motion.pressScaleChip]) {
      expect(scale).toBeGreaterThanOrEqual(0.9);
      expect(scale).toBeLessThan(1);
    }
    expect(opacity.disabled).toBeLessThan(opacity.pressed);
  });

  it('only overlays are allowed a shadow', () => {
    expect(theme.elevation.overlay).toHaveProperty('shadowRadius');
    for (const key of ['flat', 'raised', 'elevated'] as const) {
      expect(theme.elevation[key]).not.toHaveProperty('shadowRadius');
    }
  });
});

describe('typography', () => {
  const NAMES = [
    'displayLarge',
    'displayMedium',
    'headingXL',
    'headingLG',
    'headingMD',
    'headingSM',
    'bodyLG',
    'bodyMD',
    'bodySM',
    'labelLG',
    'labelMD',
    'labelSM',
    'caption',
    'metricXL',
    'metricLG',
    'metricMD',
    'tabLabel',
    'buttonLG',
    'buttonMD',
  ];

  it('defines every requested style', () => {
    expect(Object.keys(typography).sort()).toEqual([...NAMES].sort());
  });

  it('has a line-height comfortably above the font size', () => {
    for (const style of Object.values(typography)) {
      expect((style.lineHeight ?? 0) / (style.fontSize ?? 1)).toBeGreaterThanOrEqual(1.1);
    }
  });

  it('uses tabular numerals for all metrics and none for body text', () => {
    for (const key of ['metricXL', 'metricLG', 'metricMD'] as const) {
      expect(typography[key].fontVariant).toEqual(['tabular-nums']);
    }
    expect(typography.bodyMD).not.toHaveProperty('fontVariant');
  });

  it('ships exactly three weights, so no screen can exceed three', () => {
    expect(Object.values(fontFamily)).toHaveLength(3);
    const used = new Set(Object.values(typography).map((style) => style.fontFamily));
    expect(used.size).toBeLessThanOrEqual(3);
  });

  it('every style uses a font that is actually loaded', () => {
    const loaded = new Set(Object.keys(interFontAssets));
    for (const style of Object.values(typography))
      expect(loaded.has(style.fontFamily ?? '')).toBe(true);
    expect(Object.values(fontFamily).sort()).toEqual([...loaded].sort());
  });
});

describe('status language', () => {
  it('gives every plot status a label, tone and a distinct non-colour icon', () => {
    for (const status of plotStatusSchema.options) {
      expect(plotStatusTokens[status].label.length).toBeGreaterThan(0);
      expect(['dot', 'clock', 'check', 'lock', 'minus']).toContain(plotStatusTokens[status].icon);
    }
    expect(new Set(plotStatusSchema.options.map((s) => plotStatusTokens[s].icon)).size).toBe(5);
  });

  it('composes one theme from the same token objects', () => {
    expect(theme.colors).toBe(colors);
    expect(theme.space).toBe(space);
    expect(theme.radius).toBe(radius);
    expect(theme.status.plot).toBe(plotStatusTokens);
  });
});
