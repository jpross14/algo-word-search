import { useState, useRef, useEffect } from 'react';

export const useTimer = () => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!isTimerRunning && startTime === null) {
      const now = Date.now();
      setStartTime(now);
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setStartTime(null);
    setElapsedTime(0);
    setFinalScore(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateTimeBonus = (baseScore: number, timeInSeconds: number): number => {
    const timeBonus = Math.floor(baseScore / (timeInSeconds / 60));
    return baseScore + timeBonus;
  };

  useEffect(() => {
    if (isTimerRunning && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, startTime]);

  return {
    startTime,
    elapsedTime,
    isTimerRunning,
    finalScore,
    setFinalScore,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
    calculateTimeBonus
  };
};