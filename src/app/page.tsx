import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import Header from "@/components/Header";
import TypingAnimation from "@/components/TypingAnimation";
import HomeEffects from "@/components/HomeEffects";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Revalidate every 1 hour (templates don't change often)
export const revalidate = 3600;

// Top 6 templates in valentines order
const TOP_6_ORDER: Record<string, number> = {
  'Yes or No': 1,
  'Wrapped': 2,
  'Streaming Service': 3,
  'Fortune Cookie': 4,
  'Adventure Map': 5,
  'Open When Letters': 6,
};

// Cache the template query for 1 hour
const getTemplates = unstable_cache(
  async () => {
    try {
      const allTemplates = await db
        .select({
          id: templates.id,
          name: templates.name,
          description: templates.description,
          thumbnailUrl: templates.thumbnailUrl,
        })
        .from(templates)
        .where(eq(templates.isActive, true));
      
      return allTemplates
        .filter(t => TOP_6_ORDER[t.name] !== undefined)
        .sort((a, b) => (TOP_6_ORDER[a.name] ?? 999) - (TOP_6_ORDER[b.name] ?? 999))
        .slice(0, 6);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },
  ['home-templates'],
  { revalidate: 3600, tags: ['templates'] }
);

// Skeleton loader for template cards
function TemplateShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-dark-800" />
          <div className="p-4 md:p-5 space-y-2">
            <div className="h-5 bg-dark-700 rounded w-2/3" />
            <div className="h-4 bg-dark-700/50 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Async component — fetches templates, streamed via Suspense
async function TemplateShowcase() {
  const templateList = await getTemplates();

  if (templateList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Templates loading...</p>
        <Link href="/templates" className="text-accent-purple hover:underline mt-2 inline-block">
          View all templates
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
      {templateList.map((template) => (
        <Link
          key={template.id}
          href={`/customize/${template.id}`}
          className="group"
        >
          <div className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-purple/10">
            <div className="aspect-video bg-dark-800 overflow-hidden relative">
              {template.thumbnailUrl ? (
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium flex items-center gap-2">
                  Customize Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-accent-purple transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">{template.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

const stats = [
  { value: '20+', label: 'Templates' },
  { value: '60s', label: 'To Create' },
  { value: '$1', label: 'Per Gift' },
  { value: '100%', label: 'Smiles' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      <HomeEffects />

      {/* Animated Background - CSS only, simplified on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Blobs: static on mobile (no animation, reduced blur), animated on desktop */}
        <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent-purple/20 rounded-full blur-[60px] md:blur-[150px] md:animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent-pink/20 rounded-full blur-[60px] md:blur-[150px] md:animate-float-delayed" />
        <div className="hidden md:block absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="hidden md:block absolute bottom-[30%] left-[15%] w-[300px] h-[300px] bg-accent-teal/10 rounded-full blur-[100px] animate-float-delayed" />
        
        {/* Subtle lines - desktop only */}
        <div className="hidden md:block absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent animate-pulse-slow" />
        <div className="hidden md:block absolute top-[60%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-pink/20 to-transparent animate-pulse-slow animation-delay-200" />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.4)_70%,rgba(10,10,15,0.8)_100%)]" />
        
        {/* Grid pattern - desktop only */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section — renders immediately, no DB dependency */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-sm mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
              </span>
              <span className="text-gray-300">New templates added weekly</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight animate-fade-in-up">
              <span className="text-white">Gift websites for</span>
              <br />
              <TypingAnimation />
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
              Create a tiny, personalized website in under a minute.
              <span className="hidden sm:inline"> Add their name, your message, inside jokes - then share a link they&apos;ll actually remember.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
              <Link
                href="/templates"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-accent-purple/30"
              >
                <span className="relative z-10">Browse Templates</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-pink to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 glass-strong text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                <span>See How It Works</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section — static, renders immediately */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-accent-purple to-accent-pink mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Template Showcase — async, streamed via Suspense */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
              20+ Interactive Templates
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From playful to romantic. Each one is fully customizable and takes under 60 seconds to personalize.
            </p>
          </div>

          <Suspense fallback={<TemplateShowcaseSkeleton />}>
            <TemplateShowcase />
          </Suspense>

          <div className="text-center mt-10">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-accent-purple hover:text-accent-pink transition-colors font-medium"
            >
              View all 20+ templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* How It Works — static, renders immediately */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
              Three Steps. Done.
            </h2>
            <p className="text-gray-400 text-lg">No app to download.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: '01',
                  icon: '🎨',
                  title: 'Pick a template',
                  desc: 'Choose from 20+ interactive designs - scratch cards, vinyl players, love letters, and more.',
                  gradient: 'from-accent-purple to-accent-blue',
                },
                {
                  step: '02',
                  icon: '✏️',
                  title: 'Make it personal',
                  desc: "Add their name, your message, photos, inside jokes - whatever makes it uniquely yours.",
                  gradient: 'from-accent-pink to-accent-orange',
                },
                {
                  step: '03',
                  icon: '🚀',
                  title: 'Send the link',
                  desc: 'Pay from $1, get a unique URL instantly. Share via text, DM, email - anywhere.',
                  gradient: 'from-accent-teal to-accent-green',
                },
              ].map((item) => (
                <div key={item.step} className="text-center md:text-left">
                  <div className="relative inline-block mb-6">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl md:text-4xl shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-dark-950 border-2 border-accent-purple flex items-center justify-center text-xs font-bold text-white">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA — static, renders immediately */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative glass-strong rounded-3xl p-8 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent-purple/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent-pink/30 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <div className="text-5xl md:text-6xl mb-6">🎁</div>
                <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
                  Make someone smile today
                </h2>
                <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
                  60 seconds to create. A lifetime to remember.
                  <br className="hidden md:block" />
                  <span className="text-accent-purple font-medium">From just $1 per gift.</span>
                </p>
                <Link
                  href="/templates"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-10 py-5 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-accent-purple/30"
                >
                  <span className="relative z-10">Start Creating Now</span>
                  <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-pink to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Image src="/logo-small.png" alt="Me2You" width={32} height={32} className="h-8 w-auto" />
                <span className="text-gray-600 text-sm">&copy; 2026 Me2You</span>
              </div>
              <div className="flex gap-6">
                <Link href="/templates" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Templates
                </Link>
                <a href="#how-it-works" className="text-gray-500 hover:text-white text-sm transition-colors">
                  How It Works
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
