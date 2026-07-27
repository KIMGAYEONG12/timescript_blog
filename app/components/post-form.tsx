"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PostFormState } from "../actions";

const FIELD_CLASS =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50";

const CATEGORIES = ["삽질기록", "오늘배운것", "프로젝트"];

type PostFormAction = (
  prevState: PostFormState,
  formData: FormData,
) => Promise<PostFormState>;

export function PostForm({
  defaultValues,
  submitLabel,
  cancelHref,
  action,
}: {
  defaultValues?: {
    title: string;
    content: string;
    summary?: string;
    category?: string;
  };
  submitLabel: string;
  cancelHref: string;
  action: PostFormAction;
}) {
  const [state, formAction] = useActionState(action, {
    errors: {},
    message: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message && <p className="text-sm text-red-500">{state.message}</p>}

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category ?? CATEGORIES[0]}
          className={FIELD_CLASS}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={state.values?.title ?? defaultValues?.title ?? ""}
          maxLength={100}
          placeholder="글 제목을 입력하세요"
          className={FIELD_CLASS}
        />
        {state.errors?.title && (
          <p className="text-xs text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="summary" className="text-sm font-medium">
          한 줄 요약
        </label>
        <input
          id="summary"
          type="text"
          name="summary"
          defaultValue={defaultValues?.summary ?? ""}
          maxLength={200}
          placeholder="목록에 보일 짧은 요약"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={state.values?.content ?? defaultValues?.content ?? ""}
          maxLength={5000}
          rows={12}
          placeholder="내용을 입력하세요"
          className={FIELD_CLASS}
        />
        {state.errors?.content && (
          <p className="text-xs text-red-500">{state.errors.content[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
