import Toast from 'react-native-toast-message'

export function showSuccessToast(message: string): void {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'bottom',
    visibilityTime: 2500,
  })
}

export function showErrorToast(message: string): void {
  Toast.show({
    type: 'error',
    text1: message,
    position: 'bottom',
    visibilityTime: 3500,
  })
}
