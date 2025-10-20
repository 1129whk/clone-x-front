"use client";

import NextImage from "next/image";
import PostInfo from "./PostInfo";
import Link from "next/link";
import type { Post as PostType } from "@/types";
import { useNow, formatRelativeTimeWithNow } from "@/utils/time";
import PostInteractions from "./PostInteractions";

const Post = ({
  post,
  type,
  onLike,
  onRetweet,
  imagePriority = false,
}: {
  post: PostType;
  type?: "status" | "comment";
  onLike: (id: number) => void;
  onRetweet: (id: number) => void;
  imagePriority?: boolean;
}) => {
  const nowMs = useNow(20_000); // 20초마다 리렌더되어 "~분 전"이 자동으로 업데이트
  if (!post) return null;

  return (
    <div className="p-4 border-y-[1px] border-borderGray">
      {/* Retweet */}
      {post.isRetweeted && (
        <div className="flex items-center gap-2 text-sm text-textGray mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="#71767b"
              d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"
            />
          </svg>
          <span>{post.author.name} reposted</span>
        </div>
      )}

      <div className={`flex gap-4 ${type === "status" && "flex-col"}`}>
        {/* Avatar */}
        <div
          className={`${
            type === "status" && "hidden"
          } relative w-10 h-10 rounded-full overflow-hidden`}
        >
          <NextImage
            src={post.author.profileImage}
            alt="프로필 이미지"
            width={100}
            height={100}
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col gap-2">
          {/* TOP */}
          <div className="w-full flex justify-between">
            <Link href={`/${post.author.username}`} className="flex gap-4">
              <div
                className={`${
                  type !== "status" && "hidden"
                } relative w-10 h-10 rounded-full overflow-hidden`}
              >
                <NextImage
                  src={post.author.profileImage}
                  alt="프로필 이미지"
                  width={100}
                  height={100}
                />
              </div>
              <div
                className={`flex items-center gap-2 flex-wrap ${
                  type === "status" && "flex-col gap-0 !items-start"
                }`}
              >
                <h1 className="text-md font-bold">{post.author.username}</h1>
                <span
                  className={`text-textGray ${type === "status" && "text-sm"}`}
                >
                  @{post.author.id}
                </span>
                {type !== "status" && (
                  <span className="text-textGray">
                    {formatRelativeTimeWithNow(post.createdAt, nowMs)}
                  </span>
                )}
              </div>
            </Link>
            <PostInfo />
          </div>

          {/* Text & Media */}
          <Link href={`/${post.author.id}/status/${post.postId}`}>
            <p className={`${type === "status" && "text-lg"}`}>
              {post.content}
            </p>
          </Link>

          {post.images?.[0] && (
            <NextImage
              src={post.images[0]}
              alt="post-media"
              width={600}
              height={600}
              priority={imagePriority || type === "status"} // 상세 페이지거나 첫 카드면 우선 로드
              sizes="(max-width: 640px) 100vw, 600px"
            />
          )}

          {type === "status" && (
            <span className="text-textGray">
              {new Date(post.createdAt).toLocaleString("ko-KR", {
                hour12: false,
              })}
            </span>
          )}

          <PostInteractions
            comments={post.comments}
            likes={post.likes}
            retweets={post.retweets}
            isLiked={post.isLiked}
            isRetweeted={post.isRetweeted}
            onLike={() => onLike(post.postId)}
            onRetweet={() => onRetweet(post.postId)}
            statics={post.statics ?? 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Post;
