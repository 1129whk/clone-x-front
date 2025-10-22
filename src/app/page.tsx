import Feed from "@/components/posts/Feed";
import Share from "@/components/posts/Share";
import Link from "next/link";

const Homepage = () => {
  return (
    <div className="">
      <div className="px-4 pt-4 flex justify-evenly text-textGray font-bold border-b border-borderGray">
        <Link
          className="pb-3 flex items-center border-b-4 border-iconBlue"
          href="/"
        >
          For you
        </Link>
        <Link className="pb-3 flex items-center" href="/">
          Following
        </Link>
      </div>
      <Share />
      <Feed />
    </div>
  );
};

export default Homepage;
