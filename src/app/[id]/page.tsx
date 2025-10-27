import ProfileClient from "./ProfileClient";
import ProfileTitle from "./ProfileTitle";

import Link from "next/link";
import NextImage from "next/image";

type Params = { id: string };

export default async function ProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <div className="">
      {/* Profile Title */}
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <Link href="/">
          <NextImage src="/icons/back.svg" alt="back" width={24} height={24} />
        </Link>

        {/* author 이름은 ProfileClient 내부에서 렌더링 */}
        <h1 className="font-bold text-lg">
          <ProfileTitle id={id} />
        </h1>
      </div>

      <ProfileClient id={id} />
    </div>
  );
}
