"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { mockPosts } from "@/data/posts";

type Author = {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  verified?: boolean;
};

// Skeleton Loading
const SkeletonRow = () => (
  <div className="flex items-center justify-between p-2 rounded-xl">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-gray-700/60 animate-pulse" />
      <div className="flex flex-col gap-1">
        <div className="h-4 w-24 rounded bg-gray-700/60 animate-pulse" />
        <div className="h-3 w-20 rounded bg-gray-700/50 animate-pulse" />
      </div>
    </div>
    <div className="h-8 w-20 rounded-full bg-gray-700/60 animate-pulse" />
  </div>
);

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 중복 제거된 author 목록 생성
    const uniqueAuthors = Array.from(
      new Map(mockPosts.map((post) => [post.author.id, post.author])).values()
    );

    // 3명 무작위 추출
    const shuffled = [...uniqueAuthors].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    // 네트워크 대기 시 UX
    const t = setTimeout(() => {
      setRecommendations(selected);
      setLoading(false);
    }, 500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-4 rounded-2xl border border-borderGray flex flex-col gap-4">
      <h1 className="text-xl font-bold text-textGrayLight">Who to follow</h1>

      {/* 로딩 중: 스켈레톤 3개 */}
      {loading &&
        Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

      {/* 데이터 로드 완료 */}
      {!loading &&
        recommendations.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between hover:bg-gray-900/30 p-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <NextImage
                  src={user.profileImage}
                  alt={user.username}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-md font-bold flex items-center gap-1">
                  {user.username}
                </h1>
                <span className="text-textGray text-sm">@{user.id}</span>
              </div>
            </div>

            <button className="py-1 px-4 font-semibold bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
              Follow
            </button>
          </div>
        ))}

      <Link
        href="/"
        className="text-iconBlue font-semibold hover:underline text-sm"
      >
        Show more
      </Link>
    </div>
  );
};

export default Recommendations;
