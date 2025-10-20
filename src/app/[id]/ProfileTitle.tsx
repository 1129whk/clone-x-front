"use client";

import { useMemo } from "react";
import { usePosts } from "@/store/usePosts";
import { currentUser } from "@/data/currentUser";

export default function ProfileTitle({ id }: { id: string }) {
  const { posts } = usePosts();

  // id가 currentUser이면 currentUser, 아니면 posts에서 해당 author 탐색
  const username = useMemo(() => {
    if (id === currentUser.id) return currentUser.username;

    const author = posts.find((p) => p.author.id === id)?.author;
    // author가 아직 없을 수 있으니 안전한 폴백 제공
    return author?.username ?? id; // 데이터 준비 전에는 id를 임시 표시(서버/클라 일치)
  }, [id, posts]);

  return <>{username}</>;
}
