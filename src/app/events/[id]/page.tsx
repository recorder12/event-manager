"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EventPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR(
    `/api/events/${id}`,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error || !data?.data) return <div>Failed to load</div>;

  const event = data.data;
  const eventDate = toZonedTime(event.event_date, "America/New_York");

  const userId = session?.user?.id;

  async function handleChoose(activityId: string, partId: string) {
    try {
      const res = await fetch(`/api/parts/${partId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, partId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.message === "Maximum participants reached") {
          alert("Maximum participants reached for this part");
        } else {
          alert(errorData.message || "Failed to choose part");
        }
        return;
      }

      mutate();
    } catch (error) {
      console.error("Error choosing part:", error);
      alert("Failed to choose part");
    }
  }

  async function handleCancel(activityId: string, partId: string) {
    try {
      const res = await fetch(`/api/parts/${partId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, partId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to choose part");
        return;
      }

      mutate();
    } catch (error) {
      console.error("Error canceling part:", error);
      alert("Failed to cancel part");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border rounded-lg shadow-md p-6 mb-8 bg-white">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          {event.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center sm:space-x-10 text-gray-600 text-md">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span className="font-semibold">Date:</span>
            <span>{format(eventDate, "yyyy-MM-dd HH:mm")}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold">Location:</span>
            <span>{event.location}</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-6 text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      <div className="my-8 space-y-8">
        {event.activities.map((activity: any) => (
          <div
            key={activity._id}
            className="border rounded p-4 space-y-4 mb-20"
          >
            <div>
              <h2 className="text-xl font-semibold">{activity.title}</h2>
              {activity.description && (
                <p className="text-gray-600">{activity.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activity.parts.map((part: any) => {
                const userHasApplied = part.applicants.some(
                  (user: any) => (user?._id || user) === userId
                );

                return (
                  <div
                    key={part._id}
                    className="border rounded p-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold">{part.name}</div>
                      {/* 신청된 사람 리스트 */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                        {Array.from({ length: part.limitation }).map(
                          (_, idx) => {
                            const user = part.applicants[idx];
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg border ${
                                  user
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg mb-2 ${
                                    user ? "bg-blue-500" : "bg-gray-400"
                                  }`}
                                >
                                  👤
                                </div>
                                <div className="text-center text-xs font-medium text-gray-700 px-1">
                                  {user?.first_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : ""}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Choose / Cancel 버튼 */}
                    {userId && (
                      <div className="mt-4">
                        {userHasApplied ? (
                          <button
                            onClick={() => handleCancel(activity._id, part._id)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChoose(activity._id, part._id)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded"
                          >
                            Choose
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
