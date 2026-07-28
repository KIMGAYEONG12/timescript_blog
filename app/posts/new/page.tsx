import { PostForm } from "../post-form";
import { createPost } from "../actions";

export const metadata = {
  title: "새 글 쓰기",
};

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">새 글 쓰기</h1>
      <PostForm submitLabel="등록하기" cancelHref="/posts" action={createPost} />
    </div>
  );
}
