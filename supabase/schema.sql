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