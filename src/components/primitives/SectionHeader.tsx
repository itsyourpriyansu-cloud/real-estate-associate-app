import { ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { hitSlop, layout, space } from '@/design-system';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Row } from './Layout';

export interface SectionHeaderProps {
  title: string;
  /** Small secondary text beside the title, e.g. a count. */
  meta?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

/** Section title with an optional quiet text action ("See all"). */
export function SectionHeader({ title, meta, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <Row justify="space-between" style={{ minHeight: 28 }}>
      <Row gap={8}>
        <AppText variant="headingSM" header>
          {title}
        </AppText>
        {meta ? (
          <AppText variant="labelMD" tone="secondary">
            {meta}
          </AppText>
        ) : null}
      </Row>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={{
            minHeight: layout.minTapTarget,
            justifyContent: 'center',
            marginVertical: -space[8],
          }}
        >
          <Row gap={2}>
            <AppText variant="labelLG" tone="secondary">
              {actionLabel}
            </AppText>
            <Icon icon={ChevronRight} size="sm" tone="secondary" />
          </Row>
        </Pressable>
      ) : null}
    </Row>
  );
}
