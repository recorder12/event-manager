"use client";

import { useState } from "react";

interface Part {
  _id: string;
  name: string;
  limitation: number;
  applicants: any[];
  order: number;
}

interface Props {
  activityId: string;
  part: Part;
  onUpdate: () => void;
}

export function AdminPartCard({ activityId, part, onUpdate }: Props) {
  const [name, setName] = useState(part.name);
  const [limitation, setLimitation] = useState(part.limitation);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await fetch(`/api/parts/${part._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, name, limitation }),
    });
    if (res.ok) {
      await onUpdate();
      setIsModified(false);
      alert("Part updated");
    } else {
      alert("Failed to update part");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure to delete this part?")) return;

    const res = await fetch(`/api/parts/${part._id}?activityId=${activityId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await onUpdate();
      alert("Part deleted");
    } else {
      alert("Failed to delete part");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setIsModified(true);
        }}
        className="border p-1 rounded w-1/2"
      />
      <input
        type="number"
        value={limitation}
        onChange={(e) => {
          setLimitation(parseInt(e.target.value));
          setIsModified(true);
        }}
        className="border p-1 rounded w-24"
        min={1}
      />
      <button
        onClick={handleSave}
        disabled={!isModified}
        className={`px-2 py-1 rounded text-white ${
          isModified ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
        }`}
      >
        Save
      </button>
      <button
        onClick={handleDelete}
        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  );
}
