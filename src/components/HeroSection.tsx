"use client";

import { GradientButton } from "./GradientButton";

interface Campaign {
  headlineParts: { text: string; gradient?: boolean }[];
  subhead: string;
}

interface HeroSectionProps {
  campaign: Campaign;
  onDonate: () => void;
  onTransparency: () => void;
}

export function HeroSection({ campaign, onDonate, onTransparency }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-badge-row">
            <span className="hero-badge">Ongoing Campaign</span>
            <span className="hero-badge-pulse" />
          </div>
          <h1 className="hero-headline fade-in">
            {campaign.headlineParts.map((part, i) => (
              <span key={i}>
                <span className={part.gradient ? "gradient-text" : ""}>{part.text}</span>
                {i < campaign.headlineParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-subhead fade-in">{campaign.subhead}</p>
          <div className="hero-ctas">
            <GradientButton variant="primary" size="lg" onClick={onDonate}>
              Support the Mission
            </GradientButton>
            <GradientButton variant="outline" size="lg" onClick={onTransparency}>
              View Transparency Report
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}
