import {
  TypeSectionFrame,
  type TypeSectionHeading,
} from "@/components/type/type-detail-page-content/type-section-frame";

type TypeOverviewSectionProps = {
  heading: TypeSectionHeading;
  content: string;
};

export function TypeOverviewSection({
  heading,
  content,
}: TypeOverviewSectionProps) {
  return (
    <TypeSectionFrame heading={heading}>
      <div
        className="text-base leading-loose whitespace-pre-line"
        style={{ fontFamily: "var(--nzt-font-serif), serif" }}
      >
        {content}
      </div>
    </TypeSectionFrame>
  );
}
