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
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-midnight-600 bg-midnight-800 p-6 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-bold text-amber-400"
            htmlFor="top-name"
          >
            お名前
          </label>
          <input
            id="top-name"
            maxLength={10}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-midnight-600 bg-midnight-900 px-4 py-3 text-base text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="例: 綾乃"
            autoComplete="nickname"
          />
          <p className="text-sm text-[--color-text-muted]">
            10文字以内。結果ページと共有URLに反映されます。
          </p>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full min-h-[52px] rounded-lg px-8 py-3 bg-coral-500 text-white font-bold text-base shadow-sm hover:bg-coral-600 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          32問の診断をはじめる
        </button>
      </form>

      {resumeName ? (
        <a
          href="/diagnosis"
          className="flex items-center justify-center gap-2 rounded-lg border border-midnight-600 bg-transparent px-4 py-3 text-sm text-cyan-400 hover:bg-midnight-700/50 hover:border-cyan-400/30 transition-all"
        >
          前回の続きから再開する
          <span className="text-xs text-[--color-text-muted]">
            保存中: {resumeName}
          </span>
        </a>
      ) : null}
    </div>
  );
}
