import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <section className="max-w-xl w-full text-center space-y-6">
        <p aria-hidden className="text-6xl font-extrabold tracking-tight">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold">
          페이지를 찾을 수 없어요
        </h1>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="rounded-full bg-white text-black font-bold px-4 py-2"
          >
            홈으로 가기
          </Link>
        </div>

        <p className="text-xs text-textGray">
          계속 문제가 발생하면 서비스 상태 를 확인하세요.
        </p>
      </section>
    </main>
  );
}
