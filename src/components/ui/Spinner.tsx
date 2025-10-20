"use client";

import React from "react";

type Props = {
  size?: number; // px
  thickness?: number; // px (테두리 굵기)
  className?: string; // 레이아웃(정렬) 커스터마이즈용
  label?: string; // 접근성용 텍스트
};

export default function Spinner({
  size = 32,
  thickness = 4,
  className = "",
  label = "Loading...",
}: Props) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className="rounded-full border-gray-300 border-t-iconBlue animate-spin"
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
        }}
      />
    </div>
  );
}
