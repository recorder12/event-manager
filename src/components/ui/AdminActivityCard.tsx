"use client";

import { useState, useMemo } from "react";
import { AdminPartCard } from "./AdminPartCard";

interface Part {
  _id: string;
  name: string;
  limitation: number;
  applicants: any[];
  order: number;
}

interface Props {
  activityId: string;
  initialTitle: string;
  initialDescription: string;
  parts: Part[];
  onUpdate: () => void;
}

export function AdminActivityCard({
  activityId,
  initialTitle,
  initialDescription,
  parts,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [addingPart, setAddingPart] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartLimit, setNewPartLimit] = useState(1);

  const sortedParts = useMemo(() => {
    return [...parts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [parts]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await fetch(`/api/activities/${activityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      await onUpdate();
      setIsModified(false);
      alert("Activity updated");
    } else {
      alert("Failed to update activity");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure to delete this activity?")) return;
    const res = await fetch(`/api/activities/${activityId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await onUpdate();
      alert("Activity deleted");
    } else {
      alert("Failed to delete activity");
    }
  };

  const handleAddPart = async () => {
    if (!newPartName || newPartLimit < 1) return;

    const maxOrder =
      sortedParts.length > 0
        ? Math.max(...sortedParts.map((p) => p.order ?? 0))
        : 0;

    const res = await fetch("/api/parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId,
        name: newPartName,
        limitation: newPartLimit,
        order: maxOrder + 1,
      }),
    });

    if (res.ok) {
      await onUpdate();
      setAddingPart(false);
      setNewPartName("");
      setNewPartLimit(1);
      alert("Part added");
    } else {
      alert("Failed to add part");
    }
  };

  return (
    <div className="relative">
      {/* Main Card */}
      <div className="border rounded p-4 space-y-4 bg-white">
        <div className="flex justify-between">
          <div className="flex flex-col space-y-2 w-2/3">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsModified(true);
              }}
              className="border p-2 rounded"
            />
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsModified(true);
              }}
              className="border p-2 rounded min-h-[80px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              disabled={!isModified}
              className={`px-3 py-1 rounded text-white ${
                isModified ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              }`}
            >
              {isSaving ? "Saving..." : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Part list */}
        <div className="space-y-2">
          {sortedParts.map((part) => (
            <AdminPartCard
              key={part._id}
              activityId={activityId}
              part={part}
              onUpdate={onUpdate}
            />
          ))}
        </div>

        {/* Add new part */}
        {addingPart ? (
          <div className="space-y-2 mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="border p-1 rounded w-1/2"
                placeholder="Part Name"
              />
              <input
                type="number"
                value={newPartLimit}
                onChange={(e) => setNewPartLimit(parseInt(e.target.value))}
                className="border p-1 rounded w-24"
                min={1}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPart}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm Add
              </button>
              <button
                onClick={() => setAddingPart(false)}
                className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingPart(true)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            + Add Part
          </button>
        )}
      </div>
    </div>
  );
}
