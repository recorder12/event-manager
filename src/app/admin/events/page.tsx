"use client";

import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminEventListPage() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR("/api/events", fetcher);

  if (error)
    return <div className="p-4 text-red-600">Failed to load events</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  const events = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event: any) => (
            <li key={event._id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{event.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">{event.location}</p>
                </div>
                <Link
                  href={`/admin/events/${event._id}`}
                  className="text-blue-600 hover:underline"
                >
                  Manage
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
