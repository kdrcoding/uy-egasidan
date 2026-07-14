import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { isValidUzPhone } from '@/utils/validation';

const DEMO_CODE = '123456';

/**
 * Phone-based sign in / registration. The SMS step is simulated in the MVP —
 * the demo code is shown on screen — but the flow mirrors a real OTP login.
 */
export default function AuthScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signIn } = useAuth();

  const [step, setStep] = useState<'details' | 'code'>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('');
  const [code, setCode] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const sendCode = useCallback(() => {
    const validName = fullName.trim().length >= 3;
    const validPhone = isValidUzPhone(phone);
    setNameError(validName ? undefined : t('auth.invalidName'));
    setPhoneError(validPhone ? undefined : t('auth.invalidPhone'));
    if (validName && validPhone) {
      setStep('code');
    }
  }, [fullName, phone, t]);

  const confirmCode = useCallback(() => {
    if (code.trim() !== DEMO_CODE) {
      setCodeError(t('auth.invalidCode'));
      return;
    }
    signIn(fullName, phone.replace(/\s/g, ''), telegram);
    goBack();
  }, [code, fullName, phone, telegram, signIn, goBack, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            style={styles.iconButton}
            hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="person-circle-outline" size={34} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
          </View>

          {step === 'details' ? (
            <View style={styles.form}>
              <FormInput
                label={t('auth.fullName')}
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (nameError) setNameError(undefined);
                }}
                autoCapitalize="words"
                error={nameError}
              />
              <FormInput
                label={t('auth.phone')}
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  if (phoneError) setPhoneError(undefined);
                }}
                keyboardType="phone-pad"
                placeholder={t('auth.phonePlaceholder')}
                error={phoneError}
              />
              <FormInput
                label={t('auth.telegram')}
                value={telegram}
                onChangeText={setTelegram}
                autoCapitalize="none"
                placeholder="@username"
              />
              <PrimaryButton
                title={t('auth.sendCode')}
                icon="chatbubble-ellipses-outline"
                onPress={sendCode}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.codeNotice}>
                <Ionicons name="information-circle" size={18} color={colors.info} />
                <Text style={styles.codeNoticeText}>
                  {t('auth.codeSent')}: {phone}. {t('auth.codeHint')}
                </Text>
              </View>
              <FormInput
                label={t('auth.code')}
                value={code}
                onChangeText={(v) => {
                  setCode(v);
                  if (codeError) setCodeError(undefined);
                }}
                keyboardType="numeric"
                maxLength={6}
                error={codeError}
              />
              <PrimaryButton
                title={t('auth.verifyCode')}
                icon="checkmark"
                onPress={confirmCode}
              />
              <Pressable
                onPress={() => setStep('details')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}>
                <Ionicons name="chevron-back" size={16} color={colors.primary} />
                <Text style={styles.backLinkText}>{t('common.previous')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.title,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.bodyMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  codeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  codeNoticeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
