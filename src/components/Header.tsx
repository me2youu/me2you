'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/templates', label: 'Browse' },
    { href: '/dashboard', label: 'My Gifts' },
  ];

  return (
    <header className="border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/logo-small.png" 
              alt="Me2You" 
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-white/10" />

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-accent-purple/25">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}
