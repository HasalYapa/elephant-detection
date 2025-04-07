"use client";

import { useState, useEffect } from 'react';
import BeepButton from '@/components/audio/BeepButton';

export default function AudioTestPage() {
  const [audioStatus, setAudioStatus] = useState<string>('Not initialized');
  const [audioError, setAudioError] = useState<string | null>(null);

  // Test direct audio playback
  const playBeep = async () => {
    try {
      setAudioStatus('Creating audio element...');
      const audio = new Audio('/beep-loud.mp3'); // Using the louder beep sound
      audio.volume = 1.0;

      setAudioStatus('Setting up event listeners...');

      audio.addEventListener('canplaythrough', () => {
        setAudioStatus('Audio loaded, attempting to play...');
      });

      audio.addEventListener('playing', () => {
        setAudioStatus('Audio is playing!');
      });

      audio.addEventListener('ended', () => {
        setAudioStatus('Audio playback completed');
      });

      audio.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement;
        const errorMessage = target.error?.message || 'Unknown error';
        const errorCode = target.error?.code || 'Unknown code';
        setAudioError(`Error: ${errorMessage} (Code: ${errorCode})`);
        setAudioStatus('Audio playback failed');
      });

      setAudioStatus('Loading audio...');
      audio.load();

      try {
        setAudioStatus('Attempting to play...');
        await audio.play();
      } catch (error) {
        if (error instanceof Error) {
          setAudioError(`Play error: ${error.message}`);
          setAudioStatus('Audio play failed');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setAudioError(`Audio initialization error: ${error.message}`);
        setAudioStatus('Audio initialization failed');
      }
    }
  };

  // Test alternative audio playback method
  const playBeepWithAudioElement = () => {
    setAudioStatus('Using audio element in DOM...');
    const audioElement = document.getElementById('beep-audio') as HTMLAudioElement;

    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.volume = 1.0;

      audioElement.oncanplaythrough = () => {
        setAudioStatus('Audio element loaded, playing...');
      };

      audioElement.onplaying = () => {
        setAudioStatus('Audio element is playing!');
      };

      audioElement.onended = () => {
        setAudioStatus('Audio element playback completed');
      };

      audioElement.onerror = (e) => {
        setAudioError(`Audio element error: ${audioElement.error?.message || 'Unknown error'}`);
        setAudioStatus('Audio element playback failed');
      };

      try {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            setAudioError(`Audio element play error: ${error.message}`);
            setAudioStatus('Audio element play failed');
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          setAudioError(`Audio element play error: ${error.message}`);
          setAudioStatus('Audio element play failed');
        }
      }
    } else {
      setAudioError('Audio element not found in DOM');
      setAudioStatus('Audio element not found');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audio Test Page</h1>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Audio Status</h2>
        <div className="mb-4">
          <div className="font-medium">Status: <span className="text-primary">{audioStatus}</span></div>
          {audioError && (
            <div className="text-destructive mt-2">{audioError}</div>
          )}
        </div>

        <div className="flex space-x-4 flex-wrap gap-2">
          <button
            onClick={playBeep}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Play Beep (JavaScript API)
          </button>

          <button
            onClick={playBeepWithAudioElement}
            className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80"
          >
            Play Beep (HTML Element)
          </button>

          <div className="mt-2 w-full">
            <BeepButton label="Play Beep (Component)" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">HTML Audio Element</h2>
        <p className="mb-4">This is a standard HTML audio element with controls:</p>

        <audio
          id="beep-audio"
          src="/beep-loud.mp3"
          controls
          preload="auto"
          className="w-full"
        />

        <div className="mt-6 text-sm text-muted-foreground">
          <p>If you can play the audio using the controls above but not with the buttons, there might be an issue with the JavaScript audio API.</p>
          <p className="mt-2">If you can't hear any sound at all, check your system volume and make sure your browser has permission to play audio.</p>
        </div>
      </div>
    </div>
  );
}
