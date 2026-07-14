import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PropertyCard } from '@/components/PropertyCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import type { Property } from '@/types/property';

export default function FavoritesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { properties } = useProperties();
  const { favoriteProperties, count } = useFavorites(properties);

  const openProperty = useCallback(
    (id: string) => router.push(`/property/${id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Property }) => (
      <View style={styles.item}>
        <PropertyCard property={item} onPress={openProperty} />
      </View>
    ),
    [openProperty],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('favorites.title')}</Text>
        {count > 0 ? (
          <Text style={styles.count}>
            {count} {t('favorites.count')}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title={t('favorites.empty.title')}
            message={t('favorites.empty.text')}
            action={
              <PrimaryButton
                title={t('tabs.search')}
                icon="search"
                onPress={() => router.push('/(tabs)/search')}
              />
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xxs,
  },
  title: {
    ...textStyles.title,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    flexGrow: 1,
  },
  item: {
    marginTop: spacing.lg,
  },
});
