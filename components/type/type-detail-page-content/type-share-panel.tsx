import { ShareActions } from "@/components/type/share-actions/share-actions";

import styles from "./type-share-panel.module.css";

type TypeSharePanelProps = {
  id?: string;
  typeCode: string;
  typeName: string;
  shareText: string;
  shareUrl: string;
  copyUrl?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function TypeSharePanel({
  id,
  typeCode,
  typeName,
  shareText,
  shareUrl,
  copyUrl,
  eyebrow,
  title,
  description,
}: TypeSharePanelProps) {
  return (
    <ShareActions
      id={id}
      typeCode={typeCode}
      typeName={typeName}
      shareText={shareText}
      shareUrl={shareUrl}
      copyUrl={copyUrl}
      eyebrow={eyebrow}
      title={title}
      description={description}
      className={styles.sharePanel}
    />
  );
}
