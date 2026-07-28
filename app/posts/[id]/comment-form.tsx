"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { addComment, CommentFormState } from "./comment-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-background/40 border-t-background" />
          등록 중...
        </span>
      ) : (
        "댓글 등록"
      )}
    </button>
  );
}

export function CommentForm({
  postId,
  isLoggedIn,
}: {
  postId: string;
  isLoggedIn: boolean;
}) {
  const boundAddComment = addComment.bind(null, postId);
  const [state, formAction] = useActionState<CommentFormState, FormData>(
    boundAddComment,
    { error: null, success: false },
  );
  // 등록 성공 시 textarea를 리마운트시켜 입력값을 비운다
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setResetKey((k) => k + 1);
    }
  }, [state.success]);

  if (!isLoggedIn) {
    return (
      <p className="rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
        댓글을 작성하려면 로그인이 필요합니다.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <textarea
          key={resetKey}
          name="content"
          maxLength={500}
          rows={3}
          placeholder="댓글을 입력하세요"
          className="w-full resize-none rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
        />
        <SubmitButton />
      </div>
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
