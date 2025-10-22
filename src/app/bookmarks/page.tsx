import BookmarksClient from "./BookmarksClient";

export default function BookmarksPage() {
  return (
    <div>
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
        <h1 className="font-bold text-lg">Bookmarks</h1>
      </div>
      <BookmarksClient />
    </div>
  );
}
