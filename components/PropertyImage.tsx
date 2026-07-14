import { memo, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

interface PropertyImageProps {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

/**
 * Renders a remote listing image and falls back to a neutral placeholder when
 * the URL is missing or fails to load, so a broken image never breaks a card.
 */
function PropertyImageComponent({ uri, style, accessibilityLabel }: PropertyImageProps) {
  // Track which URL failed rather than a boolean, so a source change (e.g.
  // gallery navigation) automatically clears the error without an effect.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = !!uri && failedUri === uri;

  if (!uri || failed) {
    return (
      <View
        style={[styles.placeholder, style]}
        accessible
        accessibilityLabel={accessibilityLabel ?? 'Rasm mavjud emas'}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setFailedUri(uri)}
      accessible
      accessibilityLabel={accessibilityLabel ?? 'Uy rasmi'}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const PropertyImage = memo(PropertyImageComponent);
