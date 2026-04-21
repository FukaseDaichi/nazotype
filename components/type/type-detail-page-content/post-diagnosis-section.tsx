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

import { PostDiagnosisResultCard } from "./post-diagnosis-result-card";
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

type SearchParamsLike = {
  get(name: string): string | null;
};

type PostDiagnosisSectionProps = {
  typeData: TypeData;
  publicUrl: string;
  shareUrl: string;
};

function createResolvedState(
  shareKey: string,
  publicUrl: string,
  isPostDiagnosis: boolean,
) {
  const payload = decodeShareKey(shareKey);

  if (!payload) {
    return null;
  }

  return {
    userName: payload.n,
    shareKey,
    axisSummaries: expandShareKeyAxisSummaries(payload),
    resultUrl: getAbsoluteUrl(`${publicUrl}?s=${shareKey}`),
    isPostDiagnosis,
  } satisfies ResolvedState;
}

function resolvePostDiagnosisState(
  searchParams: SearchParamsLike,
  typeCode: string,
  publicUrl: string,
) {
  const keyParam = searchParams.get("s");
  if (keyParam) {
    return createResolvedState(
      keyParam,
      publicUrl,
      isPostDiagnosisResultMatch(typeCode, keyParam),
    );
  }

  const stored = readPostDiagnosisResult();
  if (!stored || stored.typeCode !== typeCode) {
    return null;
  }

  return createResolvedState(stored.key, publicUrl, true);
}

export function PostDiagnosisSection({
  typeData,
  publicUrl,
  shareUrl,
}: PostDiagnosisSectionProps) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResolvedState | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(
        resolvePostDiagnosisState(searchParams, typeData.typeCode, publicUrl),
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [searchParams, typeData.typeCode, publicUrl]);

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
