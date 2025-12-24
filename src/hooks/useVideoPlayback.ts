import { useState, useEffect, useCallback, useRef } from "react";

interface Scene {
  sceneNumber: number;
  duration: string;
  visualUrl?: string;
}

interface UseVideoPlaybackProps {
  scenes: Scene[];
  onSceneChange?: (index: number) => void;
}

export const useVideoPlayback = ({ scenes, onSceneChange }: UseVideoPlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sceneStartTimesRef = useRef<number[]>([]);

  // Calculate scene start times and total duration
  useEffect(() => {
    let accumulated = 0;
    const startTimes: number[] = [];
    
    scenes.forEach((scene) => {
      startTimes.push(accumulated);
      accumulated += parseInt(scene.duration) || 4;
    });
    
    sceneStartTimesRef.current = startTimes;
    setTotalDuration(accumulated);
  }, [scenes]);

  // Get current scene based on time
  const getSceneIndexAtTime = useCallback((time: number) => {
    const startTimes = sceneStartTimesRef.current;
    for (let i = startTimes.length - 1; i >= 0; i--) {
      if (time >= startTimes[i]) {
        return i;
      }
    }
    return 0;
  }, []);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1;
          
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return 0; // Loop back to start
          }
          
          // Update scene index
          const newSceneIndex = getSceneIndexAtTime(newTime);
          if (newSceneIndex !== currentSceneIndex) {
            setCurrentSceneIndex(newSceneIndex);
            onSceneChange?.(newSceneIndex);
          }
          
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, totalDuration, currentSceneIndex, getSceneIndexAtTime, onSceneChange]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const seekToScene = useCallback((index: number) => {
    const startTime = sceneStartTimesRef.current[index] || 0;
    setCurrentTime(startTime);
    setCurrentSceneIndex(index);
    onSceneChange?.(index);
  }, [onSceneChange]);

  const seekToTime = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, totalDuration));
    setCurrentTime(clampedTime);
    setCurrentSceneIndex(getSceneIndexAtTime(clampedTime));
  }, [totalDuration, getSceneIndexAtTime]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSceneIndex(0);
    onSceneChange?.(0);
  }, [onSceneChange]);

  // Get progress within current scene (0-1)
  const getCurrentSceneProgress = useCallback(() => {
    const startTimes = sceneStartTimesRef.current;
    const sceneStart = startTimes[currentSceneIndex] || 0;
    const sceneDuration = parseInt(scenes[currentSceneIndex]?.duration) || 4;
    return (currentTime - sceneStart) / sceneDuration;
  }, [currentTime, currentSceneIndex, scenes]);

  return {
    isPlaying,
    currentSceneIndex,
    currentTime,
    totalDuration,
    play,
    pause,
    togglePlayPause,
    seekToScene,
    seekToTime,
    reset,
    getCurrentSceneProgress,
    setCurrentSceneIndex,
  };
};
