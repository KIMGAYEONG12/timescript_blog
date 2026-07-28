"use client";

import { useTransition } from "react";
import { deleteComment } from "./comment-actions";

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("댓글을 삭제할까요?")) return;
        startTransition(() => {
          deleteComment(commentId, postId);
        });
      }}
      className="text-xs text-black/40 hover:text-red-500 disabled:opacity-50 dark:text-white/40"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
