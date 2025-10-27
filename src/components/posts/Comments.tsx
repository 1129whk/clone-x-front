"use client";

import { useState } from "react";
import NextImage from "next/image";
import Post from "./Post";
import type { Post as PostType } from "@/types";
import { mockPosts } from "@/data/posts";

const Comments = () => {
  // 예시로 상위 6개를 댓글처럼 표시
  const [posts, setPosts] = useState<PostType[]>(() => mockPosts.slice(0, 6));

  const onLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const onRetweet = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === id
          ? {
              ...p,
              isRetweeted: !p.isRetweeted,
              retweets: p.isRetweeted ? p.retweets - 1 : p.retweets + 1,
            }
          : p
      )
    );
  };

  return (
    <div>
      <form className="flex items-center justify-between gap-4 p-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <NextImage
            src="/general/avatar.png"
            alt="아바타"
            width={100}
            height={100}
          />
        </div>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none p-2 text-xl"
          placeholder="Post your reply"
        />
        <button
          type="button"
          className="py-2 px-4 font-bold bg-white text-black rounded-full"
        >
          Reply
        </button>
      </form>

      {posts.map((p) => (
        <Post
          key={p.postId}
          post={p}
          type="comment"
          onLike={onLike}
          onRetweet={onRetweet}
        />
      ))}
    </div>
  );
};

export default Comments;
