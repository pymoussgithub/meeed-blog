"use client";

import { useEffect, useState } from "react";
import { tourTargetSelector } from "@/lib/tour/targets";
import { useDemoTour } from "./DemoTourProvider";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 6;
const PANEL_CLEARANCE = 240;

/**
 * Spotlight : overlay + ring uniquement.
 * Messages / fallbacks → un seul panneau TourPanel (pas de 2e cadre blanc).
 */
export function TourSpotlight() {
  const { currentStep, setTargetMissing } = useDemoTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!currentStep) {
      setRect(null);
      setTargetMissing(false);
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let raf = 0;

    const measure = () => {
      if (cancelled) return;
      const candidates = [...document.querySelectorAll(tourTargetSelector(currentStep.target))];
      // Préférer la cible visible la plus « substantielle » (évite les barres pleine largeur 1px)
      const visible = candidates
        .map((node) => {
          const r = node.getBoundingClientRect();
          return { node, r, area: Math.max(0, r.width) * Math.max(0, r.height) };
        })
        .filter(({ r }) => r.width > 2 && r.height > 2);
      visible.sort((a, b) => b.area - a.area);
      const best = visible[0];
      if (!best) {
        setRect(null);
        setTargetMissing(true);
        document.documentElement.dataset.tourPanelSide = "right";
        return;
      }
      setTargetMissing(false);
      const { r } = best;
      // Clamp au viewport pour éviter un cadre qui déborde hors écran
      const top = Math.max(8, r.top - PAD);
      const left = Math.max(8, r.left - PAD);
      const right = Math.min(window.innerWidth - 8, r.right + PAD);
      const bottom = Math.min(window.innerHeight - 8, r.bottom + PAD);
      setRect({
        top,
        left,
        width: Math.max(24, right - left),
        height: Math.max(24, bottom - top),
      });

      const targetCenterX = r.left + r.width / 2;
      document.documentElement.dataset.tourPanelSide =
        targetCenterX > window.innerWidth * 0.55 ? "left" : "right";

      const marginTop = 80;
      const outOfView =
        r.top < marginTop ||
        r.bottom > window.innerHeight - PANEL_CLEARANCE ||
        r.left < 0 ||
        r.right > window.innerWidth;
      if (outOfView) {
        best.node.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    };

    measure();
    raf = window.requestAnimationFrame(measure);

    observer = new MutationObserver(() => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      delete document.documentElement.dataset.tourPanelSide;
    };
  }, [currentStep, reducedMotion, setTargetMissing]);

  if (!currentStep) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]" aria-hidden>
      {rect ? (
        <div
          className={
            reducedMotion
              ? "absolute rounded-lg"
              : "absolute rounded-lg transition-[top,left,width,height] duration-300 ease-out"
          }
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(41, 47, 54, 0.55)",
            outline: "2px solid var(--color-accent, #4ecdc4)",
            outlineOffset: 2,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-primary/50" />
      )}
    </div>
  );
}
