"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { normalizeUserName } from "@/lib/diagnosis";
import { readDiagnosisDraft, writeDiagnosisDraft } from "@/lib/draft-storage";

export function StartDiagnosisForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [resumeName, setResumeName] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const draft = readDiagnosisDraft();
      if (draft?.userName) {
        setResumeName(draft.userName);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const normalizedName = name.trim();
  const isDisabled = normalizedName.length === 0 || normalizedName.length > 10;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userName = normalizeUserName(name);
    if (!userName) {
      return;
    }

    const draft = readDiagnosisDraft();
    const isSameUser = draft?.userName === userName;

    writeDiagnosisDraft({
      userName,
      answers: isSameUser ? draft?.answers ?? {} : {},
      currentPage: isSameUser ? draft?.currentPage ?? 1 : 1,
      updatedAt: new Date().toISOString(),
    });

    router.push("/diagnosis");
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="surface-panel flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="field-label" htmlFor="top-name">
            お名前
          </label>
          <input
            id="top-name"
            maxLength={10}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="text-field"
            placeholder="例: 綾乃"
            autoComplete="nickname"
          />
          <p className="text-sm text-[color:var(--color-text-subtle)]">
            10文字以内。結果ページと共有URLに反映されます。
          </p>
        </div>

        <button type="submit" disabled={isDisabled} className="primary-button">
          32問の診断をはじめる
        </button>
      </form>

      {resumeName ? (
        <a href="/diagnosis" className="secondary-button justify-center">
          前回の続きから再開する
          <span className="text-xs text-[color:var(--color-text-subtle)]">
            保存中: {resumeName}
          </span>
        </a>
      ) : null}
    </div>
  );
}
