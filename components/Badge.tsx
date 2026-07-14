import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type BadgeVariant = 'trust' | 'info' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  icon?: IoniconName;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; fg: string }> = {
  trust: { bg: colors.trustLight, fg: colors.trust },
  info: { bg: colors.infoLight, fg: colors.info },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
};

function BadgeComponent({ label, icon, variant = 'neutral', style }: BadgeProps) {
  const palette = VARIANT_COLORS[variant];
  return (
    <View
      style={[styles.badge, { backgroundColor: palette.bg }, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}>
      {icon ? <Ionicons name={icon} size={13} color={palette.fg} /> : null}
      <Text style={[styles.label, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});

export const Badge = memo(BadgeComponent);
