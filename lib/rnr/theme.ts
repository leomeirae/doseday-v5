const treatmentTheme = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  popover: 'hsl(var(--popover))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  destructive: 'hsl(var(--destructive))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  radius: 'var(--radius)',
} as const

export const NAV_THEME = {
  light: treatmentTheme,
  dark: treatmentTheme,
} as const
