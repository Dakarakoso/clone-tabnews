import useSWR from "swr";
import { useState, useEffect } from "react";

async function fetchAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error();
  }
  return response.json();
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) return <div>Loading status...</div>;
  if (error) return <div>Error loading status: {error.message}</div>;

  return (
    <div>
      <h1>Status</h1>
      <UpdatedAt updatedAt={data?.updated_at} />
      <Dependencies dependencies={data?.dependencies} />
    </div>
  );
}

function UpdatedAt({ updatedAt }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const updatedAtDate = updatedAt ? new Date(updatedAt) : null;

  const updatedAtText = updatedAtDate
    ? updatedAtDate.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Unavailable";

  return (
    <div>
      <strong>Last Updated:</strong> {updatedAtText}
    </div>
  );
}

function Dependencies({ dependencies }) {
  const dbInfo = dependencies?.database;

  if (!dbInfo) {
    return <div>No dependency information available.</div>;
  }

  return (
    <div>
      <h2>Database Info</h2>
      <ul>
        <li>
          <strong>Version:</strong> {dbInfo.version}
        </li>
        <li>
          <strong>Max Connections:</strong> {dbInfo.max_connections}
        </li>
        <li>
          <strong>Opened Connections:</strong> {dbInfo.opened_connections}
        </li>
      </ul>
    </div>
  );
}
