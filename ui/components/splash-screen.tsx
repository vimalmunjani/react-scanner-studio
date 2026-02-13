import { useEffect, useState } from 'react';

interface SplashScreenProps {
  minDuration?: number;
  onComplete: () => void;
}

export function SplashScreen({
  minDuration = 2000,
  onComplete,
}: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, minDuration - 300);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, minDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Gradient cloud background */}
      <div
        className='absolute inset-0 flex items-center justify-center pointer-events-none'
        aria-hidden='true'
      >
        <div
          className='w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full opacity-20'
          style={{
            background: 'linear-gradient(-90deg, #ff914d 50%, #ff3131 50%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
      <div className='relative z-10 flex flex-col items-center gap-6 animate-pulse'>
        <img
          src='/logo.png'
          alt='React Scanner Studio'
          className='w-32 h-32 sm:w-40 sm:h-40 rounded-2xl'
        />
        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-2xl font-bold text-foreground'>
            React Scanner Studio
          </h1>
          <p className='text-sm text-muted-foreground'>
            Brewing your dashboard ☕
          </p>
        </div>
      </div>
    </div>
  );
}
