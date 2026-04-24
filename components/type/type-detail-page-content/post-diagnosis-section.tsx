"use client";

import { useSearchParams } from "next/navigation";

import type { TypeData } from "@/lib/types";

import { PostDiagnosisResultCard } from "./post-diagnosis-result-card";
import { resolvePostDiagnosisState } from "./post-diagnosis-state";
import { TypeSignatureSection } from "./type-signature-section";
import { TypeSharePanel } from "./type-share-panel";
import { type TypeSectionHeading } from "./type-section-frame";

const SIGNATURE_HEADING: TypeSectionHeading = {
  eyebrow: "Type Signature",
  title: "傾向",
  headingId: "signature-heading",
};

type PostDiagnosisSectionProps = {
  typeData: TypeData;
  publicUrl: string;
  shareUrl: string;
};

export function PostDiagnosisSection({
  typeData,
  publicUrl,
  shareUrl,
}: PostDiagnosisSectionProps) {
  const searchParams = useSearchParams();
  const state = resolvePostDiagnosisState(
    searchParams,
    typeData.typeCode,
    publicUrl,
  );

  if (!state) return null;

  return (
    <>
      {state.isPostDiagnosis ? (
        <PostDiagnosisResultCard
          typeData={typeData}
          axisSummaries={state.axisSummaries}
          userName={state.userName}
        />
      ) : (
        <TypeSignatureSection
          heading={SIGNATURE_HEADING}
          typeData={typeData}
          axisSummaries={state.axisSummaries}
        />
      )}

      <TypeSharePanel
        id="type-share-panel"
        typeCode={typeData.typeCode}
        typeName={typeData.typeName}
        shareText={typeData.shareText}
        shareUrl={shareUrl}
        copyUrl={state.resultUrl}
        eyebrow="Share"
        title={
          state.isPostDiagnosis
            ? "結果をシェアする"
            : "このタイプページを共有する"
        }
        description={
          state.isPostDiagnosis
            ? undefined
            : "SNS共有はタイプ公開ページへ集約し、この診断結果URLはコピーで送れます。"
        }
      />
    </>
  );
}
