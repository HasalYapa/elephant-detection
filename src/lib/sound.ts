/**
 * Utility functions for playing sounds in the application
 */

// Keep track of all audio elements created by the utility
const activeAudioElements: HTMLAudioElement[] = [];

/**
 * Play a sound with multiple fallback methods to ensure it works across browsers
 * @param soundPath Path to the sound file
 * @param volume Volume level (0.0 to 1.0)
 * @returns Promise that resolves when the sound starts playing or rejects if all methods fail
 */
export const playSound = async (soundPath: string, volume: number = 1.0): Promise<void> => {
  // Clear any previously tracked audio elements that have ended
  cleanupAudioElements();
  // Try multiple methods to play the sound
  const methods = [
    playWithAudioAPI,
    playWithExistingElement,
    playWithNewElement
  ];

  let lastError: Error | null = null;

  // Try each method in sequence
  for (const method of methods) {
    try {
      await method(soundPath, volume);
      console.log(`Sound played successfully with method: ${method.name}`);
      return; // Success!
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Sound method ${method.name} failed:`, err);
      // Continue to next method
    }
  }

  // If we get here, all methods failed
  throw lastError || new Error('All sound playback methods failed');
};

/**
 * Play sound using the Audio API
 */
const playWithAudioAPI = async (soundPath: string, volume: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.loop = false; // Ensure the sound doesn't loop

      // Track this audio element
      activeAudioElements.push(audio);

      // Remove from tracking when it ends
      audio.addEventListener('ended', () => {
        const index = activeAudioElements.indexOf(audio);
        if (index !== -1) {
          activeAudioElements.splice(index, 1);
        }
      });

      const onPlay = () => {
        audio.removeEventListener('play', onPlay);
        resolve();
      };

      const onError = (e: Event) => {
        audio.removeEventListener('error', onError);
        reject(new Error(`Audio API error: ${(e.target as HTMLAudioElement).error?.message || 'Unknown error'}`));
      };

      audio.addEventListener('play', onPlay);
      audio.addEventListener('error', onError);

      const playPromise = audio.play();
      if (playPromise === undefined) {
        // Older browsers might not return a promise
        setTimeout(resolve, 100);
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Play sound using an existing audio element in the DOM
 */
const playWithExistingElement = async (soundPath: string, volume: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Look for existing audio elements with the same source
      const audioElements = Array.from(document.querySelectorAll('audio')).filter(
        el => el.src.includes(soundPath.split('/').pop() || '')
      );

      if (audioElements.length === 0) {
        return reject(new Error('No matching audio elements found in DOM'));
      }

      const audio = audioElements[0];
      audio.volume = volume;
      audio.currentTime = 0;

      const onPlay = () => {
        audio.removeEventListener('play', onPlay);
        resolve();
      };

      const onError = (e: Event) => {
        audio.removeEventListener('error', onError);
        reject(new Error(`Existing element error: ${audio.error?.message || 'Unknown error'}`));
      };

      audio.addEventListener('play', onPlay);
      audio.addEventListener('error', onError);

      const playPromise = audio.play();
      if (playPromise === undefined) {
        // Older browsers might not return a promise
        setTimeout(resolve, 100);
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Play sound by creating a new audio element
 */
const playWithNewElement = async (soundPath: string, volume: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new audio element
      const audio = document.createElement('audio');
      audio.src = soundPath;
      audio.volume = volume;
      audio.loop = false; // Ensure the sound doesn't loop

      // Track this audio element
      activeAudioElements.push(audio);

      // Remove from tracking when it ends
      audio.addEventListener('ended', () => {
        const index = activeAudioElements.indexOf(audio);
        if (index !== -1) {
          activeAudioElements.splice(index, 1);
        }
      });
      audio.style.display = 'none';

      const onCanPlay = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);

        const playPromise = audio.play();
        if (playPromise === undefined) {
          // Older browsers might not return a promise
          setTimeout(() => {
            document.body.removeChild(audio);
            resolve();
          }, 1000);
        } else {
          playPromise
            .then(() => {
              setTimeout(() => {
                document.body.removeChild(audio);
                resolve();
              }, 1000);
            })
            .catch(err => {
              document.body.removeChild(audio);
              reject(err);
            });
        }
      };

      const onError = (e: Event) => {
        audio.removeEventListener('error', onError);
        if (document.body.contains(audio)) {
          document.body.removeChild(audio);
        }
        reject(new Error(`New element error: ${audio.error?.message || 'Unknown error'}`));
      };

      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);

      document.body.appendChild(audio);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Stop all sounds that are currently playing
 * @returns The number of sounds that were stopped
 */
export const stopAllSounds = (): number => {
  let stoppedCount = 0;

  // Stop all tracked audio elements
  activeAudioElements.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
      stoppedCount++;
    } catch (err) {
      console.error('Error stopping audio:', err);
    }
  });

  // Clear the array
  activeAudioElements.length = 0;

  // Also try to stop any audio elements in the DOM
  try {
    const domAudioElements = document.querySelectorAll('audio');
    domAudioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        stoppedCount++;
      } catch (err) {
        console.error('Error stopping DOM audio:', err);
      }
    });
  } catch (err) {
    console.error('Error accessing DOM audio elements:', err);
  }

  return stoppedCount;
};

/**
 * Clean up audio elements that have ended or are no longer needed
 */
const cleanupAudioElements = (): void => {
  // Remove any audio elements that have ended
  for (let i = activeAudioElements.length - 1; i >= 0; i--) {
    const audio = activeAudioElements[i];
    if (audio.ended || audio.paused) {
      activeAudioElements.splice(i, 1);
    }
  }
};