"use client";

import { Icon } from "./Icon";

interface GalleryItem {
  tag?: string;
  title?: string;
  description?: string;
  src?: string;
  alt?: string;
  wide?: boolean;
}

function PhotoSlot({ src, alt }: { src?: string; alt?: string }) {
  if (src) {
    return <img src={src} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
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
  const data = (items || []).filter((i) => i && (i.tag || i.title || i.src));
  if (data.length === 0) return null;

  const n = data.length;
  const featured = data[0];
  const rest = data.slice(1);
  const cols = n <= 2 ? n : n === 3 ? 3 : 4;

  return (
    <section className="section-gallery">
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
      <div
        className="gallery-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: n === 1 ? "420px" : n === 2 ? "380px" : "320px",
        }}
      >
        {n === 1 ? (
          <div className="gallery-item col2 row2" style={{ gridColumn: "1 / -1" }}>
            <PhotoSlot src={featured.src} alt={featured.alt || featured.title} />
            <div className="overlay">
              {featured.tag && <p>{featured.tag}</p>}
              {featured.title && <h4>{featured.title}</h4>}
              {featured.description && <p className="desc">{featured.description}</p>}
            </div>
          </div>
        ) : (
          <>
            <div
              className="gallery-item featured"
              style={n >= 3 ? { gridColumn: "span 2", gridRow: "span 2" } : { gridColumn: "span 1" }}
            >
              <PhotoSlot src={featured.src} alt={featured.alt || featured.title} />
              <div className="overlay">
                {featured.tag && <p>{featured.tag}</p>}
                {featured.title && <h4>{featured.title}</h4>}
                {featured.description && <p className="desc">{featured.description}</p>}
              </div>
            </div>
            {rest.map((item, i) => (
              <div key={i} className={`gallery-item${item.wide ? " col2" : ""}`}>
                <PhotoSlot src={item.src} alt={item.alt || item.title} />
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
