export type User = {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  coverImage: string;
  verified: boolean;
};

// Author 게시물 작성자
export type Author = {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  coverImage?: string;
  verified?: boolean;
};

export type ImageFit = "original" | "wide" | "square";

export type Post = {
  postId: number;
  author: Author;
  content: string;
  images: string[];
  createdAt: string;
  likes: number;
  retweets: number;
  comments: number;
  isLiked: boolean;
  isRetweeted: boolean;
  statics?: number;
  isBookmarked?: boolean;
  imageFit?: ImageFit;
};
