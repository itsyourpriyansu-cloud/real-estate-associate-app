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
  it('match the Vara light palette exactly', () => {
    expect(colors).toMatchObject({
      backgroundPrimary: '#F1F2F4',
      backgroundSecondary: '#F7F8F9',
      backgroundTertiary: '#EAEBEE',
      surfacePrimary: '#FFFFFF',
      surfaceSecondary: '#F5F6F8',
      surfaceElevated: '#FFFFFF',
      surfacePressed: '#E9EAEE',
      inkPrimary: '#121316',
      inkSecondary: '#2B2C31',
      surfaceInverse: '#17181B',
      surfaceInverseRaised: '#26272C',
      textOnInverse: '#F6F6F7',
      textOnInverseMuted: '#A9ABB3',
      textPrimary: '#121316',
      textSecondary: '#565860',
      textTertiary: '#666870',
      textDisabled: '#A6A8B0',
      textInverse: '#FFFFFF',
      borderSubtle: 'rgba(18,19,22,0.06)',
      borderMedium: 'rgba(18,19,22,0.10)',
      borderStrong: 'rgba(18,19,22,0.18)',
      brand: '#2E9B6A',
      brandStrong: '#167547',
    });
  });

  const lightSurfaces = [
    'backgroundPrimary',
    'backgroundSecondary',
    'backgroundTertiary',
    'surfacePrimary',
    'surfaceSecondary',
    'surfaceElevated',
  ] as const;

  it.each(lightSurfaces)('primary text is AAA (>= 7:1) on %s', (bg) => {
    expect(contrast(colors.textPrimary, colors[bg])).toBeGreaterThanOrEqual(7);
  });

  it.each(lightSurfaces)('secondary text is AA (>= 4.5:1) on %s', (bg) => {
    expect(contrast(colors.textSecondary, colors[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(lightSurfaces)('tertiary text is AA (>= 4.5:1) on %s', (bg) => {
    // The light theme lifts the old dark-theme exception: tertiary is now safe for meta and hints.
    expect(contrast(colors.textTertiary, colors[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('button labels are AAA: white text on the ink primary button, in both states', () => {
    expect(contrast(colors.textInverse, colors.inkPrimary)).toBeGreaterThanOrEqual(7);
    expect(contrast(colors.textInverse, colors.inkSecondary)).toBeGreaterThanOrEqual(7);
  });

  it.each(['surfaceInverse', 'surfaceInverseRaised'] as const)(
    'text on the charcoal %s is AA (primary AAA)',
    (bg) => {
      expect(contrast(colors.textOnInverse, colors[bg])).toBeGreaterThanOrEqual(7);
      expect(contrast(colors.textOnInverseMuted, colors[bg])).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('the green accent reaches AA where it carries text', () => {
    expect(contrast(colors.brandStrong, colors.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.brandStrong, colors.backgroundPrimary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.brandStrong, colors.brandSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.textInverse, colors.brandStrong)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['success', 'warning', 'danger', 'info'] as const)(
    'semantic %s is AA on the page and on cards and tiles',
    (key) => {
      expect(contrast(colors[key], colors.backgroundPrimary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors[key], colors.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors[key], colors.surfaceSecondary)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps semantic and brand colours out of the neutral surfaces and text', () => {
    const coloured = new Set<string>([
      colors.success,
      colors.warning,
      colors.danger,
      colors.info,
      colors.brand,
      colors.brandStrong,
    ]);
    const neutral = [
      'backgroundPrimary',
      'backgroundSecondary',
      'backgroundTertiary',
      'surfacePrimary',
      'surfaceSecondary',
      'surfaceElevated',
      'surfacePressed',
      'inkPrimary',
      'inkSecondary',
      'surfaceInverse',
      'surfaceInverseRaised',
      'textPrimary',
      'textSecondary',
      'textTertiary',
      'textDisabled',
    ] as const;
    for (const key of neutral) expect(coloured.has(colors[key])).toBe(false);
  });

  it('gives every tone a foreground, background and border', () => {
    for (const tone of ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const) {
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

  it('radius is generous and consistent: cards xl, tiles lg, controls md', () => {
    expect(radius).toEqual({ xs: 8, sm: 12, md: 16, lg: 20, xl: 28, pill: 999 });
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

  it('shadows are soft and wide: flat surfaces and tiles have none, overlays have the deepest', () => {
    for (const key of ['flat', 'tile'] as const) {
      expect(theme.elevation[key]).not.toHaveProperty('shadowRadius');
    }
    const shadowed = ['raised', 'elevated', 'overlay', 'inverse'] as const;
    for (const key of shadowed) {
      const { shadowOpacity, shadowRadius } = theme.elevation[key];
      expect(shadowOpacity).toBeLessThanOrEqual(0.25); // never a hard drop shadow
      expect(shadowRadius).toBeGreaterThanOrEqual(16); // always wide
    }
    expect(theme.elevation.overlay.shadowOpacity).toBeGreaterThan(
      theme.elevation.raised.shadowOpacity,
    );
  });

  it('motion has entrance, stagger, count-up and progress timings that stay under a second and a half', () => {
    expect(motion.staggerStep).toBeGreaterThanOrEqual(30);
    expect(motion.staggerStep).toBeLessThanOrEqual(60);
    expect(motion.staggerStep * motion.staggerMax).toBeLessThan(400);
    for (const ms of [motion.enterMs, motion.countUpMs, motion.progressFillMs]) {
      expect(ms).toBeGreaterThanOrEqual(300);
      expect(ms).toBeLessThanOrEqual(1500);
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

  it('status colours read on white cards (AA), so status is legible without its icon too', () => {
    for (const status of ['AVAILABLE', 'ON_HOLD', 'BLOCKED'] as const) {
      expect(
        contrast(plotStatusTokens[status].color, colors.surfacePrimary),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('composes one theme from the same token objects', () => {
    expect(theme.colors).toBe(colors);
    expect(theme.space).toBe(space);
    expect(theme.radius).toBe(radius);
    expect(theme.status.plot).toBe(plotStatusTokens);
  });
});
