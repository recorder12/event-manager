import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex w-2/3 min-h-screen flex-col items-center justify-center px-6 py-20 text-center bg-gray-50">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/images/logo.png"
          alt="Collegium Musicum NY Logo"
          width={200}
          height={200}
          className="mb-8"
        />
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Collegium Musicum New York
        </h1>
      </div>

      {/* Introduction */}
      <div className="max-w-3xl space-y-6">
        <p className="text-xl text-gray-700">
          Collegium Musicum New York is a Manhattan-based professional orchestra
          dedicated to supporting early-career musicians. We offer a wide range
          of ensemble performance opportunities and resources to help emerging
          artists grow and thrive.
        </p>
        <p className="text-md text-gray-600">
          Explore our site to learn more about our mission and how you can get
          involved.
        </p>
      </div>

      {/* Join Us */}
      <div className="mt-16 max-w-xl text-center space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">🎻 Join Us</h2>
        <p className="text-md text-gray-700">
          CMNY is currently welcoming early-career musicians based in New York
          City to join our ensemble. If you're interested, please email a brief
          resume and background to us at:
        </p>
        <p className="text-md font-semibold text-blue-700">
          info@collegiummusicumny.com
        </p>

        <Link
          href="mailto:info@collegiummusicumny.com"
          className="inline-block mt-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Contact Us
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="mt-12 max-w-xl text-center space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          📅 Upcoming Events
        </h2>
        <p className="text-md text-gray-700">
          Information about upcoming events is shared individually via email
          with interested musicians. We look forward to hearing from you!
        </p>
      </div>
    </main>
  );
}
