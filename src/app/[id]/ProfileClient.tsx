"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { usePosts } from "@/store/usePosts";
import { currentUser } from "@/data/currentUser";
import Post from "@/components/posts/Post";
import Spinner from "@/components/ui/Spinner";
import Center from "@/components/ui/Center";
import NextImage from "next/image";

type TabKey = "posts" | "likes";

const MIN_SHOW_MS = 220;

export default function ProfileClient({ id }: { id: string }) {
  const isMe = id === currentUser.id;

  const { posts, toggleLike, toggleRetweet } = usePosts();

  // id로 대상 사용자(author) 추출
  const viewedAuthor = useMemo(() => {
    if (isMe) {
      // currentUser를 author 스키마와 맞춰 반환
      return {
        id: currentUser.id,
        name: currentUser.username,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        verified: true,
        coverImage: currentUser.coverImage,
      };
    }
    // 포스트들에서 해당 author.id를 가진 첫 글의 author를 사용
    const found = posts.find((p) => p.author.id === id)?.author;
    return found
      ? {
          ...found,
          // coverImage가 없다면 안전한 기본값
          coverImage:
            (found as any).coverImage ??
            `https://picsum.photos/1200/400?blur=2&random=${encodeURIComponent(
              found.id
            )}`,
        }
      : null;
  }, [id, isMe, posts]);

  useEffect(() => {
    // 하이드레이션 전엔 posts가 비어있을 수 있으므로, 살짝 기다렸다가 판단
    // posts가 한 번이라도 채워졌는데 viewedAuthor가 없으면 notFound
    if (posts.length > 0 && !viewedAuthor) {
      notFound();
    }
  }, [posts.length, viewedAuthor]);

  // 탭 구성: 나면 posts/likes, 남이면 posts만
  const tabs: { key: TabKey; label: string; enabled: boolean }[] = isMe
    ? [
        { key: "posts", label: "Posts", enabled: true },
        { key: "likes", label: "Likes", enabled: true },
      ]
    : [{ key: "posts", label: "Posts", enabled: true }];

  const [active, setActive] = useState<TabKey>("posts");
  const [showSpinner, setShowSpinner] = useState(true); // 초기엔 항상 스피너 ON
  const hideTimerRef = useRef<number | null>(null);

  // 스피너 끄기(최소 노출시간 보장)
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

  // currentUser냐 아니냐에 따라 필터 분기
  const filtered = useMemo(() => {
    if (!viewedAuthor) return [];

    if (active === "posts") {
      // 내 프로필이면: 내가 쓴 글 + 내가 리포스트한 글
      // 남의 프로필이면: 해당 사용자가 직접 쓴 글만
      const base = isMe
        ? posts.filter((p) => p.author.id === id || p.isRetweeted === true)
        : posts.filter((p) => p.author.id === id);

      return base.sort((a, b) => {
        const t =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return t !== 0 ? t : b.postId - a.postId;
      });
    }

    // Likes 탭: 현재 구조상 isLiked는 currentUser 기준
    if (!isMe) return [];
    return posts
      .filter((p) => p.isLiked === true)
      .sort((a, b) => {
        const t =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return t !== 0 ? t : b.postId - a.postId;
      });
  }, [active, isMe, posts, viewedAuthor, id]);

  const showEmpty =
    !showSpinner && posts.length > 0 && viewedAuthor && filtered.length === 0;

  return (
    <div>
      {/* 프로필 헤더(커버/아바타/버튼) */}
      {viewedAuthor && (
        <div className="mb-2">
          {/* Cover & Avatar */}
          <div className="relative w-full">
            {/* Cover */}
            <div className="w-full aspect-[3/1] relative overflow-hidden">
              <NextImage
                src={viewedAuthor.coverImage}
                alt={`${viewedAuthor.username} cover`}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
            {/* Avatar */}
            <div className="w-1/5 aspect-square rounded-full overflow-hidden border-4 border-black bg-gray-300 absolute left-4 -translate-y-1/2">
              <NextImage
                src={viewedAuthor.profileImage}
                alt={`${viewedAuthor.username} profile`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Actions */}
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

          {/* User Details */}
          <div className="p-4 flex flex-col gap-2">
            <div>
              <h1 className="text-2xl font-bold">{viewedAuthor.username}</h1>
              <span className="text-textGray text-sm">@{viewedAuthor.id}</span>
            </div>
            <p>Hello!</p>
            <div className="flex gap-4 text-textGray text-[15px]">
              <div className="flex items-center gap-2">
                <NextImage
                  src="icons/userLocation.svg"
                  alt="location"
                  width={20}
                  height={20}
                />
                <span>Korea</span>
              </div>
              <div className="flex items-center gap-2">
                <NextImage
                  src="icons/date.svg"
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
      )}

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
