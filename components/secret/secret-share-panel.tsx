"use client";

import { useSecretShareAvailability } from "@/components/secret/secret-share-availability-context";
import { TypeSharePanel } from "@/components/type/type-detail-page-content/type-share-panel";

type SecretSharePanelProps = {
  typeCode: string;
  typeName: string;
  shareText: string;
  shareUrl: string;
};

export function SecretSharePanel({
  typeCode,
  typeName,
  shareText,
  shareUrl,
}: SecretSharePanelProps) {
  const canShare = useSecretShareAvailability();

  if (!canShare) {
    return null;
  }

  return (
    <TypeSharePanel
      id="secret-share-panel"
      typeCode={typeCode}
      typeName={typeName}
      shareText={shareText}
      shareUrl={shareUrl}
      eyebrow="Share"
      title="この秘密を誰かに渡す"
      description="SNSで共有して、同じ結末にたどり着いた仲間を集めよう。"
    />
  );
}
