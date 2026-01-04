import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

const coinSound = require('../../assets/sounds/coin.wav');
const milestoneSound = require('../../assets/sounds/milestone.wav');

export function useGameSounds() {
  const coinSoundRef = useRef<Audio.Sound | null>(null);
  const milestoneSoundRef = useRef<Audio.Sound | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound: coin } = await Audio.Sound.createAsync(coinSound);
        const { sound: milestone } = await Audio.Sound.createAsync(milestoneSound);

        coinSoundRef.current = coin;
        milestoneSoundRef.current = milestone;
        isLoadedRef.current = true;
      } catch (error) {
        console.warn('Failed to load sounds:', error);
      }
    };

    loadSounds();

    return () => {
      coinSoundRef.current?.unloadAsync();
      milestoneSoundRef.current?.unloadAsync();
    };
  }, []);

  const playCoinSound = useCallback(async () => {
    if (!isLoadedRef.current || !coinSoundRef.current) return;
    try {
      await coinSoundRef.current.setPositionAsync(0);
      await coinSoundRef.current.playAsync();
    } catch {
      // ignore
    }
  }, []);

  const playMilestoneSound = useCallback(async () => {
    if (!isLoadedRef.current || !milestoneSoundRef.current) return;
    try {
      await milestoneSoundRef.current.setPositionAsync(0);
      await milestoneSoundRef.current.playAsync();
    } catch {
      // ignore
    }
  }, []);

  return { playCoinSound, playMilestoneSound };
}
