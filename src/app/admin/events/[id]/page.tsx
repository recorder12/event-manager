"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { AdminActivityCard } from "@/components/ui/AdminActivityCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const defaultParts = [
  { name: "Violin I", limitation: 4 },
  { name: "Violin II", limitation: 4 },
  { name: "Viola", limitation: 2 },
  { name: "Cello", limitation: 2 },
  { name: "Bass", limitation: 2 },
  { name: "Flute", limitation: 5 },
  { name: "Oboe", limitation: 2 },
  { name: "Clarinet", limitation: 5 },
  { name: "Bassoon", limitation: 3 },
  { name: "Horn", limitation: 2 },
  { name: "Trumpet", limitation: 2 },
  { name: "Trombone", limitation: 3 },
  { name: "Timpani", limitation: 1 },
];

export default function AdminEventDetailPage() {
  const { id } = useParams();
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
  const [addingActivity, setAddingActivity] = useState(false);

  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    parts: defaultParts.map((p, index) => ({ ...p, order: index })),
  });

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

  const handleEditEvent = async () => {
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
      alert("Failed to update event");
    }
    setIsSaving(false);
  };

  const handleActivityChange = (
    index: number,
    field: "name" | "limitation",
    value: string | number
  ) => {
    const updated = [...newActivity.parts];
    (updated[index] as any)[field] = value;
    setNewActivity({ ...newActivity, parts: updated });
  };

  const handleRemovePart = (index: number) => {
    const updated = newActivity.parts.filter((_, i) => i !== index);
    setNewActivity({ ...newActivity, parts: updated });
  };

  const handleAddPart = () => {
    const maxOrder =
      newActivity.parts.length > 0
        ? Math.max(...newActivity.parts.map((p) => p.order ?? 0))
        : 0;

    setNewActivity((prev) => ({
      ...prev,
      parts: [...prev.parts, { name: "", limitation: 1, order: maxOrder + 1 }],
    }));
  };

  const handleConfirmActivity = async () => {
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newActivity.title,
        description: newActivity.description,
        eventId: id,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      const activityId = data.data._id;

      for (const part of newActivity.parts) {
        if (!part.name || part.limitation < 1) continue;

        await fetch("/api/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityId,
            name: part.name,
            limitation: part.limitation,
            order: part.order,
          }),
        });
      }

      await mutate();
      setAddingActivity(false);
      setNewActivity({
        title: "",
        description: "",
        parts: defaultParts.map((p, i) => ({ ...p, order: i })),
      });
      alert("Activity and parts created");
    } else {
      alert(data.message || "Failed to create activity");
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error || !event)
    return <div className="p-4 text-red-500">Event not found</div>;

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Event Edit Page</h1>

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
        <div className="flex justify-end">
          <button
            onClick={handleEditEvent}
            disabled={!isModified || isSaving}
            className={`mt-2 px-4 py-2 rounded text-white ${
              isModified ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
            }`}
          >
            {isSaving ? "Saving..." : "Edit"}
          </button>
        </div>
      </div>

      <hr className="my-6" />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activities</h2>
        <button
          onClick={() => setAddingActivity(!addingActivity)}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          {addingActivity ? "Cancel" : "+ Add Activity"}
        </button>
      </div>

      {addingActivity && (
        <div className="border p-4 rounded bg-gray-50 mt-4 space-y-4">
          <input
            type="text"
            placeholder="Activity Title"
            className="w-full border p-2 rounded"
            value={newActivity.title}
            onChange={(e) =>
              setNewActivity({ ...newActivity, title: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={newActivity.description}
            onChange={(e) =>
              setNewActivity({ ...newActivity, description: e.target.value })
            }
          />

          <h4 className="font-semibold text-sm text-gray-600">Parts</h4>
          <div className="space-y-2">
            {newActivity.parts.map((part, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={part.name}
                  onChange={(e) =>
                    handleActivityChange(i, "name", e.target.value)
                  }
                  className="border p-1 rounded w-1/2"
                  placeholder="Part Name"
                />
                <input
                  type="number"
                  value={part.limitation}
                  onChange={(e) =>
                    handleActivityChange(
                      i,
                      "limitation",
                      parseInt(e.target.value)
                    )
                  }
                  className="border p-1 rounded w-24"
                  placeholder="Limit"
                  min={1}
                />
                <button
                  onClick={() => handleRemovePart(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Remove this part"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddPart}
            className="text-sm mr-4 text-blue-600 hover:underline"
          >
            + Add Part
          </button>

          <button
            onClick={handleConfirmActivity}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      )}

      <div className="space-y-4">
        {event.activities?.length > 0 ? (
          event.activities.map((activity: any) => (
            <AdminActivityCard
              key={activity._id}
              activityId={activity._id}
              initialTitle={activity.title}
              initialDescription={activity.description}
              parts={activity.parts}
              onUpdate={mutate}
            />
          ))
        ) : (
          <p className="text-gray-500">No activities yet.</p>
        )}
      </div>
    </div>
  );
}
