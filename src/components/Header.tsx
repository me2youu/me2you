'use client';

import Link from 'next/link';
import Image from 'next/image';
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
            <Image 
              src="/logo-small.png" 
              alt="Me2You" 
              width={120}
              height={40}
              priority
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-3 sm:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs sm:text-sm bg-accent-purple hover:bg-accent-purple/80 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-accent-purple/25 whitespace-nowrap">
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
