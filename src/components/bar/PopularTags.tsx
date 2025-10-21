import Link from "next/link";
import NextImage from "next/image";

const PopularTags = () => {
  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      <h1 className="text-xl font-bold text-textGrayLight">
        {"What's"} Happening
      </h1>
      {/* Trend */}
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden">
          <NextImage
            src="/general/event.png"
            alt="event"
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-textGrayLight">앨리스 달튼 전시회</h2>
          <span className="text-sm text-textGray">더현대 서울</span>
        </div>
      </div>
      {/* Topics */}
      <div className="">
        <div className="flex items-center justify-between">
          <span className="text-textGray text-sm">Trending in South Korea</span>
          <NextImage
            src="/icons/infoMore.svg"
            alt="info"
            width={16}
            height={16}
          />
        </div>
        <h2 className="text-textGrayLight font-bold">OpenAI</h2>
        <span className="text-textGray text-sm">20K posts</span>
      </div>
      {/* Topics */}
      <div className="">
        <div className="flex items-center justify-between">
          <span className="text-textGray text-sm">Trending in South Korea</span>
          <NextImage
            src="/icons/infoMore.svg"
            alt="info"
            width={16}
            height={16}
          />
        </div>
        <h2 className="text-textGrayLight font-bold">에스파</h2>
        <span className="text-textGray text-sm">15.3K posts</span>
      </div>
      {/* Topics */}
      <div className="">
        <div className="flex items-center justify-between">
          <span className="text-textGray text-sm">Trending in South Korea</span>
          <NextImage
            src="/icons/infoMore.svg"
            alt="info"
            width={16}
            height={16}
          />
        </div>
        <h2 className="text-textGrayLight font-bold">뮤지컬 데스노트</h2>
        <span className="text-textGray text-sm">4,000 posts</span>
      </div>
      <Link href="/" className="text-iconBlue">
        Show More
      </Link>
    </div>
  );
};

export default PopularTags;
