'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-xl">
        <div className="glass rounded-2xl p-10 text-center">
          {/* Cancel icon */}
          <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
            Payment cancelled
          </h2>
          <p className="text-gray-400 mb-8">
            No worries - your gift draft is saved. You can try again anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 glass text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-dark-600/80 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
