'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface GiftData {
  id: string;
  recipientName: string;
  expiresAt: string | null;
  selectedAddons: any[] | null;
}

const DURATION_OPTIONS = [
  { key: '3d', label: '3 Days', hours: 72, price: 0.50 },
  { key: '1w', label: '1 Week', hours: 168, price: 1.00 },
  { key: 'lifetime', label: 'Lifetime', hours: null, price: 2.00 },
] as const;

function getCurrentTier(selectedAddons: any[] | null): string {
  if (!selectedAddons || !Array.isArray(selectedAddons)) return '24h';
  // Check for the latest extension or initial duration
  const extensions = selectedAddons.filter((a: any) => a.type?.startsWith('extension_'));
  if (extensions.length > 0) {
    const latest = extensions[extensions.length - 1];
    return latest.type.replace('extension_', '');
  }
  const duration = selectedAddons.find((a: any) => a.type?.startsWith('duration_'));
  if (duration) return duration.type.replace('duration_', '');
  return '24h';
}

const TIER_ORDER: Record<string, number> = { '24h': 0, '3d': 1, '1w': 2, 'lifetime': 3 };

export default function ExtendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    }>
      <ExtendContent />
    </Suspense>
  );
}

function ExtendContent() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get('giftId');

  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (!giftId) {
      setError('No gift ID provided');
      setLoading(false);
      return;
    }
    fetchGift();
  }, [giftId]);

  async function fetchGift() {
    try {
      const res = await fetch(`/api/gifts/${giftId}`);
      if (!res.ok) throw new Error('Gift not found');
      const data = await res.json();
      setGift(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getExpiryLabel(): string {
    if (!gift) return '';
    if (!gift.expiresAt) return 'Lifetime (no expiration)';
    const expires = new Date(gift.expiresAt);
    const now = new Date();
    if (expires < now) return 'Expired';
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  }

  async function handleExtend() {
    if (!selectedDuration || !giftId) return;
    setExtending(true);
    setError('');
    
    try {
      // Initialize extension payment
      const response = await fetch('/api/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, duration: selectedDuration }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initialize extension payment');
      }

      const { reference, email, amount, currency, giftId: returnedGiftId, publicKey } = await response.json();

      // Dynamically import Paystack to avoid SSR issues
      // Using checkout() to support Apple Pay on iOS/Safari
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const popup = new PaystackPop();
      await popup.checkout({
        key: publicKey,
        email,
        amount,
        currency,
        ref: reference,
        onSuccess: () => {
          // Redirect to success page
          window.location.href = `/payment/success?reference=${reference}&giftId=${returnedGiftId}&extension=true`;
        },
        onCancel: () => {
          setError('Payment was cancelled. You can try again.');
          setExtending(false);
        },
      });
    } catch (err: any) {
      setError(err.message);
      setExtending(false);
    }
  }

  const currentTier = gift ? getCurrentTier(gift.selectedAddons) : '24h';
  const currentTierOrder = TIER_ORDER[currentTier] ?? 0;
  // Filter out tiers at or below current level
  const availableOptions = DURATION_OPTIONS.filter(opt => (TIER_ORDER[opt.key] ?? 0) > currentTierOrder);

  // Calculate upgrade price (difference from current tier)
  const currentTierPrice: Record<string, number> = { '24h': 0, '3d': 0.50, '1w': 1.00, 'lifetime': 2.00 };
  function getUpgradePrice(optKey: string): number {
    const targetPrice = DURATION_OPTIONS.find(o => o.key === optKey)?.price ?? 0;
    const currentPrice = currentTierPrice[currentTier] ?? 0;
    return Math.max(0, targetPrice - currentPrice);
  }

  const isLifetime = currentTier === 'lifetime';

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">Extend Gift Duration</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/dashboard" className="text-accent-purple hover:text-accent-pink text-sm font-medium transition-colors">
              Return to Dashboard
            </Link>
          </div>
        )}

        {!loading && !error && gift && (
          <div className="space-y-6">
            {/* Gift info card */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold">Gift for {gift.recipientName}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  isLifetime
                    ? 'text-accent-green bg-accent-green/10 border-accent-green/20'
                    : gift.expiresAt && new Date(gift.expiresAt) < new Date()
                      ? 'text-red-400 bg-red-400/10 border-red-400/20'
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                }`}>
                  {getExpiryLabel()}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                Current tier: <span className="text-gray-300 font-medium capitalize">{currentTier === '24h' ? '24 Hours' : currentTier === '3d' ? '3 Days' : currentTier === '1w' ? '1 Week' : 'Lifetime'}</span>
              </p>
            </div>

            {isLifetime ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Already Lifetime</h3>
                <p className="text-gray-500 text-sm">This gift will never expire. No extension needed.</p>
              </div>
            ) : (
              <>
                {/* Duration options */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Upgrade to</h3>
                  <div className="space-y-2">
                    {availableOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No upgrade options available.</p>
                    ) : (
                      availableOptions.map(opt => {
                        const upgradePrice = getUpgradePrice(opt.key);
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedDuration(opt.key)}
                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                              selectedDuration === opt.key
                                ? 'border-accent-purple bg-accent-purple/10'
                                : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-medium">{opt.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {opt.key === 'lifetime' ? 'Never expires' : `${opt.hours} hours from ${gift.expiresAt && new Date(gift.expiresAt) > new Date() ? 'current expiry' : 'now'}`}
                                </div>
                              </div>
                              <div className={`text-lg font-bold ${selectedDuration === opt.key ? 'text-accent-purple' : 'text-white'}`}>
                                ${upgradePrice.toFixed(2)}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Extend button */}
                {availableOptions.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Payment processed in South African Rand (ZAR) at current exchange rate.
                    </p>
                    <button
                      onClick={handleExtend}
                      disabled={!selectedDuration || extending}
                      className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white py-3.5 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {extending ? 'Redirecting...' : selectedDuration ? `Extend for $${getUpgradePrice(selectedDuration).toFixed(2)}` : 'Select a duration'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
