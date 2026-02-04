'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HelpBubble() {
  const pathname = usePathname();

  // Hide on gift pages — don't cover the gift content
  if (pathname?.startsWith('/gift/')) return null;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject: 'Help Bubble Query' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }

      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    setSent(false);
    setError('');
  }

  return (
    <div className="fixed bottom-5 right-5 z-50" ref={panelRef}>
      {/* Chat panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[340px] sm:w-[360px] rounded-2xl bg-dark-800 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-purple to-accent-pink p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Need help?</h3>
                <p className="text-white/70 text-xs mt-0.5">We usually reply within a few hours</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white text-sm font-medium mb-1">Message sent!</p>
                <p className="text-gray-500 text-xs mb-3">We&apos;ll get back to you soon.</p>
                <button
                  onClick={handleReset}
                  className="text-accent-purple text-xs font-medium hover:text-accent-pink transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email"
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                />
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="How can we help?"
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all resize-none"
                />

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}

            {/* Link to full contact page */}
            <div className="mt-3 pt-3 border-t border-white/5 text-center">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
              >
                Need more help? Visit our contact page &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setOpen(!open); if (!open) handleReset(); }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg shadow-accent-purple/30 hover:shadow-xl hover:shadow-accent-purple/40 hover:scale-105 transition-all flex items-center justify-center"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
