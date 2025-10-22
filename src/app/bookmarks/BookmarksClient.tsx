"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Center from "@/components/ui/Center";
import Spinner from "@/components/ui/Spinner";
import Post from "@/components/posts/Post";
import {
  fetchPosts,
  TOTAL_POSTS,
  toggleBookmark as apiBM,
  toggleLike as apiLike,
  toggleRetweet as apiRT,
} from "@/lib/mockApi";
import { usePosts } from "@/store/usePosts";
import type { Post as PostType } from "@/types";

const LIMIT = 15;
const ROOT_MARGIN = "400px 0px 0px 0px";

function sortDesc(a: PostType, b: PostType) {
  const t = +new Date(b.createdAt) - +new Date(a.createdAt);
  return t !== 0 ? t : b.postId - a.postId;
}

export default function BookmarksClient() {
  const mutations = usePosts((s) => s.mutations);
  const toggleBookmark = usePosts((s) => s.toggleBookmark);
  const toggleLike = usePosts((s) => s.toggleLike);
  const toggleRetweet = usePosts((s) => s.toggleRetweet);

  const storePosts = usePosts((s) => s.posts);

  const [buffer, setBuffer] = useState<PostType[]>([]);
  const [visibleCount, setVisibleCount] = useState(LIMIT);
  const [loadingPage, setLoadingPage] = useState(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(Math.ceil(TOTAL_POSTS / LIMIT));

  // 버퍼에 페이지 추가
  const loadNext = useCallback(async () => {
    if (loadingPage || pageRef.current > totalPagesRef.current) return false;
    setLoadingPage(true);
    const { items, total } = await fetchPosts(pageRef.current, LIMIT);
    pageRef.current += 1;
    totalPagesRef.current = Math.ceil(total / LIMIT);

    setBuffer((prev) => {
      const map = new Map<number, PostType>();
      for (const p of prev) map.set(p.postId, p);
      for (const it of items) map.set(it.postId, it);
      return Array.from(map.values()).sort(sortDesc);
    });

    setLoadingPage(false);
    return true;
  }, [loadingPage]);

  // 최소 15개를 채울 때까지 자동으로 로드
  const patched = useMemo(() => {
    // 합치기(중복 제거: postId 기준)
    const mergedMap = new Map<number, PostType>();
    for (const p of buffer) mergedMap.set(p.postId, p);
    for (const p of storePosts) mergedMap.set(p.postId, p); //스토어 주입

    const merged = Array.from(mergedMap.values());

    // mutations 패치
    const withMu = merged.map((p) => {
      const mu = mutations[p.postId] as any;
      return mu
        ? {
            ...p,
            ...("isBookmarked" in mu ? { isBookmarked: mu.isBookmarked } : {}),
            ...("isLiked" in mu ? { isLiked: mu.isLiked } : {}),
            ...("likes" in mu ? { likes: mu.likes } : {}),
            ...("isRetweeted" in mu ? { isRetweeted: mu.isRetweeted } : {}),
            ...("retweets" in mu ? { retweets: mu.retweets } : {}),
          }
        : p;
    });

    // 북마크만 필터 + 정렬
    return withMu.filter((p) => p.isBookmarked).sort(sortDesc);
  }, [buffer, storePosts, mutations]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      while (
        !cancelled &&
        patched.length < LIMIT &&
        pageRef.current <= totalPagesRef.current
      ) {
        const ok = await loadNext();
        if (!ok) break;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patched.length, loadNext]);

  // 무한스크롤
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const onHit: IntersectionObserverCallback = async (entries) => {
      if (!entries[0]?.isIntersecting) return;

      // 화면 먼저 늘리기
      if (visibleCount < patched.length) {
        setVisibleCount((c) => Math.min(c + LIMIT, patched.length));
        return;
      }
      // 더 없으면 다음 mock 페이지
      if (pageRef.current <= totalPagesRef.current) {
        const added = await loadNext();
        if (added)
          setVisibleCount((c) => Math.min(c + LIMIT, patched.length + LIMIT));
      }
    };

    const io = new IntersectionObserver(onHit, {
      root: null,
      rootMargin: ROOT_MARGIN,
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [visibleCount, patched.length, loadNext]);

  // 액션(낙관)
  const onBookmark = async (id: number) => {
    toggleBookmark(id);
    const res = await apiBM(id);
    if (!res.success) toggleBookmark(id); // 롤백
  };
  const onLike = async (id: number) => {
    toggleLike(id);
    const res = await apiLike(id);
    if (!res.success) toggleLike(id);
  };
  const onRetweet = async (id: number) => {
    toggleRetweet(id);
    const res = await apiRT(id);
    if (!res.success) toggleRetweet(id);
  };

  // 초기/표시
  if (buffer.length === 0 && loadingPage === false && pageRef.current === 1) {
    // 첫 페이지를 아직 안 가져왔으면 가져오기
    loadNext();
  }

  if (buffer.length === 0) {
    return (
      <Center className="p-6">
        <Spinner size={32} thickness={4} />
      </Center>
    );
  }

  const items = patched.slice(0, visibleCount);

  return (
    <div>
      {items.length === 0 ? (
        <div className="p-6 text-textGray">북마크된 게시물이 없습니다.</div>
      ) : (
        <>
          {items.map((p, idx) => (
            <Post
              key={p.postId}
              post={p}
              onLike={() => onLike(p.postId)}
              onRetweet={() => onRetweet(p.postId)}
              onBookmark={() => onBookmark(p.postId)}
              imagePriority={idx < 2}
            />
          ))}

          {/* 센티넬 / 끝 */}
          {visibleCount < patched.length ||
          pageRef.current <= totalPagesRef.current ? (
            <div ref={sentinelRef} className="h-8" />
          ) : (
            <div className="p-4 text-iconBlue text-center">
              모든 게시물을 불러왔습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
}
