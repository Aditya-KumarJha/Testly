"use client";

import Link from "next/link";
import type { CSSProperties, FC, RefObject } from "react";
import {
  BROWSERBASE_BENEFITS,
  BROWSERBASE_METRICS,
  FAQS,
  FEATURES,
  LOGOS,
  STATS,
  STEPS,
  TRUST_CHIPS,
} from "./content";
import { C } from "./theme";
import {
  DotGrid,
  GlowCard,
  GreenBadge,
  MagicButton,
  Marquee,
  PipelineViz,
  StatCell,
  TerminalMockup,
} from "./ui";
import { Orbs } from "./ui";

interface SharedSectionProps {
  anim: (inView: boolean, delay?: number, from?: string) => CSSProperties;
}

export const NavBar: FC<{ isSignedIn: boolean; scrolled: boolean }> = ({
  isSignedIn,
  scrolled,
}) => (
  <header
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: scrolled ? "rgba(247,250,244,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      transition: "all 0.4s ease",
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            boxShadow: `0 4px 12px ${C.primary}44`,
          }}
        >
          ⚡
        </div>
        <span
          style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "-0.02em",
            color: C.ink,
          }}
        >
          Testly
        </span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: C.primary,
            background: C.primaryBg,
            border: `1px solid ${C.primaryMid}`,
            borderRadius: 6,
            padding: "2px 7px",
            letterSpacing: "0.04em",
          }}
        >
          AI
        </span>
      </div>

      <nav style={{ display: "flex", gap: 2 }}>
        {(["Features", "How it works", "Docs"] as const).map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 13,
              color: C.muted,
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 8,
              transition: "color 0.2s, background 0.2s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = C.ink;
              event.currentTarget.style.background = C.primaryBg;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = C.muted;
              event.currentTarget.style.background = "transparent";
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          href={isSignedIn ? "/workspace/pricing" : "/sign-in"}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 13,
            color: C.muted,
            textDecoration: "none",
            padding: "6px 12px",
          }}
        >
          {isSignedIn ? "Pricing" : "Sign in"}
        </Link>
        <Link
          href={isSignedIn ? "/workspace" : "/sign-up"}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            color: "#fff",
            textDecoration: "none",
            boxShadow: `0 4px 14px ${C.primary}38`,
            letterSpacing: "0.01em",
          }}
        >
          {isSignedIn ? "Dashboard →" : "Connect GitHub →"}
        </Link>
      </div>
    </div>
  </header>
);

export const HeroSection: FC<
  SharedSectionProps & {
    heroRef: RefObject<HTMLDivElement | null>;
    heroIn: boolean;
    isSignedIn: boolean;
  }
> = ({ anim, heroRef, heroIn, isSignedIn }) => (
  <section
    ref={heroRef}
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "7rem 2rem 4rem",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <DotGrid />
    <Orbs />

    <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24, ...anim(heroIn, 0) }}>
        <GreenBadge>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.primary,
              display: "inline-block",
              animation: "blink 1.6s infinite",
            }}
          />
          AI test automation platform for GitHub apps and modern QA teams
        </GreenBadge>
      </div>

      <h1
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          color: C.ink,
          marginBottom: "1.4rem",
          ...anim(heroIn, 0.1),
        }}
      >
        Connect repo.
        <br />
        <span
          style={{
            background: `linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 50%, ${C.primaryLight} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Testly tests it.
        </span>
      </h1>

      <p
        style={{
          fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
          color: C.muted,
          lineHeight: 1.7,
          maxWidth: 640,
          margin: "0 auto 2.5rem",
          ...anim(heroIn, 0.2),
        }}
      >
        Testly is an AI-powered test automation platform that connects to your
        GitHub repository, generates end-to-end test cases, and runs browser
        automation in Browserbase cloud browsers for faster QA, regression
        testing, and release confidence.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "3rem",
          ...anim(heroIn, 0.3),
        }}
      >
        <Link
          href={isSignedIn ? "/workspace" : "/sign-up"}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            color: "#fff",
            textDecoration: "none",
            boxShadow: `0 4px 14px ${C.primary}38`,
            letterSpacing: "0.01em",
          }}
        >
          {isSignedIn ? "⬡ Open workspace →" : "⬡ Connect GitHub repo →"}
        </Link>
        <a href="#docs" style={{ textDecoration: "none" }}>
          <MagicButton primary={false}>▶ Explore platform docs</MagicButton>
        </a>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
          ...anim(heroIn, 0.4),
        }}
      >
        {TRUST_CHIPS.map((chip) => (
          <span
            key={chip}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 12.5,
              color: C.subtle,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: C.primary, fontWeight: 700 }}>✓</span>
            {chip}
          </span>
        ))}
      </div>
    </div>

    <div
      style={{
        maxWidth: 700,
        width: "100%",
        margin: "4rem auto 0",
        position: "relative",
        zIndex: 1,
        animation: heroIn ? "float 5s ease-in-out infinite" : "none",
        ...anim(heroIn, 0.55),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${C.primary}44, ${C.primaryLight}22)`,
          filter: "blur(20px)",
          zIndex: -1,
        }}
      />
      <TerminalMockup />
    </div>
  </section>
);

export const PipelineSection: FC = () => (
  <section
    style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: "3.5rem 2rem",
    }}
  >
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <p
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.subtle,
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        How AI test automation flows
      </p>
      <PipelineViz />
    </div>
  </section>
);

export const TrustedBySection: FC = () => (
  <div
    style={{
      background: C.surfaceAlt,
      borderBottom: `1px solid ${C.border}`,
      padding: "1.25rem 0",
    }}
  >
    <p
      style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.border,
        textAlign: "center",
        marginBottom: "1rem",
      }}
    >
      Trusted by teams building on
    </p>
    <Marquee items={LOGOS} />
  </div>
);

export const StatsSection: FC<{
  statsRef: RefObject<HTMLDivElement | null>;
  statsIn: boolean;
}> = ({ statsRef, statsIn }) => (
  <div ref={statsRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem 3rem" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(13,26,5,0.05)",
        gap: 0,
      }}
    >
      {STATS.map((stat, index) => (
        <div
          key={stat.label}
          style={{
            borderRight: index < STATS.length - 1 ? `1px solid ${C.border}` : "none",
          }}
        >
          <StatCell {...stat} active={statsIn} />
        </div>
      ))}
    </div>
  </div>
);

export const FeaturesSection: FC<
  SharedSectionProps & {
    featRef: RefObject<HTMLDivElement | null>;
    featIn: boolean;
  }
> = ({ anim, featRef, featIn }) => (
  <section id="features" ref={featRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 2rem 5rem" }}>
    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
      <GreenBadge>Capabilities</GreenBadge>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          letterSpacing: "-0.03em",
          color: C.ink,
          marginTop: 16,
          lineHeight: 1.1,
        }}
      >
        AI testing, browser automation, and QA reporting in one pipeline
      </h2>
      <p
        style={{
          fontSize: 15,
          color: C.muted,
          maxWidth: 650,
          margin: "12px auto 0",
          lineHeight: 1.65,
        }}
      >
        From repository analysis to automated end-to-end testing, Testly helps
        engineering teams launch faster with less manual QA setup.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 14,
      }}
    >
      {FEATURES.map((feature, index) => (
        <GlowCard
          key={feature.label}
          accent={feature.accent}
          style={anim(featIn, index * 0.08)}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              marginBottom: 16,
              background: C.primaryBg,
              border: `1px solid ${C.primaryMid}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: feature.accent,
            }}
          >
            {feature.icon}
          </div>
          <h3
            style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 600,
              fontSize: 15.5,
              color: C.ink,
              marginBottom: 8,
            }}
          >
            {feature.label}
          </h3>
          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.65,
            }}
          >
            {feature.body}
          </p>
        </GlowCard>
      ))}
    </div>
  </section>
);

export const HowItWorksSection: FC<
  SharedSectionProps & {
    stepsRef: RefObject<HTMLDivElement | null>;
    stepsIn: boolean;
  }
> = ({ anim, stepsRef, stepsIn }) => (
  <section
    id="how-it-works"
    ref={stepsRef}
    style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: "5rem 2rem",
    }}
  >
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <GreenBadge>Process</GreenBadge>
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            letterSpacing: "-0.03em",
            color: C.ink,
            marginTop: 16,
            lineHeight: 1.1,
          }}
        >
          Zero to tested in four steps
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {STEPS.map((step, index) => (
          <div key={step.n} style={anim(stepsIn, index * 0.12)}>
            <GlowCard accent={C.primary} style={{ height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.primary,
                    background: C.primaryBg,
                    border: `1px solid ${C.primaryMid}`,
                    borderRadius: 6,
                    padding: "3px 8px",
                    letterSpacing: "0.06em",
                  }}
                >
                  {step.n}
                </span>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.primaryBg,
                    border: `1px solid ${C.primaryMid}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    color: C.primary,
                  }}
                >
                  {step.icon}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 600,
                  fontSize: 15.5,
                  color: C.ink,
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: 13.5,
                  color: C.muted,
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            </GlowCard>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const BrowserbaseSection: FC = () => (
  <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "3rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "3rem",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(13,26,5,0.06)",
      }}
    >
      <div>
        <GreenBadge>Powered by Browserbase</GreenBadge>
        <h3
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            color: C.ink,
            marginTop: 16,
            marginBottom: 14,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          Real browsers.
          <br />
          Zero infrastructure.
        </h3>
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 14.5,
            color: C.muted,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          Testly uses Browserbase to run end-to-end testing in authentic cloud
          browsers. That means reliable browser automation for QA teams without
          maintaining Selenium grids, Docker images, or custom infrastructure.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BROWSERBASE_BENEFITS.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontFamily: "'Geist', sans-serif",
                fontSize: 13.5,
                color: C.inkMid,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: C.primaryBg,
                  border: `1px solid ${C.primaryMid}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: C.primary,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BROWSERBASE_METRICS.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 12,
                  color: C.inkMid,
                }}
              >
                {metric.label}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 12,
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                <span style={{ color: C.primary, fontWeight: 600 }}>
                  ✓ {metric.passed}
                </span>
                {metric.failed > 0 ? (
                  <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                    ✗ {metric.failed}
                  </span>
                ) : null}
              </div>
            </div>
            <div
              style={{
                background: C.border,
                borderRadius: 99,
                height: 5,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${metric.pct}%`,
                  height: "100%",
                  background:
                    metric.pct === 100
                      ? C.primary
                      : `linear-gradient(90deg, ${C.primary}, ${C.primaryLight})`,
                  borderRadius: 99,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const DocsSection: FC = () => (
  <section
    id="docs"
    style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "0 2rem 5rem",
    }}
  >
    <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
      <GreenBadge>Docs and FAQ</GreenBadge>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          letterSpacing: "-0.03em",
          color: C.ink,
          marginTop: 16,
          lineHeight: 1.1,
        }}
      >
        AI test automation docs for modern engineering teams
      </h2>
      <p
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 15,
          color: C.muted,
          lineHeight: 1.7,
          maxWidth: 720,
          margin: "12px auto 0",
        }}
      >
        Learn how Testly handles GitHub repository analysis, AI-generated test
        cases, browser automation, and regression testing workflows for React
        and Next.js applications.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {FAQS.map((faq) => (
        <GlowCard key={faq.question} accent={C.primary}>
          <h3
            style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: C.ink,
              marginBottom: 10,
            }}
          >
            {faq.question}
          </h3>
          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.7,
            }}
          >
            {faq.answer}
          </p>
        </GlowCard>
      ))}
    </div>
  </section>
);

export const CtaSection: FC<{ isSignedIn: boolean }> = ({ isSignedIn }) => (
  <section style={{ padding: "1rem 2rem 6rem" }}>
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        position: "relative",
        background: `linear-gradient(145deg, ${C.primaryDark}, ${C.primary})`,
        borderRadius: 24,
        padding: "4.5rem 3rem",
        textAlign: "center",
        boxShadow: `0 32px 80px ${C.primary}30, 0 8px 24px ${C.primary}20`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-25%",
          right: "-8%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-4%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 12,
              fontFamily: "'Geist', sans-serif",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.04em",
            }}
          >
            ⚡ Ready when you are
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            color: "#fff",
            marginBottom: 16,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
          }}
        >
          Ship with confidence.
          <br />
          <em>Always.</em>
        </h2>
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 15.5,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 520,
            margin: "0 auto 2.5rem",
            lineHeight: 1.65,
          }}
        >
          Connect your GitHub repo and launch AI-generated end-to-end testing in
          Browserbase within minutes with Testly.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={isSignedIn ? "/workspace" : "/sign-up"}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              padding: "13px 28px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "#fff",
              color: C.primaryDark,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              transition: "transform 0.2s, box-shadow 0.2s",
              textDecoration: "none",
            }}
          >
            {isSignedIn ? "⬡ Open workspace →" : "⬡ Connect GitHub →"}
          </Link>
          <a href="#docs" style={{ textDecoration: "none" }}>
            <button
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                padding: "13px 28px",
                borderRadius: 10,
                cursor: "pointer",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                backdropFilter: "blur(8px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
            >
              Read the docs
            </button>
          </a>
        </div>
      </div>
    </div>
  </section>
);

export const Footer: FC = () => (
  <footer
    style={{
      borderTop: `1px solid ${C.border}`,
      padding: "2.5rem 2rem",
      background: C.surface,
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
          }}
        >
          ⚡
        </div>
        <span
          style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: C.ink,
          }}
        >
          Testly AI
        </span>
      </div>
      <span
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 13,
          color: C.subtle,
        }}
      >
        © {new Date().getFullYear()} Testly AI. All rights reserved.
      </span>
      <div style={{ display: "flex", gap: 24 }}>
        {(["Terms", "Privacy", "Contact"] as const).map((label) => (
          <a
            key={label}
            href="#"
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 13,
              color: C.subtle,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = C.ink;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = C.subtle;
            }}
          >
            {label}
          </a>
        ))}
        <a
          href="#docs"
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 13,
            color: C.subtle,
            textDecoration: "none",
          }}
        >
          Docs
        </a>
      </div>
    </div>
  </footer>
);
