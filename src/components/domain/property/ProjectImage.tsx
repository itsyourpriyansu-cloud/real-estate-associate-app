import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { colors } from '@/design-system';

/** Stable 32-bit hash of a string, so the same project always draws the same artwork. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

const COLS = 9;
const ROWS = 4;

/**
 * Controlled local placeholder for project imagery: an abstract, monochrome layout plan drawn with
 * SVG — plots, roads and a single highlighted plot — generated deterministically from the project
 * key. It ships no image files, looks intentional rather than empty, and is replaced automatically
 * when a project has a real image URL.
 */
function SitePlanArt({ seed, height }: { seed: string; height: number }) {
  const h = hash(seed);
  const highlight = (h >> 3) % (COLS * ROWS);
  const roadRow = 1 + (h % 2); // horizontal boulevard between rows
  const cellW = 320 / COLS;
  const ROAD_GAP = 10;
  const cellH = (136 - ROAD_GAP) / ROWS;

  return (
    <View style={{ height, backgroundColor: colors.backgroundTertiary, overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox="0 0 320 136" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: COLS * ROWS }, (_, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);
          const inset = 4;
          const y = row * cellH + (row >= roadRow ? ROAD_GAP : 0);
          return (
            <Rect
              key={index}
              x={col * cellW + inset}
              y={y + inset}
              width={cellW - inset * 2}
              height={cellH - inset * 2}
              rx={2}
              fill={index === highlight ? colors.textSecondary : colors.surfaceSecondary}
              fillOpacity={index === highlight ? 0.55 : 1}
              stroke={colors.borderMedium}
              strokeWidth={1}
            />
          );
        })}
        <Line
          x1={0}
          x2={320}
          y1={roadRow * cellH + ROAD_GAP / 2}
          y2={roadRow * cellH + ROAD_GAP / 2}
          stroke={colors.borderStrong}
          strokeWidth={1}
          strokeDasharray="6 6"
        />
      </Svg>
    </View>
  );
}

/** Project imagery: a remote URL renders as a photo; a `placeholder://` key renders the site-plan artwork. */
export function ProjectImage({
  source,
  height = 148,
  accessibilityLabel,
}: {
  source: string;
  height?: number;
  accessibilityLabel?: string;
}) {
  const isRemote = /^https?:\/\//.test(source);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? 'Project layout illustration'}
    >
      {isRemote ? (
        <Image
          source={{ uri: source }}
          style={{ height, width: '100%' }}
          contentFit="cover"
          transition={140}
        />
      ) : (
        <SitePlanArt seed={source} height={height} />
      )}
    </View>
  );
}
