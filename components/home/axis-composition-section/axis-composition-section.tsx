import { AXIS_DEFINITIONS } from "@/lib/axis";

import styles from "./axis-composition-section.module.css";

export function AxisCompositionSection() {
  return (
    <section
      id="axes"
      className="mb-16"
      aria-labelledby="axis-composition-heading"
    >
      <div className="mb-6">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
          4 Axes
        </span>
        <h2
          id="axis-composition-heading"
          className="font-heading text-[clamp(1.6rem,3vw,2.4rem)] tracking-wider mt-1 mb-2"
        >
          4つの軸で、あなたを診断
        </h2>
        <p className="text-sm text-[--color-text-muted] max-w-2xl">
          まずは各軸が何を見ているのかを読むと、タイプ名の意味がつかみやすくなります。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {AXIS_DEFINITIONS.map((definition) => (
          <article
            key={definition.axis}
            className={`${styles.axisCard} rounded-xl border border-midnight-600 bg-midnight-800 p-5`}
            data-axis={definition.axis}
          >
            {/* Axis badge */}
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400 m-0">
              AXIS {definition.no}
            </p>

            {/* Axis name */}
            <h3 className="font-heading text-lg tracking-wider mt-1 mb-2">
              {definition.label}
            </h3>

            {/* Axis description */}
            <p className="text-sm text-[--color-text-muted] mb-4">
              {definition.description}
            </p>

            {/* Two poles */}
            <div className="flex flex-col gap-3">
              {/* Side 1 */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-midnight-700 flex items-center justify-center">
                  <span className="font-heading text-xl text-amber-400">
                    {definition.sides[0].code}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm m-0">
                    <span className="text-[--color-text]">
                      {definition.sides[0].word}
                    </span>
                    <span className="text-[--color-text-muted] ml-2 font-normal">
                      {definition.sides[0].label}
                    </span>
                  </p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5 m-0">
                    {definition.sides[0].shortDescription}
                  </p>
                </div>
              </div>

              {/* VS divider */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="flex-1 h-px bg-midnight-600" />
                <span className="font-heading text-xs text-midnight-500 tracking-wider">
                  VS
                </span>
                <span className="flex-1 h-px bg-midnight-600" />
              </div>

              {/* Side 2 */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-midnight-700 flex items-center justify-center">
                  <span className="font-heading text-xl text-cyan-400">
                    {definition.sides[1].code}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm m-0">
                    <span className="text-[--color-text]">
                      {definition.sides[1].word}
                    </span>
                    <span className="text-[--color-text-muted] ml-2 font-normal">
                      {definition.sides[1].label}
                    </span>
                  </p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5 m-0">
                    {definition.sides[1].shortDescription}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
