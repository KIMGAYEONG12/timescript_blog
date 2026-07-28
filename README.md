# 개발 기록 블로그

완성된 포트폴리오가 아니라, 삽질하고 배운 과정 자체를 콘텐츠로 남기는 **Work Log 스타일 개발 기록 블로그**입니다.
Next.js(App Router)와 Supabase로 만들었습니다.

## 주요 기능

- **글 CRUD**: 작성 / 수정 / 삭제, 이미지 첨부(최대 5MB, jpg·png)
- **카테고리 태그**: 삽질기록 / 오늘배운것 / 프로젝트
- **월별 타임라인**: 작성일 기준으로 글을 월별로 그룹핑해서 목록에 표시
- **소셜 로그인**: Google / GitHub OAuth (Supabase Auth)
- **댓글**: 로그인한 사용자만 작성 가능, 본인 댓글만 삭제 가능
- **프로필**: 닉네임 / 아바타 / 자기소개 수정

## 기술 스택

| 구분                         | 사용 기술                          |
| ---------------------------- | ---------------------------------- |
| 프레임워크                   | Next.js 16 (App Router, Turbopack) |
| 언어                         | TypeScript                         |
| UI                           | React 19, Tailwind CSS 4           |
| 백엔드 / DB / Auth / Storage | Supabase                           |
| 배포                         | Vercel                             |

## 폴더 구조

```
app/
├─ auth/
│  ├─ actions.ts        # 로그아웃 등 인증 관련 서버 액션
│  └─ callback/         # OAuth 콜백 라우트
├─ components/
│  └─ site-header.tsx   # 공통 헤더
├─ login/                # 소셜 로그인 페이지
├─ posts/
│  ├─ actions.ts         # 글 작성/수정/삭제 서버 액션
│  ├─ post-form.tsx       # 글 작성/수정 폼
│  ├─ page.tsx            # 글 목록(홈)
│  ├─ new/                # 글 작성 페이지
│  └─ [id]/
│     ├─ page.tsx             # 글 상세
│     ├─ edit/                # 글 수정 페이지
│     ├─ comment-form.tsx     # 댓글 작성 폼
│     ├─ comment-list.tsx     # 댓글 목록
│     ├─ delete-comment-button.tsx
│     └─ comment-actions.ts   # 댓글 작성/삭제 서버 액션
├─ profile/
│  ├─ actions.ts         # 프로필 수정 서버 액션
│  ├─ page.tsx            # 프로필 페이지
│  └─ profile-form.tsx    # 프로필 수정 폼
└─ layout.tsx / page.tsx / globals.css

supabase/
└─ setup.sql             # posts / profiles / comments 테이블, RLS 정책, Storage 버킷 설정 (한 번에 실행 가능)

utils/supabase/
├─ client.ts             # 브라우저용 Supabase 클라이언트
└─ server.ts             # 서버 컴포넌트/액션용 Supabase 클라이언트
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트 값을 채워주세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 테이블 / 정책 설정

Supabase 프로젝트의 SQL Editor에 `supabase/setup.sql` 내용을 그대로 붙여넣고 실행하세요.
`posts`, `profiles`, `comments` 테이블과 RLS 정책, `avatars` / `post-images` Storage 버킷까지 한 번에 생성됩니다. (이미 존재하는 객체는 건너뛰도록 작성되어 있어 재실행해도 안전합니다.)

### 4. Supabase Auth에 소셜 로그인 Provider 등록

Supabase 대시보드 → Authentication → Providers에서 Google, GitHub OAuth를 활성화하고, Redirect URL로 `{배포 주소}/auth/callback`을 등록하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 배포

Vercel에 GitHub 저장소를 연결하고, 위의 환경 변수를 Vercel 프로젝트 설정에도 동일하게 등록하면 됩니다.

```bash
npm run build
```

으로 로컬에서 먼저 빌드가 정상적으로 되는지 확인 후 배포하는 것을 권장합니다.
