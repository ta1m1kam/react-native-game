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

export function useShakeDetector(): UseShakeDetectorReturn {
  const [shakeCount, setShakeCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const prevDataRef = useRef<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const lastShakeTimeRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  const detectShake = useCallback(
    (current: AccelerometerData, prev: AccelerometerData): boolean => {
      const deltaX = Math.abs(current.x - prev.x);
      const deltaY = Math.abs(current.y - prev.y);
      const deltaZ = Math.abs(current.z - prev.z);
      const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
      return totalDelta > SHAKE_THRESHOLD;
    },
    []
  );

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
      const isShake = detectShake(data, prevDataRef.current);
      const isCooldownPassed = now - lastShakeTimeRef.current > SHAKE_COOLDOWN_MS;

      if (isShake && isCooldownPassed) {
        setShakeCount((prev) => prev + 1);
        lastShakeTimeRef.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      prevDataRef.current = data;
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isActive, detectShake]);

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
    prevDataRef.current = { x: 0, y: 0, z: 0 };
    lastShakeTimeRef.current = 0;
  }, []);

  return { shakeCount, isActive, start, stop, reset };
}
