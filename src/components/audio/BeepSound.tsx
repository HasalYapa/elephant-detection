import { useEffect, useRef, useState } from 'react';

interface BeepSoundProps {
  play: boolean;
  confidence: number;
  confidenceThreshold: number;
  debug?: boolean;
}

const BeepSound: React.FC<BeepSoundProps> = ({ play, confidence, confidenceThreshold, debug = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // For debugging
  useEffect(() => {
    if (debug) {
      console.log('BeepSound props:', { play, confidence, confidenceThreshold });
      console.log('BeepSound state:', { isAudioLoaded, audioError, isPlaying });
    }
  }, [play, confidence, confidenceThreshold, isAudioLoaded, audioError, isPlaying, debug]);

  // Initialize audio element on component mount
  useEffect(() => {
    let audio: HTMLAudioElement;
    try {
      audio = new Audio('/beep-loud.mp3'); // Using the louder beep sound
      audio.volume = 1.0; // Maximum volume for better audibility
      audio.preload = 'auto';
      audio.loop = false;

      if (debug) {
        console.log('Audio element created with src:', audio.src);
      }

      const handleCanPlayThrough = () => {
        setIsAudioLoaded(true);
        setAudioError(null);
        if (debug) {
          console.log('Audio loaded successfully and ready to play');
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handleError = (e: Event) => {
        const target = e.target as HTMLAudioElement;
        const errorMessage = target.error?.message || 'Unknown error';
        const errorCode = target.error?.code || 'Unknown code';
        setAudioError(`Failed to load audio: ${errorMessage}`);
        console.error('Audio loading error:', { message: errorMessage, code: errorCode, src: target.src });
        setIsAudioLoaded(false);
      };

      // Add event listeners
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audioRef.current = audio;

      // Preload the audio file
      audio.load();

      // Cleanup function
      return () => {
        if (audio) {
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          audio.pause();
          audioRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioError('Failed to initialize audio system');
      return () => {};
    }
  }, []);

  // Log prop changes for debugging
  useEffect(() => {
    if (debug) {
      console.log('BeepSound play prop changed:', { play, confidence, confidenceThreshold });
    }

    // Log when play prop changes specifically
    if (debug && play) {
      console.log('PLAY PROP CHANGED TO TRUE!');
    }
  }, [play, confidence, confidenceThreshold, debug]);

  // Handle stopping the sound when play changes from true to false
  useEffect(() => {
    if (!play && isPlaying) {
      // Stop the sound when play prop becomes false
      try {
        // Stop any playing audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });

        // Also stop our audio ref if it exists
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        setIsPlaying(false);
        console.log('Sound stopped because play prop changed to false');
      } catch (err) {
        console.error('Error stopping sound:', err);
      }
    }
  }, [play, isPlaying]);

  // Handle audio playback
  useEffect(() => {
    // Force play when the play prop changes from false to true
    const shouldPlay = play && confidence >= confidenceThreshold && isAudioLoaded && !audioError;

    if (debug) {
      console.log('Should play audio?', {
        shouldPlay,
        play,
        confidence,
        confidenceThreshold,
        isAudioLoaded,
        audioError,
        isPlaying
      });
    }

    // Play sound when play prop is true, regardless of other conditions
    if (play && audioRef.current) {
      console.log('PLAY PROP IS TRUE - ATTEMPTING TO PLAY SOUND');

      // Try to play the sound using the utility function
      try {
        const audio = new Audio('/beep-loud.mp3');
        audio.volume = 1.0;
        audio.loop = false; // Ensure the sound doesn't loop

        // Add event listener to log when the sound ends
        audio.addEventListener('ended', () => {
          console.log('Beep sound ended');
          setIsPlaying(false);
        });

        audio.play().catch(err => console.error('Direct play error:', err));
      } catch (err) {
        console.error('Error creating audio:', err);
      }
    }

    // Original condition for playing through the component
    if (shouldPlay && audioRef.current) {
      const playSound = async () => {
        try {
          const audio = audioRef.current;
          if (!audio) return;

          // Reset audio state
          audio.currentTime = 0;
          audio.volume = 1.0; // Maximum volume for better audibility
          setIsPlaying(true);

          if (debug) {
            console.log('Attempting to play audio...');
          }

          // Attempt to play the sound
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
              if (debug) {
                console.log('Audio playback started successfully');
              }
            }
          } catch (error) {
            console.error('Audio play error:', error);
            if (error instanceof Error) {
              if (error.name === 'NotAllowedError') {
                setAudioError('Please interact with the page to enable sound');
              } else {
                console.error('Playback failed:', error);
                setAudioError(`Sound playback failed: ${error.message}`);
              }
            }
            setIsPlaying(false);
          }
        } catch (error) {
          console.error('Error playing beep sound:', error);
          setAudioError('Failed to play sound alert');
          setIsPlaying(false);
        }
      };

      playSound();
    }

    // Cleanup function
    return () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
  }, [play, confidence, confidenceThreshold, isAudioLoaded, audioError, isPlaying]);

  // Render a debug view if debug is enabled, otherwise render nothing
  if (debug) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-md text-xs z-50">
        <div>Audio Status: {isAudioLoaded ? '✅ Loaded' : '❌ Not Loaded'}</div>
        <div>Should Play: {play && confidence >= confidenceThreshold ? '✅ Yes' : '❌ No'}</div>
        <div>Confidence: {(confidence * 100).toFixed(1)}%</div>
        <div>Is Playing: {isPlaying ? '✅ Yes' : '❌ No'}</div>
        {audioError && <div className="text-red-400">Error: {audioError}</div>}
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = 1.0;
              audioRef.current.play().catch(err => console.error('Manual play error:', err));
            }
          }}
          className="mt-2 bg-primary text-white px-2 py-1 rounded text-xs"
        >
          Force Play
        </button>
      </div>
    );
  }

  return null;
};

export default BeepSound;