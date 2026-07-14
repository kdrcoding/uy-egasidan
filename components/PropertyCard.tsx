import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/Badge';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PropertyImage } from '@/components/PropertyImage';
import { colors } from '@/constants/colors';
import { radius, shadows, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useLanguage } from '@/context/LanguageContext';
import type { Property } from '@/types/property';
import { formatArea, formatPrice } from '@/utils/currency';

interface PropertyCardProps {
  property: Property;
  onPress: (id: string) => void;
}

function MetaItem({ icon, text }: { icon: 'bed-outline' | 'resize-outline' | 'business-outline'; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={15} color={colors.textSecondary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function PropertyCardComponent({ property, onPress }: PropertyCardProps) {
  const { t } = useLanguage();
  const cover = property.images.length > 0 ? property.images[0] : undefined;

  return (
    <Pressable
      onPress={() => onPress(property.id)}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.district}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <PropertyImage
          uri={cover}
          style={styles.image}
          accessibilityLabel={property.title}
        />
        <View style={styles.typeBadge}>
          <Badge
            label={t(`listingType.${property.listingType}.badge`)}
            variant={property.listingType === 'sale' ? 'info' : 'trust'}
          />
          <Badge label={t(`type.${property.propertyType}`)} variant="neutral" />
        </View>
        <View style={styles.favorite}>
          <FavoriteButton propertyId={property.id} variant="floating" />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(property.price, property.currency, property.listingType, t('common.perMonth'))}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.district}, {property.city}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <View style={styles.metaRow}>
          <MetaItem icon="bed-outline" text={`${property.rooms} ${t('common.rooms')}`} />
          <MetaItem icon="resize-outline" text={formatArea(property.areaSquareMeters)} />
          {typeof property.floor === 'number' ? (
            <MetaItem
              icon="business-outline"
              text={
                property.totalFloors
                  ? `${property.floor}/${property.totalFloors}`
                  : `${property.floor}`
              }
            />
          ) : null}
        </View>

        <View style={styles.badgeRow}>
          {property.ownerVerified ? (
            <Badge
              label={t('badge.verifiedOwner')}
              icon="shield-checkmark"
              variant="trust"
            />
          ) : null}
          <Badge label={t('badge.noCommission')} icon="pricetag" variant="info" />
        </View>

        <View style={styles.confirmedRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.trust} />
          <Text style={styles.confirmedText} numberOfLines={1}>
            {t('property.confirmedAvailable')} · {property.confirmedAvailableAt}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  pressed: {
    opacity: 0.94,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  favorite: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  price: {
    ...textStyles.price,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  title: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  confirmedText: {
    fontSize: fontSize.xs,
    color: colors.trust,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
});

export const PropertyCard = memo(PropertyCardComponent);
