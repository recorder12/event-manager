"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminEventCheckoutPage() {
  const { id } = useParams();
  const { data, isLoading, error, mutate } = useSWR(
    `/api/events/${id}`,
    fetcher
  );
  const event = data?.data;

  const [selectedParticipants, setSelectedParticipants] = useState<
    Record<string, string[]>
  >({});
  const [submitting, setSubmitting] = useState(false);

  //   console.log(event.confirmed_participants);
  //   console.log(event.absent_applicants);

  const toggleParticipant = (partId: string, userId: string) => {
    setSelectedParticipants((prev) => {
      const current = prev[partId] || [];
      if (current.includes(userId)) {
        return { ...prev, [partId]: current.filter((id) => id !== userId) };
      } else {
        return { ...prev, [partId]: [...current, userId] };
      }
    });
  };

  const handleConfirm = async () => {
    if (submitting) return;

    setSubmitting(true);

    const body = {
      parts: Object.entries(selectedParticipants).map(
        ([partId, participants]) => ({
          partId,
          participants,
        })
      ),
    };

    const res = await fetch(`/api/events/${id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Participants confirmed!");
    } else {
      alert("Failed to confirm participants.");
      return;
    }

    setSubmitting(false);
    mutate();
  };

  if (isLoading) return <div className="p-6">Loading event...</div>;
  if (error || !event)
    return <div className="p-6 text-red-500">Event not found</div>;

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto p-8 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        {event.title} - Checkout
      </h1>

      {event.activities.length === 0 && (
        <div className="text-gray-500 text-center">No activities found.</div>
      )}

      {event.activities.map((activity: any) => (
        <div
          key={activity._id}
          className="border border-gray-200 rounded-2xl p-8 bg-white shadow-lg space-y-8"
        >
          <h2 className="text-3xl font-semibold text-gray-800">
            {activity.title}
          </h2>
          {activity.parts.map((part: any) => (
            <div key={part._id} className="space-y-2 mt-6">
              <h3 className="text-xl font-semibold text-gray-700">
                {part.name}
              </h3>
              <div className="flex flex-wrap gap-6">
                {part.applicants.length === 0 && (
                  <div className="text-gray-400 text-sm">No applicants</div>
                )}
                {part.applicants.map((user: any) => {
                  const isSelected = selectedParticipants[part._id]?.includes(
                    user._id
                  );

                  return (
                    <div
                      key={user._id}
                      className={`
                        w-44 p-4 border transition-all duration-150
                        rounded-xl cursor-pointer text-center shadow-sm
                        ${
                          isSelected
                            ? "bg-green-50 border-green-400 ring-2 ring-green-200"
                            : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        }
                        hover:shadow-md
                      `}
                      onClick={() => toggleParticipant(part._id, user._id)}
                    >
                      <div className="font-semibold text-gray-800 text-base">
                        {user.first_name} {user.last_name}
                      </div>
                      {isSelected && (
                        <div className="text-green-600 font-bold mt-1">
                          ✔️ Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {event.is_participants_confirmed && (
        <div>
          <div className="text-red-500 text-center mt-6">
            Participants have already been confirmed for this event.
          </div>
          <div>
            {/* 참가자 리스트 */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">
                ✅ Confirmed Participants
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {event.confirmed_participants.map((user: any) => (
                  <li key={user._id}>
                    {user.first_name} {user.last_name}
                  </li>
                ))}
              </ul>
            </div>

            {/* 결석자 리스트 */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">
                ❌ Absent Applicants
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {event.absent_applicants.map((user: any) => (
                  <li key={user._id}>
                    {user.first_name} {user.last_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-10">
        <button
          onClick={handleConfirm}
          disabled={submitting || event.is_participants_confirmed}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-2xl shadow-lg transition-all duration-150 disabled:opacity-60"
        >
          {submitting ? "Confirming..." : "Confirm Participants"}
        </button>
      </div>
    </div>
  );
}
