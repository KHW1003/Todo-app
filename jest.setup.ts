// toBeInTheDocument() 같은 화면 검사 함수를 쓸 수 있게 한다
import "@testing-library/jest-dom";
import { randomUUID } from "node:crypto";

// 테스트용 가짜 브라우저(jsdom)에는 crypto.randomUUID가 없어서 Node 것을 빌려 준다
if (typeof globalThis.crypto.randomUUID !== "function") {
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID });
}
