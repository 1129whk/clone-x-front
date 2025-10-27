"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Post from "./Post";
import {
  fetchPosts,
  toggleLike,
  toggleRetweet,
  TOTAL_POSTS,
  toggleBookmark,
} from "@/lib/mockApi";
import { usePosts } from "@/store/usePosts";
import Spinner from "@/components/ui/Spinner";
import Center from "@/components/ui/Center";
import { claimScope, releaseScope, saveScopedPosts } from "@/lib/scopedStorage";

// 1번에 15개 게시물을 표시
const LIMIT = 15;
const TICK_MS = 15000; // 15초마다 상대시간 갱신

const Feed = () => {
  const {
    posts,
    addPosts,
    toggleLike: likeInStore,
    toggleRetweet: rtInStore,
    toggleBookmark: bmInStore,
  } = usePosts();

  // 이미 스토어에 남아 있는 개수에 따라 다음 페이지를 계산
  const [page, setPage] = useState(() => Math.floor(posts.length / LIMIT) + 1);
  const [hasMore, setHasMore] = useState(posts.length < TOTAL_POSTS);

  // 무한스크롤 로딩용
  const [loading, setLoading] = useState(false);

  // 첫 진입/새로고침 전용 로딩 플래그
  const [initialLoading, setInitialLoading] = useState(posts.length === 0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 상대시간 자동 갱신용 틱
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      forceTick((v) => v + 1);
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  // scope 점유/반납 (피드 전용)
  useEffect(() => {
    claimScope("feed");
    return () => releaseScope("feed");
  }, []);

  // 현재 화면 posts를 scope 저장(스크롤로 늘어날 때마다 자동 덮어쓰기)
  useEffect(() => {
    saveScopedPosts("feed", posts);
  }, [posts]);

  // ref 락(스테일 클로저 방지)
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loading || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    const { items, total } = await fetchPosts(page, LIMIT);
    addPosts(items);

    const endIndex = page * LIMIT;
    const more = endIndex < total && items.length === LIMIT;
    setHasMore(more);
    hasMoreRef.current = more;

    setPage((p) => p + 1);
    setLoading(false);
    isFetchingRef.current = false;
  }, [loading, page, addPosts]);

  // 첫 진입: 스토어가 비어있으면 첫 페이지 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      if (posts.length === 0) {
        setInitialLoading(true);
        await loadMore();
        if (alive) setInitialLoading(false);
      } else {
        setPage(Math.floor(posts.length / LIMIT) + 1);
        setHasMore(posts.length < TOTAL_POSTS);
        setInitialLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadMore, posts.length]);

  // posts 길이가 바뀔 때마다 page/hasMore 동기화 (하이드레이션/추가 로드/새 글 작성 모두 대응)
  useEffect(() => {
    const nextPage = Math.floor(posts.length / LIMIT) + 1;
    setPage(nextPage);

    const more = posts.length < TOTAL_POSTS; // mock 총량 기준
    setHasMore(more);
    hasMoreRef.current = more;

    // 초기 스피너도 보정: 하이드레이션으로 posts가 채워지면 스피너 끔
    if (posts.length > 0) setInitialLoading(false);
  }, [posts.length]);

  // 무한스크롤
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!hasMoreRef.current || isFetchingRef.current) return;
        loadMore();
      },
      { rootMargin: "400px 0px 0px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [posts.length, hasMore, loadMore]);

  // 좋아요 업데이트 <낙관적 업데이트 (즉시 UI 반영 후 서버 동기화)>
  const onLike = async (id: number) => {
    likeInStore(id);

    // 저장하는 부분
    const res = await toggleLike(id);
    if (!res.success) likeInStore(id); //롤백
  };

  // 리트윗 업데이트
  const onRetweet = async (id: number) => {
    rtInStore(id);

    const res = await toggleRetweet(id);
    if (!res.success) rtInStore(id); //롤백
  };

  // 북마크
  const onBookmark = async (id: number) => {
    bmInStore(id); // 낙관적 업데이트
    const res = await toggleBookmark(id);
    if (!res.success) bmInStore(id); // 실패 시 롤백
  };

  // 초기 스피너
  if (initialLoading && posts.length === 0) {
    return (
      <Center className="p-6">
        <Spinner size={32} thickness={4} />
      </Center>
    );
  }

  return (
    <div>
      {posts.map((p, idx) => {
        const key = p.postId;
        const isInitialAboveTheFold = page === 2 && idx < 2;
        return (
          <Post
            key={key}
            post={p}
            onLike={onLike}
            onRetweet={onRetweet}
            onBookmark={onBookmark}
            imagePriority={isInitialAboveTheFold}
          />
        );
      })}

      {/* 더 로드할 게 있을 때만 센티넬/스피너 */}
      {hasMore && <div ref={sentinelRef} className="h-8" />}

      {loading && hasMore && (
        <Center className="p-6">
          <Spinner size={32} thickness={4} />
        </Center>
      )}

      {/* 전부 로드되면 안내 문구 */}
      {!hasMore && posts.length > 0 && (
        <div className="p-4 text-iconBlue text-center">
          모든 게시물을 불러왔습니다.
        </div>
      )}
    </div>
  );
};

export default Feed;
