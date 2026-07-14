import { memo } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { HIT_TARGET, radius } from '@/constants/spacing';
import { useFavoritesContext } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  propertyId: string;
  /** Larger, higher-contrast variant for use over images / on the detail screen. */
  variant?: 'card' | 'floating';
  style?: StyleProp<ViewStyle>;
}

function FavoriteButtonComponent({
  propertyId,
  variant = 'card',
  style,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const active = isFavorite(propertyId);

  return (
    <Pressable
      onPress={() => toggleFavorite(propertyId)}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'floating' ? styles.floating : styles.card,
        pressed && styles.pressed,
        style,
      ]}>
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={20}
        color={active ? colors.danger : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: HIT_TARGET,
    height: HIT_TARGET,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  floating: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
});

export const FavoriteButton = memo(FavoriteButtonComponent);
