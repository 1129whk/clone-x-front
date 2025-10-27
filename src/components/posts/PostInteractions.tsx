"use client";

import HeartLike from "./likes/HeartLike";

const PostInteractions = ({
  comments,
  likes,
  retweets,
  isLiked,
  isRetweeted,
  isBookmarked,
  onLike,
  onRetweet,
  onBookmark,
  statics,
}: {
  comments: number;
  likes: number;
  retweets: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onRetweet: () => void;
  onBookmark?: () => void;
  statics: number;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 lg:gap-16 my-2 text-textGray">
      <div className="flex items-center justify-between flex-1">
        {/* Comments (표시만) */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              className="fill-textGray group-hover:fill-iconBlue"
              d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
            />
          </svg>
          <span className="group-hover:text-iconBlue text-sm">{comments}</span>
        </div>

        {/* Repost */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onRetweet}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              className={`${
                isRetweeted ? "fill-iconGreen" : "fill-textGray"
              } group-hover:fill-iconGreen`}
              d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"
            />
          </svg>
          <span className="group-hover:text-iconGreen text-sm">{retweets}</span>
        </div>

        {/* Like (하트 팡 효과) */}
        <HeartLike likes={likes} isLiked={isLiked} onLike={onLike} />

        {/* Statics (표시만) */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              className="fill-textGray group-hover:fill-iconBlue"
              d="M3 3.75C3 3.34 3.34 3 3.75 3h2.5c.41 0 .75.34.75.75v16.5c0 .41-.34.75-.75.75h-2.5A.75.75 0 0 1 3 20.25V3.75zm7 5.5c0-.41.34-.75.75-.75h2.5c.41 0 .75.34.75.75v11c0 .41-.34.75-.75.75h-2.5a.75.75 0 0 1-.75-.75v-11zm7-4.5c0-.41.34-.75.75-.75h2.5c.41 0 .75.34.75.75v15.5c0 .41-.34.75-.75.75h-2.5a.75.75 0 0 1-.75-.75V4.75z"
            />
          </svg>
          <span className="group-hover:text-iconBlue text-sm">{statics}</span>{" "}
        </div>
      </div>

      {/* BookMark */}
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer group ${
            onBookmark ? "" : "pointer-events-none"
          }`}
          onClick={onBookmark}
          aria-label={isBookmarked ? "북마크됨" : "북마크"}
          title={isBookmarked ? "북마크됨" : "북마크"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className={
              isBookmarked
                ? "text-iconBlue"
                : "text-textGray group-hover:text-iconBlue"
            }
            aria-hidden="true"
          >
            <path
              d="M6.5 2h11A2.5 2.5 0 0 1 20 4.5v18.44l-8-5.71-8 5.71V4.5A2.5 2.5 0 0 1 6.5 2Z"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Share (표시만) */}
        <div className="cursor-pointer group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              className="fill-textGray group-hover:fill-iconBlue"
              d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PostInteractions;
