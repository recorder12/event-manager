"use client";

import { useEffect, useState } from "react";

type ProfileData = {
  email: string;
  first_name: string;
  last_name: string;
  profile?: string;
};

export default function Profile() {
  const [formData, setFormData] = useState<ProfileData>({
    email: "",
    first_name: "",
    last_name: "",
    profile: "",
  });

  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // ✅ 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/me/profile", {
          method: "POST",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // ✅ 변경 여부 감지
  useEffect(() => {
    if (!originalData) return;
    const changed =
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name ||
      formData.profile !== originalData.profile;
    setIsModified(changed);
  }, [formData, originalData]);

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  // ✅ 저장 핸들러 (edit endpoint로 POST)
  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/me/profile/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          profile: formData.profile,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setOriginalData(updated);
      setIsModified(false);
      setStatus("saved");
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold mb-8">Profile</h2>

      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={formData.email}
          disabled
          className="w-full border border-gray-300 bg-gray-100 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Last Name</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={handleChange("last_name")}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">First Name</label>
        <input
          type="text"
          value={formData.first_name}
          onChange={handleChange("first_name")}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="flex justify-end items-center">
        <button
          onClick={handleSave}
          disabled={!isModified || status === "saving"}
          className={` px-4 py-2 mt-4 rounded transition 
    ${
      isModified && status !== "saving"
        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }`}
        >
          {status === "saving"
            ? "Saving..."
            : status === "saved"
            ? "✅ Saved"
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
