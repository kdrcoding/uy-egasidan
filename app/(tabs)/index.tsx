import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { LoadingCard } from '@/components/LoadingCard';
import { PropertyCard } from '@/components/PropertyCard';
import { SecondaryButton } from '@/components/SecondaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/constants/colors';
import { TASHKENT_DISTRICTS } from '@/constants/districts';
import { radius, shadows, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useLanguage } from '@/context/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import type { Property } from '@/types/property';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const FEATURED_CARD_WIDTH = 300;

interface TrustItem {
  icon: IoniconName;
  titleKey: string;
  textKey: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: 'shield-checkmark',
    titleKey: 'home.trust.verifiedOwners',
    textKey: 'home.trust.verifiedOwners.text',
  },
  {
    icon: 'pricetag',
    titleKey: 'home.trust.noCommission',
    textKey: 'home.trust.noCommission.text',
  },
  {
    icon: 'sparkles',
    titleKey: 'home.trust.freshListings',
    textKey: 'home.trust.freshListings.text',
  },
];

const HOW_STEPS = [
  { icon: 'search-outline' as IoniconName, titleKey: 'home.step1.title', textKey: 'home.step1.text' },
  { icon: 'call-outline' as IoniconName, titleKey: 'home.step2.title', textKey: 'home.step2.text' },
  { icon: 'key-outline' as IoniconName, titleKey: 'home.step3.title', textKey: 'home.step3.text' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { latest, featured, loading, error, reload } = useProperties();

  const openProperty = useCallback(
    (id: string) => router.push(`/property/${id}`),
    [router],
  );

  const openSearch = useCallback(
    (params: { district?: string; listingType?: string } = {}) =>
      router.push({
        pathname: '/(tabs)/search',
        params,
      }),
    [router],
  );

  const renderLatest = useCallback(
    ({ item }: { item: Property }) => (
      <View style={styles.latestItem}>
        <PropertyCard property={item} onPress={openProperty} />
      </View>
    ),
    [openProperty],
  );

  const header = (
    <View>
      {/* Greeting + brand */}
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <Ionicons name="home" size={18} color={colors.textInverse} />
        </View>
        <View style={styles.brandTextWrap}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.brandName}>{t('app.name')}</Text>
        </View>
      </View>

      {/* Hero */}
      <Text style={styles.heroHeading}>{t('home.heading')}</Text>
      <Text style={styles.heroSub}>{t('home.subheading')}</Text>

      {/* Search field (navigates to Search tab) */}
      <Pressable
        onPress={() => openSearch()}
        accessibilityRole="search"
        accessibilityLabel={t('home.searchPlaceholder')}
        style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
      </Pressable>

      {/* Rent / buy quick entry */}
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => openSearch({ listingType: 'rent' })}
          accessibilityRole="button"
          accessibilityLabel={t('listingType.rent')}
          style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}>
          <View style={[styles.modeIcon, { backgroundColor: colors.trustLight }]}>
            <Ionicons name="key-outline" size={20} color={colors.trust} />
          </View>
          <Text style={styles.modeLabel}>{t('listingType.rent')}</Text>
        </Pressable>
        <Pressable
          onPress={() => openSearch({ listingType: 'sale' })}
          accessibilityRole="button"
          accessibilityLabel={t('listingType.sale')}
          style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}>
          <View style={[styles.modeIcon, { backgroundColor: colors.infoLight }]}>
            <Ionicons name="pricetag-outline" size={20} color={colors.info} />
          </View>
          <Text style={styles.modeLabel}>{t('listingType.sale')}</Text>
        </Pressable>
      </View>

      {/* District chips */}
      <Text style={styles.districtLabel}>{t('home.districts')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.districtRow}>
        {TASHKENT_DISTRICTS.map((district) => (
          <Pressable
            key={district}
            onPress={() => openSearch({ district })}
            accessibilityRole="button"
            accessibilityLabel={district}
            style={({ pressed }) => [styles.districtChip, pressed && styles.pressed]}>
            <Text style={styles.districtChipText}>{district}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Trust indicators */}
      <View style={styles.trustGrid}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.titleKey} style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <Ionicons name={item.icon} size={18} color={colors.trust} />
            </View>
            <Text style={styles.trustTitle}>{t(item.titleKey)}</Text>
            <Text style={styles.trustText}>{t(item.textKey)}</Text>
          </View>
        ))}
      </View>

      {/* Featured */}
      {featured.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title={t('home.featured')} />
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.featuredItem}>
                <PropertyCard property={item} onPress={openProperty} />
              </View>
            )}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      ) : null}

      {/* How it works */}
      <View style={styles.section}>
        <SectionHeader title={t('home.howItWorks')} />
        <View style={styles.howCard}>
          {HOW_STEPS.map((step, index) => (
            <View key={step.titleKey} style={styles.howRow}>
              <View style={styles.howIndex}>
                <Ionicons name={step.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.howTextWrap}>
                <Text style={styles.howTitle}>
                  {index + 1}. {t(step.titleKey)}
                </Text>
                <Text style={styles.howText}>{t(step.textKey)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Latest header */}
      <View style={styles.section}>
        <SectionHeader
          title={t('home.latest')}
          actionLabel={t('home.seeAll')}
          onActionPress={() => openSearch()}
        />
      </View>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('search.empty.title')}
          message={error}
          action={
            <SecondaryButton title={t('common.retry')} icon="refresh" onPress={reload} />
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={loading ? [] : latest}
        keyExtractor={(item) => item.id}
        renderItem={renderLatest}
        ListHeaderComponent={header}
        ListFooterComponent={
          loading ? (
            <View style={styles.skeletonWrap}>
              <LoadingCard />
              <LoadingCard />
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  brandName: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  heroHeading: {
    ...textStyles.title,
    marginBottom: spacing.xs,
  },
  heroSub: {
    ...textStyles.bodyMuted,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  searchPlaceholder: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  modeIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  districtLabel: {
    ...textStyles.caption,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  districtRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  districtChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  districtChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  pressed: {
    opacity: 0.7,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  trustCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.trustLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  trustTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  trustText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  section: {
    marginTop: spacing.xxl,
  },
  featuredList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  featuredItem: {
    width: FEATURED_CARD_WIDTH,
  },
  howCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  howIndex: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howTextWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  howTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  howText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  latestItem: {
    marginTop: spacing.lg,
  },
  skeletonWrap: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
});
