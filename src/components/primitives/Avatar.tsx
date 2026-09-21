import { Image } from 'expo-image';
import { BadgeCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { colors, radius, typography } from '@/design-system';
import { initials } from '@/utils/format';

import { AppText } from './AppText';
import { Icon } from './Icon';

const sizes = { sm: 32, md: 40, lg: 56 } as const;
const initialsStyle = {
  sm: typography.labelMD,
  md: typography.labelLG,
  lg: typography.headingSM,
} as const;

export interface AvatarProps {
  name: string;
  /** A remote photo URL. `placeholder://` keys and missing values fall back to initials. */
  imageUrl?: string;
  size?: keyof typeof sizes;
  verified?: boolean;
}

/** Photo with an initials fallback — never a generic silhouette. */
export function Avatar({ name, imageUrl, size = 'md', verified }: AvatarProps) {
  const dimension = sizes[size];
  const hasPhoto = !!imageUrl && !imageUrl.startsWith('placeholder://');
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={verified ? `${name}, verified` : name}
      style={{ width: dimension, height: dimension }}
    >
      <View
        style={{
          width: dimension,
          height: dimension,
          borderRadius: radius.pill,
          overflow: 'hidden',
          backgroundColor: colors.brandSoft,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasPhoto ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: dimension, height: dimension }}
            contentFit="cover"
          />
        ) : (
          <AppText style={initialsStyle[size]} tone="brand">
            {initials(name)}
          </AppText>
        )}
      </View>
      {verified ? (
        <View
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            backgroundColor: colors.surfacePrimary,
            borderRadius: radius.pill,
          }}
        >
          <Icon icon={BadgeCheck} size="sm" color={colors.brandStrong} />
        </View>
      ) : null}
    </View>
  );
}
