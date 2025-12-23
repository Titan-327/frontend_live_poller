import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const updateOption = (index, value) => {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  };

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const submit = async () => {
    setError("");

    if (!question.trim()) {
      return setError("Question is required");
    }

    if (options.some(opt => !opt.trim())) {
      return setError("All options must be filled");
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `https://backend-live-poller.onrender.com/api/poll/create`,
        { question, options },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/poll/${res.data.pollId}`);
    } catch (err) {
      setError("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🗳️ Create New Poll
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poll Question
          </label>
          <input
            type="text"
            placeholder="What is your favorite programming language?"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>

          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />

              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add option */}
        <button
          onClick={addOption}
          className="text-indigo-600 text-sm font-semibold hover:underline mb-6"
        >
          + Add another option
        </button>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? "Creating poll..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}
