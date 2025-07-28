import React from "react";

const CollectionLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="rounded-2xl shadow-lg bg-gray-100 p-6 w-[260px] h-[260px] flex flex-col relative animate-pulse">
        {/* Title bar */}
        <div className="h-5 w-2/3 bg-gray-300 rounded mb-2" />
        {/* Subtitle */}
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-6" />
        {/* Overlapping image skeletons */}
        <div className="relative flex-1 flex items-end justify-center mt-2">
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-20 bg-gray-300 rounded-xl shadow-md"
            style={{
              zIndex: 3,
              transform: "translate(-50%, 0) rotate(-6deg)",
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-4 w-32 h-20 bg-gray-200 rounded-xl shadow-md"
            style={{
              zIndex: 2,
              transform: "translate(-50%, 0) rotate(4deg)",
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-8 w-32 h-20 bg-gray-100 rounded-xl shadow-md"
            style={{
              zIndex: 1,
              transform: "translate(-50%, 0) rotate(-2deg)",
            }}
          />
        </div>
        {/* Dots or menu icon (optional) */}
        <div className="absolute top-4 right-4 w-6 h-2 flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default CollectionLoadingState;
