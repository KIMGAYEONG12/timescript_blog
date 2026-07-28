-- =========================================================
-- 개발 기록 블로그 - 전체 스키마 (한 번에 실행 가능, 재실행해도 안전)
-- =========================================================
-- 이 파일은 schema.sql + migration.sql을 하나로 합치고,
-- 모든 구문을 "이미 있으면 건너뛰기" 방식으로 바꿔서
-- 중간에 하나가 실패해도 전체가 롤백되지 않도록 만든 버전입니다.
--
-- Supabase SQL Editor는 여러 문장을 한 번에 붙여넣고 실행하면
-- 전체를 하나의 트랜잭션으로 처리합니다. 즉 뒤쪽 문장(예: storage
-- 정책) 하나가 실패하면 앞쪽에서 이미 실행된 "컬럼 추가" 같은
-- 변경사항까지 통째로 취소됩니다. (image_url 컬럼이 안 보이거나
-- 글 상세 페이지가 404로 뜨는 원인 중 하나가 바로 이것입니다.)
--
-- 아래 스크립트는 create policy를 DO 블록 + 예외 처리로 감싸서
-- "정책이 이미 있음" 같은 에러가 나도 스크립트 전체가 죽지 않게
-- 했습니다. 전체를 그대로 복사해서 Supabase SQL Editor에 붙여넣고
-- Run 하면 됩니다.

-- ---------------------------------------------------------
-- 1. posts 테이블
-- ---------------------------------------------------------
-- 참고: 실제 운영 중인 posts 테이블은 id가 int8(정수, 자동증가)입니다.
-- 이미 테이블이 있으면 아래 create table은 실행되지 않고 건너뜁니다.
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  summary text,
  category text,
  image_url text,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists summary text;
alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists image_url text;

alter table public.posts enable row level security;

do $$
begin
  create policy "누구나 게시글 조회 가능" on public.posts
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "로그인 사용자만 작성 가능" on public.posts
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "작성자만 수정 가능" on public.posts
    for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "작성자만 삭제 가능" on public.posts
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------
-- 2. profiles 테이블 (닉네임 / 아바타 / 자기소개)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  bio text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  create policy "프로필은 누구나 조회 가능" on public.profiles
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "본인 프로필만 수정 가능" on public.profiles
    for update using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "본인 프로필만 생성 가능" on public.profiles
    for insert with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- 소셜 로그인 최초 가입 시 자동으로 profiles 행 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 3. comments 테이블
-- ---------------------------------------------------------
-- 주의: 실제 posts.id는 uuid가 아니라 int8(정수, 자동증가)입니다.
-- 그래서 post_id도 반드시 bigint로 맞춰야 합니다. (uuid로 만들면
-- foreign key 생성 시 타입 불일치 에러가 나고, Supabase SQL Editor는
-- 스크립트 전체를 한 트랜잭션으로 실행하므로 그 위에서 이미 실행된
-- image_url 컬럼 추가까지 통째로 롤백됩니다 — 이번 404의 진짜 원인.)
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

do $$
begin
  create policy "댓글은 누구나 조회 가능" on public.comments
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "로그인한 사용자만 댓글 작성 가능" on public.comments
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "본인 댓글만 삭제 가능" on public.comments
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------
-- 4. Storage 버킷: avatars(프로필 이미지), post-images(글 첨부 이미지)
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

do $$
begin
  create policy "아바타는 누구나 조회 가능" on storage.objects
    for select using (bucket_id = 'avatars');
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "본인 폴더에만 아바타 업로드 가능" on storage.objects
    for insert with check (
      bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "본인 폴더 아바타만 교체 가능" on storage.objects
    for update using (
      bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "글 첨부 이미지는 누구나 조회 가능" on storage.objects
    for select using (bucket_id = 'post-images');
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "로그인한 사용자만 글 이미지 업로드 가능" on storage.objects
    for insert with check (
      bucket_id = 'post-images' and auth.role() = 'authenticated'
    );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------
-- 5. 점검용: posts 테이블에 image_url 컬럼이 실제로 있는지 확인
-- ---------------------------------------------------------
-- 아래 쿼리를 따로 실행해서 image_url 행이 보이면 정상 적용된 것입니다.
-- select column_name from information_schema.columns
-- where table_schema = 'public' and table_name = 'posts';
