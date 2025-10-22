"use client";

import { Suspense, memo, useEffect, useRef } from "react";
import Link from "next/link";
import PopularTags from "./PopularTags";
import Recommendations from "./Recommendations";
import Search from "./Search";
import SearchSkeleton from "./SearchSkeleton";
import PopularTagsSkeleton from "./PopularTagsSkeleton";
import RecommendationsSkeleton from "./RecommendationsSkeleton";

const HEADER_H = 1; // 상단 고정 헤더 높이(px)
const SCROLLBAR_GUTTER = 16; // 대부분 브라우저의 스크롤바 너비(대략값)

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const RightBar = () => {
  const outerRef = useRef<HTMLDivElement | null>(null); // sticky 래퍼
  const railRef = useRef<HTMLDivElement | null>(null); // 내부 스크롤 컨테이너
  const rafRef = useRef<number | null>(null);

  // 증분 동기화를 위한 이전 window Y 저장
  const lastWinYRef = useRef<number>(0);
  // 초기 정렬(절대 위치 매핑)을 1회만 수행했는지
  const didInitRef = useRef(false);

  useEffect(() => {
    const outer = outerRef.current;
    const rail = railRef.current;
    if (!outer || !rail) return;

    const startY = () => {
      const rect = outer.getBoundingClientRect();
      return Math.max(0, Math.round(rect.top + window.scrollY - HEADER_H));
    };

    const absoluteAlign = () => {
      const sY = startY();
      const delta = window.scrollY - sY;
      const maxR = Math.max(0, rail.scrollHeight - rail.clientHeight);
      rail.scrollTop = clamp(delta, 0, maxR);
      lastWinYRef.current = window.scrollY;
      didInitRef.current = true;
    };

    const syncIncremental = () => {
      if (!didInitRef.current) {
        absoluteAlign();
        return;
      }

      const prev = lastWinYRef.current;
      const curr = window.scrollY;
      const dY = curr - prev; // +아래 / -위
      if (dY === 0) return;

      const maxR = Math.max(0, rail.scrollHeight - rail.clientHeight);
      rail.scrollTop = clamp(rail.scrollTop + dY, 0, maxR);
      lastWinYRef.current = curr;
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncIncremental);
    };

    const onResize = () => {
      didInitRef.current = false;
      absoluteAlign();
    };

    // 초기 정렬
    absoluteAlign();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // RightBar 영역 스크롤 입력은 항상 window로 위임(위/아래 동일)
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    // 마우스 휠 -> window로
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    };

    // 터치 -> window로
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dy = startY - e.touches[0].clientY;
      if (Math.abs(dy) < 0.5) return;
      e.preventDefault();
      window.scrollBy({ top: dy, behavior: "auto" });
      startY = e.touches[0].clientY;
    };

    // 키보드 -> window로
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const line = 40;
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "PageDown" ||
        key === "PageUp" ||
        key === " " ||
        key === "Home" ||
        key === "End"
      ) {
        e.preventDefault();
        let delta = 0;
        if (key === "ArrowDown") delta = line;
        else if (key === "ArrowUp") delta = -line;
        else if (key === "PageDown" || key === " ")
          delta = window.innerHeight * 0.85;
        else if (key === "PageUp") delta = -window.innerHeight * 0.85;
        else if (key === "Home") delta = -window.scrollY;
        else if (key === "End") delta = Number.MAX_SAFE_INTEGER;
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("touchstart", onTouchStart, { passive: true });
    rail.addEventListener("touchmove", onTouchMove, { passive: false });
    rail.addEventListener("keydown", onKeyDown);

    return () => {
      rail.removeEventListener("wheel", onWheel as any);
      rail.removeEventListener("touchstart", onTouchStart as any);
      rail.removeEventListener("touchmove", onTouchMove as any);
      rail.removeEventListener("keydown", onKeyDown as any);
    };
  }, []);

  return (
    <aside className="pt-1">
      {/* sticky 래퍼: 상단 헤더 만큼 여유 */}
      <div ref={outerRef} className="sticky" style={{ top: HEADER_H }}>
        {/* 내부 스크롤 컨테이너(별도 스크롤) */}
        <div
          ref={railRef}
          tabIndex={0}
          data-testid="rightbar-rail"
          className="rightbar-scroll overflow-y-auto overscroll-contain space-y-4 pr-1"
          style={{
            // 스크롤 설정
            overflowY: "auto",
            maxHeight: `calc(100vh - ${HEADER_H}px)`,

            /**
             * 스크롤바 절대 미노출 레이아웃 트릭
             * 오른쪽에 스크롤바가 그려지더라도, 그 영역을 뷰 밖으로 밀어냅니다.
             * paddingRight 로 내용이 가려지지 않게 여백을 주고
             * marginRight 를 음수로 주어 스크롤바가 화면 밖(오른쪽)으로 나가도록
             * 이 방식은 첫 페인트 직전에도 적용되므로 "깜빡" 보일 여지가 없습니다.
             */
            paddingRight: `${SCROLLBAR_GUTTER}px`,
            marginRight: `-${SCROLLBAR_GUTTER}px`,

            /**
             * 보조 안전망(크로스 브라우저 스크롤바 숨김 속성)
             * 일부 엔진에서 스크롤바가 강제로 그려지려 해도 최대한 숨깁니다.
             */
            msOverflowStyle: "none" as any, // IE/Edge(old)
            scrollbarWidth: "none" as any, // Firefox
          }}
        >
          {/* 검색창: 내부 기준 sticky + 배경으로 가림 */}
          <div className="sticky" style={{ top: 8, zIndex: 30 }}>
            <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>
          </div>

          {/* Who to follow */}
          <Suspense fallback={<RecommendationsSkeleton />}>
            <Recommendations />
          </Suspense>

          {/* What's happening */}
          <Suspense fallback={<PopularTagsSkeleton />}>
            <PopularTags />
          </Suspense>

          {/* footer(끝에서 멈춤) */}
          <div className="text-textGray text-sm flex gap-x-4 flex-wrap pb-2 pr-1">
            <Link href="/">Terms of Service</Link>
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Cookie Policy</Link>
            <Link href="/">Accessibility</Link>
            <Link href="/">Ads Info</Link>
            <span>© 2025 X Corp.</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default memo(RightBar);
