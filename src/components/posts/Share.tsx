"use client";

import React, { useRef, useState } from "react";
import NextImage from "next/image";
// import { shareAction } from "@/actions";
import ImageEditor from "./ImageEditor";
import { currentUser } from "@/data/currentUser";
import { usePosts } from "@/store/usePosts";
import type { Post } from "@/types";

const Share = () => {
  const { addPosts } = usePosts();
  const [media, setMedia] = useState<File | null>(null);

  // Preview Image Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
  }>({
    type: "original",
  });

  const [text, setText] = useState("");
  const maxLength = 280;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [objectURL, setObjectURL] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이전 미리보기 URL 해제
    if (objectURL) URL.revokeObjectURL(objectURL);

    const url = URL.createObjectURL(file);
    setObjectURL(url);
    setMedia(file);
  };

  const clearMedia = () => {
    // 미리보기 URL 해제 + 상태 초기화
    if (objectURL) URL.revokeObjectURL(objectURL);
    setObjectURL(null);
    setMedia(null);
    setIsEditorOpen(false);
    setSettings((s) => ({ ...s, type: "original" }));

    // 같은 파일 다시 선택 가능하도록 input 비우기
    if (fileRef.current) fileRef.current.value = "";
  };

  const previewURL = objectURL;

  // 파일을 DataURL로 변환(새로고침 후에도 이미지 유지됨)
  // 나중에 백엔드 사용시 API로 교체
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  // 상단 Share도 스토어에 즉시 반영
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const noText = text.trim().length === 0;
    if ((noText && !media) || text.length > maxLength) return;

    let images: string[] = [];
    if (media) {
      try {
        const dataUrl = await fileToDataUrl(media);
        images = [dataUrl];
      } catch {
        images = [];
      }
    }

    const now = new Date();
    const newPost: Post = {
      postId: now.getTime(),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        verified: currentUser.verified,
      },
      content: text,
      images,
      createdAt: now.toISOString(),
      likes: 0,
      retweets: 0,
      comments: 0,
      isLiked: false,
      isRetweeted: false,
    };

    addPosts([newPost]);

    // 입력 초기화
    setText("");
    clearMedia();
  };

  return (
    <form className="p-4 flex gap-4" onSubmit={handleSubmit}>
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <NextImage
          src={currentUser.profileImage}
          alt={currentUser.username}
          width={100}
          height={100}
        />
      </div>
      {/* Others */}
      <div className="flex-1 flex flex-col gap-4">
        <input
          type="text"
          name="desc"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What is happening?!"
          className="bg-transparent outline-none placeholder:text-textGray text-xl"
        />
        {/* preview Image */}
        {media?.type.includes("image") && previewURL && (
          <div className="relative rounded-xl overflow-hidden">
            <NextImage
              key={previewURL}
              src={previewURL}
              alt=""
              width={600}
              height={600}
              className={`w-full ${
                settings.type === "original"
                  ? "h-full object-contain"
                  : settings.type === "square"
                  ? "aspect-square object-cover"
                  : "aspect-video object-cover"
              }`}
            />
            <div
              className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer"
              onClick={() => setIsEditorOpen(true)}
            >
              Edit
            </div>
            <div
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
              onClick={clearMedia}
            >
              X
            </div>
          </div>
        )}
        {isEditorOpen && previewURL && (
          <ImageEditor
            onClose={() => setIsEditorOpen(false)}
            previewURL={previewURL}
            settings={settings}
            setSettings={setSettings}
          />
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-4 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              onChange={handleMediaChange}
              className="hidden"
              id="file"
              accept="image/*"
            />
            <label
              htmlFor="file"
              onClick={() => {
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              <NextImage
                src="icons/image.svg"
                alt="이미지"
                width={20}
                height={20}
                className="cursor-pointer"
              />
            </label>
            <NextImage
              src="/icons/gif.svg"
              alt="gif"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/icons/poll.svg"
              alt="목록"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/icons/emoji.svg"
              alt="이모지"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/icons/schedule.svg"
              alt="일정"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/icons/location.svg"
              alt="지역"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={
              text.length > maxLength || (text.trim().length === 0 && !media)
            }
            className="bg-white text-black font-bold rounded-full py-2 px-4 disabled:bg-gray-600 disabled:text-gray-300"
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
};

export default Share;
