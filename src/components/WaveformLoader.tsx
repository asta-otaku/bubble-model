import * as React from "react";

const WaveformLoader: React.FC = () => {
  // Create an array for a fixed number of bars (e.g., 8)
  const bars = Array.from({ length: 8 });

  return (
    <div className="flex items-end space-x-1">
      {bars.map((_, index) => (
        <div
          key={index}
          className="w-2 rounded"
          style={{
            // Each bar's animation is staggered by 0.15 seconds
            animation: `wave 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        ></div>
      ))}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 12px;
            background-color: #f87171; /* red */
          }
          25% {
            height: 24px;
            background-color: #facc15; /* yellow */
          }
          50% {
            height: 36px;
            background-color: #4ade80; /* green */
          }
          75% {
            height: 24px;
            background-color: #60a5fa; /* blue */
          }
        }
      `}</style>
    </div>
  );
};

export default WaveformLoader;
