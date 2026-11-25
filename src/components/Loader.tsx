import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import "./Loader.css";

const loadingMessages = [
  "Finding pieces you'll love",
  "Good taste takes a moment",
  "Curating something special",
  "Your style journey starts here",
  "Almost ready. Stay stylish.",
];

function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="loader-ambient ambient-one" />
      <div className="loader-ambient ambient-two" />

      <div className="loader-visual">
        <div className="loader-orbit orbit-one" />
        <div className="loader-orbit orbit-two" />

        <div className="loader-orb">
          <img src="/shopra.svg" alt="SHOPORA Logo" />
        </div>

        <span className="loader-particle particle-one" />
        <span className="loader-particle particle-two" />
        <span className="loader-particle particle-three" />
      </div>

      <div className="loader-copy">
        <h2>
          SHOPORA<span>.</span>
        </h2>
        <p className="loader-message" key={messageIndex}>
          {loadingMessages[messageIndex]}
        </p>
      </div>

      <div className="loader-progress">
        <div className="loader-progress-fill" />
      </div>

      <div className="loader-caption">
        <Sparkles size={13} />
        <span>CRAFTING YOUR EXPERIENCE</span>
        <span className="loader-dots">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="loader-footer">STYLE IS A WAY TO SAY WHO YOU ARE.</div>
    </div>
  );
}

export default Loader;
