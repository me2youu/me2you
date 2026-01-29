'use client';

import Link from "next/link";
import Header from "@/components/Header";
import { useEffect, useState, useRef } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [typedText, setTypedText] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  const trailId = useRef(0);

  const phrases = ['birthdays', 'anniversaries', 'apologies', 'thank yous', 'just because'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing animation
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

  // Cursor trail effect (desktop only, throttled)
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return;
    
    let lastTime = 0;
    const throttleMs = 50; // Only update every 50ms
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;
      
      setCursorPos({ x: e.clientX, y: e.clientY });
      trailId.current++;
      setCursorTrail(prev => [...prev.slice(-6), { x: e.clientX, y: e.clientY, id: trailId.current }]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch templates
  useEffect(() => {
    setMounted(true);
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data.slice(0, 6));
      })
      .catch(() => {});

    // Generate particles (fewer on mobile)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 10 : 25;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const stats = [
    { value: '23+', label: 'Templates' },
    { value: '60s', label: 'To Create' },
    { value: 'R10', label: 'Per Gift' },
    { value: '100%', label: 'Smiles' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Custom Cursor Trail (desktop only) */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-50">
        {cursorTrail.map((point, i) => (
          <div
            key={point.id}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink"
            style={{
              left: point.x - 6,
              top: point.y - 6,
              opacity: (i + 1) / cursorTrail.length * 0.5,
              transform: `scale(${(i + 1) / cursorTrail.length})`,
              transition: 'opacity 0.3s',
            }}
          />
        ))}
      </div>

      {/* Animated Background - simplified on mobile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs - smaller blur on mobile for performance */}
        <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent-purple/20 rounded-full blur-[80px] md:blur-[150px] md:animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent-pink/20 rounded-full blur-[80px] md:blur-[150px] md:animate-float-delayed" />
        <div className="hidden md:block absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-accent-blue/10 rounded-full blur-[120px] animate-float-slow" />
        
        {/* Floating Particles - hidden on mobile for performance */}
        <div className="hidden md:block">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/30 animate-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid Pattern - hidden on mobile */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-sm mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
              </span>
              <span className="text-gray-300">New templates added weekly</span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-4xl sm:text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-white">Gift websites for</span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange bg-[length:200%_auto] animate-gradient">
                {typedText}
                <span className="animate-blink">|</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Create a tiny, personalized website in under a minute.
              <span className="hidden sm:inline"> Add their name, your message, inside jokes - then share a link they'll actually remember.</span>
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
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
          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <div className="max-w-4xl mx-auto">
              <div className="glass-strong rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  {stats.map((stat, i) => (
                    <div key={stat.label} className="text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                      <div className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-accent-purple to-accent-pink mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Template Showcase */}
        <section className="container mx-auto px-4 py-16">
          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
                23+ Interactive Templates
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                From playful to romantic. Each one is fully customizable and takes under 60 seconds to personalize.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {templates.length === 0 ? (
              // Loading skeleton
              [...Array(6)].map((_, i) => (
                <div key={i} className="scroll-animate opacity-0 translate-y-8 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-dark-800 animate-pulse" />
                    <div className="p-4 md:p-5">
                      <div className="h-5 bg-dark-700 rounded animate-pulse mb-2 w-3/4" />
                      <div className="h-4 bg-dark-800 rounded animate-pulse w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              templates.map((template, i) => (
                <Link
                  key={template.id}
                  href={`/customize/${template.id}`}
                  className="scroll-animate opacity-0 translate-y-8 transition-all duration-500 group"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-purple/10">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-dark-800 relative overflow-hidden">
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4">
                Three Steps. Done.
              </h2>
              <p className="text-gray-400 text-lg">No account needed. No app to download.</p>
            </div>
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
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="scroll-animate opacity-0 translate-y-8 transition-all duration-500 text-center md:text-left"
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
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

            {/* Connection Line (desktop) */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-[60%] h-0.5 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-teal opacity-20" />
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
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

      {/* Global Styles */}
      <style jsx global>{`
        .glass-strong {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .scroll-animate.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.03); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes particle {
          0%, 100% { 
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-50px) translateX(-10px);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-30px) translateX(5px);
            opacity: 0.5;
          }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; animation-delay: 2s; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; animation-delay: 4s; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-particle { animation: particle linear infinite; }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-float-slow,
          .animate-particle,
          .animate-blink {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
