import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  title: string;
  location: string;
  event_date: string;
};

export default function EventPreviewCard({
  id,
  title,
  location,
  event_date,
}: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure to delete it?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Event deleted");
        router.refresh(); // SWR or router-based refresh
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete event");
      }
    } catch (error) {
      alert("Error deleting event");
      console.error(error);
    }
  };

  return (
    <div
      key={id}
      className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700"
        title="Delete Event"
      >
        ✕
      </button>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-1">
          {new Date(event_date).toLocaleString()}
        </p>
        <p className="text-sm text-gray-400">{location}</p>
      </div>

      <Link
        href={`/admin/events/${id}`}
        className="mt-auto inline-block bg-gray-100 hover:bg-gray-200 text-sm text-blue-600 font-medium px-4 py-2 rounded text-center"
      >
        Manage
      </Link>
    </div>
  );
}
