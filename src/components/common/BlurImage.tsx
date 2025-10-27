"use client";

import NextImage, { ImageProps } from "next/image";
import { useState, useMemo } from "react";

// 아주 작은 블러 플라세홀더(svg shimmer)
const shimmerDataURL = (w: number, h: number) =>
  `data:image/svg+xml;base64,${btoa(
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g">
        <stop stop-color="#2a2a2a" offset="20%"/>
        <stop stop-color="#3a3a3a" offset="50%"/>
        <stop stop-color="#2a2a2a" offset="70%"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#2a2a2a"/>
      <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"/>
    </svg>`
  )}`;

/**
 * BlurImage
 * - next/image 래퍼
 * - 로딩 중 blur + 살짝 확대 -> 완료 시 선명 + 원래 크기
 * - placeholder="blur"를 자동으로 셋업
 */
type BlurImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  /**
   * 블러 플라세홀더 크기 힌트. (미지정 시 width/height 또는 기본값 사용)
   */
  placeholderSize?: { w: number; h: number };
  /**
   * 트랜지션을 끄고 싶다면 false
   */
  withTransition?: boolean;
  /**
   * 이미지 준비 완료 후 추가로 실행할 콜백
   */
  onReady?: () => void;
  /**
   * img 요소에 줄 추가 클래스
   */
  imgClassName?: string;
};

export default function BlurImage({
  placeholderSize,
  withTransition = true,
  onReady,
  className,
  imgClassName,
  onLoadingComplete,
  width,
  height,
  fill,
  sizes,
  ...rest
}: BlurImageProps) {
  const [ready, setReady] = useState(false);

  // placeholder 크기 자동 추정
  const { w, h } = useMemo(() => {
    if (placeholderSize) return placeholderSize;
    if (typeof width === "number" && typeof height === "number")
      return { w: width, h: height };
    // fill인 경우 대략적인 커버 사이즈(너비 1200, 높이 400)로
    return { w: 1200, h: 400 };
  }, [placeholderSize, width, height]);

  return (
    <div className={className}>
      <NextImage
        {...rest}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={shimmerDataURL(w, h)}
        onLoadingComplete={(el) => {
          setReady(true);
          onReady?.();
          onLoadingComplete?.(el);
        }}
        className={[
          // 사용자가 넘긴 className은 wrapper에, 실제 img에는 imgClassName 사용
          // next/image는 className을 img에 적용하므로 imgClassName을 여기에 합칩니다.
          imgClassName,
          withTransition
            ? "will-change-transform transition-[filter,transform] duration-500 ease-out"
            : "",
          ready ? "blur-0 scale-100" : "blur-md scale-[1.02]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}
