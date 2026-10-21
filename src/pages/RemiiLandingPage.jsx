import React, { useEffect, useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import FeatureCard from '../components/landing/FeatureCard';
import PipelineStep from '../components/landing/PipelineStep';
import LogoMarquee from '../components/landing/LogoMarquee';
import SecurityVault from '../components/landing/SecurityVault';
import PricingCard from '../components/landing/PricingCard';
import CTASection from '../components/landing/CTASection';
import FloatingCTA from '../components/landing/FloatingCTA';
import LandingFooter from '../components/landing/LandingFooter';
import { landingConfig } from '../config/landingConfig';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

export default function RemiiLandingPage({ onBackToApp }) {
  const { brand, featureGrid, pipeline, pricing, faqs } = landingConfig;
  const [openFaq, setOpenFaq] = useState(null);

  // SEO & Head title update
  useEffect(() => {
    document.title = `${brand.name} — ${brand.tagline}`;
    
    // Set meta theme-color to pure black
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = '#000000';

    return () => {
      document.title = 'PlacePrep – Smart Placement Preparation Platform';
    };
  }, [brand.name, brand.tagline]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* 1. STICKY NAVBAR */}
      <LandingNavbar onBackToApp={onBackToApp} />

      {/* 2. HERO SECTION */}
      <main>
        <LandingHero />

        {/* 3. "CONNECTS TO ALL YOUR FAVORITE TOOLS" BENTO GRID */}
        <section id="features" className="relative py-24 sm:py-32 border-t border-white/[0.08] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase block mb-3">
                INTEGRATED APPS & EXTENSIONS
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.05] mb-4">
                {featureGrid.heading}
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                {featureGrid.subheading}
              </p>
            </div>

            {/* 4 Bento Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {featureGrid.cards.map((card) => (
                <FeatureCard key={card.id} card={card} />
              ))}
            </div>

          </div>
        </section>

        {/* 4. AUTOMATION PIPELINE SECTION */}
        <section id="pipeline" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase block mb-3">
                {pipeline.label}
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.05] mb-4">
                {pipeline.heading}
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                {pipeline.subheading}
              </p>
            </div>

            {/* 6-Step 2x3 Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pipeline.steps.map((st, idx) => (
                <PipelineStep
                  key={st.step}
                  step={st.step}
                  title={st.title}
                  description={st.description}
                  index={idx}
                  total={pipeline.steps.length}
                />
              ))}
            </div>

          </div>
        </section>

        {/* 5. INFINITE LOGO MARQUEE */}
        <LogoMarquee />

        {/* 6. SECURITY & PRIVACY SECTION */}
        <SecurityVault />

        {/* 7. PRICING SECTION */}
        <section id="pricing" className="relative py-24 sm:py-32 border-b border-white/[0.08] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-950/20 blur-[150px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase block mb-3">
                PLANS & CAPABILITIES
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.05] mb-4">
                Relax, {brand.shortName} got it.
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light">
                {pricing.subheading}
              </p>
            </div>

            {/* 3 Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
              {pricing.plans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>

          </div>
        </section>

        {/* FAQS SECTION */}
        <section id="faqs" className="relative py-20 border-b border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-[10px] font-mono tracking-widest text-white/60 uppercase mb-3">
                <HelpCircle className="w-3 h-3 text-indigo-400" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                Common Questions & Answers
              </h3>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-light text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-white/50 transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-white/60 font-light leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 8. FINAL CTA BAND */}
        <CTASection />

      </main>

      {/* 9. FLOATING BUTTON */}
      <FloatingCTA />

      {/* 10. FOOTER */}
      <LandingFooter />

    </div>
  );
}
