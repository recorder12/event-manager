"use client";

import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import EventPreviewCard from "@/components/ui/EventPreviewCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminEventListPage() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR("/api/events", fetcher);

  if (error)
    return <div className="p-4 text-red-600">Failed to load events</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  const events = data?.data || [];

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center m-12 mt-20">
        <h1 className="text-3xl font-bold text-gray-800">Manage Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          + Create Event
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 m-6">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div className="flex flex-col space-y-2" key={event._id}>
                <EventPreviewCard
                  id={event._id}
                  title={event.title}
                  location={event.location}
                  event_date={event.event_date}
                />
                {event.is_closed && (
                  <Link
                    href={`/admin/events/${event._id}/checkout`}
                    className="text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Check Out
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
