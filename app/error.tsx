// app/error.tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void; }) {
  return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-gray-600 mt-2">{error.message || "Please try again."}</p>
        <button onClick={reset} className="mt-4 rounded bg-black px-4 py-2 text-white">
          Try again
        </button>
      </div>  );
}
