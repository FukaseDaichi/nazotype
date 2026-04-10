"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { AxisSummary, TypeData } from "@/lib/types";
import {
  isPostDiagnosisResultMatch,
  readPostDiagnosisResult,
} from "@/lib/post-diagnosis-result";
import { decodeShareKey, expandShareKeyAxisSummaries } from "@/lib/share-key";
import { getAbsoluteUrl } from "@/lib/site";

import { TypeSignatureSection } from "./type-signature-section";
import { TypeSharePanel } from "./type-share-panel";
import { type TypeSectionHeading } from "./type-section-frame";

const SIGNATURE_HEADING: TypeSectionHeading = {
  eyebrow: "Type Signature",
  title: "傾向",
  headingId: "signature-heading",
};

type ResolvedState = {
  userName: string;
  shareKey: string;
  axisSummaries: AxisSummary[];
  resultUrl: string;
  isPostDiagnosis: boolean;
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
  const [state, setState] = useState<ResolvedState | null>(null);

  useEffect(() => {
    // 1) Check for share key in URL query param
    const keyParam = searchParams.get("s");
    if (keyParam) {
      const payload = decodeShareKey(keyParam);
      if (payload) {
        const axisSummaries = expandShareKeyAxisSummaries(payload);
        setState({
          userName: payload.n,
          shareKey: keyParam,
          axisSummaries,
          resultUrl: getAbsoluteUrl(`${publicUrl}?s=${keyParam}`),
          isPostDiagnosis: isPostDiagnosisResultMatch(
            typeData.typeCode,
            keyParam,
          ),
        });
        return;
      }
    }

    // 2) Check for post-diagnosis result in localStorage
    const stored = readPostDiagnosisResult();
    if (stored && stored.typeCode === typeData.typeCode) {
      const payload = decodeShareKey(stored.key);
      if (payload) {
        const axisSummaries = expandShareKeyAxisSummaries(payload);
        setState({
          userName: payload.n,
          shareKey: stored.key,
          axisSummaries,
          resultUrl: getAbsoluteUrl(`${publicUrl}?s=${stored.key}`),
          isPostDiagnosis: true,
        });
      }
    }
  }, [searchParams, typeData.typeCode, publicUrl]);

  if (!state) return null;

  return (
    <>
      <TypeSignatureSection
        heading={SIGNATURE_HEADING}
        typeData={typeData}
        axisSummaries={state.axisSummaries}
      />

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
