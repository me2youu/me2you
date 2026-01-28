'use client';

import Link from "next/link";
import Header from "@/components/Header";
import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  basePrice: string;
}

// Color cycle for template cards
const cardColors = [
  'accent-purple', 'accent-pink', 'accent-blue',
  'accent-orange', 'accent-teal', 'accent-green',
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<Template[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDbTemplates(data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const occasions = [
    { name: "Birthday", slug: "birthday" },
    { name: "Thank You", slug: "thank-you" },
    { name: "Congrats", slug: "congratulations" },
    { name: "Just Because", slug: "just-because" },
    { name: "Valentine's", slug: "valentines" },
    { name: "Friendship", slug: "friendship" },
    { name: "Anniversary", slug: "anniversary" },
    { name: "Apology", slug: "apology" },
    { name: "Get Well", slug: "get-well" },
  ];

  // Compute lowest price from templates
  const lowestPrice = dbTemplates.length > 0
    ? Math.min(...dbTemplates.map(t => parseFloat(t.basePrice || '0'))).toFixed(2)
    : '1.49';

  // Fallback to hardcoded previews if DB fetch hasn't resolved yet
  const templatePreviews = dbTemplates.length > 0
    ? dbTemplates.map((t, i) => ({
        id: t.id,
        name: t.name,
        desc: t.description,
        color: cardColors[i % cardColors.length],
      }))
    : [
        { id: '', name: "Yes / No", desc: "Interactive question with runaway buttons", color: "accent-purple" },
        { id: '', name: "Meme Slideshow", desc: "Curated memes that cycle through with captions", color: "accent-pink" },
        { id: '', name: "Countdown Timer", desc: "Animated countdown to a special date", color: "accent-blue" },
        { id: '', name: "Scratch Card", desc: "Scratch to reveal a hidden surprise", color: "accent-orange" },
        { id: '', name: "Message in a Bottle", desc: "Animated letter floating ashore", color: "accent-teal" },
        { id: '', name: "Polaroid Wall", desc: "Photo gallery with handwritten captions", color: "accent-green" },
      ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-pink/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-accent-blue/5 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <main className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto pt-20 pb-16 text-center">
            <div
              className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-8">
                <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
                From ${lowestPrice} USD per gift
              </div>

              <h1 className="text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight">
                <span className="text-white">Create tiny websites</span>
                <br />
                <span className="text-gradient bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-[length:200%_auto] animate-gradient">
                  as gifts for anyone
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Pick a template, customize it with your message, photos, or inside jokes,
                and share a link they will actually remember.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all hover:scale-105"
                >
                  Browse Templates
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 glass text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-dark-600/50 transition-all"
                >
                  How It Works
                </a>
              </div>
            </div>
          </div>

          {/* Occasions */}
          <div
            className={`max-w-5xl mx-auto mb-24 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-6">
              For every occasion
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {occasions.map((occ, i) => (
                <Link
                  key={occ.slug}
                  href={`/templates?occasion=${occ.slug}`}
                  className="group px-5 py-2.5 rounded-full glass hover:bg-dark-600/80 transition-all hover:scale-105"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {occ.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Template Previews */}
          <div
            className={`max-w-6xl mx-auto mb-24 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-3">
                Simple, fun, personal
              </h2>
              <p className="text-gray-400 text-lg">
                From silly to sentimental. Each one takes under a minute to make.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatePreviews.map((t, i) => {
                const Wrapper = t.id ? Link : 'div';
                const wrapperProps = t.id ? { href: `/customize/${t.id}` } : {};
                return (
                  <Wrapper
                    key={t.name}
                    {...(wrapperProps as any)}
                    className="glass rounded-2xl p-6 hover:bg-dark-700/50 transition-all group cursor-pointer hover:scale-[1.02]"
                    style={{ animationDelay: `${600 + i * 100}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${t.color}/10 flex items-center justify-center mb-4`}>
                      <div className={`w-3 h-3 rounded-full bg-${t.color}`} />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-accent-purple transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{t.desc}</p>
                  </Wrapper>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/templates"
                className="text-accent-purple hover:text-accent-pink transition-colors text-sm font-medium"
              >
                View all templates &rarr;
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div
            id="how-it-works"
            className={`max-w-4xl mx-auto mb-24 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white text-center mb-16">
              Three steps. That's it.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Pick a template",
                  desc: "Choose from interactive questions, meme players, countdowns, scratch cards, and more.",
                  gradient: "from-accent-purple to-accent-blue",
                },
                {
                  step: "02",
                  title: "Make it yours",
                  desc: "Add their name, your message, photos, memes, dates - whatever fits the template.",
                  gradient: "from-accent-pink to-accent-orange",
                },
                {
                  step: "03",
                  title: "Send the link",
                  desc: "Get a unique URL to share via text, DM, email, or however you communicate.",
                  gradient: "from-accent-teal to-accent-green",
                },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white font-bold text-lg mb-5 group-hover:scale-110 transition-transform`}>
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className={`max-w-3xl mx-auto mb-24 transition-all duration-700 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-pink/10 pointer-events-none" />
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-4">
                  Make someone's day
                </h2>
                <p className="text-gray-400 mb-8 text-lg">
                  It takes 60 seconds. They'll remember it way longer.
                </p>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-accent-purple/25 transition-all hover:scale-105"
                >
                  Start Creating
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">&copy; 2026 Me2You</p>
            <div className="flex gap-6">
              <Link href="/templates" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Templates</Link>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">How It Works</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
