"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface Record {
  id: string;
  dealHealthScore: number | null;
  createdAt: Date | string;
}

export function HistoryChart({ records }: { records: Record[] }) {
  const scored = records
    .filter((r) => r.dealHealthScore !== null)
    .slice()
    .reverse(); // oldest -> newest, left to right

  if (scored.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Health Score over time</CardTitle>
      </CardHeader>
      <CardContent>
        <Line
          data={{
            labels: scored.map((r) => new Date(r.createdAt).toLocaleDateString()),
            datasets: [
              {
                label: "Deal Health Score",
                data: scored.map((r) => r.dealHealthScore as number),
                borderColor: "#b08d57",
                backgroundColor: "#b08d5733",
                tension: 0.3,
                pointBackgroundColor: "#fbf7e8",
              },
            ],
          }}
          options={{
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: { color: "#aab4c9" },
                grid: { color: "#2c3a5c" },
              },
              x: {
                ticks: { color: "#aab4c9" },
                grid: { color: "#2c3a5c" },
              },
            },
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
