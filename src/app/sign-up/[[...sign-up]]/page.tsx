'use client';

import { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  const [promoEmails, setPromoEmails] = useState(true);

  // Store preference in localStorage so we can sync it to DB after signup
  function handleToggle() {
    const next = !promoEmails;
    setPromoEmails(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('me2you_promo_emails', String(next));
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 w-full max-w-[440px]">
        <SignUp 
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-dark-800 border border-white/5 shadow-2xl shadow-black/50",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-dark-700 border-white/10 text-white hover:bg-dark-600",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-dark-700 border-white/10 text-white",
              footerActionLink: "text-accent-purple hover:text-accent-pink",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500",
            },
            variables: {
              colorPrimary: '#a855f7',
              colorBackground: '#16161f',
              colorText: '#e5e5e5',
              colorTextSecondary: '#888',
              colorInputBackground: '#1e1e2a',
              colorInputText: '#fff',
            }
          }}
        />

        {/* Promotional email opt-in — sits below Clerk card, styled to match */}
        <div className="w-full rounded-xl bg-dark-800 border border-white/5 px-5 py-4">
          <label
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleToggle}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              promoEmails 
                ? 'bg-accent-purple border-accent-purple' 
                : 'border-gray-600 bg-transparent group-hover:border-gray-400'
            }`}>
              {promoEmails && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-400 leading-snug group-hover:text-gray-300 transition-colors">
              I&apos;d like to receive promotional emails and updates from Me2You
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
