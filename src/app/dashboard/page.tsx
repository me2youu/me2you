'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Gift {
  id: string;
  recipientName: string;
  customMessage: string | null;
  shortUrl: string;
  viewCount: number;
  createdAt: string;
  templateId: string;
  expiresAt: string | null;
  selectedAddons: any[] | null;
}

export default function DashboardPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchGifts();
  }, []);

  async function fetchGifts() {
    try {
      const res = await fetch('/api/gifts');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view your dashboard.');
          return;
        }
        throw new Error('Failed to fetch gifts');
      }
      const data = await res.json();
      // Sort by newest first
      data.sort((a: Gift, b: Gift) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGifts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyLink(giftId: string) {
    navigator.clipboard.writeText(`${appUrl}/gift/${giftId}`);
    setCopiedId(giftId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getExpiryStatus(gift: Gift): { label: string; color: string; canExtend: boolean } {
    if (!gift.expiresAt) {
      return { label: 'Lifetime', color: 'text-accent-green bg-accent-green/10 border-accent-green/20', canExtend: false };
    }
    const now = new Date();
    const expires = new Date(gift.expiresAt);
    if (expires < now) {
      return { label: 'Expired', color: 'text-red-400 bg-red-400/10 border-red-400/20', canExtend: true };
    }
    // Still live — show time remaining
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    let timeLabel: string;
    if (days > 0) {
      timeLabel = `${days}d ${hours % 24}h left`;
    } else {
      timeLabel = `${hours}h left`;
    }
    return { label: timeLabel, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', canExtend: true };
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-poppins">Your Gifts</h1>
            <p className="text-gray-500 text-sm mt-1">
              {gifts.length > 0
                ? `${gifts.length} gift${gifts.length !== 1 ? 's' : ''} created`
                : 'No gifts yet'}
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-accent-purple/25 transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Gift
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-gray-400 mb-4">{error}</p>
            <Link
              href="/sign-in"
              className="text-accent-purple hover:text-accent-pink transition-colors text-sm font-medium"
            >
              Sign in
            </Link>
          </div>
        )}

        {!loading && !error && gifts.length === 0 && (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No gifts yet</h3>
            <p className="text-gray-500 mb-6">Create your first gift and share it with someone special.</p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-accent-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-purple/80 transition-all"
            >
              Browse Templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {!loading && !error && gifts.length > 0 && (
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="glass rounded-xl p-4 sm:p-5 hover:bg-dark-700/50 transition-all group"
              >
                {/* Top row: name + status */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-white font-semibold truncate text-sm sm:text-base">
                    Gift for {gift.recipientName}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {gift.viewCount}
                    </span>
                    {(() => {
                      const status = getExpiryStatus(gift);
                      return (
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Message + date */}
                {gift.customMessage && (
                  <p className="text-gray-500 text-xs sm:text-sm truncate">{gift.customMessage}</p>
                )}
                <p className="text-gray-600 text-xs mt-1">{formatDate(gift.createdAt)}</p>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  {getExpiryStatus(gift).canExtend && (
                    <Link
                      href={`/extend?giftId=${gift.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-purple/10 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/20 transition-all"
                    >
                      Extend
                    </Link>
                  )}
                  <button
                    onClick={() => copyLink(gift.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      copiedId === gift.id
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                        : 'glass text-gray-400 hover:text-white hover:bg-dark-600/80'
                    }`}
                  >
                    {copiedId === gift.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link
                    href={`/gift/${gift.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium glass text-gray-400 hover:text-white hover:bg-dark-600/80 transition-all"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
