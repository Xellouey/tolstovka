export interface SizeOption {
  value: string
  label: string
}

export type SizePresetKey = 'apparel' | 'footwear'

const normalize = (value: string) => value.replace(/\s+/g, '').toUpperCase()
const upper = (value: string) => value.toUpperCase()

const BASE_OPTION: SizeOption = { value: '', label: 'Без размера' }

const APPAREL_SIZE_ITEMS: SizeOption[] = [
  { value: 'XXS', label: 'XXS' },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
  { value: 'ONE SIZE', label: 'One Size' }
]

const FOOTWEAR_SIZE_VALUES = Array.from({ length: 15 }, (_, index) => String(35 + index))
const FOOTWEAR_SIZE_ITEMS: SizeOption[] = FOOTWEAR_SIZE_VALUES.map(value => ({ value, label: value }))

export const APPAREL_SIZE_OPTIONS: SizeOption[] = [BASE_OPTION, ...APPAREL_SIZE_ITEMS]

export const FOOTWEAR_SIZE_OPTIONS: SizeOption[] = [BASE_OPTION, ...FOOTWEAR_SIZE_ITEMS]

export const PRODUCT_SIZE_OPTIONS = APPAREL_SIZE_OPTIONS

export const PRODUCT_SIZE_LABEL_MAP = new Map<string, string>(
  [...APPAREL_SIZE_OPTIONS, ...FOOTWEAR_SIZE_OPTIONS].map(option => [
    normalize(option.value),
    option.label
  ])
)

export function formatProductSizeLabel(value?: string | null): string {
  if (!value) {
    return BASE_OPTION.label
  }
  const label = PRODUCT_SIZE_LABEL_MAP.get(normalize(value))
  return label ?? value
}

export const PRODUCT_SIZE_ORDER = APPAREL_SIZE_ITEMS.map(option => normalize(option.value))

export interface SizePreset {
  key: SizePresetKey
  label: string
  options: SizeOption[]
  values: string[]
}

export const SIZE_PRESETS: Record<SizePresetKey, SizePreset> = {
  apparel: {
    key: 'apparel',
    label: 'Размеры одежды',
    options: APPAREL_SIZE_OPTIONS,
    values: APPAREL_SIZE_ITEMS.map(option => upper(option.value))
  },
  footwear: {
    key: 'footwear',
    label: 'Размеры обуви',
    options: FOOTWEAR_SIZE_OPTIONS,
    values: FOOTWEAR_SIZE_VALUES.map(value => upper(value))
  }
}

const FOOTWEAR_CATEGORY_MATCHERS = ['obuv', 'footwear', 'shoes']

export function getSizePresetForCategory(categorySlug?: string | null): SizePreset {
  if (!categorySlug) {
    return SIZE_PRESETS.apparel
  }

  const normalizedSlug = categorySlug.toLowerCase()
  if (FOOTWEAR_CATEGORY_MATCHERS.some(key => normalizedSlug.includes(key))) {
    return SIZE_PRESETS.footwear
  }

  return SIZE_PRESETS.apparel
}
