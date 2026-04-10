import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

type TypeListSectionProps = {
  heading: TypeSectionHeading;
  items: string[];
};

export function TypeListSection({ heading, items }: TypeListSectionProps) {
  return (
    <TypeSectionFrame heading={heading}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="shrink-0 text-gold-400" aria-hidden="true">
              ─
            </span>
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </TypeSectionFrame>
  );
}
