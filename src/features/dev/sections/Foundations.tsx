import { View } from 'react-native';

import { AppText, Surface } from '@/components/primitives';
import {
  colors,
  elevation,
  radius,
  space,
  typography,
  type TypographyToken,
} from '@/design-system';

import { ShowcaseSection, Specimen } from '../ShowcaseSection';

const SAMPLES: Record<TypographyToken, string> = {
  displayLarge: 'Your day',
  displayMedium: 'Your sales day',
  headingXL: 'Rahul Sharma',
  headingLG: 'Real Rise',
  headingMD: 'Today’s visits',
  headingSM: 'Site visit · Real Rise',
  bodyLG: 'Follow up on the Real Rise shortlist.',
  bodyMD: 'Budget ₹40–55L, east facing, self use.',
  bodySM: 'Referred by Kavitha Menon.',
  labelLG: 'Mark complete',
  labelMD: 'Bangalore Highway',
  labelSM: 'Next action',
  caption: '2 min ago',
  metricXL: '₹1,24,56,000',
  metricLG: '₹42.8L',
  metricMD: '240 sq yd',
  tabLabel: 'Projects',
  buttonLG: 'Continue',
  buttonMD: 'Open lead',
};

const SWATCH_GROUPS: { label: string; keys: (keyof typeof colors)[] }[] = [
  {
    label: 'Backgrounds',
    keys: ['backgroundPrimary', 'backgroundSecondary', 'backgroundTertiary'],
  },
  {
    label: 'Surfaces',
    keys: ['surfacePrimary', 'surfaceSecondary', 'surfaceElevated', 'surfacePressed'],
  },
  { label: 'Ink', keys: ['inkPrimary', 'inkSecondary'] },
  {
    label: 'Inverse (charcoal)',
    keys: ['surfaceInverse', 'surfaceInverseRaised', 'textOnInverse', 'textOnInverseMuted'],
  },
  { label: 'Brand (green)', keys: ['brand', 'brandStrong', 'brandMuted', 'brandSoft'] },
  { label: 'Text', keys: ['textPrimary', 'textSecondary', 'textTertiary', 'textDisabled'] },
  { label: 'Borders', keys: ['borderSubtle', 'borderMedium', 'borderStrong'] },
  { label: 'Semantic (state only)', keys: ['success', 'warning', 'danger', 'info'] },
];

export function Foundations() {
  return (
    <>
      <ShowcaseSection title="Typography" note="Inter, three weights. Numbers use tabular figures.">
        {(Object.keys(SAMPLES) as TypographyToken[]).map((token) => (
          <Specimen
            key={token}
            label={`${token} · ${typography[token].fontSize}/${typography[token].lineHeight}`}
          >
            <AppText variant={token} numberOfLines={1}>
              {SAMPLES[token]}
            </AppText>
          </Specimen>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title="Colour"
        note="Soft grey page, white cards, ink actions. Green is the only accent; semantic colours mark state only."
      >
        {SWATCH_GROUPS.map((group) => (
          <Specimen key={group.label} label={group.label}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
              {group.keys.map((key) => (
                <View key={key} style={{ width: 96, gap: space[6] }}>
                  <View
                    style={{
                      height: 44,
                      borderRadius: radius.sm,
                      backgroundColor: colors[key],
                      borderWidth: 1,
                      borderColor: colors.borderMedium,
                    }}
                  />
                  <AppText variant="caption" tone="secondary" numberOfLines={1}>
                    {key}
                  </AppText>
                </View>
              ))}
            </View>
          </Specimen>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title="Spacing, radius and elevation"
        note="4-point scale; 20px page gutter; depth from tone + hairline, not shadow."
      >
        <Specimen label="Spacing">
          <View style={{ gap: space[6] }}>
            {Object.entries(space).map(([key, value]) => (
              <View
                key={key}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}
              >
                <AppText variant="caption" tone="secondary" style={{ width: 24 }}>
                  {key}
                </AppText>
                <View
                  style={{
                    width: value,
                    height: 8,
                    backgroundColor: colors.inkSecondary,
                    borderRadius: radius.xs,
                  }}
                />
              </View>
            ))}
          </View>
        </Specimen>
        <Specimen label="Radius">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
            {Object.entries(radius).map(([key, value]) => (
              <View key={key} style={{ alignItems: 'center', gap: space[6] }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: value,
                    backgroundColor: colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: colors.borderMedium,
                  }}
                />
                <AppText variant="caption" tone="secondary">
                  {key} {value === 999 ? '' : value}
                </AppText>
              </View>
            ))}
          </View>
        </Specimen>
        <Specimen label="Elevation">
          <View style={{ gap: space[12] }}>
            {(Object.keys(elevation) as (keyof typeof elevation)[]).map((variant) => (
              <Surface key={variant} variant={variant} padding={16}>
                <AppText variant="labelLG">{variant}</AppText>
              </Surface>
            ))}
          </View>
        </Specimen>
      </ShowcaseSection>
    </>
  );
}
