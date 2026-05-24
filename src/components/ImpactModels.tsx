"use client";

import { Icon } from "./Icon";
import { TokenIcon } from "./TokenIcon";

interface CardConfig {
  title: string;
  pill: string;
  desc: string;
  features: string[];
  cta: string;
  icon: string;
  multichainLabel?: string;
  methods?: { label: string; icon?: string; token?: string }[];
  multichainFoot?: string;
  footTitle?: string;
  footSub?: string;
  footIcon?: string;
}

interface ImpactModelsProps {
  title: string;
  sub: string;
  showStake?: boolean;
  donateCard: CardConfig;
  stakeCard: CardConfig | null;
  onDonate: () => void;
  onStake: () => void;
}

export function ImpactModels({ title, sub, donateCard, stakeCard, showStake = true, onDonate, onStake }: ImpactModelsProps) {
  return (
    <section className="section-impact">
      <div className="impact-header">
        <h2 className="impact-title">{title}</h2>
        <p className="impact-sub">{sub}</p>
      </div>
      <div className={`impact-grid${showStake ? "" : " impact-grid-single"}`}>
        <div className="impact-card primary">
          <div className="impact-card-inner">
            <div className="impact-card-blur" />
            <div className="impact-icon-wrap">
              <Icon name={donateCard.icon || "volunteer_activism"} fill={1} />
            </div>
            <div className="impact-title-row">
              <h3>{donateCard.title}</h3>
              <span className="impact-pill primary">{donateCard.pill}</span>
            </div>
            <p className="impact-desc">{donateCard.desc}</p>
            <ul className="impact-feats">
              {donateCard.features.map((f, i) => (
                <li key={i}><Icon name="check_circle" fill={1} />{f}</li>
              ))}
            </ul>
            <div className="impact-multichain">
              <p className="impact-multichain-label">{donateCard.multichainLabel || "Payment methods"}</p>
              <div className="chain-chips">
                {(donateCard.methods || []).map((m, i) => (
                  <span key={i} className="chain-chip" title={m.label}>
                    {m.icon ? <Icon name={m.icon} size={14} /> : <TokenIcon symbol={m.token || ""} size={14} />}
                    {m.label}
                  </span>
                ))}
              </div>
              {donateCard.multichainFoot && (
                <p className="impact-multichain-foot">{donateCard.multichainFoot}</p>
              )}
            </div>
            <button className="impact-cta primary" onClick={onDonate}>
              {donateCard.cta} →
            </button>
          </div>
        </div>
        {showStake && stakeCard && (
          <div className="impact-card secondary">
            <div className="impact-card-inner">
              <div className="impact-card-blur" />
              <div className="impact-icon-wrap">
                <Icon name={stakeCard.icon || "account_balance"} fill={1} />
              </div>
              <div className="impact-title-row">
                <h3>{stakeCard.title}</h3>
                <span className="impact-pill secondary">{stakeCard.pill}</span>
              </div>
              <p className="impact-desc">{stakeCard.desc}</p>
              <ul className="impact-feats">
                {stakeCard.features.map((f, i) => (
                  <li key={i}><Icon name="check_circle" fill={1} />{f}</li>
                ))}
              </ul>
              <div className="impact-shield">
                <Icon name={stakeCard.footIcon || "shield"} fill={1} />
                <div>
                  <p className="impact-shield-title">{stakeCard.footTitle}</p>
                  <p className="impact-shield-sub">{stakeCard.footSub}</p>
                </div>
              </div>
              <button className="impact-cta secondary" onClick={onStake}>
                {stakeCard.cta} →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
