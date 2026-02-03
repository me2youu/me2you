'use client';

import { useEffect, useState } from 'react';

const phrases = ['valentines', 'birthdays', 'anniversaries', 'apologies', 'thank yous', 'just because'];

export default function TypingAnimation() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    const interval = setInterval(() => {
      setFading(true);
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setFading(false);
      }, 300);
      return () => clearTimeout(timeout);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-gradient bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-[length:200%_auto] animate-gradient inline-block"
      style={{
        opacity: hydrated ? (fading ? 0 : 1) : 1,
        transform: hydrated ? (fading ? 'translateY(8px)' : 'translateY(0)') : 'none',
        transition: hydrated ? 'opacity 0.3s, transform 0.3s' : 'none',
      }}
    >
      {phrases[index]}
    </span>
  );
}
