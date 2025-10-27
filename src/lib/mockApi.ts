import type { Post } from "@/types";
import { mockPosts } from "@/data/posts"; // 최초 1회 생성본(Seed로만 사용)

const SNAP_KEY = "mock-dataset-v1";

/* 브라우저에서 한 번만 스냅샷을 만들어 고정 사용 */
const getStableMock = (): Post[] => {
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
    } catch {}
  }

  // 스냅샷이 없으면 현재 mockPosts(한 번 생성된 씨앗)를 저장해 고정
  window.localStorage.setItem(SNAP_KEY, JSON.stringify(mockPosts));
  return mockPosts;
};

/* 총 개수는 스냅샷 기준 */
export const TOTAL_POSTS = (() => {
  // 클라이언트에서 최종 값으로 덮여쓰여도 무방
  try {
    const arr = getStableMock();
    return arr.length;
  } catch {
    return mockPosts.length;
  }
})();

export const fetchPosts = async (
  page = 1,
  limit = 10
): Promise<{ items: Post[]; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 로딩 시뮬

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

// 좋아요 모의 API
export const toggleLike = async (postId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // 로컬 상태 업데이트
  return { success: true };
};

// 리트윗 모의 API
export const toggleRetweet = async (postId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // 로컬 상태 업데이트
  return { success: true };
};

// 북마크 모의 API
export const toggleBookmark = async (_postId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
};
