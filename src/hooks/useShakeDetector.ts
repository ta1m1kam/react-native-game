import { useState, useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import {
  SHAKE_THRESHOLD,
  SHAKE_COOLDOWN_MS,
  SENSOR_UPDATE_INTERVAL_MS,
} from '../constants/game';
import type { AccelerometerData } from '../types/game';

interface UseShakeDetectorReturn {
  shakeCount: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const STRONG_SHAKE_MULTIPLIER = 2.0;
const MEDIUM_SHAKE_MULTIPLIER = 1.5;
const MILESTONE_INTERVAL = 10;

export function useShakeDetector(): UseShakeDetectorReturn {
  const [shakeCount, setShakeCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const prevDataRef = useRef<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const lastShakeTimeRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const shakeCountRef = useRef(0);

  const getShakeIntensity = useCallback(
    (current: AccelerometerData, prev: AccelerometerData): number => {
      const deltaX = Math.abs(current.x - prev.x);
      const deltaY = Math.abs(current.y - prev.y);
      const deltaZ = Math.abs(current.z - prev.z);
      return Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
    },
    []
  );

  const triggerHaptic = useCallback((intensity: number, newCount: number) => {
    const isMilestone = newCount > 0 && newCount % MILESTONE_INTERVAL === 0;

    if (isMilestone) {
      // マイルストーン: 連続した強い振動
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
    } else if (intensity > SHAKE_THRESHOLD * STRONG_SHAKE_MULTIPLIER) {
      // 強いシェイク: Heavy
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      // 通常シェイク: Medium（Lightより強く）
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      return;
    }

    Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener((data) => {
      const now = Date.now();
      const intensity = getShakeIntensity(data, prevDataRef.current);
      const isShake = intensity > SHAKE_THRESHOLD;
      const isCooldownPassed = now - lastShakeTimeRef.current > SHAKE_COOLDOWN_MS;

      if (isShake && isCooldownPassed) {
        const newCount = shakeCountRef.current + 1;
        shakeCountRef.current = newCount;
        setShakeCount(newCount);
        lastShakeTimeRef.current = now;
        triggerHaptic(intensity, newCount);
      }

      prevDataRef.current = data;
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isActive, getShakeIntensity, triggerHaptic]);

  const start = useCallback(() => {
    prevDataRef.current = { x: 0, y: 0, z: 0 };
    lastShakeTimeRef.current = 0;
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setShakeCount(0);
    shakeCountRef.current = 0;
    prevDataRef.current = { x: 0, y: 0, z: 0 };
    lastShakeTimeRef.current = 0;
  }, []);

  return { shakeCount, isActive, start, stop, reset };
}
