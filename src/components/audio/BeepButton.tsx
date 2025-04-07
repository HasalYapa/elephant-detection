import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { playSound } from '@/lib/sound';

interface BeepButtonProps {
  label?: string;
}

const BeepButton: React.FC<BeepButtonProps> = ({ label = 'Test Beep Sound' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playBeep = async () => {
    try {
      setIsPlaying(true);
      setError(null);

      // Use the sound utility to play the beep sound
      await playSound('/beep-loud.mp3', 1.0);

      // Set a timeout to reset the playing state after the sound duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Unknown error playing sound');
      }
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button
        onClick={playBeep}
        disabled={isPlaying}
        className="flex items-center px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 disabled:opacity-50"
      >
        {isPlaying ? (
          <Volume2 size={16} className="mr-2 animate-pulse" />
        ) : (
          <Volume2 size={16} className="mr-2" />
        )}
        {label}
      </button>

      {error && (
        <div className="text-destructive text-sm mt-1 flex items-center">
          <VolumeX size={14} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default BeepButton;
