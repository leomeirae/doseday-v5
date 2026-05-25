// lib/theme/tokens.ts
// Tokens canônicos do design system DoseDay V5.
// Fonte de verdade: docs/DESIGN.md + .impeccable/design.json
// Atualizado via Prompt 03 (aplicar tokens canônicos do DESIGN.md)

export const colors = {
  // Background
  bgBase: '#050B12',
  bgElevated: '#0E1620',
  bgSurface: '#1B2433',

  // Brand
  brand: '#00D4AA',
  brandDim: '#00B894',
  mintSoft: '#A3E6D2',

  // Semantic
  semanticPositive: '#00D4AA',
  semanticWarning: '#FFB347',
  semanticCritical: '#E64545',
  semanticInfo: '#5BA8D9',
  semanticMuted: '#5C6878',

  // Destructive actions (iOS HIG system red, distinto de semanticCritical que e magenta-red custom)
  destructive: '#FF453A',

  // Text
  textPrimary: '#F2F4F7',
  textSecondary: '#9CA8B8',
  textTertiary: '#6B7280',
  textInverse: '#050B12',
  textBrand: '#00D4AA',

  // Clinical (gráficos)
  clinicalWeight: '#00D4AA',
  clinicalDose: '#5BA8D9',
  clinicalMild: '#7DD3A0',
  clinicalModerate: '#FFB347',
  clinicalSevere: '#E64545',
} as const

export const typography = {
  display:      { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  displayUltralight: { fontSize: 28, fontWeight: '300' as const, lineHeight: 34 },
  headline:     { fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
  title:        { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  subtitle:     { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body:         { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyClinical: { fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
  label:        { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  caption:      { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  tabLabel:     { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  numberHero:   { fontSize: 48, fontWeight: '700' as const, lineHeight: 54 }, // Hero number — usado APENAS em NextDoseCard D1+ (Vital Mint Rarity)
  numberPersonal: { fontSize: 48, fontWeight: '300' as const, lineHeight: 54 },
  numberLarge:  { fontSize: 40, fontWeight: '700' as const, lineHeight: 48 },
  numberMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  monoData:     { fontFamily: 'SF Mono, monospace', fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
} as const

export const spacing = {
  xxs:  4,
  xs:   8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
} as const

export const radius = {
  xs:   6,
  sm:  10,
  md:  14,
  lg:  20,
  xl:  28,
  full: 9999,
} as const

export const elevation = {
  0: { shadowOpacity: 0,    shadowRadius: 0,  shadowOffset: { width: 0, height: 0  } },
  1: { shadowOpacity: 0.20, shadowRadius: 2,  shadowOffset: { width: 0, height: 1  } },
  2: { shadowOpacity: 0.30, shadowRadius: 12, shadowOffset: { width: 0, height: 4  } },
  3: { shadowOpacity: 0.45, shadowRadius: 32, shadowOffset: { width: 0, height: 12 } },
} as const
