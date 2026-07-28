-- 게시글 테이블
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  summary text,
  category text,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- RLS(Row Level Security) 활성화
alter table posts enable row level security;

-- 모든 사람이 글을 읽을 수 있음
create policy "누구나 게시글 조회 가능"
  on posts for select
  using (true);

-- 로그인한 사용자만 글쓰기 가능
create policy "로그인 사용자만 작성 가능"
  on posts for insert
  with check (auth.uid() = user_id);

-- 작성자 본인만 수정 가능
create policy "작성자만 수정 가능"
  on posts for update
  using (auth.uid() = user_id);

-- 작성자 본인만 삭제 가능
create policy "작성자만 삭제 가능"
  on posts for delete
  using (auth.uid() = user_id);

alter table posts add column if not exists summary text;
alter table posts add column if not exists category text;

-- 댓글 테이블
-- 주의: posts.id 가 uuid 이므로 post_id 도 uuid 여야 합니다 (기존 bigint 참조는 타입 불일치로 생성이 안 됩니다)
create table if not exists comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamp with time zone default now()
);

-- RLS(Row Level Security) 활성화
alter table comments enable row level security;

-- 모든 사람이 댓글 조회 가능
create policy "누구나 댓글 조회 가능"
  on comments for select
  using (true);

-- 로그인한 사용자만 댓글 작성 가능
create policy "로그인 사용자만 댓글 작성 가능"
  on comments for insert
  with check (auth.uid() = user_id);

-- 작성자 본인만 댓글 수정 가능
create policy "작성자만 댓글 수정 가능"
  on comments for update
  using (auth.uid() = user_id);

-- 작성자 본인만 댓글 삭제 가능
create policy "작성자만 댓글 삭제 가능"
  on comments for delete
  using (auth.uid() = user_id);
