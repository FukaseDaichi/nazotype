"use client";

import { useEffect, useRef } from "react";

export function Particles({ count = 30 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const left = Math.random() * 100;
      const dur = 8 + Math.random() * 12;
      const delay = Math.random() * 15;
      const dx = (Math.random() - 0.5) * 200;
      p.style.cssText = `left:${left}%;--dur:${dur}s;--dx:${dx}px;animation-delay:${delay}s;`;
      container.appendChild(p);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [count]);

  return <div ref={ref} className="particles" aria-hidden="true" />;
}
