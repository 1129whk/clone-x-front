// 게시물이 0일때 테스트
//http://localhost:3000/?empty=1

import type { Post } from "@/types";
import { mockPosts } from "@/data/posts"; // 최초 1회 생성본(Seed로만 사용)

const SNAP_KEY = "mock-dataset-v1";

/** 빈 피드(게시물 0개) 강제 토글 */
const isEmptyFeed = (): boolean => {
  // 클라이언트: URL 쿼리로 제어 (예: /?empty=1)
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("empty") === "1";
  }
  // 서버/빌드: 환경변수로 제어
  // (서버 렌더 중에도 안전하게 처리)
  return process.env.NEXT_PUBLIC_EMPTY_FEED === "1";
};

/* 브라우저에서 한 번만 스냅샷을 만들어 고정 사용 */
const getStableMock = (): Post[] => {
  // 빈 피드 테스트면 곧바로 빈 배열 반환
  if (isEmptyFeed()) return [];

  // 서버(SSR) 혹은 테스트 환경 대비
  if (typeof window === "undefined") {
    // 클라이언트에서 다시 호출되면 localStorage 스냅샷을 사용하므로,
    // 여기서는 seed만 반환(SSR 단계에선 페이징 호출 안 하도록 구성되어 있음)
    return mockPosts;
  }

  const cached = window.localStorage.getItem(SNAP_KEY);
  if (cached) {
    try {
      const arr = JSON.parse(cached) as Post[];
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch {
      // 파싱 실패 시 아래에서 스냅 재생성
    }
  }

  // 스냅샷이 없으면 현재 mockPosts(한 번 생성된 씨앗)를 저장해 고정
  window.localStorage.setItem(SNAP_KEY, JSON.stringify(mockPosts));
  return mockPosts;
};

/* 총 개수는 스냅샷/플래그 기준 */
export const TOTAL_POSTS = (() => {
  try {
    // isEmptyFeed()가 true면 0으로 떨어짐
    const arr = getStableMock();
    return arr.length;
  } catch {
    // 예외시 seed 기준
    return isEmptyFeed() ? 0 : mockPosts.length;
  }
})();

/* 페이징 모의 API */
export const fetchPosts = async (
  page = 1,
  limit = 10
): Promise<{ items: Post[]; total: number }> => {
  // 로딩 시뮬
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 빈 피드 강제 모드면 항상 0개
  if (isEmptyFeed()) {
    return { items: [], total: 0 };
  }

  const base = getStableMock();

  // createdAt DESC이 동일하면 postId DESC
  const sorted: Post[] = [...base].sort((a, b) => {
    const byTime =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (byTime !== 0) return byTime;
    return b.postId - a.postId;
  });

  const start = (page - 1) * limit;
  const end = page * limit;
  const items = sorted.slice(start, end);

  return { items, total: sorted.length };
};

// 좋아요 모의 API (성공만 응답)
export const toggleLike = async (_postId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
};

// 리트윗 모의 API (성공만 응답)
export const toggleRetweet = async (_postId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
};
