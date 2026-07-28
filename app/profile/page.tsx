import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "프로필 설정",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">프로필 설정</h1>
      <ProfileForm
        defaultValues={{
          nickname: profile?.nickname ?? user.email?.split("@")[0] ?? "",
          bio: profile?.bio ?? "",
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}
