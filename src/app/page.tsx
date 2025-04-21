import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex w-2/3 min-h-screen flex-col items-center justify-center px-6 py-20 text-center bg-gray-50">
      {/* 로고 + 타이틀 */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/images/logo.png"
          alt="Collegium Musicum NY Logo"
          width={200}
          height={200}
          className="mb-12"
        />
        <h1 className="text-5xl font-extrabold text-gray-900">
          Collegium Musicum New York
        </h1>
      </div>

      {/* 설명 문구 */}
      <p className="text-xl text-gray-700 max-w-2xl mb-6">
        Collegium Musicum New York, a Manhattan-based professional orchestra,
        supports early-career musicians through abundant ensemble music making
        opportunities and career development resources.
      </p>
      <p className="text-md text-gray-600 max-w-xl">
        Explore our site to learn more about our mission.
      </p>
    </main>
  );
}
