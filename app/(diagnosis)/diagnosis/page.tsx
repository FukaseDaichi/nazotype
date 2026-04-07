import type { Metadata } from "next";

import { DiagnosisFlow } from "@/components/diagnosis/diagnosis-flow/diagnosis-flow";
import { getQuestionMaster } from "@/lib/data";

export const metadata: Metadata = {
  description:
    "32問に答えて、マーダーミステリーでの立ち回りタイプを診断します。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DiagnosisPage() {
  const questionMaster = await getQuestionMaster();

  return <DiagnosisFlow questionMaster={questionMaster} />;
}
