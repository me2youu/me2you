'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useUploadThing } from '@/lib/uploadthing';

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

// Addon definitions - variables starting with "enable" are treated as paid addons
const ADDON_PRICE = 0.50;
const ADDON_DETAILS: Record<string, { label: string; description: string; icon: string }> = {
  enableConfetti: { label: 'Confetti Burst', description: 'Celebrate with a confetti explosion on reveal', icon: '🎉' },
  enableSparkles: { label: 'Sparkle Trail', description: 'Glitter particles that float around', icon: '✨' },
  enableLuckyNumbers: { label: 'Lucky Numbers', description: 'Add random lucky numbers to the fortune', icon: '🔢' },
  enableFireflies: { label: 'Fireflies', description: 'Warm glowing fireflies float across the night sky', icon: '🪲' },
  enableExtraBottles: { label: 'Extra Bottles', description: 'Two more bottles wash ashore, each with its own message', icon: '🍾' },
  enableExtraSlides: { label: 'Extra Slides', description: 'Add up to 4 more meme slides ($0.50 each filled)', icon: '🖼️' },
  enableMicBlow: { label: 'Mic Blow', description: 'Blow into the microphone to extinguish candles!', icon: '🎤' },
  enableExtraPhotos: { label: 'Extra Photos', description: 'Add up to 6 more photos ($0.50 each)', icon: '📸' },
  enableExtraSongs: { label: 'Extra Songs', description: 'Add up to 3 more songs to your top 5 ($0.50 each)', icon: '🎵' },
  enableExtraMoments: { label: 'Extra Moments', description: 'Add up to 3 more moments to your top 5 ($0.50 each)', icon: '✨' },
  enableExtraEpisodes: { label: 'Extra Episodes', description: 'Add 2 more episodes to your show ($0.50 each filled)', icon: '🎬' },
  enableExtraTopThings: { label: 'Extra Top Things', description: 'Add 2 more items to your Top Things list ($0.50 each filled)', icon: '🏆' },
};

// Addons that are free toggles (they unlock paid fields instead of costing $0.50 themselves)
const FREE_TOGGLE_ADDONS = new Set(['enableExtraSlides', 'enableExtraPhotos', 'enableExtraSongs', 'enableExtraMoments', 'enableExtraEpisodes', 'enableExtraTopThings']);

// Fields that should only be visible when a specific addon is enabled
const ADDON_DEPENDENT_FIELDS: Record<string, string[]> = {
  enableExtraBottles: ['customMessage2', 'customMessage3'],
  enableExtraSlides: ['memeSlide2', 'memeSlide3', 'memeSlide4', 'memeSlide5', 'memeCaption2', 'memeCaption3', 'memeCaption4', 'memeCaption5'],
  enableExtraPhotos: ['polaroidPhoto3','polaroidPhoto4','polaroidPhoto5','polaroidPhoto6','polaroidPhoto7','polaroidPhoto8','polaroidCaption3','polaroidCaption4','polaroidCaption5','polaroidCaption6','polaroidCaption7','polaroidCaption8'],
  enableExtraSongs: ['wrappedSong3','wrappedArtist3','wrappedSong4','wrappedArtist4','wrappedSong5','wrappedArtist5'],
  enableExtraMoments: ['wrappedMoment3','wrappedMoment4','wrappedMoment5'],
  enableExtraEpisodes: ['episode2Title','episode2Date','episode2Desc','episode3Title','episode3Date','episode3Desc'],
  enableExtraTopThings: ['top3'],
};

// Fields managed by custom UI editors (hidden from the generic form)
const CUSTOM_EDITOR_FIELDS = new Set([
  'memeSlide1', 'memeSlide2', 'memeSlide3', 'memeSlide4', 'memeSlide5',
  'memeCaption1', 'memeCaption2', 'memeCaption3', 'memeCaption4', 'memeCaption5',
  'polaroidPhoto1','polaroidPhoto2','polaroidPhoto3','polaroidPhoto4','polaroidPhoto5','polaroidPhoto6','polaroidPhoto7','polaroidPhoto8',
  'polaroidCaption1','polaroidCaption2','polaroidCaption3','polaroidCaption4','polaroidCaption5','polaroidCaption6','polaroidCaption7','polaroidCaption8',
  'wrappedSong1','wrappedSong2','wrappedSong3','wrappedSong4','wrappedSong5',
  'wrappedArtist1','wrappedArtist2','wrappedArtist3','wrappedArtist4','wrappedArtist5',
  'wrappedMoment1','wrappedMoment2','wrappedMoment3','wrappedMoment4','wrappedMoment5',
  'wrappedTheme',
  'episode1Title','episode1Date','episode1Desc','episode1Image',
  'episode2Title','episode2Date','episode2Desc','episode2Image',
  'episode3Title','episode3Date','episode3Desc','episode3Image',
  'top1','top2','top3',
  'heroImageUrl',
  'showTitle','showDescription','showYear',
]);

// Smart field type detection based on variable name
function detectFieldType(varName: string): TemplateVariable['type'] {
  const lower = varName.toLowerCase();
  
  if (lower.includes('date') && !lower.includes('update')) return 'datetime';
  if (lower.includes('since')) return 'date';
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
    .replace(/(\d+)/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Polaroid photo upload slot component
// startUpload is passed from parent so only ONE useUploadThing instance exists
function PolaroidPhotoSlot({ num, photoVal, captionVal, onPhotoChange, onCaptionChange, startUpload }: {
  num: number; photoVal: string; captionVal: string;
  onPhotoChange: (url: string) => void; onCaptionChange: (val: string) => void;
  startUpload: (files: File[]) => Promise<any[] | undefined>;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await startUpload([file]);
      const uploadedUrl = (res?.[0] as any)?.ufsUrl || res?.[0]?.url;
      if (uploadedUrl) {
        onPhotoChange(uploadedUrl);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail / Upload */}
        <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-dark-900 border border-white/10 relative group">
          {photoVal ? (
            <>
              <img src={photoVal} alt={`Photo ${num}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onPhotoChange('')}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
              >
                Remove
              </button>
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800 transition-colors">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[10px] text-gray-600 mt-0.5">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            </label>
          )}
        </div>
        {/* Info + Caption */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-400">
              Photo {num}
              {num <= 2 && <span className="text-gray-600 ml-1">(free)</span>}
              {num > 2 && <span className="text-accent-green ml-1">+$0.50</span>}
            </span>
          </div>
          <input
            type="text"
            value={captionVal}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
            placeholder="Caption (max 20 chars)"
            maxLength={20}
          />
          {captionVal.length > 0 && (
            <p className={`text-[10px] mt-0.5 text-right ${captionVal.length >= 18 ? 'text-accent-pink' : 'text-gray-600'}`}>
              {captionVal.length}/20
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomizePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Single shared upload handler for all polaroid photo slots and hero image
  const { startUpload } = useUploadThing('imageUploader');
  const [heroUploading, setHeroUploading] = useState(false);

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
        // Set sensible defaults for specific fields
        if (v.name === 'wrappedTheme') initialData[v.name] = 'friendship';
        else initialData[v.name] = '';
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
        // customMessage* fields go at the end, in natural order (1, 2, 3)
        const aIsMsg = a.name.startsWith('customMessage');
        const bIsMsg = b.name.startsWith('customMessage');
        if (aIsMsg && bIsMsg) return a.name.localeCompare(b.name, undefined, { numeric: true });
        if (aIsMsg) return 1;
        if (bIsMsg) return -1;
        return a.label.localeCompare(b.label);
      });
  };

  const templateVariables = useMemo(() => {
    if (!template) return [];
    return extractVariables(template.htmlTemplate).filter(v => !v.name.startsWith('enable'));
  }, [template]);

  // Detect which addons this template supports
  const availableAddons = useMemo(() => {
    if (!template) return [];
    return extractVariables(template.htmlTemplate)
      .filter(v => v.name.startsWith('enable') && ADDON_DETAILS[v.name])
      .map(v => v.name);
  }, [template]);

  const renderPreview = () => {
    if (!template) return '';

    let html = template.htmlTemplate;

    // Replace ALL formData keys (including custom editor fields and addon toggles)
    Object.entries(formData).forEach(([key, value]) => {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    });

    // Replace any remaining {{var}} placeholders with friendly labels
    html = html.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
      if (varName.startsWith('enable')) return 'false';
      return `[${formatLabel(varName)}]`;
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

  // Calculate total price (base + addons + custom URL + per-slide pricing)
  const basePrice = parseFloat(template?.basePrice || '0');
  const customUrlPrice = wantCustomUrl && customUrlStatus === 'available' ? 2.00 : 0;
  const enabledAddonsCount = availableAddons.filter(a => formData[a] === 'true' && !FREE_TOGGLE_ADDONS.has(a)).length;
  const addonsPrice = enabledAddonsCount * ADDON_PRICE;
  // Per-slide pricing: each filled extra slide (2-5) costs $0.50
  const filledExtraSlidesCount = formData.enableExtraSlides === 'true'
    ? [2,3,4,5].filter(n => (formData[`memeSlide${n}`] || '').trim() !== '').length
    : 0;
  const extraSlidesPrice = filledExtraSlidesCount * ADDON_PRICE;
  // Per-photo pricing: photos 3-8 cost $0.50 each when extra photos addon is on
  const filledExtraPhotosCount = formData.enableExtraPhotos === 'true'
    ? [3,4,5,6,7,8].filter(n => (formData[`polaroidPhoto${n}`] || '').trim() !== '').length
    : 0;
  const extraPhotosPrice = filledExtraPhotosCount * ADDON_PRICE;
  // Per-song pricing: songs 3-5 cost $0.50 each when extra songs addon is on
  const filledExtraSongsCount = formData.enableExtraSongs === 'true'
    ? [3,4,5].filter(n => (formData[`wrappedSong${n}`] || '').trim() !== '').length
    : 0;
  const extraSongsPrice = filledExtraSongsCount * ADDON_PRICE;
  // Per-moment pricing: moments 3-5 cost $0.50 each
  const filledExtraMomentsCount = formData.enableExtraMoments === 'true'
    ? [3,4,5].filter(n => (formData[`wrappedMoment${n}`] || '').trim() !== '').length
    : 0;
  const extraMomentsPrice = filledExtraMomentsCount * ADDON_PRICE;
  // Per-episode pricing: episodes 2-3 cost $0.50 each when extra episodes addon is on
  const filledExtraEpisodesCount = formData.enableExtraEpisodes === 'true'
    ? [2,3].filter(n => (formData[`episode${n}Title`] || '').trim() !== '').length
    : 0;
  const extraEpisodesPrice = filledExtraEpisodesCount * ADDON_PRICE;
  // Per-top-thing pricing: top3 costs $0.50 when extra top things addon is on
  const filledExtraTopThingsCount = formData.enableExtraTopThings === 'true'
    ? [3].filter(n => (formData[`top${n}`] || '').trim() !== '').length
    : 0;
  const extraTopThingsPrice = filledExtraTopThingsCount * ADDON_PRICE;
  const totalPrice = basePrice + customUrlPrice + addonsPrice + extraSlidesPrice + extraPhotosPrice + extraSongsPrice + extraMomentsPrice + extraEpisodesPrice + extraTopThingsPrice;

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
      // Build selected addons array for pricing
      const enabledAddons = availableAddons
        .filter(a => formData[a] === 'true' && !FREE_TOGGLE_ADDONS.has(a))
        .map(a => ({ type: a, price: ADDON_PRICE }));

      // Add per-slide pricing for extra filled slides
      if (formData.enableExtraSlides === 'true') {
        [2,3,4,5].forEach(n => {
          if ((formData[`memeSlide${n}`] || '').trim() !== '') {
            enabledAddons.push({ type: `extraSlide${n}`, price: ADDON_PRICE });
          }
        });
      }

      // Add per-photo pricing for extra uploaded photos (3-8)
      if (formData.enableExtraPhotos === 'true') {
        [3,4,5,6,7,8].forEach(n => {
          if ((formData[`polaroidPhoto${n}`] || '').trim() !== '') {
            enabledAddons.push({ type: `extraPhoto${n}`, price: ADDON_PRICE });
          }
        });
      }

      // Add per-song pricing for extra songs (3-5)
      if (formData.enableExtraSongs === 'true') {
        [3,4,5].forEach(n => {
          if ((formData[`wrappedSong${n}`] || '').trim() !== '') {
            enabledAddons.push({ type: `extraSong${n}`, price: ADDON_PRICE });
          }
        });
      }

      // Add per-moment pricing for extra moments (3-5)
      if (formData.enableExtraMoments === 'true') {
        [3,4,5].forEach(n => {
          if ((formData[`wrappedMoment${n}`] || '').trim() !== '') {
            enabledAddons.push({ type: `extraMoment${n}`, price: ADDON_PRICE });
          }
        });
      }

      // Add per-episode pricing for extra episodes (2-3)
      if (formData.enableExtraEpisodes === 'true') {
        [2,3].forEach(n => {
          if ((formData[`episode${n}Title`] || '').trim() !== '') {
            enabledAddons.push({ type: `extraEpisode${n}`, price: ADDON_PRICE });
          }
        });
      }

      // Add per-top-thing pricing for extra top thing (3)
      if (formData.enableExtraTopThings === 'true') {
        if ((formData.top3 || '').trim() !== '') {
          enabledAddons.push({ type: 'extraTopThing3', price: ADDON_PRICE });
        }
      }

      // 1. Create the gift
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          recipientName,
          customMessage: formData.customMessage || '',
          customData: formData,
          selectedAddons: enabledAddons,
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
      case 'textarea': {
        const maxLen = variable.name.includes('letter') || variable.name.includes('final') ? 500
          : variable.name.includes('Description') || variable.name.includes('Desc') ? 200
          : 75;
        return (
          <div>
            <textarea
              value={value}
              onChange={(e) => { if (e.target.value.length <= maxLen) onChange(e.target.value); }}
              className={`${baseClass} resize-none`}
              rows={variable.name.includes('final') || variable.name.includes('letter') ? 5 : 3}
              placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
              maxLength={maxLen}
            />
            <p className={`text-xs mt-1 text-right ${value.length > maxLen * 0.9 ? 'text-accent-pink' : 'text-gray-600'}`}>
              {value.length}/{maxLen}
            </p>
          </div>
        );
      }

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

      default: {
        const textMax = variable.name.includes('Title') || variable.name.includes('title') ? 40 : 80;
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass}
            placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
            required={variable.required}
            maxLength={textMax}
          />
        );
      }
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
              {templateVariables.map((variable) => {
                // Hide fields managed by custom UI editors
                if (CUSTOM_EDITOR_FIELDS.has(variable.name)) return null;

                // Check if this field depends on an addon being enabled
                const dependentAddon = Object.entries(ADDON_DEPENDENT_FIELDS).find(
                  ([, fields]) => fields.includes(variable.name)
                );
                if (dependentAddon && formData[dependentAddon[0]] !== 'true') {
                  return null; // Hide field when its addon is off
                }

                return (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      {variable.label}
                      {variable.required && <span className="text-accent-pink ml-1">*</span>}
                    </label>
                    {renderField(variable)}
                  </div>
                );
              })}

              {templateVariables.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">
                  No customization fields available for this template.
                </p>
              )}

              {/* Meme Slide Editor - shown for templates with memeSlide fields */}
              {templateVariables.some(v => v.name === 'memeSlide1') && (() => {
                const extraSlidesEnabled = formData.enableExtraSlides === 'true';
                const maxSlides = extraSlidesEnabled ? 5 : 1;
                const filledExtraSlides = extraSlidesEnabled
                  ? [2,3,4,5].filter(n => (formData[`memeSlide${n}`] || '').trim() !== '').length
                  : 0;
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">GIF Slides</h4>
                      <a
                        href="https://giphy.com/search/funny"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-accent-purple hover:text-accent-pink text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        Find GIFs on Giphy
                      </a>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Paste a Giphy or image link for each slide</p>
                    <div className="space-y-2">
                      {Array.from({ length: maxSlides }, (_, i) => i + 1).map(num => {
                        const slideKey = `memeSlide${num}`;
                        const captionKey = `memeCaption${num}`;
                        const slideVal = formData[slideKey] || '';
                        const captionVal = formData[captionKey] || '';
                        return (
                          <div key={num} className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-medium text-gray-400 w-6 shrink-0">#{num}</span>
                              <input
                                type="url"
                                value={slideVal}
                                onChange={(e) => setFormData({ ...formData, [slideKey]: e.target.value })}
                                className="flex-1 px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all text-xs"
                                placeholder="https://media.giphy.com/..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 shrink-0"></span>
                              <input
                                type="text"
                                value={captionVal}
                                onChange={(e) => setFormData({ ...formData, [captionKey]: e.target.value })}
                                className="flex-1 px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none transition-all text-xs"
                                placeholder="Caption (optional)"
                                maxLength={100}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {extraSlidesEnabled && filledExtraSlides > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +${(filledExtraSlides * ADDON_PRICE).toFixed(2)} for {filledExtraSlides} extra slide{filledExtraSlides > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Polaroid Photo Editor - shown for templates with polaroidPhoto fields */}
              {templateVariables.some(v => v.name === 'polaroidPhoto1') && (() => {
                const extraPhotosEnabled = formData.enableExtraPhotos === 'true';
                const maxPhotos = extraPhotosEnabled ? 8 : 2;
                const filledExtra = extraPhotosEnabled
                  ? [3,4,5,6,7,8].filter(n => (formData[`polaroidPhoto${n}`] || '').trim() !== '').length
                  : 0;
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Photos</h4>
                      <span className="text-xs text-gray-500">
                        {extraPhotosEnabled ? 'Up to 8 photos' : '2 photos included'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Upload photos for your polaroid wall</p>
                    <div className="space-y-2">
                      {Array.from({ length: maxPhotos }, (_, i) => i + 1).map(num => {
                        const photoKey = `polaroidPhoto${num}`;
                        const captionKey = `polaroidCaption${num}`;
                        const photoVal = formData[photoKey] || '';
                        const captionVal = formData[captionKey] || '';
                        return (
                          <PolaroidPhotoSlot
                            key={num}
                            num={num}
                            photoVal={photoVal}
                            captionVal={captionVal}
                            startUpload={startUpload}
                            onPhotoChange={(url: string) => setFormData(prev => ({ ...prev, [photoKey]: url }))}
                            onCaptionChange={(val: string) => setFormData(prev => ({ ...prev, [captionKey]: val }))}
                          />
                        );
                      })}
                    </div>
                    {/* Add more photos button */}
                    {!extraPhotosEnabled && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableExtraPhotos: 'true' }))}
                        className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-accent-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-accent-purple text-sm font-medium">Add More Photos</span>
                        <span className="text-xs text-gray-500">($0.50 each)</span>
                      </button>
                    )}
                    {extraPhotosEnabled && filledExtra > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +${(filledExtra * ADDON_PRICE).toFixed(2)} for {filledExtra} extra photo{filledExtra > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Wrapped Song Editor - shown for templates with wrappedSong fields */}
              {templateVariables.some(v => v.name === 'wrappedSong1') && (() => {
                const extraSongsEnabled = formData.enableExtraSongs === 'true';
                const maxSongs = extraSongsEnabled ? 5 : 2;
                const filledExtra = extraSongsEnabled
                  ? [3,4,5].filter(n => (formData[`wrappedSong${n}`] || '').trim() !== '').length
                  : 0;
                const currentTheme = formData.wrappedTheme || 'friendship';
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    {/* Theme Selector */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, wrappedTheme: 'friendship' }))}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            currentTheme === 'friendship'
                              ? 'bg-green-500/10 border-green-500/40'
                              : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-lg block mb-1">🤝</span>
                          <span className="text-white text-xs font-semibold">Friendship</span>
                          <span className="text-gray-500 text-[10px] block">Green vibes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, wrappedTheme: 'love' }))}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            currentTheme === 'love'
                              ? 'bg-pink-500/10 border-pink-500/40'
                              : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-lg block mb-1">💕</span>
                          <span className="text-white text-xs font-semibold">Love</span>
                          <span className="text-gray-500 text-[10px] block">Pink & romantic</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Top Songs</h4>
                      <span className="text-xs text-gray-500">
                        {extraSongsEnabled ? 'Up to 5 songs' : '2 songs included'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Add your top songs together</p>
                    <div className="space-y-2">
                      {Array.from({ length: maxSongs }, (_, i) => i + 1).map(num => {
                        const songKey = `wrappedSong${num}`;
                        const artistKey = `wrappedArtist${num}`;
                        const songVal = formData[songKey] || '';
                        const artistVal = formData[artistKey] || '';
                        return (
                          <div key={num} className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold w-5 shrink-0" style={{color: num <= 2 ? '#1db954' : '#1ed760'}}>
                                #{num}
                              </span>
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={songVal}
                                  onChange={(e) => setFormData(prev => ({ ...prev, [songKey]: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                                  placeholder="Song name"
                                  maxLength={60}
                                />
                              </div>
                              <span className="text-[10px] text-gray-600 shrink-0">
                                {num <= 2 ? '(free)' : '+$0.50'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 shrink-0"></span>
                              <input
                                type="text"
                                value={artistVal}
                                onChange={(e) => setFormData(prev => ({ ...prev, [artistKey]: e.target.value }))}
                                className="flex-1 px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                                placeholder="Artist name"
                                maxLength={60}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add more songs button */}
                    {!extraSongsEnabled && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableExtraSongs: 'true' }))}
                        className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-accent-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-accent-purple text-sm font-medium">Add More Songs</span>
                        <span className="text-xs text-gray-500">($0.50 each)</span>
                      </button>
                    )}
                    {extraSongsEnabled && filledExtra > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +${(filledExtra * ADDON_PRICE).toFixed(2)} for {filledExtra} extra song{filledExtra > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Show Details Editor - shown for streaming service templates */}
              {templateVariables.some(v => v.name === 'showTitle') && (() => {
                const titleVal = formData.showTitle || '';
                const descVal = formData.showDescription || '';
                const yearVal = formData.showYear || '';
                const currentYear = new Date().getFullYear();
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <h4 className="text-white font-semibold text-sm mb-3">Show Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Show Title</label>
                        <input
                          type="text"
                          value={titleVal}
                          onChange={(e) => setFormData(prev => ({ ...prev, showTitle: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                          placeholder="e.g. Our Love Story"
                          maxLength={20}
                        />
                        <p className={`text-[10px] mt-0.5 text-right ${titleVal.length >= 18 ? 'text-accent-pink' : 'text-gray-600'}`}>
                          {titleVal.length}/20
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Year</label>
                        <select
                          value={yearVal}
                          onChange={(e) => setFormData(prev => ({ ...prev, showYear: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                        >
                          <option value="">Select year</option>
                          {Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i).map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <input
                          type="text"
                          value={descVal}
                          onChange={(e) => setFormData(prev => ({ ...prev, showDescription: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                          placeholder="Short tagline for your show"
                          maxLength={30}
                        />
                        <p className={`text-[10px] mt-0.5 text-right ${descVal.length >= 27 ? 'text-accent-pink' : 'text-gray-600'}`}>
                          {descVal.length}/30
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Hero Image Upload - shown for templates with heroImageUrl field */}
              {templateVariables.some(v => v.name === 'heroImageUrl') && (() => {
                const heroVal = formData.heroImageUrl || '';
                const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setHeroUploading(true);
                  try {
                    const res = await startUpload([file]);
                    const url = (res?.[0] as any)?.ufsUrl || res?.[0]?.url;
                    if (url) setFormData(prev => ({ ...prev, heroImageUrl: url }));
                  } catch (err) { console.error('Hero upload failed:', err); }
                  finally { setHeroUploading(false); }
                };
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <h4 className="text-white font-semibold text-sm mb-2">Hero Banner Image</h4>
                    <p className="text-gray-600 text-xs mb-3">Upload a photo for the hero background (landscape works best)</p>
                    <div className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                      {heroVal ? (
                        <div className="relative group">
                          <img src={heroVal} alt="Hero" className="w-full h-32 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, heroImageUrl: '' }))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm rounded-md"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-24 flex flex-col items-center justify-center cursor-pointer rounded-md border border-dashed border-white/10 hover:border-accent-purple/30 hover:bg-dark-800 transition-all">
                          {heroUploading ? (
                            <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <svg className="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-xs text-gray-500">Click to upload</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={heroUploading} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Episode Editor - shown for templates with episode fields */}
              {templateVariables.some(v => v.name === 'episode1Title') && (() => {
                const extraEpisodesEnabled = formData.enableExtraEpisodes === 'true';
                const maxEpisodes = extraEpisodesEnabled ? 3 : 1;
                const filledExtra = extraEpisodesEnabled
                  ? [2,3].filter(n => (formData[`episode${n}Title`] || '').trim() !== '').length
                  : 0;
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Episodes</h4>
                      <span className="text-xs text-gray-500">
                        {extraEpisodesEnabled ? 'Up to 3 episodes' : '1 episode included'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Each episode is a memory — title, date, and what happened</p>
                    <div className="space-y-3">
                      {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map(num => {
                        const titleKey = `episode${num}Title`;
                        const dateKey = `episode${num}Date`;
                        const descKey = `episode${num}Desc`;
                        const imgKey = `episode${num}Image`;
                        const titleVal = formData[titleKey] || '';
                        const descVal = formData[descKey] || '';
                        const imgVal = formData[imgKey] || '';
                        return (
                          <div key={num} className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-red-500">E{num}</span>
                              <span className="text-[10px] text-gray-600">
                                {num === 1 ? '(free)' : '+$0.50'}
                              </span>
                            </div>
                            {/* Episode thumbnail upload */}
                            <div className="mb-2">
                              <label className="block text-[10px] text-gray-500 mb-1">Thumbnail</label>
                              <div className="w-full h-20 rounded-md overflow-hidden bg-dark-900 border border-white/10 relative group">
                                {imgVal ? (
                                  <>
                                    <img src={imgVal} alt={`E${num}`} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, [imgKey]: '' }))}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                                    >
                                      Remove
                                    </button>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-dark-800 transition-colors">
                                    <svg className="w-5 h-5 text-gray-600 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-[10px] text-gray-600">Upload image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const res = await startUpload([file]);
                                        const url = (res?.[0] as any)?.ufsUrl || res?.[0]?.url;
                                        if (url) setFormData(prev => ({ ...prev, [imgKey]: url }));
                                      } catch (err) { console.error('Episode image upload failed:', err); }
                                    }} />
                                  </label>
                                )}
                              </div>
                            </div>
                            <input
                              type="text"
                              value={titleVal}
                              onChange={(e) => setFormData(prev => ({ ...prev, [titleKey]: e.target.value }))}
                              className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs mb-1.5"
                              placeholder="Title (e.g. First Date)"
                              maxLength={10}
                            />
                            <p className={`text-[10px] mb-1 text-right ${titleVal.length >= 9 ? 'text-accent-pink' : 'text-gray-600'}`}>
                              {titleVal.length}/10
                            </p>
                            <input
                              type="date"
                              value={formData[dateKey] || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [dateKey]: e.target.value }))}
                              className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs mb-1.5 [color-scheme:dark]"
                            />
                            <textarea
                              value={descVal}
                              onChange={(e) => { if (e.target.value.length <= 200) setFormData(prev => ({ ...prev, [descKey]: e.target.value })); }}
                              className="w-full px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs resize-none"
                              rows={2}
                              placeholder="What happened? (shown when clicked)"
                              maxLength={200}
                            />
                            {descVal.length > 0 && (
                              <p className={`text-[10px] mt-0.5 text-right ${descVal.length >= 180 ? 'text-accent-pink' : 'text-gray-600'}`}>
                                {descVal.length}/200
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!extraEpisodesEnabled && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableExtraEpisodes: 'true' }))}
                        className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-accent-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-accent-purple text-sm font-medium">Add More Episodes</span>
                        <span className="text-xs text-gray-500">($0.50 each)</span>
                      </button>
                    )}
                    {extraEpisodesEnabled && filledExtra > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +${(filledExtra * ADDON_PRICE).toFixed(2)} for {filledExtra} extra episode{filledExtra > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Top Things Editor - shown for templates with top1 field */}
              {templateVariables.some(v => v.name === 'top1') && (() => {
                const extraTopThingsEnabled = formData.enableExtraTopThings === 'true';
                const maxItems = extraTopThingsEnabled ? 3 : 2;
                const filledExtra = extraTopThingsEnabled
                  ? ((formData.top3 || '').trim() !== '' ? 1 : 0)
                  : 0;
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Top Things</h4>
                      <span className="text-xs text-gray-500">
                        {extraTopThingsEnabled ? 'Up to 3 items' : '2 items included'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Top things about the recipient</p>
                    <div className="space-y-2">
                      {Array.from({ length: maxItems }, (_, i) => i + 1).map(num => {
                        const key = `top${num}`;
                        const val = formData[key] || '';
                        return (
                          <div key={num} className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold w-5 shrink-0 text-red-500">#{num}</span>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                className="flex-1 px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                                placeholder={num === 1 ? 'e.g. Your infectious laugh' : 'Another great thing...'}
                                maxLength={60}
                              />
                              <span className="text-[10px] text-gray-600 shrink-0">
                                {num <= 2 ? '(free)' : '+$0.50'}
                              </span>
                            </div>
                            {val.length > 0 && (
                              <p className={`text-[10px] mt-0.5 text-right ${val.length >= 55 ? 'text-accent-pink' : 'text-gray-600'}`}>
                                {val.length}/60
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!extraTopThingsEnabled && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableExtraTopThings: 'true' }))}
                        className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-accent-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-accent-purple text-sm font-medium">Add One More</span>
                        <span className="text-xs text-gray-500">($0.50)</span>
                      </button>
                    )}
                    {extraTopThingsEnabled && filledExtra > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +$0.50 for 1 extra item
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Wrapped Moments Editor - shown for templates with wrappedMoment fields */}
              {templateVariables.some(v => v.name === 'wrappedMoment1') && (() => {
                const extraMomentsEnabled = formData.enableExtraMoments === 'true';
                const maxMoments = extraMomentsEnabled ? 5 : 2;
                const filledExtra = extraMomentsEnabled
                  ? [3,4,5].filter(n => (formData[`wrappedMoment${n}`] || '').trim() !== '').length
                  : 0;
                return (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Top Moments</h4>
                      <span className="text-xs text-gray-500">
                        {extraMomentsEnabled ? 'Up to 5 moments' : '2 moments included'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">Your best memories together (shown as a ranked list)</p>
                    <div className="space-y-2">
                      {Array.from({ length: maxMoments }, (_, i) => i + 1).map(num => {
                        const key = `wrappedMoment${num}`;
                        const val = formData[key] || '';
                        return (
                          <div key={num} className="bg-dark-800/50 border border-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold w-5 shrink-0" style={{color: num <= 2 ? '#a855f7' : '#c084fc'}}>
                                #{num}
                              </span>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                                className="flex-1 px-2.5 py-1.5 bg-dark-900 border border-white/10 rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-accent-purple/50 outline-none transition-all text-xs"
                                placeholder={num === 1 ? 'e.g. That road trip in March' : 'Another great moment...'}
                                maxLength={80}
                              />
                              <span className="text-[10px] text-gray-600 shrink-0">
                                {num <= 2 ? '(free)' : '+$0.50'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!extraMomentsEnabled && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, enableExtraMoments: 'true' }))}
                        className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 hover:border-accent-purple/50 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-accent-purple group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-accent-purple text-sm font-medium">Add More Moments</span>
                        <span className="text-xs text-gray-500">($0.50 each)</span>
                      </button>
                    )}
                    {extraMomentsEnabled && filledExtra > 0 && (
                      <p className="text-accent-green text-xs mt-2 text-right">
                        +${(filledExtra * ADDON_PRICE).toFixed(2)} for {filledExtra} extra moment{filledExtra > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Effect Addons — only show paid addons (free toggles have their own "Add More" buttons) */}
            {availableAddons.filter(a => !FREE_TOGGLE_ADDONS.has(a)).length > 0 && (
              <div className="border-t border-white/5 pt-6 mt-6">
                <h4 className="text-white font-semibold text-sm mb-3">Add Effects</h4>
                <div className="space-y-3">
                  {availableAddons.filter(a => !FREE_TOGGLE_ADDONS.has(a)).map((addonKey) => {
                    const addon = ADDON_DETAILS[addonKey];
                    const isEnabled = formData[addonKey] === 'true';
                    return (
                      <button
                        key={addonKey}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, [addonKey]: isEnabled ? 'false' : 'true' }))}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isEnabled
                            ? 'bg-accent-purple/10 border-accent-purple/30'
                            : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{addon.icon}</span>
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">{addon.label}</p>
                            <p className="text-gray-500 text-xs">{addon.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-accent-green text-xs font-medium">+$0.50</span>
                          <div className={`w-10 h-6 rounded-full transition-all flex items-center ${
                            isEnabled ? 'bg-accent-purple justify-end' : 'bg-dark-700 justify-start'
                          }`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-all ${
                              isEnabled ? 'scale-100' : 'scale-90 opacity-60'
                            }`} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  {(addonsPrice > 0 || customUrlPrice > 0 || extraSlidesPrice > 0 || extraPhotosPrice > 0 || extraSongsPrice > 0 || extraMomentsPrice > 0 || extraEpisodesPrice > 0 || extraTopThingsPrice > 0) && (
                    <span className="text-xs text-accent-green ml-2">
                      (incl. {[
                        enabledAddonsCount > 0 ? `${enabledAddonsCount} addon${enabledAddonsCount > 1 ? 's' : ''}` : '',
                        filledExtraSlidesCount > 0 ? `${filledExtraSlidesCount} extra slide${filledExtraSlidesCount > 1 ? 's' : ''}` : '',
                        filledExtraPhotosCount > 0 ? `${filledExtraPhotosCount} extra photo${filledExtraPhotosCount > 1 ? 's' : ''}` : '',
                        filledExtraSongsCount > 0 ? `${filledExtraSongsCount} extra song${filledExtraSongsCount > 1 ? 's' : ''}` : '',
                        filledExtraMomentsCount > 0 ? `${filledExtraMomentsCount} extra moment${filledExtraMomentsCount > 1 ? 's' : ''}` : '',
                        filledExtraEpisodesCount > 0 ? `${filledExtraEpisodesCount} extra episode${filledExtraEpisodesCount > 1 ? 's' : ''}` : '',
                        filledExtraTopThingsCount > 0 ? `${filledExtraTopThingsCount} extra top thing${filledExtraTopThingsCount > 1 ? 's' : ''}` : '',
                        customUrlPrice > 0 ? 'custom URL' : ''
                      ].filter(Boolean).join(' + ')})
                    </span>
                  )}
                </div>
                <span className="text-xs bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-full font-medium">
                  Secure Checkout
                </span>
              </div>

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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>

            <div className="rounded-lg overflow-hidden bg-dark-900 border border-white/5">
              <iframe
                srcDoc={renderPreview()}
                className="w-full h-[600px]"
                title="Gift Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <p className="text-center text-gray-600 text-xs mt-3">
              Live preview - updates as you type
            </p>
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
