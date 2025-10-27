import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="min-h-[50vh] flex items-center justify-center px-4">
      <section className="max-w-lg w-full text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          프로필을 찾을 수 없어요
        </h1>
        <p className="text-textGray">
          해당 사용자가 존재하지 않거나 비공개 계정일 수 있어요.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-full bg-white text-black font-bold px-4 py-2"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
