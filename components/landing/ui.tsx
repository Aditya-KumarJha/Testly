"use client";

import type { CSSProperties, FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { PIPELINE, TERM_LINES } from "./content";
import { useCounter, useInView } from "./hooks";
import { C } from "./theme";

interface GlowCardProps {
  children: ReactNode;
  accent?: string;
  style?: CSSProperties;
}

export const GlowCard: FC<GlowCardProps> = ({
  children,
  accent = C.primary,
  style = {},
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hovered ? `${accent}66` : C.border}`,
        borderRadius: 16,
        padding: "1.75rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.25s",
        boxShadow: hovered
          ? `0 0 0 1px ${accent}18, 0 8px 32px ${accent}14, 0 2px 8px rgba(0,0,0,0.05)`
          : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        transform: hovered ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {hovered ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            borderRadius: "16px 16px 0 0",
          }}
        />
      ) : null}
      {children}
    </div>
  );
};

export const GreenBadge: FC<{ children: ReactNode }> = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 14px 6px 10px",
      borderRadius: 999,
      background: C.primaryBg,
      border: `1px solid ${C.primaryMid}`,
      fontSize: 12,
      fontFamily: "'Geist', sans-serif",
      fontWeight: 500,
      color: C.primaryDark,
      letterSpacing: "0.01em",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "55%",
        height: "100%",
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
        animation: "shimmer 2.8s infinite",
      }}
    />
    {children}
  </span>
);

interface MagicButtonProps {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export const MagicButton: FC<MagicButtonProps> = ({
  children,
  primary = true,
  onClick,
  style = {},
}) => {
  const [hovered, setHovered] = useState(false);

  if (primary) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: "'Geist', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: "11px 24px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: hovered
            ? `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`
            : `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
          color: "#fff",
          boxShadow: hovered
            ? `0 8px 24px ${C.primary}50, 0 2px 8px ${C.primary}30`
            : `0 4px 14px ${C.primary}38`,
          transform: hovered ? "translateY(-1px)" : "none",
          transition: "all 0.2s ease",
          letterSpacing: "0.01em",
          ...style,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Geist', sans-serif",
        fontWeight: 500,
        fontSize: 14,
        padding: "10px 22px",
        borderRadius: 10,
        cursor: "pointer",
        background: hovered ? C.primaryBg : C.surface,
        color: C.inkMid,
        border: `1px solid ${hovered ? C.primaryMid : C.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const TerminalMockup: FC = () => {
  const [visible, setVisible] = useState(0);
  const [started, setStarted] = useState(false);
  const [ref, inView] = useInView(0.3);

  useEffect(() => {
    if (!inView || started) {
      return;
    }

    setStarted(true);
    TERM_LINES.forEach(({ delay }, index) => {
      setTimeout(() => {
        setVisible((current) => Math.max(current, index + 1));
      }, delay);
    });
  }, [inView, started]);

  return (
    <div
      ref={ref}
      style={{
        background: "#0e1a08",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(109,152,70,0.2)",
        boxShadow:
          "0 24px 64px rgba(13,26,5,0.16), 0 4px 16px rgba(13,26,5,0.08), 0 0 0 1px rgba(109,152,70,0.09)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#0a1205",
          display: "flex",
          alignItems: "center",
          gap: 7,
          borderBottom: "1px solid rgba(109,152,70,0.12)",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <span
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            color: "#6b7a5e",
            marginLeft: 8,
          }}
        >
          testly - zsh
        </span>
      </div>

      <div style={{ padding: "1.25rem 1.5rem", minHeight: 220 }}>
        {TERM_LINES.slice(0, visible).map((line, index) => (
          <div
            key={index}
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 12.5,
              color: line.color,
              marginBottom: 5,
              lineHeight: 1.65,
              animation: "fadeUpLine 0.3s ease",
            }}
          >
            {line.text}
          </div>
        ))}
        {visible < TERM_LINES.length ? (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13,
              color: C.primary,
              animation: "blink 1s steps(1) infinite",
            }}
          >
            ▋
          </span>
        ) : null}
      </div>
    </div>
  );
};

export const PipelineViz: FC = () => {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflowX: "auto",
        paddingBottom: 8,
      }}
    >
      {PIPELINE.map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            flex: index < PIPELINE.length - 1 ? "1 0 auto" : "0 0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              minWidth: 96,
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(16px)",
              transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background:
                  index === 0
                    ? C.inkMid
                    : index === PIPELINE.length - 1
                      ? C.primary
                      : C.primaryBg,
                border: `1px solid ${
                  index === 0 || index === PIPELINE.length - 1
                    ? "transparent"
                    : C.primaryMid
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color:
                  index === 0 || index === PIPELINE.length - 1
                    ? "#fff"
                    : C.primary,
                boxShadow:
                  index === PIPELINE.length - 1
                    ? `0 4px 16px ${C.primary}44`
                    : "none",
              }}
            >
              {item.icon}
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: C.inkMid,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: 11,
                  color: C.subtle,
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            </div>
          </div>
          {index < PIPELINE.length - 1 ? (
            <div
              style={{
                flex: 1,
                height: 1,
                minWidth: 20,
                background: `linear-gradient(90deg, ${C.primaryMid}, ${C.primaryMid})`,
                margin: "0 4px",
                marginBottom: 28,
                opacity: inView ? 1 : 0,
                transition: `opacity 0.4s ease ${(index + 0.5) * 0.1}s`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.primaryMid,
                }}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const StatCell: FC<{
  target: number;
  suffix: string;
  label: string;
  active: boolean;
}> = ({ target, suffix, label, active }) => {
  const value = useCounter(target, active);

  return (
    <div style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
      <div
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
          color: C.primary,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 13,
          color: C.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Marquee: FC<{ items: readonly string[] }> = ({ items }) => (
  <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
    <div
      style={{
        display: "flex",
        gap: 56,
        animation: "marquee 24s linear infinite",
        width: "max-content",
      }}
    >
      {[...items, ...items].map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: C.subtle,
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export const DotGrid: FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      backgroundImage: `radial-gradient(circle, ${C.primaryMid} 1px, transparent 1px)`,
      backgroundSize: "28px 28px",
      maskImage:
        "radial-gradient(ellipse 75% 55% at 50% 0%, black 0%, transparent 100%)",
    }}
  />
);

export const Orbs: FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: "-8%",
        right: "-6%",
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.primary}14 0%, transparent 70%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "40%",
        left: "-6%",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.primaryLight}0e 0%, transparent 70%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "8%",
        right: "20%",
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.primaryDark}0a 0%, transparent 70%)`,
      }}
    />
  </div>
);

export const LandingGlobalStyles: FC = () => (
  <>
    <style>{`
      @keyframes shimmer    { 0%{left:-100%} 100%{left:200%} }
      @keyframes fadeUpLine { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
      @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::selection { background: ${C.primaryMid}; color: ${C.primaryDark}; }
      html { scroll-behavior: smooth; }
    `}</style>
  </>
);
