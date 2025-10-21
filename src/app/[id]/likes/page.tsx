import ProfileClient from "../ProfileClient";
import ProfileTitle from "../ProfileTitle";
import Link from "next/link";
import NextImage from "next/image";

type Params = { id: string };

export default async function ProfileLikesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <NextImage src="/icons/back.svg" alt="back" width={24} height={24} />
        </Link>
        <h1 className="font-bold text-lg">
          <ProfileTitle id={id} />
        </h1>
      </div>

      {/* 초기 탭을 likes로 고정 */}
      <ProfileClient id={id} initialTab="likes" />
    </div>
  );
}
