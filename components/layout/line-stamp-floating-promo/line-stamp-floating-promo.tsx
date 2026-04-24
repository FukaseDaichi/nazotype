import { LINE_STAMP_URL } from "@/lib/site";

import { LineStampFloatingPromoClient } from "./line-stamp-floating-promo-client";

type LineStampFloatingPromoProps = {
  variant: "home" | "type";
  typeName?: string;
  typeCode?: string;
};

export function LineStampFloatingPromo({
  variant,
  typeName,
  typeCode,
}: LineStampFloatingPromoProps) {
  if (!LINE_STAMP_URL) {
    return null;
  }

  const title =
    variant === "type" && typeName
      ? `${typeName} も入った\nLINEスタンプ発売中`
      : "16タイプの\nLINEスタンプ、できました";
  const description =
    variant === "type" && typeName
      ? "このタイプを含む16タイプのスタンプをLINEで使えます。"
      : "診断のあとも使いやすい、キャラ入りスタンプです。";
  const collapsedText =
    variant === "type" && typeName
      ? `${typeName} もいるよ`
      : "16タイプのスタンプ発売中";

  return (
    <LineStampFloatingPromoClient
      href={LINE_STAMP_URL}
      title={title}
      description={description}
      collapsedText={collapsedText}
      typeCode={variant === "type" ? typeCode : undefined}
    />
  );
}
