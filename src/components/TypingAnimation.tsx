'use client';

import { useEffect, useState } from 'react';

const phrases = ['valentines', 'birthdays', 'anniversaries', 'apologies', 'thank yous', 'just because'];

export default function TypingAnimation() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setFading(false);
      }, 300);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-gradient bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-[length:200%_auto] animate-gradient inline-block transition-all duration-300"
      style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)' }}
    >
      {phrases[index]}
    </span>
  );
}
