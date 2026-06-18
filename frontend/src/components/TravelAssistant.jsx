import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { askTravelAssistant } from "../services/api";
import "./TravelAssistant.css";

function TravelAssistant({ location }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      const response = await askTravelAssistant(
        location,
        question
      );

      setAnswer(response.answer);
    } catch (error) {
      setAnswer(
        error.message ||
        "Failed to get response."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-ai-container">

      <h2>Travel Assistant</h2>

      <p>
        Ask about hotels, attractions,
        food, transport, safety and
        tourism.
      </p>

      <textarea
        placeholder="Ask something about this location..."
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
      />

      <button
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? "🤖 Generating Travel Guide..." : "🚀 Ask AI"}
      </button>

      {answer && (
        <div className="travel-ai-response">
          <h3>🌍 Travel Advice</h3>

          <div className="markdown-output">
            <ReactMarkdown>
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}

    </div>
  );
}

export default TravelAssistant;