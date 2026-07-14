import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { radius, shadows, spacing } from '@/constants/spacing';

/**
 * Static skeleton placeholder shown while listings load. Mirrors the layout of
 * `PropertyCard` so the transition to real content is not jarring.
 */
function LoadingCardComponent() {
  return (
    <View style={styles.card} accessible accessibilityLabel="Yuklanmoqda">
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={[styles.line, styles.lineWide]} />
        <View style={[styles.line, styles.lineMedium]} />
        <View style={[styles.line, styles.lineNarrow]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    height: 170,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  line: {
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  lineWide: {
    width: '70%',
    height: 18,
  },
  lineMedium: {
    width: '50%',
  },
  lineNarrow: {
    width: '35%',
  },
});

export const LoadingCard = memo(LoadingCardComponent);
