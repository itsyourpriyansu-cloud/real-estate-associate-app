import { View } from 'react-native';

import { space } from '@/design-system';

import { Button } from '../../buttons/Button';
import { AppText } from '../../primitives/AppText';
import { Surface } from '../../primitives/Surface';

/** A message template (Share project, Site visit reminder…) with a preview and a "Use template" action. */
export function WhatsAppTemplateCard({
  title,
  preview,
  onUse,
}: {
  title: string;
  preview: string;
  onUse?: () => void;
}) {
  return (
    <Surface padding={16} style={{ gap: space[12] }}>
      <View style={{ gap: space[4] }}>
        <AppText variant="headingSM">{title}</AppText>
        <AppText variant="bodySM" tone="secondary" numberOfLines={3}>
          {preview}
        </AppText>
      </View>
      <Button
        label="Use template"
        variant="secondary"
        size="small"
        onPress={onUse}
        accessibilityLabel={`Use ${title} template`}
      />
    </Surface>
  );
}
