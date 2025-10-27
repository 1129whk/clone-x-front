"use client";

import React, { useRef, useState } from "react";
import NextImage from "next/image";
import ImageEditor from "@/components/posts/ImageEditor";
import { useRouter } from "next/navigation";
import { currentUser } from "@/data/currentUser";
import type { Post } from "@/types";
import { usePosts } from "@/store/usePosts";
import HighlightText from "@/components/common/HighlightText";

const PostModal = () => {
  const router = useRouter();
  const { addPost } = usePosts();

  // character limit 280자
  const [text, setText] = useState("");
  const maxLength = 280;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Preview Image Edit
  const [media, setMedia] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
  }>({
    type: "original",
  });

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

  const closeModal = () => {
    router.back();
  };

  // Counter Image
  const remaining = maxLength - text.length;
  const used = Math.min(text.length, maxLength);
  const percent = used / maxLength; // 0 ~ 1
  const exceeded = remaining < 0;

  // 원형 카운터 컴포넌트
  const CounterCircle = ({
    percent,
    remaining,
    exceeded,
  }: {
    percent: number;
    remaining: number;
    exceeded: boolean;
  }) => {
    const size = 36;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const strokeColor = exceeded
      ? "stroke-red-500"
      : remaining === 0
      ? "stroke-green-500"
      : "stroke-yellow-400";

    const textColor = exceeded
      ? "text-red-500"
      : remaining === 0
      ? "text-green-500"
      : "text-yellow-400";

    return (
      <div
        className="relative"
        aria-label={`remaining ${remaining}`}
        title={`남은 글자수: ${Math.max(remaining, 0)}`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 배경 트랙 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="stroke-gray-600"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
          {/* 진행 스트로크 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className={`${strokeColor}`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - percent)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {/* 남은 글자수 숫자 */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${textColor}`}
        >
          {exceeded ? Math.abs(remaining) : remaining}
        </span>
      </div>
    );
  };

  // 파일을 DataURL로 변환(새로고침 후에도 이미지 유지됨)
  // 나중에 백엔드 사용시 API로 교체
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  // 작성 완료하면 스토어에 반영
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
      postId: now.getTime(), // 간단 유니크
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

    addPost(newPost); // 스토어 최상단 반영
    router.back(); // 모달 닫기
  };

  return (
    <div className="absolute w-screen h-screen top-0 left-0 z-20 bg-[#293139a6] flex justify-center">
      <div className="py-4 px-8 rounded-xl bg-black w-[600px] h-max mt-12">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={closeModal}>
            X
          </div>
          <div className="text-iconBlue font-bold">Drafts</div>
        </div>

        <form className="" onSubmit={handleSubmit}>
          {/* CENTER */}
          <div className="py-8 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <NextImage
                  src={currentUser.profileImage}
                  alt={currentUser.username}
                  width={100}
                  height={100}
                />
              </div>

              {/* 입력 영역: 부분 강조 오버레이 */}
              <div className="flex-1 relative overflow-x-hidden">
                {/* 하이라이터 레이어(배경) */}
                <div
                  aria-hidden
                  className="min-h-[2.5rem] whitespace-pre-wrap break-all [overflow-wrap:anywhere] text-lg text-white"
                >
                  {text.length === 0 ? (
                    <span className="text-textGray">What is happening?!</span>
                  ) : (
                    <>
                      {/* 280자까지는 하이라이트 */}
                      <HighlightText
                        text={text.slice(0, maxLength)}
                        linkify={false}
                      />
                      {/* 초과분은 붉은 배경 */}
                      {text.length > maxLength && (
                        <span className="bg-red-600/60 rounded-sm">
                          {text.slice(maxLength)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* 실제 입력 textarea (투명 글자 + 흰색 커서) */}
                <textarea
                  className="absolute inset-0 w-full h-full bg-transparent outline-none text-lg text-transparent caret-white resize-none whitespace-pre-wrap break-all [overflow-wrap:anywhere]"
                  value={text}
                  onChange={handleTextChange}
                  name="desc"
                  rows={3}
                />
              </div>
            </div>

            {/* 글자 초과 경고 */}
            {text.length > maxLength && (
              <p className="text-red-500 text-xs pl-14">
                280자를 초과했어요. 내용을 줄여주세요.
              </p>
            )}

            {/* preview Image */}
            {media?.type.includes("image") && previewURL && (
              <div className="pl-14">
                <div className="relative rounded-xl overflow-hidden">
                  <NextImage
                    key={previewURL}
                    src={previewURL}
                    alt="미리보기 이미지"
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
          </div>
          {/* BOTTOM */}
          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-borderGray pt-4">
            <div className="flex gap-4 flex-wrap">
              <input
                ref={fileRef}
                type="file"
                onChange={handleMediaChange}
                className="hidden"
                id="modal-file"
                accept="image/*"
              />
              <label
                htmlFor="modal-file"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <NextImage
                  src="/icons/image.svg"
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

            {/* 초과 카운터 + Post 버튼 */}
            <div className="flex items-center gap-3">
              <CounterCircle
                percent={percent}
                remaining={remaining}
                exceeded={exceeded}
              />

              <button
                type="submit"
                disabled={
                  text.length > maxLength ||
                  (text.trim().length === 0 && !media)
                }
                className="bg-white text-black font-bold rounded-full py-2 px-4 disabled:bg-gray-600 disabled:text-gray-300"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
