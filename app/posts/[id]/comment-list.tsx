import { createClient } from "@/utils/supabase/server";
import { DeleteCommentButton } from "./delete-comment-button";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

type Profile = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function CommentList({ postId }: { postId: string }) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-red-500">
        댓글을 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  const list = (comments as Comment[]) ?? [];

  let profileMap = new Map<string, Profile>();
  if (list.length > 0) {
    const userIds = Array.from(new Set(list.map((c) => c.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url")
      .in("id", userIds);
    profileMap = new Map((profiles as Profile[] ?? []).map((p) => [p.id, p]));
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-black/50 dark:text-white/50">
        댓글 {list.length}개
      </h2>

      {list.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((comment) => {
            const profile = profileMap.get(comment.user_id);
            const displayName = profile?.nickname?.trim() || "익명";
            const initial = displayName.charAt(0).toUpperCase();
            const isOwn = currentUser?.id === comment.user_id;

            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-md border border-black/10 p-4 dark:border-white/15"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/10 text-xs font-medium dark:bg-white/15">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                      <span className="font-medium text-black/80 dark:text-white/80">
                        {displayName}
                      </span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    {isOwn && (
                      <DeleteCommentButton commentId={comment.id} postId={postId} />
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
