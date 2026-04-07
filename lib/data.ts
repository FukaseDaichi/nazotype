import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

import type { QuestionMaster, TypeCode, TypeData } from "@/lib/types";

const DATA_DIR = join(process.cwd(), "data");
const TYPES_DIR = join(DATA_DIR, "types");
const PUBLIC_TYPES_DIR = join(process.cwd(), "public", "types");

export const getQuestionMaster = cache(async () => {
  const source = await readFile(join(DATA_DIR, "question-master.json"), "utf8");
  return JSON.parse(source) as QuestionMaster;
});

export const getAllTypeCodes = cache(async () => {
  const files = await readdir(TYPES_DIR);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/u, ""))
    .sort();
});

export const getAllTypes = cache(async () => {
  const codes = await getAllTypeCodes();
  const types = await Promise.all(codes.map((code) => getTypeByCode(code)));
  return types.filter((type): type is TypeData => Boolean(type));
});

export const getTypeByCode = cache(async (typeCode: TypeCode) => {
  try {
    const source = await readFile(join(TYPES_DIR, `${typeCode}.json`), "utf8");
    return JSON.parse(source) as TypeData;
  } catch {
    return null;
  }
});

export async function getTypesByCodes(typeCodes: TypeCode[]) {
  const uniqueCodes = [...new Set(typeCodes)];
  const types = await Promise.all(uniqueCodes.map((code) => getTypeByCode(code)));
  return types.filter((type): type is TypeData => Boolean(type));
}

export const hasTypeImage = cache(async (typeCode: TypeCode) => {
  try {
    await access(join(PUBLIC_TYPES_DIR, `${typeCode}.png`));
    return true;
  } catch {
    return false;
  }
});

export const hasChibiImage = cache(async (typeCode: TypeCode) => {
  try {
    await access(join(PUBLIC_TYPES_DIR, `${typeCode}_chibi.png`));
    return true;
  } catch {
    return false;
  }
});
