import ProfileClient from "./ProfileClient";

import Link from "next/link";
import { currentUser } from "@/data/currentUser";
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
          <NextImage src="icons/back.svg" alt="back" width={24} height={24} />
        </Link>
        <h1 className="font-bold text-lg">{currentUser.username}</h1>
      </div>
      {/* Information */}
      <div className="">
        {/* Cover & Avatar Container */}
        <div className="relative w-full">
          {/* Cover */}
          <div className="w-full aspect-[3/1] relative overflow-hidden">
            <NextImage
              src={currentUser.coverImage}
              alt={`${currentUser.username} cover`}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
          {/* Avatar */}
          <div className="w-1/5 aspect-square rounded-full overflow-hidden border-4 border-black bg-gray-300 absolute left-4 -translate-y-1/2">
            <NextImage
              src={currentUser.profileImage}
              alt={`${currentUser.username} profile`}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 p-2">
          <button className="py-2 px-4 mt-2 bg-white text-black font-bold rounded-full">
            Edit Profile
          </button>
        </div>
        {/* User Details */}
        <div className="p-4 flex flex-col gap-2">
          {/* Username & Handle */}
          <div className="">
            <h1 className="text-2xl font-bold">{currentUser.username}</h1>
            <span className="text-textGray text-sm">@{currentUser.id}</span>
          </div>
          <p>Hello!</p>
          {/* JOB & LOCATION & DATE */}
          <div className="flex gap-4 text-textGray text-[15px]">
            <div className="flex items-center gap-2">
              <NextImage
                src="icons/userLocation.svg"
                alt="location"
                width={20}
                height={20}
              />
              <span>Korea</span>
            </div>
            <div className="flex items-center gap-2">
              <NextImage
                src="icons/date.svg"
                alt="date"
                width={20}
                height={20}
              />
              <span>Joined October 2025</span>
            </div>
          </div>
          {/* Followings & Followers */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">100</span>
              <span className="text-textGray text-[15px]">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">100</span>
              <span className="text-textGray text-[15px]">Followings</span>
            </div>
          </div>
        </div>
      </div>
      <ProfileClient id={id} />
    </div>
  );
}
