import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const PollPage = () => {
  const { pollId } = useParams();
  const socketRef = useRef(null);

  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  /* ---------------- FETCH POLL + VOTE STATE ---------------- */
  useEffect(() => {
    const voted = localStorage.getItem(`voted_${pollId}`);
    if (voted) setHasVoted(true);

    axios
      .get(`https://backend-live-poller.onrender.com/api/poll/${pollId}`)
      .then(res => setPoll(res.data))
      .catch(() => setError("Poll not found"));
  }, [pollId]);

  /* ---------------- SOCKET: CONNECT ON PAGE ENTER ---------------- */
  useEffect(() => {
    if (!poll) return;

    socketRef.current = io("https://backend-live-poller.onrender.com");

    socketRef.current.emit("join_poll", { pollId });

    socketRef.current.on("poll_update", updatedPoll => {
      setPoll(updatedPoll);
    });

    socketRef.current.on("vote_error", msg => {
      alert(msg);
    });

    // ✅ disconnect ONLY when leaving page
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [pollId, poll]);

  /* ---------------- VOTE ---------------- */
  const handleVote = (optionId) => {
    if (hasVoted || !poll.isActive) return;

    localStorage.setItem(`voted_${pollId}`, true);
    setHasVoted(true);

    socketRef.current?.emit("cast_vote", { pollId, optionId });
  };

  /* ---------------- STATES ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading poll…</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">

        {/* Question */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          {poll.question}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {poll.options.map(opt => (
            <button
              key={opt._id}
              disabled={!poll.isActive || hasVoted}
              onClick={() => handleVote(opt._id)}
              className={`w-full flex justify-between items-center px-5 py-4 rounded-xl border transition
                ${
                  !poll.isActive || hasVoted
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-indigo-50 hover:border-indigo-400"
                }`}
            >
              <span className="font-medium text-base">
                {opt.text}
              </span>
              <span className="text-sm text-gray-500">
                {opt.voteCount} votes
              </span>
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          {!poll.isActive ? (
            <p className="text-red-600 font-semibold">
              🚫 Poll has ended
            </p>
          ) : hasVoted ? (
            <p className="text-green-600 font-semibold">
              ✅ You have already voted
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Choose one option to submit your vote
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollPage;
