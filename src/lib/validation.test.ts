import { validateTitle } from "./validation";

// TEST_CASES.md 1장 - 제목 검증 규칙
describe("validateTitle", () => {
  test("VAL-01 '장보기' → 통과", () => {
    expect(validateTitle("장보기")).toEqual({ ok: true, value: "장보기" });
  });

  test("VAL-02 앞뒤 공백 제거", () => {
    expect(validateTitle("  장보기  ")).toEqual({ ok: true, value: "장보기" });
  });

  test("VAL-03 가운데 공백 유지", () => {
    expect(validateTitle("장  보기")).toEqual({ ok: true, value: "장  보기" });
  });

  test("VAL-04 빈 문자열 → TITLE_REQUIRED", () => {
    expect(validateTitle("")).toEqual({ ok: false, code: "TITLE_REQUIRED" });
  });

  test("VAL-05 공백만 → TITLE_REQUIRED", () => {
    expect(validateTitle("   ")).toEqual({ ok: false, code: "TITLE_REQUIRED" });
  });

  test("VAL-06 1자 → 통과", () => {
    expect(validateTitle("가")).toEqual({ ok: true, value: "가" });
  });

  test("VAL-07 100자 → 통과", () => {
    const title = "가".repeat(100);
    expect(validateTitle(title)).toEqual({ ok: true, value: title });
  });

  test("VAL-08 101자 → TITLE_TOO_LONG", () => {
    expect(validateTitle("가".repeat(101))).toEqual({ ok: false, code: "TITLE_TOO_LONG" });
  });

  test("VAL-09 👍 100개 → 통과 (보이는 글자 기준)", () => {
    const title = "👍".repeat(100);
    expect(validateTitle(title)).toEqual({ ok: true, value: title });
  });

  test("VAL-10 👍 101개 → TITLE_TOO_LONG", () => {
    expect(validateTitle("👍".repeat(101))).toEqual({ ok: false, code: "TITLE_TOO_LONG" });
  });

  test("VAL-11 문자열이 아님 → TITLE_REQUIRED", () => {
    expect(validateTitle(1)).toEqual({ ok: false, code: "TITLE_REQUIRED" });
    expect(validateTitle(null)).toEqual({ ok: false, code: "TITLE_REQUIRED" });
  });
});
