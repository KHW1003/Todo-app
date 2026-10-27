# Todo-app
학습용 할 일 관리 앱

## 기술 스택
- 화면: Next.js 15, React 19, TypeScript, Tailwind CSS
- 서버: Python FastAPI (v0.2부터)
- DB: PostgreSQL (v0.3부터)

## 실행
- 화면: `npm install` 후 `npm run dev` → http://localhost:3000
- 서버 (v0.2부터): `backend` 폴더에서 `uvicorn app.main:app --reload --port 8000`

## 테스트
- 화면: `npm test`
- 서버: `backend` 폴더에서 `pytest`

자세한 명세는 [docs/](docs/) 폴더와 [CLAUDE.md](CLAUDE.md)를 참고.
