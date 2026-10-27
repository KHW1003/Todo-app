import { z } from "zod";

// 화면용 제목 규칙 (TRD 8장). 안내용이고, 같은 규칙이 서버 backend/app/validation.py에도 있다
const MAX_VISIBLE_LENGTH = 100; // 보이는 글자 수
const MAX_STORED_LENGTH = 400; // DB 칸 크기 (VARCHAR(400))

// 보이는 글자 수 세기. "👍".length는 2라서 Intl.Segmenter로 센다
const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });
function countVisibleChars(text: string): number {
  return Array.from(segmenter.segment(text)).length;
}

export const titleSchema = z
  .string({ error: "TITLE_REQUIRED" })
  .trim()
  .refine((v) => v.length > 0, { error: "TITLE_REQUIRED" })
  .refine((v) => countVisibleChars(v) <= MAX_VISIBLE_LENGTH, { error: "TITLE_TOO_LONG" })
  .refine((v) => v.length <= MAX_STORED_LENGTH, { error: "TITLE_TOO_LONG" });

export type TitleResult =
  | { ok: true; value: string }
  | { ok: false; code: "TITLE_REQUIRED" | "TITLE_TOO_LONG" };

// 제목을 검사하고, 통과하면 앞뒤 공백을 지운 값을 돌려준다
export function validateTitle(input: unknown): TitleResult {
  const result = titleSchema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  const code = result.error.issues[0]?.message === "TITLE_TOO_LONG" ? "TITLE_TOO_LONG" : "TITLE_REQUIRED";
  return { ok: false, code };
}
