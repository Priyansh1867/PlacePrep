import React, { useState } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { landingConfig } from '../../config/landingConfig';
import PlacePrepLogo from '../PlacePrepLogo';

export default function LandingNavbar({ onBackToApp }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { brand, navLinks } = landingConfig;

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Official PlacePrep Logo */}
          <div className="flex items-center gap-3">
            <a 
              href="#hero" 
              className="flex items-center gap-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg group"
              aria-label={`${brand.name} Home`}
            >
              <PlacePrepLogo className="h-8 sm:h-9 w-auto" theme="dark" />
            </a>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-white/70">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="hover:text-white transition-colors focus:outline-none focus:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: CTA Button */}
          <div className="hidden sm:flex items-center gap-4">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Portal
              </button>
            )}

            <a
              href="#pricing"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.4)] flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span>START FREE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/[0.08] px-4 pt-4 pb-6 space-y-4 animate-in fade-in-50">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider text-white/80">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="py-2 px-3 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider text-center block"
            >
              START FREE
            </a>
            {onBackToApp && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToApp();
                }}
                className="text-xs font-mono uppercase tracking-wider text-white/50 text-center py-2"
              >
                ← Back to Campus Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
