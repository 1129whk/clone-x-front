// Zustand 사용을 위함
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Post } from "@/types";

type Mutation = Partial<
  Pick<Post, "likes" | "isLiked" | "retweets" | "isRetweeted" | "isBookmarked">
>;

interface PostsState {
  posts: Post[];
  mutations: Record<number, Mutation>; // 변경분만 저장
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addPosts: (batch: Post[]) => void;
  addPost: (post: Post) => void;
  toggleLike: (id: number) => void;
  toggleRetweet: (id: number) => void;
  toggleBookmark: (id: number) => void;
  clearAll: () => void; // 전체 초기화
}

export const usePosts = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      mutations: {},
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      // 서버/모의 데이터 들어올 때, 기존 posts + batch 병합하면서
      // mutations에 저장된 값으로 likes/isLiked/retweets/isRetweeted를 덮어씌움
      addPosts: (batch) => {
        const { posts, mutations } = get();

        // 들어온 batch에 mutations 패치
        const patchedBatch = batch.map((p) => {
          const mu = mutations[p.postId];
          if (!mu) return p;
          return {
            ...p,
            likes: mu.likes ?? p.likes,
            isLiked: mu.isLiked ?? p.isLiked,
            retweets: mu.retweets ?? p.retweets,
            isRetweeted: mu.isRetweeted ?? p.isRetweeted,
            isBookmarked: mu.isBookmarked ?? p.isBookmarked,
          };
        });

        // 기존 posts + patchedBatch 중복 제거(postId 기준)
        const map = new Map<number, Post>();
        for (const p of [...posts, ...patchedBatch]) {
          map.set(p.postId, p);
        }

        // 최신순 정렬( createdAt DESC, 같으면 postId DESC )
        const merged = Array.from(map.values()).sort((a, b) => {
          const t =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return t !== 0 ? t : b.postId - a.postId;
        });
        set({ posts: merged });
      },

      // 새 게시물 추가(상단 삽입) — mutations 영향 없음
      addPost: (post) => {
        const { posts } = get();
        // postId 중복 방어
        const exists = posts.some((p) => p.postId === post.postId);
        if (exists) return;

        const merged = [post, ...posts].sort((a, b) => {
          const t =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return t !== 0 ? t : b.postId - a.postId;
        });

        set({ posts: merged });
      },

      // 좋아요 토글: posts를 즉시 갱신 + mutations에도 같은 결과를 기록
      toggleLike: (id) => {
        const { posts, mutations } = get();
        const target = posts.find((p) => p.postId === id);
        if (!target) return;

        const nextIsLiked = !target.isLiked;
        const nextLikes = nextIsLiked ? target.likes + 1 : target.likes - 1;

        const nextPosts = posts.map((p) =>
          p.postId === id ? { ...p, isLiked: nextIsLiked, likes: nextLikes } : p
        );

        const prevMu = mutations[id] ?? {};
        const nextMutations: Record<number, Mutation> = {
          ...mutations,
          [id]: {
            ...prevMu,
            isLiked: nextIsLiked,
            likes: nextLikes,
          },
        };

        set({ posts: nextPosts, mutations: nextMutations });
      },

      // 리포스트 토글: posts 즉시 갱신 + mutations 기록
      toggleRetweet: (id) => {
        const { posts, mutations } = get();
        const target = posts.find((p) => p.postId === id);
        if (!target) return;

        const nextIsRT = !target.isRetweeted;
        const nextRTs = nextIsRT ? target.retweets + 1 : target.retweets - 1;

        const nextPosts = posts.map((p) =>
          p.postId === id
            ? { ...p, isRetweeted: nextIsRT, retweets: nextRTs }
            : p
        );

        const prevMu = mutations[id] ?? {};
        const nextMutations: Record<number, Mutation> = {
          ...mutations,
          [id]: {
            ...prevMu,
            isRetweeted: nextIsRT,
            retweets: nextRTs,
          },
        };

        set({ posts: nextPosts, mutations: nextMutations });
      },

      toggleBookmark: (id) => {
        const { posts, mutations } = get();
        const target = posts.find((p) => p.postId === id);
        if (!target) return;

        const next = !target.isBookmarked;
        const nextPosts = posts.map((p) =>
          p.postId === id ? { ...p, isBookmarked: next } : p
        );

        const prevMu = mutations[id] ?? {};
        const nextMutations: Record<number, Mutation> = {
          ...mutations,
          [id]: { ...prevMu, isBookmarked: next },
        };

        set({ posts: nextPosts, mutations: nextMutations });
      },

      clearAll: () => set({ posts: [], mutations: {} }),
    }),
    {
      name: "posts-v3", // 기존 키 유지(데이터 보존). 버전만 올려서 마이그레이션
      version: 4,
      migrate: (state: any, version) => {
        // v2 -> v3 로 올라오면서 mutations 필드가 없으면 추가
        if (!state) return state;
        if (version < 3) {
          return {
            ...state,
            mutations: state.mutations ?? {},
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
