"use client";

import { useActionState } from "react";
import {
  createComment,
  deleteComment,
  CommentFormState,
} from "../comments-actions";

const FIELD_CLASS =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 disabled:opacity-50 dark:border-white/20 dark:focus:border-white/50";

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
};

export function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  const boundCreateComment = createComment.bind(null, postId);
  const [state, formAction] = useActionState<CommentFormState, FormData>(
    boundCreateComment,
    { error: null },
  );

  return (
    <div className="flex flex-col gap-4 border-t border-black/10 pt-6 dark:border-white/15">
      <h2 className="text-sm font-semibold">댓글 {comments.length}개</h2>

      <div className="flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-md border border-black/10 p-3 dark:border-white/15"
          >
            <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
              <span>
                {new Date(comment.created_at).toLocaleDateString("ko-KR")}
              </span>
              {currentUserId === comment.user_id && (
                <form action={deleteComment.bind(null, comment.id, postId)}>
                  <button
                    type="submit"
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-2">
        {state.error && <p className="text-xs text-red-500">{state.error}</p>}
        <textarea
          name="content"
          rows={3}
          maxLength={1000}
          placeholder={
            currentUserId
              ? "댓글을 입력하세요"
              : "로그인 후 댓글을 작성할 수 있습니다"
          }
          disabled={!currentUserId}
          className={FIELD_CLASS}
        />
        <button
          type="submit"
          disabled={!currentUserId}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          댓글 등록
        </button>
      </form>
    </div>
  );
}
