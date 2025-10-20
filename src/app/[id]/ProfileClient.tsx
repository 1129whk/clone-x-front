"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { usePosts } from "@/store/usePosts";
import { currentUser } from "@/data/currentUser";
import Post from "@/components/posts/Post";
import Spinner from "@/components/ui/Spinner";
import Center from "@/components/ui/Center";

type TabKey = "posts" | "likes";

const tabs: { key: TabKey; label: string; enabled: boolean }[] = [
  { key: "posts", label: "Posts", enabled: true },
  { key: "likes", label: "Likes", enabled: true },
];

const MIN_SHOW_MS = 220; // 스피너 최소 노출 시간

export default function ProfileClient({ id }: { id: string }) {
  if (id !== currentUser.id) {
    notFound();
  }

  const { posts, toggleLike, toggleRetweet } = usePosts();
  const [active, setActive] = useState<TabKey>("posts");
  const [showSpinner, setShowSpinner] = useState(true); // 초기엔 항상 스피너 ON
  const hideTimerRef = useRef<number | null>(null);

  // 공통: 스피너 끄기(최소 노출시간 보장)
  const scheduleHideSpinner = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setShowSpinner(false);
      hideTimerRef.current = null;
    }, MIN_SHOW_MS);
  };

  // 첫 진입/새로고침: 마운트 후 데이터가 있든 없든 최소 시간은 스피너 유지
  useEffect(() => {
    scheduleHideSpinner();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 스토어가(하이드레이션 등으로) 채워지면 스피너 내려주기
  useEffect(() => {
    if (posts.length > 0) {
      scheduleHideSpinner();
    }
  }, [posts.length]);

  // 탭 전환 시에도 짧게 스피너 노출(체감용)
  const onChangeTab = (key: TabKey) => {
    if (key === active) return;
    setActive(key);
    setShowSpinner(true);
    scheduleHideSpinner();
  };

  const filtered = useMemo(() => {
    const base =
      active === "posts"
        ? posts.filter(
            (p) => p.author.id === currentUser.id || p.isRetweeted === true
          )
        : posts.filter((p) => p.isLiked === true);

    return base.sort((a, b) => {
      const t =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return t !== 0 ? t : b.postId - a.postId;
    });
  }, [active, posts]);

  // 비어있음을 보여줄 조건: 스피너가 꺼져 있고, 스토어가 하이드레이션되어 있고, 필터 결과가 진짜로 0개일 때
  const showEmpty = !showSpinner && posts.length > 0 && filtered.length === 0;

  return (
    <div>
      {/* 탭 바 */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="sticky top-[56px] z-10 bg-black/70 backdrop-blur-md"
      >
        <div className="flex items-stretch border-b border-borderGray">
          {tabs.map(({ key, label, enabled }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key}`}
                disabled={!enabled}
                onClick={() => enabled && onChangeTab(key)}
                className={[
                  "relative px-4 sm:px-6 py-3 text-[15px] font-medium",
                  enabled
                    ? "text-[#71767b] hover:text-white"
                    : "text-[#4b4f54] cursor-default",
                  isActive && "text-white",
                ].join(" ")}
              >
                {label}
                {/* 활성 인디케이터 */}
                <span
                  className={[
                    "absolute left-1/2 -translate-x-1/2 bottom-0 h-1 rounded-full transition-all",
                    isActive ? "w-10 bg-iconBlue" : "w-0 bg-transparent",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 패널 */}
      <div id={`panel-${active}`} role="tabpanel" aria-labelledby={active}>
        {showSpinner ? (
          <Center className="p-6">
            <Spinner size={32} thickness={4} />
          </Center>
        ) : showEmpty ? (
          <div className="p-6 text-textGray">
            {active === "likes"
              ? "아직 좋아요한 게시물이 없습니다."
              : "표시할 게시물이 없습니다."}
          </div>
        ) : (
          filtered.map((p, idx) => (
            <Post
              key={p.postId}
              post={p}
              onLike={() => toggleLike(p.postId)}
              onRetweet={() => toggleRetweet(p.postId)}
              imagePriority={idx < 2}
            />
          ))
        )}
      </div>
    </div>
  );
}
