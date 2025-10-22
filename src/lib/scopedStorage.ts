import type { Post } from "@/types";

const KEY_DATA = "scoped-posts-v1"; // 스코프용 별도 키
const KEY_SCOPE = "scoped-posts-scope"; // 스코프 식별 키

export function claimScope(scopeId: string) {
  if (typeof window === "undefined") return;
  const cur = window.localStorage.getItem(KEY_SCOPE);
  if (cur && cur !== scopeId) {
    window.localStorage.removeItem(KEY_DATA);
  }
  window.localStorage.setItem(KEY_SCOPE, scopeId);
}

export function releaseScope(scopeId: string) {
  if (typeof window === "undefined") return;
  const cur = window.localStorage.getItem(KEY_SCOPE);
  if (cur === scopeId) {
    window.localStorage.removeItem(KEY_SCOPE);
  }
}

export function saveScopedPosts(scopeId: string, posts: Post[]) {
  if (typeof window === "undefined") return;
  const cur = window.localStorage.getItem(KEY_SCOPE);
  if (cur === scopeId) {
    if (posts && posts.length > 0) {
      window.localStorage.setItem(KEY_DATA, JSON.stringify(posts));
    }
  }
}

export function readScopedPosts(scopeId: string): Post[] | null {
  if (typeof window === "undefined") return null;
  const cur = window.localStorage.getItem(KEY_SCOPE);
  if (cur !== scopeId) return null;
  const raw = window.localStorage.getItem(KEY_DATA);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Post[];
  } catch {
    return null;
  }
}
