"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminEventCreatePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        description,
        location,
        event_date: new Date(eventDate).toISOString(),
        type,
        visibility,
        // CMNY 조직 고정값: 실제 조직 ID로 교체 필요
        organizationId: "6805ae5681bb9f8d8d58000b",
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/admin/events/${data._id}`);
    } else {
      alert(`Failed to create event: ${data.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event description"
          className="w-full border p-2 rounded"
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
