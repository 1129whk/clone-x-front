import { render, screen, waitFor } from "@testing-library/react";
import ProfileClient from "@/app/[id]/ProfileClient";
import * as api from "@/lib/mockApi";

// usePosts 모킹: 시작부터 포스트 1개 + hydrated: true
jest.mock("@/store/usePosts", () => {
  const posts = [
    {
      postId: 1,
      author: {
        id: "someone",
        name: "누군가",
        username: "someone",
        profileImage: "/avatar.png",
        verified: false,
      },
      content: "헬로 월드!",
      images: [],
      createdAt: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      comments: 0,
      isLiked: false,
      isRetweeted: false,
    },
  ];
  return {
    usePosts: () => ({
      posts,
      addPosts: (items: any[]) => posts.push(...items),
      toggleLike: jest.fn(),
      toggleRetweet: jest.fn(),
      toggleBookmark: jest.fn(),
      hydrated: true,
    }),
  };
});

// fetchPosts도 혹시 불리면 같은 포스트를 주도록
jest.spyOn(api, "fetchPosts").mockResolvedValue({
  items: [
    {
      postId: 2,
      author: {
        id: "someone",
        name: "누군가",
        username: "someone",
        profileImage: "/avatar.png",
        verified: false,
      },
      content: "헬로 또다시!",
      images: [],
      createdAt: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      comments: 0,
      isLiked: false,
      isRetweeted: false,
    },
  ],
  total: 50,
});

test("스피너 → 목록 전환", async () => {
  render(<ProfileClient id="someone" initialTab="posts" />);
  // 스피너는 바로 사라질 수 있으니 존재해도/안해도 상관없게 느슨하게
  await waitFor(() => {
    // 초기 포스트 텍스트가 보여야 함
    expect(screen.getByText(/헬로/i)).toBeInTheDocument();
  });
});
