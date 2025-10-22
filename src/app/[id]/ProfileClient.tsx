"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";

import { usePosts } from "@/store/usePosts";
import { currentUser } from "@/data/currentUser";
import {
  fetchPosts,
  TOTAL_POSTS,
  toggleLike as apiLike,
  toggleRetweet as apiRT,
  toggleBookmark as apiBM,
} from "@/lib/mockApi";

import Post from "@/components/posts/Post";
import Spinner from "@/components/ui/Spinner";
import Center from "@/components/ui/Center";
import { claimScope, releaseScope, saveScopedPosts } from "@/lib/scopedStorage";
import type { Post as PostType } from "@/types";
import BlurImage from "@/components/common/BlurImage";

type TabKey = "posts" | "likes";

const LIMIT = 15;
const ROOT_MARGIN = "0px 0px 0px 0px";
const TICK_MS = 15000;

const hashToNum = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export default function ProfileClient({
  id,
  initialTab = "posts",
}: {
  id: string;
  initialTab?: TabKey;
}) {
  const isMe = id === currentUser.id;

  // 전역 스토어
  const {
    posts,
    addPosts,
    toggleLike: likeInStore,
    toggleRetweet: rtInStore,
    toggleBookmark: bmInStore,
    hydrated,
  } = usePosts();

  // 전역 페이징 로더
  const [page, setPage] = useState<number>(
    () => Math.floor(posts.length / LIMIT) + 1
  );
  const [hasMoreGlobal, setHasMoreGlobal] = useState<boolean>(
    posts.length < TOTAL_POSTS
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(
    posts.length === 0
  );
  const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMoreGlobal);
  useEffect(() => {
    hasMoreRef.current = hasMoreGlobal;
  }, [hasMoreGlobal]);

  const loadMoreGlobal = useCallback(async () => {
    if (isFetchingRef.current || loadingGlobal || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setLoadingGlobal(true);

    const { items, total } = await fetchPosts(page, LIMIT);
    addPosts(items);

    const endIndex = page * LIMIT;
    const more = endIndex < total && items.length === LIMIT;
    setHasMoreGlobal(more);
    hasMoreRef.current = more;

    setPage((p) => p + 1);
    setLoadingGlobal(false);
    isFetchingRef.current = false;
  }, [loadingGlobal, page, addPosts]);

  // 첫 진입
  useEffect(() => {
    let alive = true;
    (async () => {
      if (posts.length === 0) {
        setInitialLoading(true);
        await loadMoreGlobal();
        if (alive) setInitialLoading(false);
      } else {
        setPage(Math.floor(posts.length / LIMIT) + 1);
        setHasMoreGlobal(posts.length < TOTAL_POSTS);
        setInitialLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadMoreGlobal, posts.length]);

  // posts 바뀔 때 페이지/hasMore 동기화
  useEffect(() => {
    const nextPage = Math.floor(posts.length / LIMIT) + 1;
    setPage(nextPage);

    const more = posts.length < TOTAL_POSTS;
    setHasMoreGlobal(more);
    hasMoreRef.current = more;

    if (posts.length > 0) setInitialLoading(false);
  }, [posts.length]);

  // 상대시간 자동 갱신
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((v) => v + 1), TICK_MS);
    return () => clearInterval(t);
  }, []);

  // Likes 경로 접근 제약
  useEffect(() => {
    if (initialTab === "likes" && !isMe) {
      notFound();
    }
  }, [initialTab, isMe]);

  // 정렬
  const sortDesc = useCallback((a: PostType, b: PostType) => {
    const t = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return t !== 0 ? t : b.postId - a.postId;
  }, []);

  // 대상 사용자(author)
  const viewedAuthor = useMemo(() => {
    if (isMe) {
      return {
        id: currentUser.id,
        name: currentUser.username,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        verified: true,
        coverImage: currentUser.coverImage,
      };
    }

    const seed = 100 + (hashToNum(id) % 900);
    const fallback = {
      id,
      name: id,
      username: id,
      profileImage: `https://picsum.photos/80/80?random=${seed}`,
      verified: false,
      coverImage: `https://picsum.photos/1200/400?random=${seed}`,
    };

    const found = posts.find((p) => p.author.id === id)?.author;
    if (found) {
      return {
        id: found.id,
        name: found.name ?? found.username ?? found.id,
        username: found.username ?? found.id,
        profileImage: found.profileImage ?? fallback.profileImage,
        verified: !!found.verified,
        coverImage: (found as any).coverImage ?? fallback.coverImage,
      };
    }
    return fallback;
  }, [id, isMe, posts]);

  // 하이드레이션 이후에야 404 판정
  useEffect(() => {
    if (!initialLoading && posts.length > 0 && !viewedAuthor) notFound();
  }, [initialLoading, posts.length, viewedAuthor]);

  // 활성 탭
  const active: TabKey = initialTab;

  // 탭별 소스
  const source: PostType[] = useMemo(() => {
    if (!viewedAuthor) return [];
    if (active === "posts") {
      const base = isMe
        ? posts.filter(
            (p: PostType) => p.author.id === id || p.isRetweeted === true
          )
        : posts.filter((p: PostType) => p.author.id === id);
      return base.sort(sortDesc);
    }
    if (!isMe) return [];
    return posts.filter((p: PostType) => p.isLiked === true).sort(sortDesc);
  }, [active, isMe, posts, viewedAuthor, id, sortDesc]);

  // 로컬 페이지 창
  const [visibleCount, setVisibleCount] = useState<number>(LIMIT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 사용자 스크롤 감지
  const userHasScrolledRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      userHasScrolledRef.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 탭/유저 변경 시 초기화
  useEffect(() => {
    setVisibleCount(LIMIT);
    window.scrollTo({ top: 0, behavior: "auto" });
    userHasScrolledRef.current = false;
  }, [id, active]);

  // source 줄면 보이는 개수 줄이기
  useEffect(() => {
    setVisibleCount((c) => Math.min(c, source.length));
  }, [source.length]);

  const hasMoreLocal = visibleCount < source.length;
  const pageItems = source.slice(0, visibleCount);

  // scope 관리
  const scopeId = `profile:${id}:${active}`;
  const prevScopeRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevScopeRef.current && prevScopeRef.current !== scopeId) {
      releaseScope(prevScopeRef.current);
    }
    claimScope(scopeId);
    prevScopeRef.current = scopeId;
    return () => {
      releaseScope(scopeId);
    };
  }, [scopeId]);

  // 현재 탭 스냅샷 저장
  useEffect(() => {
    saveScopedPosts(scopeId, pageItems);
  }, [scopeId, pageItems]);

  // 인피니트 센티넬
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const onHit: IntersectionObserverCallback = async (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (!userHasScrolledRef.current) return;
      if (hasMoreLocal) {
        setVisibleCount((c) => Math.min(c + LIMIT, source.length));
      }
      if (!hasMoreLocal && hasMoreRef.current) {
        await loadMoreGlobal();
      }
    };
    const io = new IntersectionObserver(onHit, {
      root: null,
      rootMargin: ROOT_MARGIN,
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMoreLocal, source.length, loadMoreGlobal]);

  // 좋아요(낙관적)
  const onLike = useCallback(
    async (postId: number) => {
      likeInStore(postId);
      const res = await apiLike(postId);
      if (!res.success) likeInStore(postId);
    },
    [likeInStore]
  );

  // 리트윗(낙관적)
  const onRetweet = useCallback(
    async (postId: number) => {
      rtInStore(postId);
      const res = await apiRT(postId);
      if (!res.success) rtInStore(postId);
    },
    [rtInStore]
  );

  // 북마크(낙관적)
  const onBookmark = useCallback(
    async (postId: number) => {
      bmInStore(postId);
      const res = await apiBM(postId);
      if (!res.success) bmInStore(postId);
    },
    [bmInStore]
  );

  // 렌더링 분기
  if (!hydrated) {
    return (
      <Center className="p-6">
        <Spinner size={32} thickness={4} />
      </Center>
    );
  }

  // 탭 링크
  const tabs = isMe
    ? ([
        { key: "posts", label: "Posts", href: `/${id}` },
        { key: "likes", label: "Likes", href: `/${id}/likes` },
      ] as const)
    : ([{ key: "posts", label: "Posts", href: `/${id}` }] as const);

  // 헤더
  const Header = viewedAuthor ? (
    <div className="mb-2">
      <div className="relative w-full">
        <div className="w-full aspect-[3/1] relative overflow-hidden">
          <BlurImage
            src={viewedAuthor.coverImage}
            alt={`${viewedAuthor.username} cover`}
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            placeholderSize={{ w: 1200, h: 400 }}
            className="object-cover"
            imgClassName="object-cover"
          />
        </div>
        <div className="w-1/5 aspect-square rounded-full overflow-hidden border-4 border-black bg-gray-300 absolute left-4 -translate-y-1/2">
          <BlurImage
            src={viewedAuthor.profileImage}
            alt={`${viewedAuthor.username} profile`}
            width={100}
            height={100}
            loading="lazy"
            decoding="async"
            placeholderSize={{ w: 100, h: 100 }}
            imgClassName="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-2 p-2">
        {isMe ? (
          <button className="py-2 px-4 mt-2 bg-white text-black font-bold rounded-full">
            Edit Profile
          </button>
        ) : (
          <button className="py-2 px-4 mt-2 bg-white text-black font-bold rounded-full">
            Follow
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold">{viewedAuthor.username}</h1>
          <span className="text-textGray text-sm">@{viewedAuthor.id}</span>
        </div>
        <p>Hello!</p>
        <div className="flex gap-4 text-textGray text-[15px]">
          <div className="flex items-center gap-2">
            <NextImage
              src="/icons/userLocation.svg"
              alt="location"
              width={20}
              height={20}
            />
            <span>Korea</span>
          </div>
          <div className="flex items-center gap-2">
            <NextImage
              src="/icons/date.svg"
              alt="date"
              width={20}
              height={20}
            />
            <span>Joined October 2025</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">100</span>
            <span className="text-textGray text-[15px]">Followers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">100</span>
            <span className="text-textGray text-[15px]">Followings</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {Header}

      {/* 탭 바 */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="sticky top-[56px] z-10 bg-black/70 backdrop-blur-md"
      >
        <div className="flex items-stretch border-b border-borderGray">
          {tabs.map(({ key, label, href }) => {
            const isActive = initialTab === key;
            return (
              <Link
                key={key}
                href={href}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key}`}
                className={[
                  "relative px-4 sm:px-6 py-3 text-[15px] font-medium",
                  "text-[#71767b] hover:text-white",
                  isActive && "text-white",
                ].join(" ")}
              >
                {label}
                <span
                  className={[
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 h-1 rounded-full transition-all",
                    isActive ? "w-10 bg-iconBlue" : "w-0 bg-transparent",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 패널 */}
      <div id={`panel-${active}`} role="tabpanel" aria-labelledby={active}>
        {!initialLoading && !loadingGlobal && pageItems.length === 0 ? (
          <div className="p-6 text-textGray">
            {active === "likes"
              ? "아직 좋아요한 게시물이 없습니다."
              : "표시할 게시물이 없습니다."}
          </div>
        ) : (
          <>
            {pageItems.map((p, idx) => (
              <Post
                key={p.postId}
                post={p}
                onLike={() => onLike(p.postId)}
                onRetweet={() => onRetweet(p.postId)}
                onBookmark={() => onBookmark(p.postId)}
                imagePriority={idx < 2}
              />
            ))}

            {visibleCount < source.length || hasMoreGlobal ? (
              <>
                <div ref={sentinelRef} className="h-8" />
                {loadingGlobal && (
                  <Center className="p-6">
                    <Spinner size={32} thickness={4} />
                  </Center>
                )}
              </>
            ) : (
              pageItems.length > 0 && (
                <div className="p-4 text-iconBlue text-center">
                  모든 게시물을 불러왔습니다.
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
