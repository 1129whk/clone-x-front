import Link from "next/link";
import NextImage from "next/image";
import { currentUser } from "@/data/currentUser";

const menuList = [
  {
    id: 1,
    name: "Homepage",
    link: "/",
    icon: "home.svg",
  },
  {
    id: 2,
    name: "Explore",
    link: "/",
    icon: "explore.svg",
  },
  {
    id: 3,
    name: "Notifications",
    link: "/",
    icon: "notification.svg",
  },
  {
    id: 4,
    name: "Messages",
    link: "/",
    icon: "message.svg",
  },
  {
    id: 5,
    name: "Bookmarks",
    link: "/bookmarks",
    icon: "bookmark.svg",
  },
  {
    id: 7,
    name: "Communities",
    link: "/",
    icon: "community.svg",
  },
  {
    id: 8,
    name: "Premium",
    link: "/",
    icon: "logo.svg",
  },
  { id: 9, name: "Profile", link: `/${currentUser.id}`, icon: "profile.svg" },
  {
    id: 10,
    name: "More",
    link: "/",
    icon: "more.svg",
  },
];

const LeftBar = () => {
  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between pt-2 pb-8">
      {/* Logo Menu Button */}
      <div className="flex flex-col gap-4 text-lg items-center xxl:items-start">
        {/* Logo */}
        <Link href="/" className="p-2 rounded-full hover:bg-[#181818] ">
          <NextImage src="/icons/logo.svg" alt="logo" width={24} height={24} />
        </Link>
        {/* Menu List */}
        <div className="flex flex-col gap-4">
          {menuList.map((item) => (
            <Link
              href={item.link}
              className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4"
              key={item.id}
            >
              <NextImage
                src={`/icons/${item.icon}`}
                alt={item.name}
                width={24}
                height={24}
              />
              <span className="hidden xxl:inline">{item.name}</span>
            </Link>
          ))}
        </div>
        {/* Button */}
        <Link
          href="/compose/post"
          className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center xxl:hidden"
        >
          <NextImage
            src="icons/post.svg"
            alt="new post"
            width={24}
            height={24}
          />
        </Link>
        <Link
          href="/compose/post"
          className="hidden xxl:block bg-white text-black rounded-full font-bold py-2 px-20"
        >
          Post
        </Link>
      </div>
      {/* User */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative rounded-full overflow-hidden">
            <NextImage
              src={currentUser.profileImage}
              alt={currentUser.username}
              width={100}
              height={100}
            />
          </div>
          <div className="hidden xxl:flex flex-col">
            <span className="font-bold">{currentUser.username}</span>
            <span className="text-sm text-textGray">@{currentUser.id}</span>
          </div>
        </div>
        <div className="hidden xxl:block cursor-pointer font-bold">...</div>
      </div>
    </div>
  );
};

export default LeftBar;
