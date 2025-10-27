import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Feed from "@/components/posts/Feed";
import * as api from "@/lib/mockApi";
import { usePosts } from "__mocks__/usePosts";

jest.mock("@/store/usePosts", () => require("__mocks__/usePosts"));

describe("Feed 낙관적 업데이트", () => {
  beforeEach(() => {
    const s: any = usePosts();
    s.posts = [
      {
        postId: 1,
        author: {
          id: "me",
          name: "나",
          username: "me",
          profileImage: "/a.png",
          verified: false,
        },
        content: "hi",
        images: [],
        createdAt: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        comments: 0,
        isLiked: false,
        isRetweeted: false,
      },
    ];
    jest.spyOn(api, "toggleLike").mockResolvedValue({ success: true });
    jest.spyOn(api, "fetchPosts").mockResolvedValue({ items: [], total: 1 });
  });

  it("좋아요 클릭 시 즉시 토글(서버 대기 X)", async () => {
    render(<Feed />);
    // 실제 버튼의 aria-label에 맞춰 수정하세요(예: aria-label="like")
    const likeButton =
      screen.getByRole("button", { name: /좋아요|like/i }) ||
      screen.getByLabelText(/좋아요|like/i);

    fireEvent.click(likeButton);
    const s: any = usePosts();
    expect(s.toggleLike).toHaveBeenCalledWith(1);

    await waitFor(() => expect(api.toggleLike).toHaveBeenCalledWith(1));
  });
});
