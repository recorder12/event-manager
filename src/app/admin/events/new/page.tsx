"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

export default function AdminEventCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = DateTime.fromFormat(eventDate, "yyyy-MM-dd'T'HH:mm", {
      zone: "America/New_York",
    });

    if (!parsed.isValid) {
      console.error("Invalid event date:", eventDate);
      alert("Invalid event date format");
      return;
    }

    const eventDateInUTC = parsed.toUTC().toISO();

    const res = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        location,
        event_date: eventDateInUTC,
        type,
        visibility,
        organizationId: "6805ae5681bb9f8d8d58000b",
      }),
    });

    const resJson = await res.json();

    if (res.ok) {
      router.push(`/admin/events/${resJson.data._id}`);
    } else {
      alert(`Failed to create event: ${resJson.message}`);
    }
  };

  return (
    <div className="min-h-screen max-w-xl mx-auto p-6 mt-12">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Event description"
          className="w-full border p-3 rounded min-h-[120px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />

        <div className="flex gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PUBLIC" | "PRIVATE")}
            className="w-1/2 border p-2 rounded"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>

          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "PUBLIC" | "PRIVATE")
            }
            className="w-1/2 border p-2 rounded"
          >
            <option value="PUBLIC">Visible to all</option>
            <option value="PRIVATE">Organization only</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
