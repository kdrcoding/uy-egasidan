import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Identity verification: photo of a passport / ID card plus a selfie.
 * Required once before the user can post a listing. In the MVP the review is
 * simulated and auto-approves shortly after submission.
 */
export default function VerificationScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { account, submitVerification } = useAuth();

  const [idUri, setIdUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [router]);

  const capture = useCallback(
    async (target: 'id' | 'selfie', source: 'camera' | 'library') => {
      try {
        let result: ImagePicker.ImagePickerResult;
        if (source === 'camera') {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t('verify.title'), t('verify.permission'));
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            cameraType:
              target === 'selfie'
                ? ImagePicker.CameraType.front
                : ImagePicker.CameraType.back,
          });
        } else {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t('verify.title'), t('verify.permission'));
            return;
          }
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          });
        }
        if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          if (target === 'id') {
            setIdUri(uri);
          } else {
            setSelfieUri(uri);
          }
        }
      } catch {
        Alert.alert(t('verify.title'), t('verify.permission'));
      }
    },
    [t],
  );

  const submit = useCallback(() => {
    if (!idUri || !selfieUri) {
      Alert.alert(t('verify.title'), t('verify.missing'));
      return;
    }
    submitVerification(idUri, selfieUri);
  }, [idUri, selfieUri, submitVerification, t]);

  const status = account?.verificationStatus ?? 'unverified';

  const renderStatusScreen = (
    icon: IoniconName,
    iconColor: string,
    iconBg: string,
    title: string,
    text: string,
    action?: React.ReactNode,
  ) => (
    <View style={styles.statusWrap}>
      <View style={[styles.statusIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={40} color={iconColor} />
      </View>
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={styles.statusText}>{text}</Text>
      {action}
    </View>
  );

  const renderBody = () => {
    if (!account) {
      return renderStatusScreen(
        'person-circle-outline',
        colors.primary,
        colors.primaryLight,
        t('gate.signIn.title'),
        t('gate.signIn.text'),
        <PrimaryButton
          title={t('gate.signIn.action')}
          icon="log-in-outline"
          onPress={() => router.push('/auth')}
        />,
      );
    }
    if (status === 'pending') {
      return renderStatusScreen(
        'time-outline',
        colors.warning,
        colors.warningLight,
        t('verify.pending.title'),
        t('verify.pending.text'),
      );
    }
    if (status === 'verified') {
      return renderStatusScreen(
        'shield-checkmark',
        colors.trust,
        colors.trustLight,
        t('verify.verified.title'),
        t('verify.verified.text'),
        <PrimaryButton
          title={t('verify.postNow')}
          icon="add-circle-outline"
          onPress={() => router.replace('/(tabs)/add-property')}
        />,
      );
    }

    // unverified / rejected → capture form
    return (
      <View style={styles.form}>
        {status === 'rejected' ? (
          <View style={styles.rejectedNotice}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.rejectedText}>{t('verify.rejected.text')}</Text>
          </View>
        ) : null}

        <DocumentSlot
          icon="card-outline"
          title={t('verify.idDoc')}
          hint={t('verify.idDocHint')}
          uri={idUri}
          onCamera={() => capture('id', 'camera')}
          onLibrary={() => capture('id', 'library')}
          retakeLabel={t('verify.retake')}
          cameraLabel={t('verify.takePhoto')}
          libraryLabel={t('verify.pickPhoto')}
        />
        <DocumentSlot
          icon="happy-outline"
          title={t('verify.selfie')}
          hint={t('verify.selfieHint')}
          uri={selfieUri}
          onCamera={() => capture('selfie', 'camera')}
          onLibrary={() => capture('selfie', 'library')}
          retakeLabel={t('verify.retake')}
          cameraLabel={t('verify.takePhoto')}
          libraryLabel={t('verify.pickPhoto')}
        />

        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
          <Text style={styles.privacyText}>{t('verify.privacy')}</Text>
        </View>

        <PrimaryButton
          title={t('verify.submit')}
          icon="shield-checkmark-outline"
          onPress={submit}
          disabled={!idUri || !selfieUri}
        />
      </View>
    );
  };

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
        <Text style={styles.topTitle}>{t('verify.title')}</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {status === 'unverified' && account ? (
          <Text style={styles.subtitle}>{t('verify.subtitle')}</Text>
        ) : null}
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}

function DocumentSlot({
  icon,
  title,
  hint,
  uri,
  onCamera,
  onLibrary,
  retakeLabel,
  cameraLabel,
  libraryLabel,
}: {
  icon: IoniconName;
  title: string;
  hint: string;
  uri: string | null;
  onCamera: () => void;
  onLibrary: () => void;
  retakeLabel: string;
  cameraLabel: string;
  libraryLabel: string;
}) {
  return (
    <View style={styles.slot}>
      <View style={styles.slotHeader}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <View style={styles.slotHeaderText}>
          <Text style={styles.slotTitle}>{title}</Text>
          <Text style={styles.slotHint}>{hint}</Text>
        </View>
        {uri ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.trust} />
        ) : null}
      </View>

      {uri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
          <SecondaryButton title={retakeLabel} icon="refresh" onPress={onCamera} />
        </View>
      ) : (
        <View style={styles.slotActions}>
          <SecondaryButton
            title={cameraLabel}
            icon="camera-outline"
            onPress={onCamera}
            style={styles.slotAction}
          />
          <SecondaryButton
            title={libraryLabel}
            icon="images-outline"
            onPress={onLibrary}
            style={styles.slotAction}
          />
        </View>
      )}
    </View>
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
  },
  subtitle: {
    ...textStyles.bodyMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  slot: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  slotHeaderText: {
    flex: 1,
    gap: spacing.xxs,
  },
  slotTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  slotHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  slotActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotAction: {
    flex: 1,
    minHeight: 44,
  },
  previewWrap: {
    gap: spacing.md,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  rejectedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rejectedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusWrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  statusIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    ...textStyles.title,
    textAlign: 'center',
  },
  statusText: {
    ...textStyles.bodyMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
