import Link from "next/link";
import Header from "@/components/Header";
import TypingAnimation from "@/components/TypingAnimation";
import HomeEffects from "@/components/HomeEffects";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Revalidate every 1 hour (templates don't change often)
export const revalidate = 3600;

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
        .where(eq(templates.isActive, true))
        .limit(6);
      return allTemplates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },
  ['home-templates'],
  { revalidate: 3600, tags: ['templates'] }
);

export default async function Home() {
  const templateList = await getTemplates();

  const stats = [
    { value: '23+', label: 'Templates' },
    { value: '60s', label: 'To Create' },
    { value: 'R10', label: 'Per Gift' },
    { value: '100%', label: 'Smiles' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Desktop-only effects (cursor trail, particles) - loads after content */}
      <HomeEffects />

      {/* Animated Background - CSS only, no JS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-purple/20 rounded-full blur-[100px] md:blur-[150px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-pink/20 rounded-full blur-[100px] md:blur-[150px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[20%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-accent-blue/10 rounded-full blur-[80px] md:blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[30%] left-[15%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-accent-teal/10 rounded-full blur-[60px] md:blur-[100px] animate-float-delayed" />
        
        {/* Glowing accent lines */}
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent animate-pulse-slow" />
        <div className="absolute top-[60%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-pink/20 to-transparent animate-pulse-slow animation-delay-200" />
        <div className="absolute top-[85%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/10 to-transparent animate-pulse-slow animation-delay-100" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.4)_70%,rgba(10,10,15,0.8)_100%)]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] md:opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-sm mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
              </span>
              <span className="text-gray-300">New templates added weekly</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight animate-fade-in-up">
              <span className="text-white">Gift websites for</span>
              <br />
              <TypingAnimation />
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
              Create a tiny, personalized website in under a minute.
              <span className="hidden sm:inline"> Add their name, your message, inside jokes - then share a link they&apos;ll actually remember.</span>
            </p>

            {/* CTA Buttons */}
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

        {/* Stats Section */}
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

        {/* Template Showcase */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
              23+ Interactive Templates
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From playful to romantic. Each one is fully customizable and takes under 60 seconds to personalize.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {templateList.length === 0 ? (
              // Fallback if DB fails
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Templates loading...</p>
                <Link href="/templates" className="text-accent-purple hover:underline mt-2 inline-block">
                  View all templates
                </Link>
              </div>
            ) : (
              templateList.map((template) => (
                <Link
                  key={template.id}
                  href={`/customize/${template.id}`}
                  className="group"
                >
                  <div className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-purple/10">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-dark-800 relative overflow-hidden">
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20" />
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium flex items-center gap-2">
                          Customize Now
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4 md:p-5">
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-accent-purple transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-accent-purple hover:text-accent-pink transition-colors font-medium"
            >
              View all 23+ templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
              Three Steps. Done.
            </h2>
            <p className="text-gray-400 text-lg">No account needed. No app to download.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: '01',
                  icon: '🎨',
                  title: 'Pick a template',
                  desc: 'Choose from 23+ interactive designs - scratch cards, vinyl players, love letters, and more.',
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
                  desc: 'Pay R10, get a unique URL instantly. Share via text, DM, email - anywhere.',
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

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative glass-strong rounded-3xl p-8 md:p-16 text-center overflow-hidden">
              {/* Background decoration */}
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
                  <span className="text-accent-purple font-medium">Just R10 per gift.</span>
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
                <img src="/logo-small.png" alt="Me2You" className="h-8 w-auto" />
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
