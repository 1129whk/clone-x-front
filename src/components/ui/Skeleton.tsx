"use client";

type Props = { className?: string };

export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={
        "animate-pulse rounded-md bg-white/10 " +
        // 배경 대비가 약하면 살짝 그라데이션 느낌
        "before:block before:h-full before:w-full before:rounded-md before:bg-white/5 " +
        className
      }
    />
  );
}
