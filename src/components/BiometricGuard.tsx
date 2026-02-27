import { authenticate, checkBiometrics } from '@/src/utils/biometrics';
import { Lock, ScanFace } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store/useStore';

export const BiometricGuard = ({ children }: { children: React.ReactNode }) => {
  const { language, isBiometricEnabled } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(!isBiometricEnabled);
  const appState = useRef(AppState.currentState);
  const isTR = language === 'tr';

  const handleAuthentication = useCallback(async () => {
    if (!isBiometricEnabled) {
      setIsAuthenticated(true);
      return;
    }

    const canAuth = await checkBiometrics();
    if (canAuth) {
      const success = await authenticate(isTR);
      if (success) {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(true);
    }
  }, [isBiometricEnabled, isTR]);

  useEffect(() => {
    if (!isBiometricEnabled) {
      setIsAuthenticated(true);
    } else if (!isAuthenticated) {
      handleAuthentication();
    }
  }, [isBiometricEnabled, handleAuthentication, isAuthenticated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isBiometricEnabled
      ) {
        setIsAuthenticated(false);
        handleAuthentication();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled, handleAuthentication]);

  if (!isAuthenticated && isBiometricEnabled) {
    return (
      <View style={[styles.container, { backgroundColor: '#09090b' }]}>
        <View style={styles.lockCircle}>
          <Lock size={40} color="#10b981" />
        </View>
        <Text style={styles.title}>{isTR ? 'Luxtra Kilitli' : 'Luxtra Locked'}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={handleAuthentication}
          activeOpacity={0.8}
        >
          <ScanFace size={20} color="#09090b" />
          <Text style={styles.retryText}>{isTR ? 'Kilidi Aç' : 'Unlock'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#f4f4f5',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: '#09090b',
    fontSize: 16,
    fontWeight: '700',
  }
});