import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [confirmPollId, setConfirmPollId] = useState(null);
  const [ending, setEnding] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`https://backend-live-poller.onrender.com/api/poll/my-polls`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPolls(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const endPoll = async (pollId) => {
    setEnding(true);
    try {
      await axios.put(
        `https://backend-live-poller.onrender.com/api/poll/end/${pollId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPolls(prev =>
        prev.map(p =>
          p._id === pollId ? { ...p, isActive: false } : p
        )
      );

      setConfirmPollId(null);
    } catch {
      alert("Failed to end poll");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 My Polls</h1>
            <p className="text-sm text-gray-500">
              Manage and monitor your live polls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/create-poll")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400"
            >
              + Create Poll
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {polls.length === 0 ? (
          <div className="text-center text-gray-500 mt-24">
            <p className="text-xl font-medium">No polls yet</p>
            <p className="mt-2 text-sm">
              Create your first poll to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((p) => (
              <div
                key={p._id}
                className="relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
              >
                {/* End Poll */}
                {p.isActive && (
                  <button
                    onClick={() => setConfirmPollId(p._id)}
                    className="absolute top-4 right-4 text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100"
                  >
                    End Poll
                  </button>
                )}

                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {p.question}
                  </h3>

                  <span
                    className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-medium ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.isActive ? "Active" : "Ended"}
                  </span>

                  <div className="mt-auto pt-6">
                    <button
                      onClick={() => navigate(`/poll/${p._id}`)}
                      className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-black transition"
                    >
                      Open Poll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CONFIRM MODAL */}
      {confirmPollId && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              End this poll?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              This will immediately stop voting and cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmPollId(null)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => endPoll(confirmPollId)}
                disabled={ending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {ending ? "Ending..." : "Yes, End Poll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
