import { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { FilterChip } from '@/components/FilterChip';
import { LoadingCard } from '@/components/LoadingCard';
import { PropertyCard } from '@/components/PropertyCard';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors } from '@/constants/colors';
import { CITIES, DEFAULT_CITY, districtsForCity } from '@/constants/districts';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useLanguage } from '@/context/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import { EMPTY_FILTERS, type PropertyFilters, type SortOption } from '@/types/filters';
import type { Currency, ListingType, Property, PropertyType } from '@/types/property';
import { parsePositiveNumber } from '@/utils/validation';
import { countActiveFilters, filterProperties } from '@/utils/propertyFilters';

const LISTING_TYPES: ListingType[] = ['rent', 'sale'];
const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'private_room', 'shared_room'];
const ROOM_OPTIONS = [1, 2, 3, 4];
const CURRENCIES: Currency[] = ['UZS', 'USD'];
const SORT_OPTIONS: SortOption[] = ['newest', 'price_asc', 'price_desc', 'area_desc'];

function FilterRowTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.filterTitle}>{children}</Text>;
}

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { properties, loading } = useProperties();
  const params = useLocalSearchParams<{ district?: string; listingType?: string }>();

  const [filters, setFilters] = useState<PropertyFilters>(() => ({
    ...EMPTY_FILTERS,
    district: typeof params.district === 'string' ? params.district : undefined,
  }));
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');

  // Apply navigation params even when the Search tab is already mounted
  // (e.g. tapping a district chip on Home while Search is warm). State is
  // adjusted during render, per the React "you might not need an effect" rule.
  const [appliedParams, setAppliedParams] = useState<{
    district?: string;
    listingType?: string;
  }>({});
  if (params.district !== appliedParams.district || params.listingType !== appliedParams.listingType) {
    setAppliedParams({ district: params.district, listingType: params.listingType });
    setFilters((prev) => ({
      ...prev,
      district:
        typeof params.district === 'string' && params.district.length > 0
          ? params.district
          : prev.district,
      listingType:
        params.listingType === 'rent' || params.listingType === 'sale'
          ? (params.listingType as ListingType)
          : prev.listingType,
    }));
  }

  const results = useMemo(
    () => filterProperties(properties, filters),
    [properties, filters],
  );

  const activeCount = countActiveFilters(filters);

  const update = useCallback((patch: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleValue = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: prev[key] === value ? undefined : value,
      }));
    },
    [],
  );

  const clearAll = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
    setMinPriceText('');
    setMaxPriceText('');
  }, []);

  const commitMinPrice = useCallback(
    (text: string) => {
      setMinPriceText(text);
      const parsed = parsePositiveNumber(text);
      update({ minPrice: parsed ?? undefined });
    },
    [update],
  );

  const commitMaxPrice = useCallback(
    (text: string) => {
      setMaxPriceText(text);
      const parsed = parsePositiveNumber(text);
      update({ maxPrice: parsed ?? undefined });
    },
    [update],
  );

  const openProperty = useCallback(
    (id: string) => router.push(`/property/${id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Property }) => (
      <View style={styles.resultItem}>
        <PropertyCard property={item} onPress={openProperty} />
      </View>
    ),
    [openProperty],
  );

  const header = (
    <View>
      <Text style={styles.screenTitle}>{t('search.title')}</Text>

      {/* Query */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={filters.query ?? ''}
          onChangeText={(text) => update({ query: text })}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          accessibilityLabel={t('search.placeholder')}
          returnKeyType="search"
        />
        {filters.query ? (
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.textMuted}
            onPress={() => update({ query: undefined })}
          />
        ) : null}
      </View>

      {/* Listing type (rent / sale) */}
      <FilterRowTitle>{t('search.listingType')}</FilterRowTitle>
      <View style={styles.chipRow}>
        <FilterChip
          label={t('common.all')}
          selected={!filters.listingType}
          onPress={() => update({ listingType: undefined })}
        />
        {LISTING_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={t(`listingType.${type}`)}
            selected={filters.listingType === type}
            onPress={() => toggleValue('listingType', type)}
          />
        ))}
      </View>

      {/* Sort */}
      <FilterRowTitle>{t('search.sort')}</FilterRowTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {SORT_OPTIONS.map((option) => (
          <FilterChip
            key={option}
            label={t(`sort.${option}`)}
            selected={filters.sort === option}
            onPress={() => update({ sort: option })}
          />
        ))}
      </ScrollView>

      {/* City */}
      <FilterRowTitle>{t('search.city')}</FilterRowTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CITIES.map((city) => (
          <FilterChip
            key={city}
            label={city}
            selected={filters.city === city}
            onPress={() =>
              // Districts are city-specific: switching city clears the district.
              setFilters((prev) => ({
                ...prev,
                city: prev.city === city ? undefined : city,
                district: undefined,
              }))
            }
          />
        ))}
      </ScrollView>

      {/* District */}
      <FilterRowTitle>{t('search.district')}</FilterRowTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {districtsForCity(filters.city ?? DEFAULT_CITY).map((district) => (
          <FilterChip
            key={district}
            label={district}
            selected={filters.district === district}
            onPress={() => toggleValue('district', district)}
          />
        ))}
      </ScrollView>

      {/* Property type */}
      <FilterRowTitle>{t('search.propertyType')}</FilterRowTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {PROPERTY_TYPES.map((type) => (
          <FilterChip
            key={type}
            label={t(`type.${type}`)}
            selected={filters.propertyType === type}
            onPress={() => toggleValue('propertyType', type)}
          />
        ))}
      </ScrollView>

      {/* Rooms */}
      <FilterRowTitle>{t('search.rooms')}</FilterRowTitle>
      <View style={styles.chipRow}>
        {ROOM_OPTIONS.map((rooms) => (
          <FilterChip
            key={rooms}
            label={rooms >= 4 ? '4+' : String(rooms)}
            selected={filters.rooms === rooms}
            onPress={() => toggleValue('rooms', rooms)}
          />
        ))}
      </View>

      {/* Price range */}
      <FilterRowTitle>
        {t('search.minPrice')} / {t('search.maxPrice')}
      </FilterRowTitle>
      <View style={styles.priceRow}>
        <TextInput
          value={minPriceText}
          onChangeText={commitMinPrice}
          placeholder={t('search.minPrice')}
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          style={[styles.priceInput, styles.priceInputLeft]}
          accessibilityLabel={t('search.minPrice')}
        />
        <TextInput
          value={maxPriceText}
          onChangeText={commitMaxPrice}
          placeholder={t('search.maxPrice')}
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          style={styles.priceInput}
          accessibilityLabel={t('search.maxPrice')}
        />
      </View>

      {/* Currency + toggles */}
      <FilterRowTitle>{t('search.currency')}</FilterRowTitle>
      <View style={styles.chipRow}>
        {CURRENCIES.map((currency) => (
          <FilterChip
            key={currency}
            label={currency}
            selected={filters.currency === currency}
            onPress={() => toggleValue('currency', currency)}
          />
        ))}
        <FilterChip
          label={t('search.furnished')}
          selected={filters.furnished === true}
          onPress={() => toggleValue('furnished', true)}
        />
        <FilterChip
          label={t('search.petsAllowed')}
          selected={filters.petsAllowed === true}
          onPress={() => toggleValue('petsAllowed', true)}
        />
      </View>

      {/* Results + clear */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {results.length} {t('search.results')}
          {activeCount > 0 ? ` · ${activeCount} ${t('search.filters').toLowerCase()}` : ''}
        </Text>
        {activeCount > 0 || filters.sort !== 'newest' ? (
          <SecondaryButton
            title={t('search.clear')}
            icon="close"
            onPress={clearAll}
            style={styles.clearButton}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={loading ? [] : results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListFooterComponent={
          loading ? (
            <View style={styles.skeletonWrap}>
              <LoadingCard />
              <LoadingCard />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="search-outline"
              title={t('search.empty.title')}
              message={t('search.empty.text')}
              action={
                <SecondaryButton
                  title={t('search.clear')}
                  icon="refresh"
                  onPress={clearAll}
                />
              }
            />
          )
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
  screenTitle: {
    ...textStyles.title,
    marginTop: spacing.md,
    marginBottom: spacing.md,
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
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  filterTitle: {
    ...textStyles.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  priceInputLeft: {
    marginRight: 0,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  clearButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  resultItem: {
    marginTop: spacing.lg,
  },
  skeletonWrap: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
});
