"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | null;

export default function HeartLike({
  likes,
  isLiked,
  onLike,
  animMs = 220,
}: {
  likes: number;
  isLiked: boolean;
  onLike: () => void;
  /** 숫자 슬라이드 애니메이션 시간(ms) */
  animMs?: number;
}) {
  // 하트 팡 효과
  const [pop, setPop] = useState(false);

  // 숫자 애니메이션 상태
  const [displayLikes, setDisplayLikes] = useState(likes);
  const [nextLikes, setNextLikes] = useState(likes);
  const [anim, setAnim] = useState<Direction>(null);
  const prevLikesRef = useRef(likes);
  const timerRef = useRef<number | null>(null);

  // 외부 likes 변경 감지 → 위/아래 방향으로 슬라이드
  useEffect(() => {
    const prev = prevLikesRef.current;
    if (likes === prev) return;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setNextLikes(likes);
    setAnim(likes > prev ? "up" : "down");

    timerRef.current = window.setTimeout(() => {
      setDisplayLikes(likes);
      setAnim(null);
      prevLikesRef.current = likes;
    }, animMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [likes, animMs]);

  // 더블 클릭에 의한 깜빡임 방지
  const LAST_CLICK_GAP = 120;
  const lastClickRef = useRef(0);
  const handleClick = () => {
    const now = performance.now();
    if (now - lastClickRef.current < LAST_CLICK_GAP) return;
    lastClickRef.current = now;

    if (!isLiked) {
      setPop(true);
      window.setTimeout(() => setPop(false), 250);
    }
    onLike();
  };

  return (
    <div
      role="button"
      aria-pressed={isLiked}
      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      className="relative flex items-center gap-2 cursor-pointer group"
      onClick={handleClick}
    >
      {/* 팡 효과 (원형) */}
      <span
        className={`pointer-events-none absolute -inset-2 rounded-full opacity-30 ${
          pop ? "animate-ping" : "hidden"
        } ${isLiked ? "bg-pink-500" : "bg-pink-400"}`}
      />

      {/* 하트 아이콘 */}
      <div
        className={`transition-transform duration-200 ${
          pop ? "scale-125" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className={`${
            isLiked ? "text-iconPink" : "text-textGray"
          } group-hover:text-iconPink`}
        >
          <path
            d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      {/* 좋아요 수 (위/아래 슬라이드) */}
      <div
        className={`relative h-5 overflow-hidden text-sm ${
          isLiked ? "text-iconPink" : "group-hover:text-iconPink"
        }`}
        style={{
          lineHeight: "1.25rem",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div
          className={`flex flex-col ${
            anim === "up"
              ? "likes-slide-up"
              : anim === "down"
              ? "likes-slide-down pre-neg"
              : ""
          }`}
          style={{ willChange: "transform" }}
        >
          <span className="h-5">{displayLikes}</span>
          <span className="h-5">{nextLikes}</span>
        </div>
      </div>

      {/* 내부 스타일: 숫자 슬라이드 키프레임 */}
      <style jsx>{`
        .likes-slide-up {
          animation: likes-slide-up ${animMs}ms ease forwards;
        }
        .likes-slide-down {
          animation: likes-slide-down ${animMs}ms ease forwards;
        }
        .pre-neg {
          transform: translateY(-100%);
        }
        @keyframes likes-slide-up {
          from {
            transform: translateY(0%);
          }
          to {
            transform: translateY(-100%);
          }
        }
        @keyframes likes-slide-down {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}
