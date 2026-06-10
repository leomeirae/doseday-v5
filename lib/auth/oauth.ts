/**
 * Login social (Google + Apple) via Supabase `signInWithIdToken`.
 *
 * Cada função retorna um `OAuthOutcome` discriminado — o componente de UI
 * decide o que mostrar. Sucesso não roteia aqui: o `AuthGuard` (app/_layout.tsx)
 * reage à mudança de sessão e leva conta nova → onboarding / existente → tabs.
 */
import { Platform } from 'react-native'
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import { supabase } from '@lib/supabase/client'
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './oauthConfig'

export type OAuthOutcome =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }

const GENERIC_ERROR = 'Não foi possível concluir o login. Tente novamente.'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return GENERIC_ERROR
}

/** Configura o Google Sign In uma vez no startup (no-op na web). */
export function configureGoogleSignIn(): void {
  if (Platform.OS === 'web') return
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  })
}

export async function signInWithGoogle(): Promise<OAuthOutcome> {
  if (Platform.OS === 'web') {
    return { status: 'error', message: 'Login com Google indisponível na web.' }
  }

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    }

    const response = await GoogleSignin.signIn()
    if (!isSuccessResponse(response)) {
      return { status: 'cancelled' }
    }

    const idToken = response.data.idToken
    if (!idToken) {
      return { status: 'error', message: 'Não foi possível obter o token do Google.' }
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })
    if (error) return { status: 'error', message: error.message }

    return { status: 'success' }
  } catch (error: unknown) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { status: 'cancelled' }
    }
    return { status: 'error', message: getErrorMessage(error) }
  }
}

/** Logout best-effort do Google — chamado no sign-out do app. */
export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === 'web') return
  try {
    await GoogleSignin.signOut()
  } catch {
    // best-effort: o usuário pode não ter logado via Google
  }
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false
  return AppleAuthentication.isAvailableAsync()
}

function isAppleCancellation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'ERR_REQUEST_CANCELED'
  )
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function signInWithApple(): Promise<OAuthOutcome> {
  if (Platform.OS !== 'ios') {
    return { status: 'error', message: 'Apple Sign In disponível apenas no iOS.' }
  }

  try {
    // Nonce: gera bruto, manda o SHA-256 pra Apple e o bruto pro Supabase.
    const rawNonce = bytesToHex(await Crypto.getRandomBytesAsync(32))
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    )

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    })

    if (!credential.identityToken) {
      return { status: 'error', message: 'Não foi possível obter o token da Apple.' }
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    })
    if (error) return { status: 'error', message: error.message }

    return { status: 'success' }
  } catch (error: unknown) {
    if (isAppleCancellation(error)) return { status: 'cancelled' }
    return { status: 'error', message: getErrorMessage(error) }
  }
}
