"use client";

import Link from "next/link";
import React from "react";

/**
 * 텍스트에서 멘션과 해시태그를 파란색으로 하이라이트
 * - mention 규칙: @ 뒤에 유니코드 문자/숫자/밑줄 1자 이상 (한글, 영어, 숫자 포함)
 * - hashtag 규칙: # 뒤에 유니코드 문자/숫자/밑줄 1자 이상
 */
export default function HighlightText({
  text,
  className = "",
  linkify = false,
}: {
  text: string;
  className?: string;
  linkify?: boolean;
}) {
  // 멘션과 해시태그 정규식 — 모두 유니코드 문자 포함
  const re = /(@[\p{L}\p{N}_]{1,})|(#([\p{L}\p{N}_]{1,}))/gu;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > lastIndex) {
      parts.push(text.slice(lastIndex, idx));
    }
    const token = m[0];

    // 멘션 처리
    if (token.startsWith("@")) {
      const handle = token.slice(1);
      const node = linkify ? (
        <Link
          key={`${idx}-m`}
          href={`/${handle}`}
          className="text-iconBlue hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {token}
        </Link>
      ) : (
        <span key={`${idx}-m`} className="text-iconBlue">
          {token}
        </span>
      );
      parts.push(node);
    } else {
      // 해시태그 처리
      const tag = token.slice(1);
      const node = linkify ? (
        <Link
          key={`${idx}-h`}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="text-iconBlue hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {token}
        </Link>
      ) : (
        <span key={`${idx}-h`} className="text-iconBlue">
          {token}
        </span>
      );
      parts.push(node);
    }
    lastIndex = idx + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return <span className={className}>{parts}</span>;
}
