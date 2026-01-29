'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get('giftId');
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const giftUrl = `${appUrl}/gift/${shortUrl || giftId}`;

  // Fetch gift to get the correct shortUrl (for custom URLs)
  useEffect(() => {
    if (giftId) {
      fetch(`/api/gifts/${giftId}`)
        .then(res => res.json())
        .then(data => {
          if (data.shortUrl) setShortUrl(data.shortUrl);
        })
        .catch(() => {});
    }
  }, [giftId]);

  // Confirm the order on page load (fallback for when ITN webhook doesn't fire)
  useEffect(() => {
    if (orderId) {
      fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      }).catch(() => {
        // Silent fail - ITN webhook is the primary confirmation
      });
    }
  }, [orderId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareGift = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I made you something special!',
          text: 'Open this link for a surprise gift I made just for you!',
          url: giftUrl,
        });
        setShared(true);
      } catch (e) {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <div className="glass rounded-2xl p-10 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
          Payment successful!
        </h2>
        <p className="text-gray-400 mb-8">
          Your gift is ready to share. Copy the link below and send it.
        </p>

        {giftId && (
          <>
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

            {/* Share Button */}
            <button
              onClick={shareGift}
              className="w-full mb-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white py-3.5 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all flex items-center justify-center gap-2"
            >
              {shared ? (
                <>Shared!</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Gift
                </>
              )}
            </button>

            {/* Preview */}
            <Link
              href={`/gift/${shortUrl || giftId}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-accent-purple hover:text-accent-pink transition-colors text-sm font-medium mb-6"
            >
              Open preview
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </>
        )}

        {orderId && (
          <p className="text-gray-600 text-xs mt-4">Order: {orderId}</p>
        )}
      </div>

      <div className="flex justify-center gap-6 mt-8">
        <Link href="/templates" className="text-gray-500 hover:text-accent-purple text-sm transition-colors">
          Create another
        </Link>
        <Link href="/dashboard" className="text-gray-500 hover:text-accent-purple text-sm transition-colors">
          My Gifts
        </Link>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-xl">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
