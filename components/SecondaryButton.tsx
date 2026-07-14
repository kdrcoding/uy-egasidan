import { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/colors';
import { HIT_TARGET, radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: IoniconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function SecondaryButtonComponent({
  title,
  onPress,
  icon,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        <Text style={[styles.title, disabled && styles.disabledText]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: HIT_TARGET + 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    backgroundColor: colors.primaryLight,
  },
  disabled: {
    borderColor: colors.border,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

export const SecondaryButton = memo(SecondaryButtonComponent);
