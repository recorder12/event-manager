"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error, mutate } = useSWR(
    `/api/events/${id}`,
    fetcher
  );
  const event = data?.data;

  const [confirming, setConfirming] = useState(false);

  const handleConfirmParticipants = async () => {
    setConfirming(true);
    const res = await fetch(`/api/events/${id}/confirm-participants`, {
      method: "POST",
    });
    setConfirming(false);

    if (res.ok) {
      await mutate(); // SWR 캐시 갱신
      alert("Participants confirmed");
    } else {
      alert("Error confirming participants");
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error || !event)
    return <div className="p-4 text-red-500">Failed to load event</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{event.description}</h1>
      <p className="text-gray-600">
        {new Date(event.event_date).toLocaleString()}
      </p>
      <p className="text-gray-500">{event.location}</p>

      <div className="flex justify-between items-center mt-4">
        <h2 className="text-xl font-semibold">Activities</h2>
        <Link
          href={`/admin/activities/new?eventId=${id}`}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          + Add Activity
        </Link>
      </div>

      <div className="space-y-4">
        {event.activities?.length > 0 ? (
          event.activities.map((activity: any) => (
            <div key={activity._id} className="border p-4 rounded">
              <p className="font-semibold">{activity.title}</p>
              {activity.parts?.length > 0 ? (
                <ul className="text-sm text-gray-600 list-disc ml-4 mt-2">
                  {activity.parts.map((part: any) => (
                    <li key={part._id}>
                      {part.name} ({part.applicants.length}/{part.limitation})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm mt-1">No parts</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No activities yet.</p>
        )}
      </div>

      {!event.is_participants_confirmed && (
        <button
          onClick={handleConfirmParticipants}
          disabled={confirming}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6"
        >
          {confirming ? "Confirming..." : "Confirm Participants"}
        </button>
      )}

      {event.is_participants_confirmed && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Confirmed Participants</h3>
          <ul className="text-sm text-gray-700 mt-2">
            {event.confirmed_participants.map((u: any) => (
              <li key={u}>{u}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mt-4">Absent Applicants</h3>
          <ul className="text-sm text-red-600 mt-2">
            {event.absent_applicants.map((u: any) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
