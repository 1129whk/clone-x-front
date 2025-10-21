import NextImage from "next/image";

const PostInfo = () => {
  return (
    <div className="cursor-pointer w-4 h-4 relative">
      <NextImage
        src="/icons/infoMore.svg"
        alt="더보기"
        width={16}
        height={16}
      />
    </div>
  );
};

export default PostInfo;
