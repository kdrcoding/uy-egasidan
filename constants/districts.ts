/**
 * Cities and their districts, used across search filters, the add-property
 * form and mock data. Districts are city-specific so the form and filters
 * never offer a Tashkent district for a Samarqand listing.
 */

export const DEFAULT_CITY = 'Toshkent';

export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  Toshkent: [
    'Chilonzor',
    'Yunusobod',
    'Mirobod',
    'Yakkasaroy',
    'Shayxontohur',
    'Uchtepa',
    'Sergeli',
    'Mirzo Ulugbek',
    'Yashnobod',
    'Olmazor',
    'Bektemir',
    'Yangihayot',
  ],
  Samarqand: ['Markaz', 'Registon atrofi', 'Sattepo', 'Motrid', 'Ulug‘bek', 'Sog‘diyona'],
  Buxoro: ['Markaz', 'Eski shahar', 'Kogon yo‘li', 'Sitorai Mohi Xosa', 'Gijduvon yo‘li'],
  Andijon: ['Markaz', 'Bog‘ishamol', 'Yangi shahar', 'Eski shahar', 'Asaka yo‘li'],
  "Farg'ona": ['Markaz', 'Yermazar', 'Kirguli', 'Al-Farg‘oniy', 'Qirguli sanoat'],
  Namangan: ['Markaz', 'Davlatobod', 'Yangi Namangan', 'Eski shahar'],
  Nukus: ['Markaz', 'Qidirniyoz', '27-mikrorayon', 'Do‘slik'],
  Urganch: ['Markaz', 'Yoshlik', 'Al-Xorazmiy', 'Toza bog‘'],
  Qarshi: ['Markaz', 'Nasaf', 'Sharq', 'Eski shahar'],
  Termiz: ['Markaz', 'Yangi Termiz', 'Alpomish', 'Port atrofi'],
  Jizzax: ['Markaz', 'Sharof Rashidov', 'Yangi shahar'],
  Guliston: ['Markaz', 'Yangi Guliston', 'Sanoat zonasi'],
  Navoiy: ['Markaz', 'Ibn Sino', 'Yangi shahar'],
};

export const CITIES: string[] = Object.keys(DISTRICTS_BY_CITY);

export function districtsForCity(city: string): string[] {
  return DISTRICTS_BY_CITY[city] ?? [];
}

/** Kept for places that show a default district strip (e.g. Home quick chips). */
export const TASHKENT_DISTRICTS: string[] = DISTRICTS_BY_CITY[DEFAULT_CITY];
