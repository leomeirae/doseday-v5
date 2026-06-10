/**
 * Client IDs OAuth do Google — PÚBLICOS (não-segredo), reusados da V4.
 *
 * O mesmo bundle `com.doseday.premium` é usado na V4 e V5, então estes IDs
 * (projeto Google `553630899758`) são reaproveitados como estão. O client
 * SECRET do Google vive SOMENTE no painel do Supabase (provider Google) —
 * nunca no repositório. Estes três valores são seguros para versionar:
 * client IDs e o URL scheme reverso são embarcados no app e expostos por design.
 */

export const GOOGLE_WEB_CLIENT_ID =
  '553630899758-k5m9ejsqr378lko949qo4a5apmbpotaa.apps.googleusercontent.com'

export const GOOGLE_IOS_CLIENT_ID =
  '553630899758-j2n0e39169d0tuvoncjd4131gtoq3qd5.apps.googleusercontent.com'

/**
 * iOS client ID invertido — usado como URL scheme no `app.json`
 * (config do plugin `@react-native-google-signin/google-signin`).
 */
export const GOOGLE_IOS_URL_SCHEME =
  'com.googleusercontent.apps.553630899758-j2n0e39169d0tuvoncjd4131gtoq3qd5'
