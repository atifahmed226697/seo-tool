"use client";

import React, { useEffect, useState } from "react";

/**
 * Click any image inside a blog article to open it in a large preview.
 * Close it by clicking the dark area, the Close button, or pressing Esc.
 */
export function ImageLightbox() {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);

  // Listen for clicks on images inside the article body
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;
      if (!target.closest(".blog-content")) return;
      const el = target as HTMLImageElement;
      setImg({ src: el.currentSrc || el.src, alt: el.alt });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Close on Esc and stop the page behind from scrolling
  useEffect(() => {
    if (!img) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImg(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [img]);

  return (
    <>
      <style>{`.blog-content img{cursor:zoom-in}`}</style>

      {img && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={img.alt || "Image preview"}
          onClick={() => setImg(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setImg(null)}
            className="absolute right-4 top-4 rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            Close ✕
          </button>
          <img
            src={img.src}
            alt={img.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-md bg-white object-contain"
          />
        </div>
      )}
    </>
  );
}