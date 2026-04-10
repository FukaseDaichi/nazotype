"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
};

export function RevealOnScroll({
  children,
  className = "",
  as: Tag = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}
