'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    occasion: [] as string[],
    thumbnailUrl: '',
    htmlTemplate: '',
    cssTemplate: '',
    jsTemplate: '',
    basePrice: '0',
  });

  const occasions = [
    'birthday', 'thank-you', 'congratulations', 'just-because',
    'valentines', 'friendship', 'anniversary', 'apology', 'get-well',
  ];

  const handleOccasionToggle = (occ: string) => {
    setFormData((prev) => ({
      ...prev,
      occasion: prev.occasion.includes(occ)
        ? prev.occasion.filter((o) => o !== occ)
        : [...prev.occasion, occ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create template');
      }

      const template = await response.json();
      setSuccess(`Template "${template.name}" created!`);

      setFormData({
        name: '', description: '', occasion: [], thumbnailUrl: '',
        htmlTemplate: '', cssTemplate: '', jsTemplate: '', basePrice: '0',
      });

      setTimeout(() => router.push('/templates'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-1 font-poppins">Create Template</h2>
      <p className="text-gray-500 text-sm mb-6">Admin panel for adding new gift templates</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Template Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all"
            placeholder="e.g., Scratch Card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all resize-none"
            rows={2}
            placeholder="Brief description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Occasions</label>
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => handleOccasionToggle(occ)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  formData.occasion.includes(occ)
                    ? 'bg-accent-purple text-white'
                    : 'bg-dark-800 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all"
              placeholder="3.99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Thumbnail URL</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Code */}
        <div className="border-t border-white/5 pt-5">
          <p className="text-xs text-gray-500 mb-4">
            Use <code className="bg-dark-800 px-1.5 py-0.5 rounded text-accent-purple">{'{{recipientName}}'}</code> and <code className="bg-dark-800 px-1.5 py-0.5 rounded text-accent-purple">{'{{customMessage}}'}</code> as placeholders
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">HTML</label>
              <textarea
                required
                value={formData.htmlTemplate}
                onChange={(e) => setFormData({ ...formData, htmlTemplate: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all font-mono text-xs resize-none"
                rows={10}
                placeholder="<html>...</html>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">CSS (optional)</label>
              <textarea
                value={formData.cssTemplate}
                onChange={(e) => setFormData({ ...formData, cssTemplate: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all font-mono text-xs resize-none"
                rows={6}
                placeholder="body { ... }"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">JavaScript (optional)</label>
              <textarea
                value={formData.jsTemplate}
                onChange={(e) => setFormData({ ...formData, jsTemplate: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-gray-300 placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all font-mono text-xs resize-none"
                rows={6}
                placeholder="function init() { ... }"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white py-3.5 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Template'}
        </button>
      </form>
    </div>
  );
}
