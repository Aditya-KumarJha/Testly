"use client";

import type { CSSProperties, FC } from "react";
import { useInView, useScrollY } from "./hooks";
import {
  BrowserbaseSection,
  CtaSection,
  DocsSection,
  FeaturesSection,
  Footer,
  HeroSection,
  HowItWorksSection,
  NavBar,
  PipelineSection,
  StatsSection,
  TrustedBySection,
} from "./sections";
import { C } from "./theme";
import { LandingGlobalStyles } from "./ui";

const LandingPageClient: FC<{ isSignedIn: boolean }> = ({ isSignedIn }) => {
  const scrollY = useScrollY();
  const [heroRef, heroIn] = useInView(0.05);
  const [featRef, featIn] = useInView(0.1);
  const [stepsRef, stepsIn] = useInView(0.1);
  const [statsRef, statsIn] = useInView(0.3);
  const scrolled = scrollY > 30;

  const anim = (
    inView: boolean,
    delay = 0,
    from = "translateY(20px)",
  ): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : from,
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <>
      <LandingGlobalStyles />
      <div
        style={{
          fontFamily: "'Geist', sans-serif",
          background: C.bg,
          color: C.ink,
          minHeight: "100vh",
        }}
      >
        <NavBar isSignedIn={isSignedIn} scrolled={scrolled} />
        <HeroSection
          anim={anim}
          heroRef={heroRef}
          heroIn={heroIn}
          isSignedIn={isSignedIn}
        />
        <PipelineSection />
        <TrustedBySection />
        <StatsSection statsRef={statsRef} statsIn={statsIn} />
        <FeaturesSection anim={anim} featRef={featRef} featIn={featIn} />
        <HowItWorksSection anim={anim} stepsRef={stepsRef} stepsIn={stepsIn} />
        <BrowserbaseSection />
        <DocsSection />
        <CtaSection isSignedIn={isSignedIn} />
        <Footer />
      </div>
    </>
  );
};

export default LandingPageClient;
