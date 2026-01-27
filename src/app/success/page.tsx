'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get('giftId');
  const [copied, setCopied] = useState(false);

  const giftUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gift/${giftId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaText = () => {
    const message = `I made something for you! ${giftUrl}`;
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
  };

  const shareViaEmail = () => {
    const subject = 'I made something for you';
    const body = `Hey! I made a little something for you.\n\nCheck it out here: ${giftUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!giftId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">?</div>
          <h2 className="text-xl font-bold text-white mb-4">No Gift Found</h2>
          <Link
            href="/templates"
            className="bg-accent-purple text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-purple/80 transition-all"
          >
            Create a Gift
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-2xl p-10 text-center">
        {/* Success */}
        <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
          Gift created
        </h2>
        <p className="text-gray-400 mb-8">
          Copy the link below and send it to them.
        </p>

        {/* URL Copy */}
        <div className="bg-dark-800 rounded-lg p-1 flex items-center gap-2 mb-8">
          <input
            type="text"
            value={giftUrl}
            readOnly
            className="flex-1 px-4 py-2.5 bg-transparent text-gray-300 text-sm outline-none min-w-0"
          />
          <button
            onClick={copyToClipboard}
            className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              copied
                ? 'bg-accent-green text-white'
                : 'bg-accent-purple text-white hover:bg-accent-purple/80'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Preview */}
        <Link
          href={`/gift/${giftId}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-accent-purple hover:text-accent-pink transition-colors text-sm font-medium mb-8"
        >
          Open preview
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </Link>

        {/* Share */}
        <div className="border-t border-white/5 pt-6">
          <p className="text-sm text-gray-500 mb-4">Or share directly</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={shareViaText}
              className="flex-1 max-w-[160px] glass text-gray-300 py-3 rounded-lg hover:bg-dark-600/80 transition-all text-sm font-medium"
            >
              Text
            </button>
            <button
              onClick={shareViaEmail}
              className="flex-1 max-w-[160px] glass text-gray-300 py-3 rounded-lg hover:bg-dark-600/80 transition-all text-sm font-medium"
            >
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex justify-center gap-6 mt-8">
        <Link href="/templates" className="text-gray-500 hover:text-accent-purple text-sm transition-colors">
          Create another
        </Link>
        <Link href="/" className="text-gray-500 hover:text-accent-purple text-sm transition-colors">
          Home
        </Link>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-xl">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
