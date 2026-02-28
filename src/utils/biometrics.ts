import * as LocalAuthentication from 'expo-local-authentication';

export async function checkBiometrics(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function authenticate(isTR: boolean): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: isTR ? 'Luxtra Kilidini Aç' : 'Unlock Luxtra',
      fallbackLabel: isTR ? 'Şifre Gir' : 'Enter Passcode',
      cancelLabel: isTR ? 'İptal' : 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch {
    return false;
  }
}

