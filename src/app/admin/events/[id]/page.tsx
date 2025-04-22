"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error, mutate } = useSWR(
    `/api/events/${id}`,
    fetcher
  );
  const event = data?.data;

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
  });
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        event_date: DateTime.fromISO(event.event_date).toFormat(
          "yyyy-MM-dd'T'HH:mm"
        ),
      });
    }
  }, [event]);

  useEffect(() => {
    if (!event) return;

    const isChanged =
      form.title !== (event.title || "") ||
      form.description !== (event.description || "") ||
      form.location !== (event.location || "") ||
      form.event_date !==
        DateTime.fromISO(event.event_date).toFormat("yyyy-MM-dd'T'HH:mm");

    setIsModified(isChanged);
  }, [form, event]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async () => {
    setIsSaving(true);
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        location: form.location,
        event_date: DateTime.fromFormat(form.event_date, "yyyy-MM-dd'T'HH:mm", {
          zone: "America/New_York",
        })
          .toUTC()
          .toISO(),
      }),
    });

    if (res.ok) {
      await mutate();
      setIsModified(false);
      alert("Event updated");
    } else {
      alert("Failed to update");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error || !event)
    return <div className="p-4 text-red-500">The event is not found</div>;

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleInput}
          className="w-full border px-3 py-2 rounded"
          placeholder="Title"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleInput}
          className="w-full border px-3 py-2 rounded min-h-[100px]"
          placeholder="Description"
        />
        <input
          type="datetime-local"
          name="event_date"
          value={form.event_date}
          onChange={handleInput}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleInput}
          className="w-full border px-3 py-2 rounded"
          placeholder="Location"
        />

        <button
          onClick={handleEdit}
          disabled={!isModified || isSaving}
          className={`mt-2 px-4 py-2 rounded text-white ${
            isModified
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : "Edit"}
        </button>
      </div>

      <hr className="my-6" />

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
          onClick={async () => {
            setConfirming(true);
            const res = await fetch(`/api/events/${id}/confirm-participants`, {
              method: "POST",
            });
            setConfirming(false);
            if (res.ok) {
              await mutate();
              alert("Participants confirmed");
            } else {
              alert("Error confirming participants");
            }
          }}
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
