import { useState, useEffect } from "react";

interface JsonPreviewProps {
  url: string;
}

function JsonPreview({ url }: JsonPreviewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJson() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch JSON data");
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJson();
  }, [url]);

  if (loading) {
    return <div className="p-4">Loading JSON...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 w-full flex justify-center">
      <pre className="text-sm overflow-auto hide-scrollbar">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default JsonPreview;
