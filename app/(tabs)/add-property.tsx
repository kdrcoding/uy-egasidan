import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';

import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PropertyImage } from '@/components/PropertyImage';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors } from '@/constants/colors';
import { CITIES, DEFAULT_CITY, districtsForCity } from '@/constants/districts';
import { radius, spacing } from '@/constants/spacing';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useListings } from '@/context/ListingsContext';
import type { Currency, ListingType, Property, PropertyType } from '@/types/property';
import { formatPrice } from '@/utils/currency';
import {
  parseNonNegativeNumber,
  parsePositiveNumber,
  validateListingDraft,
  validateListingStep,
  type DraftField,
  type ListingDraft,
} from '@/utils/validation';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TOTAL_STEPS = 6;
const MAX_PHOTOS = 8;

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; icon: IoniconName }[] = [
  { value: 'apartment', icon: 'business-outline' },
  { value: 'house', icon: 'home-outline' },
  { value: 'private_room', icon: 'bed-outline' },
  { value: 'shared_room', icon: 'people-outline' },
];

const LISTING_TYPES: { value: ListingType; icon: IoniconName }[] = [
  { value: 'rent', icon: 'key-outline' },
  { value: 'sale', icon: 'pricetag-outline' },
];

const CURRENCIES: Currency[] = ['UZS', 'USD'];

function createDraft(
  currency: Currency,
  contactPhone: string,
  telegramUsername: string,
): ListingDraft {
  return {
    listingType: 'rent',
    propertyType: null,
    city: DEFAULT_CITY,
    district: '',
    neighborhood: '',
    street: '',
    nearbyLandmark: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    furnished: false,
    parking: false,
    balcony: false,
    airConditioning: false,
    internet: false,
    petsAllowed: false,
    price: '',
    currency,
    deposit: '',
    utilitiesIncluded: false,
    availableFrom: '',
    maxOccupants: '',
    contactPhone,
    telegramUsername,
    title: '',
    description: '',
    images: [],
  };
}

function generateListingId(): string {
  return `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.borderStrong }}
        thumbColor={colors.surface}
        accessibilityLabel={label}
      />
    </View>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.selectChip,
        selected && styles.selectChipSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.selectChipText, selected && styles.selectChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Full-screen notice used for the sign-in / verification / one-listing gates. */
function Gate({
  icon,
  iconColor,
  iconBg,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon: IoniconName;
  iconColor: string;
  iconBg: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.gateWrap}>
      <View style={[styles.gateIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={40} color={iconColor} />
      </View>
      <Text style={styles.gateTitle}>{title}</Text>
      <Text style={styles.gateText}>{text}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { t, currency } = useLanguage();
  const { account } = useAuth();
  const { addListing, getOwnListing } = useListings();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ListingDraft>(() => createDraft(currency, '', ''));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<DraftField, string>>>({});

  // Prefill contact details once the account is known (adjusted during
  // render, per the React "you might not need an effect" rule).
  const [prefilledForAccount, setPrefilledForAccount] = useState<string | null>(null);
  if (account && prefilledForAccount !== account.id) {
    setPrefilledForAccount(account.id);
    setDraft((prev) => ({
      ...prev,
      contactPhone: prev.contactPhone || account.phone,
      telegramUsername: prev.telegramUsername || (account.telegramUsername ?? ''),
    }));
  }

  const set = useCallback(<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const stepTitles = useMemo(
    () => [
      t('add.step1.title'),
      t('add.step2.title'),
      t('add.step3.title'),
      t('add.step4.title'),
      t('add.step5.title'),
      t('add.step6.title'),
    ],
    [t],
  );

  const reset = useCallback(() => {
    setDraft(createDraft(currency, account?.phone ?? '', account?.telegramUsername ?? ''));
    setFieldErrors({});
    setStep(1);
  }, [currency, account]);

  const goNext = useCallback(() => {
    const result = validateListingStep(draft, step);
    if (!result.valid) {
      setFieldErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      Alert.alert(t('add.validation.title'), result.messages.join('\n'), [
        { text: t('common.ok') },
      ]);
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }, [draft, step, t]);

  const goPrev = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const addPhotos = useCallback(async () => {
    const remaining = MAX_PHOTOS - draft.images.length;
    if (remaining <= 0) {
      return;
    }
    const pickFrom = async (source: 'camera' | 'library') => {
      try {
        let result: ImagePicker.ImagePickerResult;
        if (source === 'camera') {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t('add.photos'), t('verify.permission'));
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          });
        } else {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t('add.photos'), t('verify.permission'));
            return;
          }
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: remaining,
          });
        }
        if (!result.canceled) {
          const uris = result.assets.map((asset) => asset.uri).slice(0, remaining);
          setDraft((prev) => ({ ...prev, images: [...prev.images, ...uris] }));
          setFieldErrors((prev) => (prev.images ? { ...prev, images: undefined } : prev));
        }
      } catch {
        Alert.alert(t('add.photos'), t('verify.permission'));
      }
    };
    Alert.alert(t('add.addPhoto'), undefined, [
      { text: t('verify.takePhoto'), onPress: () => void pickFrom('camera') },
      { text: t('verify.pickPhoto'), onPress: () => void pickFrom('library') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [draft.images.length, t]);

  const removePhoto = useCallback((index: number) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const submit = useCallback(() => {
    if (!account) {
      return;
    }
    const result = validateListingDraft(draft);
    if (!result.valid) {
      setFieldErrors(result.fieldErrors);
      Alert.alert(t('add.validation.title'), result.messages.join('\n'), [
        { text: t('common.ok') },
      ]);
      return;
    }

    const isRent = draft.listingType === 'rent';
    const now = new Date();
    const listing: Property = {
      id: generateListingId(),
      ownerId: account.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      propertyType: draft.propertyType ?? 'apartment',
      listingType: draft.listingType,
      city: draft.city,
      district: draft.district,
      neighborhood: draft.neighborhood.trim() || undefined,
      street: draft.street.trim() || undefined,
      nearbyLandmark: draft.nearbyLandmark.trim() || undefined,
      price: parsePositiveNumber(draft.price) ?? 0,
      currency: draft.currency,
      deposit: isRent ? (parseNonNegativeNumber(draft.deposit) ?? 0) : 0,
      rooms: parsePositiveNumber(draft.rooms) ?? 1,
      bedrooms: parsePositiveNumber(draft.bedrooms) ?? 0,
      bathrooms: parsePositiveNumber(draft.bathrooms) ?? 1,
      areaSquareMeters: parsePositiveNumber(draft.area) ?? 0,
      floor: parsePositiveNumber(draft.floor) ?? undefined,
      totalFloors: parsePositiveNumber(draft.totalFloors) ?? undefined,
      furnished: draft.furnished,
      petsAllowed: draft.petsAllowed,
      utilitiesIncluded: isRent ? draft.utilitiesIncluded : false,
      parking: draft.parking,
      balcony: draft.balcony,
      airConditioning: draft.airConditioning,
      internet: draft.internet,
      maximumOccupants: isRent
        ? (parsePositiveNumber(draft.maxOccupants) ?? undefined)
        : undefined,
      availableFrom: isRent ? draft.availableFrom.trim() : '',
      ownerVerified: true,
      propertyVerified: false,
      confirmedAvailableAt: now.toISOString().slice(0, 10),
      status: 'published',
      images: draft.images,
      createdAt: now.toISOString(),
      contactPhone: draft.contactPhone.replace(/\s/g, ''),
      telegramUsername: draft.telegramUsername.trim().replace(/^@/, '') || undefined,
    };

    const outcome = addListing(listing);
    if (!outcome.ok) {
      Alert.alert(t('gate.oneListing.title'), t('gate.oneListing.text'), [
        { text: t('common.ok') },
      ]);
      return;
    }
    Alert.alert(t('add.success.title'), t('add.success.text'), [
      {
        text: t('common.ok'),
        onPress: () => {
          reset();
          router.push('/my-listing');
        },
      },
    ]);
  }, [account, draft, addListing, reset, router, t]);

  // ---- Posting gates -------------------------------------------------------
  const ownListing = account ? getOwnListing(account.id) : undefined;

  const gate = (() => {
    if (!account) {
      return (
        <Gate
          icon="person-circle-outline"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          title={t('gate.signIn.title')}
          text={t('gate.signIn.text')}
          actionLabel={t('gate.signIn.action')}
          onAction={() => router.push('/auth')}
        />
      );
    }
    if (account.verificationStatus === 'pending') {
      return (
        <Gate
          icon="time-outline"
          iconColor={colors.warning}
          iconBg={colors.warningLight}
          title={t('gate.pending.title')}
          text={t('gate.pending.text')}
          actionLabel={t('gate.pending.action')}
          onAction={() => router.push('/verification')}
        />
      );
    }
    if (account.verificationStatus !== 'verified') {
      return (
        <Gate
          icon="shield-checkmark-outline"
          iconColor={colors.info}
          iconBg={colors.infoLight}
          title={t('gate.verify.title')}
          text={t('gate.verify.text')}
          actionLabel={t('gate.verify.action')}
          onAction={() => router.push('/verification')}
        />
      );
    }
    if (ownListing) {
      return (
        <Gate
          icon="home"
          iconColor={colors.trust}
          iconBg={colors.trustLight}
          title={t('gate.oneListing.title')}
          text={t('gate.oneListing.text')}
          actionLabel={t('gate.oneListing.action')}
          onAction={() => router.push('/my-listing')}
        />
      );
    }
    return null;
  })();

  if (gate) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('add.title')}</Text>
          <View style={styles.ownerNotice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.info} />
            <Text style={styles.ownerNoticeText}>{t('add.ownerOnly')}</Text>
          </View>
        </View>
        {gate}
      </SafeAreaView>
    );
  }

  // ---- Wizard --------------------------------------------------------------
  const isRent = draft.listingType === 'rent';

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step1.title')}</Text>
            <Text style={styles.fieldLabel}>{t('add.listingType')}</Text>
            <View style={styles.typeGrid}>
              {LISTING_TYPES.map((option) => {
                const selected = draft.listingType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => set('listingType', option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(`listingType.${option.value}`)}
                    style={({ pressed }) => [
                      styles.typeCard,
                      styles.listingTypeCard,
                      selected && styles.typeCardSelected,
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                      {t(`listingType.${option.value}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.fieldLabel}>{t('search.propertyType')}</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPE_OPTIONS.map((option) => {
                const selected = draft.propertyType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => set('propertyType', option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(`type.${option.value}`)}
                    style={({ pressed }) => [
                      styles.typeCard,
                      selected && styles.typeCardSelected,
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={28}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                      {t(`type.${option.value}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      case 2: {
        const districts = districtsForCity(draft.city);
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step2.title')}</Text>
            <Text style={styles.fieldLabel}>{t('add.city')}</Text>
            <View style={styles.chipWrap}>
              {CITIES.map((city) => (
                <SelectChip
                  key={city}
                  label={city}
                  selected={draft.city === city}
                  onPress={() => {
                    if (city !== draft.city) {
                      // Districts are city-specific; clear the stale selection.
                      setDraft((prev) => ({ ...prev, city, district: '' }));
                    }
                  }}
                />
              ))}
            </View>
            <Text style={styles.fieldLabel}>{t('add.district')}</Text>
            <View style={styles.chipWrap}>
              {districts.map((district) => (
                <SelectChip
                  key={district}
                  label={district}
                  selected={draft.district === district}
                  onPress={() => set('district', district)}
                />
              ))}
            </View>
            {fieldErrors.district ? (
              <Text style={styles.inlineError}>{fieldErrors.district}</Text>
            ) : null}
            <FormInput
              label={t('add.neighborhood')}
              value={draft.neighborhood}
              onChangeText={(v) => set('neighborhood', v)}
            />
            <FormInput
              label={t('add.street')}
              value={draft.street}
              onChangeText={(v) => set('street', v)}
            />
            <FormInput
              label={t('add.landmark')}
              value={draft.nearbyLandmark}
              onChangeText={(v) => set('nearbyLandmark', v)}
            />
          </View>
        );
      }
      case 3:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step3.title')}</Text>
            <View style={styles.twoCol}>
              <FormInput
                label={t('add.rooms')}
                value={draft.rooms}
                onChangeText={(v) => set('rooms', v)}
                keyboardType="numeric"
                style={styles.col}
                error={fieldErrors.rooms}
              />
              <FormInput
                label={t('add.bedrooms')}
                value={draft.bedrooms}
                onChangeText={(v) => set('bedrooms', v)}
                keyboardType="numeric"
                style={styles.col}
              />
            </View>
            <View style={styles.twoCol}>
              <FormInput
                label={t('add.bathrooms')}
                value={draft.bathrooms}
                onChangeText={(v) => set('bathrooms', v)}
                keyboardType="numeric"
                style={styles.col}
              />
              <FormInput
                label={t('add.area')}
                value={draft.area}
                onChangeText={(v) => set('area', v)}
                keyboardType="numeric"
                style={styles.col}
                error={fieldErrors.area}
              />
            </View>
            <View style={styles.twoCol}>
              <FormInput
                label={t('add.floor')}
                value={draft.floor}
                onChangeText={(v) => set('floor', v)}
                keyboardType="numeric"
                style={styles.col}
              />
              <FormInput
                label={t('add.totalFloors')}
                value={draft.totalFloors}
                onChangeText={(v) => set('totalFloors', v)}
                keyboardType="numeric"
                style={styles.col}
              />
            </View>
            <View style={styles.toggleCard}>
              <ToggleRow label={t('amenity.furnished')} value={draft.furnished} onValueChange={(v) => set('furnished', v)} />
              <ToggleRow label={t('amenity.parking')} value={draft.parking} onValueChange={(v) => set('parking', v)} />
              <ToggleRow label={t('amenity.balcony')} value={draft.balcony} onValueChange={(v) => set('balcony', v)} />
              <ToggleRow label={t('amenity.airConditioning')} value={draft.airConditioning} onValueChange={(v) => set('airConditioning', v)} />
              <ToggleRow label={t('amenity.internet')} value={draft.internet} onValueChange={(v) => set('internet', v)} />
              <ToggleRow label={t('amenity.petsAllowed')} value={draft.petsAllowed} onValueChange={(v) => set('petsAllowed', v)} />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step4.title')}</Text>
            <FormInput
              label={isRent ? t('add.monthlyPrice') : t('add.salePrice')}
              value={draft.price}
              onChangeText={(v) => set('price', v)}
              keyboardType="numeric"
              error={fieldErrors.price}
            />
            <Text style={styles.fieldLabel}>{t('add.currency')}</Text>
            <View style={styles.chipWrap}>
              {CURRENCIES.map((c) => (
                <SelectChip
                  key={c}
                  label={c}
                  selected={draft.currency === c}
                  onPress={() => set('currency', c)}
                />
              ))}
            </View>
            {isRent ? (
              <>
                <FormInput
                  label={t('add.deposit')}
                  value={draft.deposit}
                  onChangeText={(v) => set('deposit', v)}
                  keyboardType="numeric"
                  error={fieldErrors.deposit}
                />
                <FormInput
                  label={t('add.availableFrom')}
                  value={draft.availableFrom}
                  onChangeText={(v) => set('availableFrom', v)}
                  autoCapitalize="none"
                  placeholder="2026-08-01"
                  error={fieldErrors.availableFrom}
                />
                <FormInput
                  label={t('add.maxOccupants')}
                  value={draft.maxOccupants}
                  onChangeText={(v) => set('maxOccupants', v)}
                  keyboardType="numeric"
                />
                <View style={styles.toggleCard}>
                  <ToggleRow
                    label={t('add.utilitiesIncluded')}
                    value={draft.utilitiesIncluded}
                    onValueChange={(v) => set('utilitiesIncluded', v)}
                  />
                </View>
              </>
            ) : null}
            <FormInput
              label={t('add.contactPhone')}
              value={draft.contactPhone}
              onChangeText={(v) => set('contactPhone', v)}
              keyboardType="phone-pad"
              error={fieldErrors.contactPhone}
            />
            <FormInput
              label={t('add.telegram')}
              value={draft.telegramUsername}
              onChangeText={(v) => set('telegramUsername', v)}
              autoCapitalize="none"
              placeholder="@username"
            />
            {/* Non-editable commission notice */}
            <View style={styles.commissionCard}>
              <Ionicons name="pricetag" size={18} color={colors.trust} />
              <Text style={styles.commissionLabel}>{t('add.commission')}</Text>
              <Text style={styles.commissionValue}>{t('add.commissionValue')}</Text>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step5.title')}</Text>
            <FormInput
              label={t('add.listingTitle')}
              value={draft.title}
              onChangeText={(v) => set('title', v)}
              maxLength={80}
              error={fieldErrors.title}
            />
            <FormInput
              label={t('add.description')}
              value={draft.description}
              onChangeText={(v) => set('description', v)}
              multiline
              maxLength={800}
              error={fieldErrors.description}
            />
            <View style={styles.photoHeader}>
              <Text style={styles.fieldLabel}>{t('add.photos')}</Text>
              <Text style={styles.photoHint}>{t('add.photoHint')}</Text>
            </View>
            <View style={styles.photoGrid}>
              {draft.images.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.photoItem}>
                  <PropertyImage uri={uri} style={styles.photoImage} />
                  <Pressable
                    onPress={() => removePhoto(index)}
                    accessibilityRole="button"
                    accessibilityLabel={t('add.removePhoto')}
                    style={styles.photoRemove}
                    hitSlop={6}>
                    <Ionicons name="close" size={16} color={colors.textInverse} />
                  </Pressable>
                </View>
              ))}
              {draft.images.length < MAX_PHOTOS ? (
                <Pressable
                  onPress={() => void addPhotos()}
                  accessibilityRole="button"
                  accessibilityLabel={t('add.addPhoto')}
                  style={({ pressed }) => [styles.addPhoto, pressed && styles.pressed]}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                  <Text style={styles.addPhotoText}>{t('add.addPhoto')}</Text>
                </Pressable>
              ) : null}
            </View>
            {fieldErrors.images ? (
              <Text style={styles.inlineError}>{fieldErrors.images}</Text>
            ) : null}
          </View>
        );
      case 6:
      default:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>{t('add.step6.title')}</Text>
            <View style={styles.summaryCard}>
              <SummaryRow label={t('add.listingTitle')} value={draft.title || '—'} />
              <SummaryRow
                label={t('add.listingType')}
                value={t(`listingType.${draft.listingType}`)}
              />
              <SummaryRow
                label={t('search.propertyType')}
                value={draft.propertyType ? t(`type.${draft.propertyType}`) : '—'}
              />
              <SummaryRow
                label={t('add.district')}
                value={draft.district ? `${draft.district}, ${draft.city}` : '—'}
              />
              <SummaryRow
                label={isRent ? t('add.monthlyPrice') : t('add.salePrice')}
                value={
                  draft.price
                    ? formatPrice(
                        Number(draft.price.replace(/\s/g, '')) || 0,
                        draft.currency,
                        draft.listingType,
                        t('common.perMonth'),
                      )
                    : '—'
                }
              />
              {isRent ? (
                <SummaryRow label={t('add.deposit')} value={draft.deposit || '—'} />
              ) : null}
              <SummaryRow
                label={t('add.rooms')}
                value={draft.rooms ? `${draft.rooms} ${t('common.rooms')}` : '—'}
              />
              <SummaryRow label={t('add.area')} value={draft.area ? `${draft.area} m²` : '—'} />
              {isRent ? (
                <SummaryRow label={t('add.availableFrom')} value={draft.availableFrom || '—'} />
              ) : null}
              <SummaryRow label={t('add.contactPhone')} value={draft.contactPhone || '—'} />
              <SummaryRow label={t('add.photos')} value={String(draft.images.length)} />
              <SummaryRow label={t('add.commission')} value="0" highlight />
            </View>
            <Text style={styles.reviewNote}>{t('add.success.text')}</Text>
          </View>
        );
    }
  };

  const isLastStep = step === TOTAL_STEPS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header + progress */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('add.title')}</Text>
          <Text style={styles.stepCounter}>
            {t('add.step')} {step}/{TOTAL_STEPS} · {stepTitles[step - 1]}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
          </View>
          <View style={styles.ownerNotice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.info} />
            <Text style={styles.ownerNoticeText}>{t('add.ownerOnly')}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer navigation */}
        <View style={styles.footer}>
          {step > 1 ? (
            <SecondaryButton
              title={t('common.previous')}
              icon="chevron-back"
              onPress={goPrev}
              style={styles.footerButton}
            />
          ) : null}
          {isLastStep ? (
            <PrimaryButton
              title={t('add.submit')}
              icon="checkmark"
              onPress={submit}
              style={styles.footerButton}
            />
          ) : (
            <PrimaryButton
              title={t('common.next')}
              icon="chevron-forward"
              onPress={goNext}
              style={styles.footerButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>
        {value}
      </Text>
    </View>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...textStyles.title,
  },
  stepCounter: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  ownerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  ownerNoticeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  stepBody: {
    gap: spacing.md,
  },
  stepHeading: {
    ...textStyles.sectionTitle,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  inlineError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    fontWeight: fontWeight.medium,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  typeCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  listingTypeCard: {
    paddingVertical: spacing.md,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  typeLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  selectChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  selectChipTextSelected: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  toggleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  commissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.trustLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  commissionLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  commissionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.trust,
  },
  photoHeader: {
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  photoHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoItem: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: 96,
    height: 96,
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
  },
  addPhotoText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  summaryValueHighlight: {
    color: colors.trust,
  },
  reviewNote: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
  gateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  gateIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gateTitle: {
    ...textStyles.title,
    textAlign: 'center',
  },
  gateText: {
    ...textStyles.bodyMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
