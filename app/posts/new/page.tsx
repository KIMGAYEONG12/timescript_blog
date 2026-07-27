import { PostForm } from "@/app/posts/_components/post-form";
import { createPost } from "@/app/posts/actions";

export const metadata = {
  title: "새 글 쓰기",
};

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">새 글 쓰기</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          오늘 배운 것, 삽질한 기록을 남겨보세요.
        </p>
      </div>

      <PostForm action={createPost} submitLabel="등록" cancelHref="/posts" />
    </div>
  );
}
