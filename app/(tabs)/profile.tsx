import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/Badge';
import { colors } from '@/constants/colors';
import { radius, shadows, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGE_OPTIONS, type Language } from '@/types/language';
import type { Currency } from '@/types/property';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface MenuRow {
  icon: IoniconName;
  labelKey: string;
  route?: '/my-listing' | '/verification';
}

const MENU_ROWS: MenuRow[] = [
  { icon: 'business-outline', labelKey: 'profile.myListing', route: '/my-listing' },
  { icon: 'shield-checkmark-outline', labelKey: 'profile.ownerVerification', route: '/verification' },
  { icon: 'calendar-outline', labelKey: 'profile.myRequests' },
  { icon: 'lock-closed-outline', labelKey: 'profile.safety' },
  { icon: 'notifications-outline', labelKey: 'profile.notifications' },
  { icon: 'help-circle-outline', labelKey: 'profile.help' },
  { icon: 'information-circle-outline', labelKey: 'profile.about' },
];

const CURRENCIES: Currency[] = ['UZS', 'USD'];

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, setLanguage, currency, setCurrency } = useLanguage();
  const { account, signOut } = useAuth();
  const [languageModal, setLanguageModal] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.code === language)?.nativeLabel ?? language;

  const notImplemented = (title: string) => {
    Alert.alert(title, t('action.notImplemented'), [{ text: t('common.ok') }]);
  };

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    setLanguageModal(false);
  };

  const confirmSignOut = () => {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  const verificationBadge = () => {
    if (!account) {
      return null;
    }
    switch (account.verificationStatus) {
      case 'verified':
        return (
          <Badge
            label={t('profile.idVerified')}
            icon="shield-checkmark"
            variant="trust"
            style={styles.userBadge}
          />
        );
      case 'pending':
        return (
          <Badge
            label={t('profile.verificationPending')}
            icon="time"
            variant="info"
            style={styles.userBadge}
          />
        );
      default:
        return (
          <Badge
            label={t('profile.notVerified')}
            icon="alert-circle"
            variant="neutral"
            style={styles.userBadge}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{t('profile.title')}</Text>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons
              name={account ? 'person' : 'person-outline'}
              size={30}
              color={colors.primary}
            />
          </View>
          <View style={styles.userInfo}>
            {account ? (
              <>
                <Text style={styles.userName}>{account.fullName}</Text>
                <Text style={styles.userPhone}>{account.phone}</Text>
                <View style={styles.badgeRow}>
                  <Badge
                    label={t('profile.phoneVerified')}
                    icon="checkmark-circle"
                    variant="trust"
                    style={styles.userBadge}
                  />
                  {verificationBadge()}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.userName}>{t('profile.guest')}</Text>
                <Text style={styles.userPhone}>{t('profile.guestHint')}</Text>
              </>
            )}
          </View>
        </View>

        {/* Owner-only rule */}
        <View style={styles.ruleCard}>
          <Ionicons name="shield-checkmark" size={20} color={colors.trust} />
          <View style={styles.ruleTextWrap}>
            <Text style={styles.ruleTitle}>{t('profile.ownerRule.title')}</Text>
            <Text style={styles.ruleText}>{t('profile.ownerRule.text')}</Text>
          </View>
        </View>

        {/* Language selector */}
        <Text style={styles.groupTitle}>{t('profile.language')}</Text>
        <Pressable
          onPress={() => setLanguageModal(true)}
          accessibilityRole="button"
          accessibilityLabel={t('profile.selectLanguage')}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View style={styles.rowLeft}>
            <View style={styles.rowIcon}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{t('profile.language')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{activeLanguageLabel}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Pressable>

        {/* Currency selector */}
        <Text style={styles.groupTitle}>{t('profile.currency')}</Text>
        <View style={styles.currencyRow}>
          {CURRENCIES.map((option) => {
            const selected = currency === option;
            return (
              <Pressable
                key={option}
                onPress={() => setCurrency(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={option}
                style={({ pressed }) => [
                  styles.currencyChip,
                  selected && styles.currencyChipSelected,
                  pressed && styles.rowPressed,
                ]}>
                <Text
                  style={[
                    styles.currencyChipText,
                    selected && styles.currencyChipTextSelected,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Menu */}
        <Text style={styles.groupTitle}>{t('profile.title')}</Text>
        <View style={styles.menuCard}>
          {MENU_ROWS.map((row, index) => (
            <Pressable
              key={row.labelKey}
              onPress={() =>
                row.route ? router.push(row.route) : notImplemented(t(row.labelKey))
              }
              accessibilityRole="button"
              accessibilityLabel={t(row.labelKey)}
              style={({ pressed }) => [
                styles.menuRow,
                index < MENU_ROWS.length - 1 && styles.menuRowDivider,
                pressed && styles.rowPressed,
              ]}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.rowLabel}>{t(row.labelKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Sign in / sign out */}
        {account ? (
          <Pressable
            onPress={confirmSignOut}
            accessibilityRole="button"
            accessibilityLabel={t('auth.signOut')}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.rowPressed]}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/auth')}
            accessibilityRole="button"
            accessibilityLabel={t('profile.login')}
            style={({ pressed }) => [styles.loginButton, pressed && styles.rowPressed]}>
            <Ionicons name="log-in-outline" size={20} color={colors.primary} />
            <Text style={styles.loginText}>{t('profile.login')}</Text>
          </Pressable>
        )}

        <Text style={styles.mockNote}>{t('profile.mock')}</Text>
        <Text style={styles.version}>
          {t('profile.version')}: {appVersion}
        </Text>
      </ScrollView>

      {/* Language modal */}
      <Modal
        visible={languageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = option.code === language;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => selectLanguage(option.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.languageRow,
                    pressed && styles.rowPressed,
                  ]}>
                  <Text style={styles.languageLabel}>{option.nativeLabel}</Text>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={22} color={colors.border} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
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
    marginBottom: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  userName: {
    ...textStyles.subtitle,
  },
  userPhone: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  userBadge: {
    marginTop: spacing.xs,
  },
  ruleCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.trustLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  ruleTextWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  ruleTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  ruleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  groupTitle: {
    ...textStyles.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currencyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  currencyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyChipText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  currencyChipTextSelected: {
    color: colors.textInverse,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  loginText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.dangerLight,
    backgroundColor: colors.surface,
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  mockNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  version: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  modalTitle: {
    ...textStyles.subtitle,
    marginBottom: spacing.md,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  languageLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
});
