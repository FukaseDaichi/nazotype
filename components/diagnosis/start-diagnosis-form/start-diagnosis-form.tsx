"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { normalizeUserName } from "@/lib/diagnosis";
import { readDiagnosisDraft, writeDiagnosisDraft } from "@/lib/draft-storage";
import {
  getSecretPublicPath,
  isSecretTriggerName,
} from "@/lib/secret-result";

type StartDiagnosisFormProps = {
  inputId?: string;
};

export function StartDiagnosisForm({
  inputId = "diagnosis-name",
}: StartDiagnosisFormProps) {
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
  const shouldShowResumeLink =
    Boolean(resumeName) && !isSecretTriggerName(resumeName ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userName = normalizeUserName(name);
    if (!userName) {
      return;
    }

    if (isSecretTriggerName(userName)) {
      router.push(getSecretPublicPath());
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
    <div className="flex flex-col items-center gap-4">
      <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
        <div className="flex border border-gold-400/30 bg-paper-50/5 backdrop-blur-[10px] overflow-hidden transition-colors focus-within:border-gold-400 focus-within:shadow-[0_0_20px_rgba(193,155,46,0.1)]">
          <input
            id={inputId}
            maxLength={10}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-paper-50 font-serif text-base px-5 py-4 placeholder:text-paper-300 min-w-0"
            placeholder="あなたの名前（任意）"
            autoComplete="nickname"
          />
          <button
            type="submit"
            disabled={isDisabled}
            className="bg-gradient-to-br from-gold-400 to-gold-500 border-none text-mystery-800 font-serif text-[0.95rem] font-bold px-6 py-4 cursor-pointer tracking-wider whitespace-nowrap transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-default"
          >
            診断を始める &rarr;
          </button>
        </div>
      </form>

      <p className="font-mono text-[0.75rem] text-paper-200">
        32問 &middot; 所要時間3〜5分 &middot; 登録不要
      </p>

      {shouldShowResumeLink && resumeName ? (
        <Link
          href="/diagnosis"
          prefetch={false}
          className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
        >
          前回の続きから再開する
          <span className="font-mono text-xs text-paper-200">
            ({resumeName})
          </span>
        </Link>
      ) : null}
    </div>
  );
}
