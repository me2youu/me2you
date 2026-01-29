'use client';

import { useEffect, useState } from 'react';

const phrases = ['birthdays', 'anniversaries', 'apologies', 'thank yous', 'just because'];

export default function TypingAnimation() {
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

  return (
    <span className="text-gradient bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-[length:200%_auto] animate-gradient">
      {typedText || 'birthdays'}
      <span className="animate-blink">|</span>
    </span>
  );
}
