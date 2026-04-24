import { LINE_STAMP_URL } from "@/lib/site";

import { LineStampFloatingPromoClient } from "./line-stamp-floating-promo-client";

type LineStampFloatingPromoProps = {
  typeCode?: string;
};

export function LineStampFloatingPromo({
  typeCode,
}: LineStampFloatingPromoProps) {
  if (!LINE_STAMP_URL) {
    return null;
  }

  const title = "16タイプの\nLINEスタンプあります";
  const description =
    "診断後も使いやすい、キャラ入りスタンプです。隠し要素もあります。";
  const collapsedText = "16タイプのスタンプ発売中";

  return (
    <LineStampFloatingPromoClient
      href={LINE_STAMP_URL}
      title={title}
      description={description}
      collapsedText={collapsedText}
      typeCode={typeCode}
    />
  );
}
