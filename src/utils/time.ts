import { useEffect, useState } from "react";

// '현재'를 갱신해 리렌더 유도
export const useNow = (tickMs = 20_000) => {
  // 20초마다 갱신하기로 함
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(t);
  }, [tickMs]);
  return now; // number(ms)
};

// 외부에서 전달한 now(ms)를 기준으로 상대 시간 포맷
export const formatRelativeTimeWithNow = (iso: string, nowMs: number) => {
  const then = new Date(iso);
  const diffSec = Math.round((then.getTime() - nowMs) / 1000); // 음수=과거
  const abs = Math.abs(diffSec);

  if (abs < 60) return "방금 전";
  const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute"); // ±분
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour"); // ±시간
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day"); // ±일
  if (abs < 31104000) return rtf.format(Math.round(diffSec / 2592000), "month"); // ±월
  return rtf.format(Math.round(diffSec / 31104000), "year"); // ±년
};
