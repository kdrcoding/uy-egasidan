import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PropertyCard } from '@/components/PropertyCard';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useListings } from '@/context/ListingsContext';

/**
 * Management screen for the user's single listing (one per user). The owner
 * can open it, mark it rented/sold, reactivate it, or delete it — deleting
 * frees the slot so a new listing can be posted.
 */
export default function MyListingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { account } = useAuth();
  const { getOwnListing, setListingStatus, deleteListing } = useListings();

  const listing = account ? getOwnListing(account.id) : undefined;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [router]);

  const confirmDelete = useCallback(() => {
    if (!listing) {
      return;
    }
    Alert.alert(t('myListing.delete'), t('myListing.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteListing(listing.id),
      },
    ]);
  }, [listing, deleteListing, t]);

  const statusVariant =
    listing?.status === 'published'
      ? 'trust'
      : listing?.status === 'rented' || listing?.status === 'sold'
        ? 'info'
        : 'neutral';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={t('detail.goBack')}
          style={styles.iconButton}
          hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle}>{t('myListing.title')}</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      {!listing ? (
        <EmptyState
          icon="home-outline"
          title={t('myListing.empty.title')}
          message={t('myListing.empty.text')}
          action={
            <PrimaryButton
              title={t('myListing.post')}
              icon="add-circle-outline"
              onPress={() => router.replace('/(tabs)/add-property')}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('myListing.status')}</Text>
            <Badge
              label={t(`status.${listing.status}`)}
              icon={listing.status === 'published' ? 'checkmark-circle' : 'time'}
              variant={statusVariant}
            />
          </View>

          <PropertyCard property={listing} onPress={(id) => router.push(`/property/${id}`)} />

          <View style={styles.ruleCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.info} />
            <Text style={styles.ruleText}>{t('myListing.oneRule')}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <SecondaryButton
              title={t('myListing.view')}
              icon="open-outline"
              onPress={() => router.push(`/property/${listing.id}`)}
            />
            {listing.status === 'published' ? (
              <SecondaryButton
                title={
                  listing.listingType === 'sale'
                    ? t('myListing.markSold')
                    : t('myListing.markRented')
                }
                icon="checkmark-done-outline"
                onPress={() =>
                  setListingStatus(
                    listing.id,
                    listing.listingType === 'sale' ? 'sold' : 'rented',
                  )
                }
              />
            ) : (
              <SecondaryButton
                title={t('myListing.reactivate')}
                icon="refresh-outline"
                onPress={() => setListingStatus(listing.id, 'published')}
              />
            )}
            <Pressable
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel={t('myListing.delete')}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>{t('myListing.delete')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topTitle: {
    ...textStyles.subtitle,
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
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    ...textStyles.subtitle,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  ruleText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.dangerLight,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  deleteText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
