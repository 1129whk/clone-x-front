import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Post from "@/components/posts/Post";

const basePost = {
  postId: 1,
  author: {
    id: "user1",
    name: "유저",
    username: "user",
    profileImage: "/avatar.png",
    verified: false,
  },
  content: "이미지 테스트",
  images: ["https://picsum.photos/600/400?random=1"],
  createdAt: new Date().toISOString(),
  likes: 0,
  retweets: 0,
  comments: 0,
  isLiked: false,
  isRetweeted: false,
  imageFit: "wide" as const,
};

describe("Post image blur transition", () => {
  it("처음엔 blur 있다가 로딩 완료 후 blur 제거", async () => {
    render(
      <Post
        post={basePost}
        onLike={() => {}}
        onRetweet={() => {}}
        onBookmark={() => {}}
      />
    );

    const img = screen.getByAltText("post-media") as HTMLImageElement;

    // 초기에는 blur 적용
    expect(img.className).toMatch(/blur-md/);

    // 이미지 로드 트리거
    fireEvent.load(img);

    // 상태 업데이트/리렌더를 기다렸다가 blur 해제 확인
    await waitFor(() => {
      expect(img.className).not.toMatch(/blur-md/);
    });
  });
});
