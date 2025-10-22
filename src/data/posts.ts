import type { Post } from "@/types";

// Author 랜덤 ID 생성기 (영문 5개 이상, 전체 5~10자, 숫자는 랜덤 위치)
const randomAuthorId = (): string => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  const totalLength = Math.floor(Math.random() * 6) + 5; // 5~10글자
  const letterCount = Math.max(
    5,
    Math.floor(Math.random() * (totalLength - 4)) + 5
  ); // 최소 5개 이상
  const numberCount = totalLength - letterCount;

  // 영문 부분 생성
  const letterPart = Array.from(
    { length: letterCount },
    () => letters[Math.floor(Math.random() * letters.length)]
  );

  // 숫자 부분 생성
  const numberPart = Array.from(
    { length: numberCount },
    () => numbers[Math.floor(Math.random() * numbers.length)]
  );

  // 둘을 합쳐서 랜덤 순서로 섞음
  const mixed = [...letterPart, ...numberPart]
    .sort(() => Math.random() - 0.5)
    .join("");

  return mixed.slice(0, totalLength);
};

// 1~2번은 과제 샘플 그대로 유지
const seeds: Post[] = [
  {
    postId: 1,
    author: {
      id: "kimdev12",
      name: "김개발",
      username: "kimdev",
      profileImage: "https://picsum.photos/40/40?random=1",
      coverImage: "https://picsum.photos/1200/400?random=101",
      verified: true,
    },
    content:
      "오늘 React 18의 새로운 기능들을 공부했습니다! Concurrent Features가 정말 흥미롭네요 🚀 #React #개발자",
    images: ["https://picsum.photos/500/300?random=1"],
    createdAt: "2024-01-15T10:30:00Z",
    likes: 42,
    retweets: 12,
    comments: 8,
    isLiked: false,
    isRetweeted: false,
    statics: 157,
    isBookmarked: true,
  },
  {
    postId: 2,
    author: {
      id: "leedsgn57",
      name: "이디자인",
      username: "leedesign",
      profileImage: "https://picsum.photos/40/40?random=2",
      coverImage: "https://picsum.photos/1200/400?random=102",
      verified: false,
    },
    content:
      "새로운 디자인 시스템을 만들고 있어요. 일관성 있는 컴포넌트 라이브러리의 중요성을 다시 한번 느낍니다 ✨",
    images: [],
    createdAt: "2024-01-15T09:15:00Z",
    likes: 28,
    retweets: 5,
    comments: 3,
    isLiked: true,
    isRetweeted: false,
    statics: 203,
    isBookmarked: false,
  },
];

// ---- 3~50까지 랜덤 데이터 생성 ----

// 한국인 이름 후보 (3글자)
const koreanNames = [
  "박민준",
  "이서연",
  "김지호",
  "최유진",
  "정현우",
  "한지민",
  "윤도현",
  "서민재",
  "이준호",
  "배수아",
  "신예찬",
  "오하늘",
  "남기훈",
  "장예린",
  "문준석",
  "노하영",
  "송지안",
  "백도윤",
  "하유진",
  "전민재",
  "임소연",
  "권하준",
  "심예은",
  "양도현",
  "조민규",
  "강하늘",
  "김다은",
  "박도윤",
  "이하린",
  "최서우",
  "홍민혁",
  "안유정",
];

// 랜덤 영어 username 생성기 (5~8자)
const randomUsername = () => {
  const length = Math.floor(Math.random() * 4) + 5; // 5~8자
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let name = "";
  for (let i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
};

// 3~50에서 "랜덤 16개"를 북마크 ON으로 선정
const pickRandomBookmarked = () => {
  const pool: number[] = [];
  for (let i = 3; i <= 50; i++) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, 16)); // 16개 선택
};
const bookmarkedSet = pickRandomBookmarked();

// 더미 게시물 생성(50개)
export const mockPosts: Post[] = (() => {
  const list: Post[] = [];
  const now = Date.now();
  let id = 1;

  // 1~2번 seed 먼저 push
  for (const s of seeds) list.push(s);

  // 3~50번 자동 생성
  for (let i = 3; i <= 50; i++) {
    const name =
      koreanNames[(i - 3) % koreanNames.length] ??
      koreanNames[Math.floor(Math.random() * koreanNames.length)];
    const username = randomUsername();

    const profileRandom = i; // 3,4,5,...
    const imageRandom = i; // 동일하게 증가

    const offset = i - 3; // 0부터 시작 → 가장 최신이 "지금"
    const createdAt = new Date(
      Date.now() - offset * 1000 * 60 * 17
    ).toISOString();

    list.push({
      postId: i,
      author: {
        id: randomAuthorId(),
        name,
        username,
        profileImage: `https://picsum.photos/40/40?random=${profileRandom}`,
        coverImage: `https://picsum.photos/1200/400?random=${100 + i}`,
        verified: Math.random() > 0.8, // 20% 확률로 인증 마크
      },
      content: `${name}님이 개발 관련 포스트를 올렸습니다! ${
        i % 5 === 0 ? "#React #Nextjs" : "#Frontend #Daily"
      }`,
      images:
        i % 2 === 0
          ? [`https://picsum.photos/500/300?random=${imageRandom}`]
          : [],
      createdAt,
      likes: Math.floor(Math.random() * 100),
      retweets: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.5,
      isRetweeted: Math.random() > 0.3,
      statics: Math.floor(200 + Math.random() * 4800),
      isBookmarked: bookmarkedSet.has(i),
    });
  }

  return list;
})();
