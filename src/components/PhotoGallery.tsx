"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { Icon } from "./Icon";

interface GalleryItem {
  tag?: string;
  title?: string;
  description?: string;
  src?: string;
  alt?: string;
  wide?: boolean;
  objectPosition?: string;
}

function PhotoSlot({ src, alt, objectPosition }: { src?: string; alt?: string; objectPosition?: string }) {
  if (src) {
    return <img src={src} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition || undefined, display: "block" }} />;
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "repeating-linear-gradient(135deg, var(--surface-container-low) 0 12px, var(--surface-container) 12px 13px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        padding: 16,
      }}
    >
      <span
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 11,
          background: "var(--surface-container-highest)",
          color: "var(--on-surface-variant)",
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid var(--outline-variant)",
        }}
      >
        {alt || "photo"}
      </span>
    </div>
  );
}

interface PhotoGalleryProps {
  title: string;
  sub: string;
  items: GalleryItem[];
}

export function PhotoGallery({ title, sub, items }: PhotoGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelector(".gallery-header"),
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", toggleActions: "play none none none" },
        }
      );

      const items = sectionRef.current.querySelectorAll(".gallery-item");
      gsap.fromTo(items,
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current.querySelector(".gallery-grid"), start: "top 65%", toggleActions: "play none none none" },
        }
      );
    },
    { dependencies: [], scope: sectionRef }
  );

  const data = (items || []).filter((i) => i && (i.tag || i.title || i.src));
  if (data.length === 0) return null;

  const n = data.length;
  const featured = data[0];
  const rest = data.slice(1);

  const layoutClass =
    n === 1 ? "gallery-grid-1" :
    n === 2 ? "gallery-grid-2" :
    n === 3 ? "gallery-grid-3" :
    "gallery-grid-4";

  return (
    <section ref={sectionRef} className="section-gallery">
      <div className="gallery-header">
        <div style={{ maxWidth: "36rem" }}>
          <h2 className="impact-title" style={{ marginBottom: 16 }}>{title}</h2>
          <p className="impact-sub">{sub}</p>
        </div>
        {n > 4 && (
          <a className="gallery-link" href="#">
            View full gallery
            <Icon name="arrow_forward" size={20} />
          </a>
        )}
      </div>
      <div className={`gallery-grid ${layoutClass}`}>
        {n === 1 ? (
          <div className="gallery-item gallery-full">
            <PhotoSlot src={featured.src} alt={featured.alt || featured.title} objectPosition={featured.objectPosition} />
            <div className="overlay">
              {featured.tag && <p>{featured.tag}</p>}
              {featured.title && <h4>{featured.title}</h4>}
              {featured.description && <p className="desc">{featured.description}</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="gallery-item gallery-featured">
              <PhotoSlot src={featured.src} alt={featured.alt || featured.title} objectPosition={featured.objectPosition} />
              <div className="overlay">
                {featured.tag && <p>{featured.tag}</p>}
                {featured.title && <h4>{featured.title}</h4>}
                {featured.description && <p className="desc">{featured.description}</p>}
              </div>
            </div>
            {rest.map((item, i) => (
              <div key={i} className="gallery-item">
                <PhotoSlot src={item.src} alt={item.alt || item.title} objectPosition={item.objectPosition} />
                <div className="overlay">
                  {item.tag && <p>{item.tag}</p>}
                  {item.title && <h4>{item.title}</h4>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
