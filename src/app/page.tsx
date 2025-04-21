import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">CMNY Event Management</h1>
      <p className="text-lg">Manage rehearsal schedules and parts</p>
      <Image
        src="/logo.png"
        alt="CMNY Logo"
        width={200}
        height={200}
        className="rounded-full"
      />
    </main>
  );
}
