# 하루하루

일기, 단상, 평가를 기록하는 미니멀한 개인 게시판입니다. Next.js(App Router) +
Supabase로 만들었습니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

## 환경 변수

`.env.local`에 Supabase 프로젝트 정보가 필요합니다.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 배포

GitHub `main` 브랜치에 푸시하면 Vercel이 자동으로 빌드하고 배포합니다.
