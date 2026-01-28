'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';

interface Template {
  id: string;
  name: string;
  description: string;
  occasion: string[];
  thumbnailUrl: string | null;
  htmlTemplate: string;
  cssTemplate: string | null;
  jsTemplate: string | null;
  basePrice: string;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'datetime' | 'url' | 'color' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
}

// Smart field type detection based on variable name
function detectFieldType(varName: string): TemplateVariable['type'] {
  const lower = varName.toLowerCase();
  
  if (lower.includes('date') && !lower.includes('update')) return 'datetime';
  if (lower.includes('url') || lower.includes('link') || lower.includes('photo') || lower.includes('image')) return 'url';
  if (lower.includes('color') || lower.includes('theme')) return 'color';
  if (lower.includes('number') || lower.includes('count')) return 'number';
  if (lower.includes('message') || lower.includes('letter') || lower.includes('description') || lower.includes('caption')) return 'textarea';
  
  return 'text';
}

// Convert camelCase/snake_case to readable label
function formatLabel(varName: string): string {
  return varName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export default function CustomizePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Custom URL addon state
  const [wantCustomUrl, setWantCustomUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customUrlStatus, setCustomUrlStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [previewUrl] = useState(() => {
    // Generate a random preview URL to show what they'd get without the addon
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  });

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) throw new Error('Template not found');
      const data = await response.json();
      setTemplate(data);
      
      // Extract variables and initialize form
      const vars = extractVariables(data.htmlTemplate);
      const initialData: Record<string, string> = {};
      vars.forEach(v => {
        initialData[v.name] = '';
      });
      setFormData(initialData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract all {{variable}} patterns from template HTML
  const extractVariables = (html: string): TemplateVariable[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = html.matchAll(regex);
    const uniqueVars = new Set<string>();
    
    for (const match of matches) {
      uniqueVars.add(match[1]);
    }

    return Array.from(uniqueVars)
      .map(name => ({
        name,
        type: detectFieldType(name),
        label: formatLabel(name),
        required: name === 'recipientName',
      }))
      .sort((a, b) => {
        // recipientName always first
        if (a.name === 'recipientName') return -1;
        if (b.name === 'recipientName') return 1;
        // customMessage typically last
        if (a.name === 'customMessage') return 1;
        if (b.name === 'customMessage') return -1;
        return a.label.localeCompare(b.label);
      });
  };

  const templateVariables = useMemo(() => {
    if (!template) return [];
    return extractVariables(template.htmlTemplate);
  }, [template]);

  const renderPreview = () => {
    if (!template) return '';

    let html = template.htmlTemplate;

    // Replace all variables
    templateVariables.forEach(v => {
      const value = formData[v.name] || '';
      html = html.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), value || `[${v.label}]`);
    });

    if (template.cssTemplate) {
      html = html.replace('</head>', `<style>${template.cssTemplate}</style></head>`);
    }
    if (template.jsTemplate) {
      html = html.replace('</body>', `<script>${template.jsTemplate}</script></body>`);
    }

    return html;
  };

  // Check custom URL availability
  const checkCustomUrl = async (url: string) => {
    if (!url || url.length < 3) {
      setCustomUrlStatus('idle');
      return;
    }

    setCustomUrlStatus('checking');
    try {
      const res = await fetch(`/api/gifts/check-url?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setCustomUrlStatus(data.available ? 'available' : data.error?.includes('format') ? 'invalid' : 'taken');
    } catch {
      setCustomUrlStatus('idle');
    }
  };

  // Debounced URL check
  useEffect(() => {
    if (!wantCustomUrl || !customUrl) return;
    const timer = setTimeout(() => checkCustomUrl(customUrl), 500);
    return () => clearTimeout(timer);
  }, [customUrl, wantCustomUrl]);

  // Calculate total price
  const basePrice = parseFloat(template?.basePrice || '0');
  const addonPrice = wantCustomUrl && customUrlStatus === 'available' ? 2.00 : 0;
  const totalPrice = basePrice + addonPrice;

  const handleCreateGift = async () => {
    const recipientName = formData.recipientName?.trim();
    if (!recipientName) {
      setError("Please enter the recipient's name");
      return;
    }

    // Validate custom URL if selected
    if (wantCustomUrl && customUrlStatus !== 'available') {
      setError('Please enter a valid, available custom URL');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // 1. Create the gift
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          recipientName,
          customMessage: formData.customMessage || '',
          customData: formData,
          customUrl: wantCustomUrl && customUrlStatus === 'available' ? customUrl : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create gift');
      }

      const gift = await response.json();

      // 2. Redirect to server-side PayFast form (handles signature + form submission)
      window.location.href = `/api/payment/redirect?giftId=${gift.id}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const renderField = (variable: TemplateVariable) => {
    const value = formData[variable.name] || '';
    const onChange = (newValue: string) => {
      setFormData({ ...formData, [variable.name]: newValue });
    };

    const baseClass = "w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all";

    switch (variable.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClass} resize-none`}
            rows={variable.name.includes('final') || variable.name.includes('letter') ? 5 : 3}
            placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
          />
        );

      case 'date':
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass}
            placeholder={variable.placeholder || "https://example.com/image.jpg"}
          />
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#a855f7'}
              onChange={(e) => onChange(e.target.value)}
              className="h-12 w-16 bg-dark-800 border border-white/10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={baseClass}
              placeholder="#a855f7"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass}
            placeholder={variable.placeholder || "100"}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass}
            placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
            required={variable.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">404</div>
          <h2 className="text-xl font-bold text-white mb-2">Template Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-accent-purple text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-purple/80 transition-all"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to templates
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-1 font-poppins">Customize</h2>
            <p className="text-gray-500 text-sm mb-6">{template?.name}</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {templateVariables.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {variable.label}
                    {variable.required && <span className="text-accent-pink ml-1">*</span>}
                  </label>
                  {renderField(variable)}
                </div>
              ))}

              {templateVariables.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">
                  No customization fields available for this template.
                </p>
              )}
            </div>

            {/* Custom URL Addon */}
            <div className="border-t border-white/5 pt-6 mt-6">
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium text-sm">Your gift URL</h4>
                    <p className="text-gray-500 text-xs mt-0.5">How people will access your gift</p>
                  </div>
                  <span className="text-xs bg-accent-green/10 text-accent-green px-2 py-1 rounded-full">
                    +$2.00
                  </span>
                </div>

                {/* Default URL preview */}
                <div className={`rounded-lg p-3 mb-3 ${wantCustomUrl ? 'bg-dark-800/50' : 'bg-dark-800 border border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="defaultUrl"
                        checked={!wantCustomUrl}
                        onChange={() => setWantCustomUrl(false)}
                        className="w-4 h-4 text-accent-purple bg-dark-700 border-white/20"
                      />
                      <label htmlFor="defaultUrl" className="text-sm cursor-pointer">
                        <span className="text-gray-400">Free:</span>{' '}
                        <code className="text-gray-300 bg-dark-700 px-2 py-0.5 rounded text-xs">
                          me2you.world/gift/{previewUrl}
                        </code>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Custom URL option */}
                <div className={`rounded-lg p-3 ${wantCustomUrl ? 'bg-dark-800 border border-accent-purple/30' : 'bg-dark-800/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      id="customUrlOption"
                      checked={wantCustomUrl}
                      onChange={() => setWantCustomUrl(true)}
                      className="w-4 h-4 text-accent-purple bg-dark-700 border-white/20"
                    />
                    <label htmlFor="customUrlOption" className="text-sm cursor-pointer">
                      <span className="text-gray-400">Custom (+$2):</span>{' '}
                      <span className="text-white">Choose your own URL</span>
                    </label>
                  </div>

                  {wantCustomUrl && (
                    <div className="ml-6 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <span>me2you.world/gift/</span>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="your-custom-url"
                          className="flex-1 bg-dark-700 border border-white/10 rounded px-2 py-1.5 text-white placeholder-gray-600 focus:border-accent-purple/50 outline-none"
                          maxLength={30}
                        />
                      </div>
                      <div className="text-xs">
                        {customUrlStatus === 'checking' && (
                          <span className="text-gray-400">Checking availability...</span>
                        )}
                        {customUrlStatus === 'available' && (
                          <span className="text-accent-green">✓ Available!</span>
                        )}
                        {customUrlStatus === 'taken' && (
                          <span className="text-red-400">✗ Already taken</span>
                        )}
                        {customUrlStatus === 'invalid' && (
                          <span className="text-red-400">✗ 3-30 chars, letters, numbers, hyphens only</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent-purple to-accent-pink">
                    ${totalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">USD, once-off</span>
                  {addonPrice > 0 && (
                    <span className="text-xs text-accent-green ml-2">(incl. custom URL)</span>
                  )}
                </div>
                <span className="text-xs bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-full font-medium">
                  Secure Checkout
                </span>
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full mb-3 glass text-gray-300 py-3 rounded-lg font-medium hover:bg-dark-600/80 transition-all text-sm"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

              <button
                onClick={handleCreateGift}
                disabled={creating || !formData.recipientName?.trim() || (wantCustomUrl && customUrlStatus !== 'available')}
                className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white py-3.5 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Processing...' : `Create & Pay $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>

            {showPreview ? (
              <div className="rounded-lg overflow-hidden bg-dark-900 border border-white/5">
                <iframe
                  srcDoc={renderPreview()}
                  className="w-full h-[600px]"
                  title="Gift Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">👁️</div>
                  <p className="text-gray-600 text-sm">Click "Show Preview" to see your gift</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}
