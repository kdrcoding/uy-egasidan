import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { HIT_TARGET, radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** When true, shows a small "x" to signal the chip clears an active filter. */
  removable?: boolean;
}

function FilterChipComponent({
  label,
  selected = false,
  onPress,
  removable = false,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}>
      <View style={styles.content}>
        <Text
          style={[styles.label, selected && styles.labelSelected]}
          numberOfLines={1}>
          {label}
        </Text>
        {removable ? (
          <Ionicons
            name="close"
            size={14}
            color={selected ? colors.textInverse : colors.textSecondary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: HIT_TARGET - 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.75,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
});

export const FilterChip = memo(FilterChipComponent);
