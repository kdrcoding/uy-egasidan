import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PropertyImage } from '@/components/PropertyImage';
import { SecondaryButton } from '@/components/SecondaryButton';
import { activeAmenities } from '@/constants/amenities';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import type { Property } from '@/types/property';
import { formatCurrency, formatPrice, formatPricePerSquareMeter } from '@/utils/currency';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function DetailStat({
  icon,
  value,
  label,
}: {
  icon: IoniconName;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.conditionRow}>
      <Text style={styles.conditionLabel}>{label}</Text>
      <Text style={styles.conditionValue}>{value}</Text>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { account } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, loading } = useProperties();
  const { width } = useWindowDimensions();
  const [galleryIndex, setGalleryIndex] = useState(0);

  const property: Property | undefined = typeof id === 'string' ? getById(id) : undefined;
  const isOwnListing = Boolean(account && property && property.ownerId === account.id);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const mockAction = useCallback(
    (title: string, message: string) => {
      Alert.alert(title, message, [{ text: t('common.ok') }]);
    },
    [t],
  );

  const openLink = useCallback(
    async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(t('action.telegram.title'), t('action.linkFailed'), [
          { text: t('common.ok') },
        ]);
      }
    },
    [t],
  );

  // Unknown id or still resolving.
  if (!property) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={t('detail.goBack')}
            style={styles.iconButton}
            hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <EmptyState
          icon={loading ? 'time-outline' : 'help-circle-outline'}
          title={loading ? '…' : t('detail.notFound.title')}
          message={loading ? undefined : t('detail.notFound.text')}
          action={
            !loading ? (
              <SecondaryButton title={t('detail.goBack')} icon="arrow-back" onPress={goBack} />
            ) : undefined
          }
        />
      </SafeAreaView>
    );
  }

  const amenities = activeAmenities(property);
  const hasImages = property.images.length > 0;
  const gallery = hasImages ? property.images : [''];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setGalleryIndex(index);
            }}>
            {gallery.map((uri, index) => (
              <PropertyImage
                key={`${uri}-${index}`}
                uri={uri || undefined}
                style={{ width, height: 280 }}
                accessibilityLabel={`${property.title} — ${index + 1}`}
              />
            ))}
          </ScrollView>
          {gallery.length > 1 ? (
            <View style={styles.dots}>
              {gallery.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === galleryIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <SafeAreaView edges={['bottom']} style={styles.body}>
          {/* Price + location */}
          <Text style={styles.price}>
            {formatPrice(property.price, property.currency, property.listingType, t('common.perMonth'))}
          </Text>
          {property.listingType === 'sale' && property.areaSquareMeters > 0 ? (
            <Text style={styles.pricePerM2}>
              {formatPricePerSquareMeter(property.price, property.areaSquareMeters, property.currency)}
            </Text>
          ) : null}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.location}>
              {property.district}, {property.city}
              {property.neighborhood ? ` · ${property.neighborhood}` : ''}
            </Text>
          </View>
          <Text style={styles.title}>{property.title}</Text>

          {/* Badges */}
          <View style={styles.badgeRow}>
            <Badge
              label={t(`listingType.${property.listingType}.badge`)}
              icon={property.listingType === 'sale' ? 'pricetag' : 'key'}
              variant={property.listingType === 'sale' ? 'info' : 'trust'}
            />
            {property.ownerVerified ? (
              <Badge label={t('badge.verifiedOwner')} icon="shield-checkmark" variant="trust" />
            ) : null}
            {property.propertyVerified ? (
              <Badge label={t('badge.propertyVerified')} icon="checkmark-done" variant="trust" />
            ) : null}
            <Badge label={t('badge.noCommission')} icon="pricetag" variant="info" />
          </View>

          {/* Availability */}
          <View style={styles.availabilityCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.trust} />
            <Text style={styles.availabilityText}>
              {t('property.confirmedAvailable')} · {property.confirmedAvailableAt}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <DetailStat
              icon="grid-outline"
              value={String(property.rooms)}
              label={t('property.rooms')}
            />
            <DetailStat
              icon="bed-outline"
              value={String(property.bedrooms)}
              label={t('property.bedrooms')}
            />
            <DetailStat
              icon="water-outline"
              value={String(property.bathrooms)}
              label={t('property.bathrooms')}
            />
            <DetailStat
              icon="resize-outline"
              value={`${property.areaSquareMeters}`}
              label="m²"
            />
            {typeof property.floor === 'number' ? (
              <DetailStat
                icon="business-outline"
                value={
                  property.totalFloors
                    ? `${property.floor}/${property.totalFloors}`
                    : `${property.floor}`
                }
                label={t('property.floor')}
              />
            ) : null}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>{t('detail.description')}</Text>
          <Text style={styles.description}>{property.description}</Text>

          {/* Amenities */}
          {amenities.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>{t('detail.amenities')}</Text>
              <View style={styles.amenityGrid}>
                {amenities.map((amenity) => (
                  <View key={amenity.key} style={styles.amenityItem}>
                    <Ionicons name={amenity.icon} size={18} color={colors.trust} />
                    <Text style={styles.amenityLabel}>{t(amenity.labelKey)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Rental / sale conditions */}
          <Text style={styles.sectionTitle}>
            {property.listingType === 'sale' ? t('detail.saleConditions') : t('detail.conditions')}
          </Text>
          <View style={styles.conditionsCard}>
            {property.listingType === 'rent' ? (
              <>
                <ConditionRow
                  label={t('property.deposit')}
                  value={formatCurrency(property.deposit, property.currency)}
                />
                <ConditionRow
                  label={t('property.utilities')}
                  value={
                    property.utilitiesIncluded
                      ? t('property.utilitiesIncluded')
                      : t('property.utilitiesExcluded')
                  }
                />
                {property.availableFrom ? (
                  <ConditionRow
                    label={t('property.availableFrom')}
                    value={property.availableFrom}
                  />
                ) : null}
                {typeof property.maximumOccupants === 'number' ? (
                  <ConditionRow
                    label={t('property.maxOccupants')}
                    value={String(property.maximumOccupants)}
                  />
                ) : null}
              </>
            ) : (
              <>
                {property.areaSquareMeters > 0 ? (
                  <ConditionRow
                    label={t('property.pricePerM2')}
                    value={
                      formatPricePerSquareMeter(
                        property.price,
                        property.areaSquareMeters,
                        property.currency,
                      ) ?? '—'
                    }
                  />
                ) : null}
              </>
            )}
            <ConditionRow label={t('add.commission')} value="0" />
          </View>

          {/* Safety warning */}
          <View style={styles.safetyCard}>
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
            <View style={styles.safetyTextWrap}>
              <Text style={styles.safetyTitle}>{t('detail.safety.title')}</Text>
              <Text style={styles.safetyText}>{t('detail.safety.text')}</Text>
            </View>
          </View>

          {/* Report */}
          <Pressable
            onPress={() => mockAction(t('action.report.title'), t('action.report.text'))}
            accessibilityRole="button"
            accessibilityLabel={t('detail.report')}
            style={({ pressed }) => [styles.reportRow, pressed && styles.pressed]}>
            <Ionicons name="flag-outline" size={18} color={colors.danger} />
            <Text style={styles.reportText}>{t('detail.report')}</Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>

      {/* Floating top controls */}
      <SafeAreaView edges={['top']} style={styles.floatingTop} pointerEvents="box-none">
        <View style={styles.floatingRow}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={t('detail.goBack')}
            style={styles.floatingButton}
            hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <FavoriteButton propertyId={property.id} variant="floating" />
        </View>
      </SafeAreaView>

      {/* Bottom action bar */}
      <SafeAreaView edges={['bottom']} style={styles.actionBar}>
        {isOwnListing ? (
          <>
            <View style={styles.ownListingRow}>
              <Ionicons name="person-circle-outline" size={18} color={colors.info} />
              <Text style={styles.ownListingText}>{t('detail.yourListing')}</Text>
            </View>
            <PrimaryButton
              title={t('detail.manageListing')}
              icon="settings-outline"
              onPress={() => router.push('/my-listing')}
            />
          </>
        ) : (
          <>
            <View style={styles.actionRow}>
              <SecondaryButton
                title={t('detail.telegram')}
                icon="paper-plane-outline"
                onPress={() =>
                  property.telegramUsername
                    ? void openLink(`https://t.me/${property.telegramUsername}`)
                    : mockAction(t('action.telegram.title'), t('detail.telegramMissing'))
                }
                style={styles.actionSecondary}
              />
              <SecondaryButton
                title={t('detail.requestViewing')}
                icon="calendar-outline"
                onPress={() =>
                  mockAction(t('action.requestViewing.title'), t('action.requestViewing.text'))
                }
                style={styles.actionSecondary}
              />
            </View>
            <PrimaryButton
              title={t('detail.callOwner')}
              icon="call"
              onPress={() =>
                property.contactPhone
                  ? void openLink(`tel:${property.contactPhone}`)
                  : mockAction(t('action.callOwner.title'), t('action.notImplemented'))
              }
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 160,
  },
  galleryWrap: {
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  dotActive: {
    opacity: 1,
    width: 18,
  },
  body: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  price: {
    ...textStyles.hero,
    fontSize: fontSize.xxl,
  },
  pricePerM2: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xxs,
  },
  ownListingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  ownListingText: {
    fontSize: fontSize.sm,
    color: colors.info,
    fontWeight: fontWeight.semibold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  location: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  title: {
    ...textStyles.subtitle,
    marginTop: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.trustLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  availabilityText: {
    fontSize: fontSize.sm,
    color: colors.trust,
    fontWeight: fontWeight.semibold,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stat: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    fontSize: fontSize.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  description: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: '47%',
    flexGrow: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  conditionsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  conditionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  conditionValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
  },
  safetyCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  safetyTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  safetyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  safetyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  reportText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
  },
  floatingTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  floatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionSecondary: {
    flex: 1,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
});
