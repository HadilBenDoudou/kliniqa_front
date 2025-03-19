import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ResponsiveContainer,
} from "recharts";

// Sample data for the health statistics (replace with actual data)
const data = [
  { name: "Jan", value: 70 },
  { name: "Feb", value: 65 },
  { name: "Mar", value: 80 },
  { name: "Apr", value: 75 },
  { name: "May", value: 90 },
  { name: "Jun", value: 85 },
  { name: "Jul", value: 70 },
  { name: "Aug", value: 60 },
  { name: "Sep", value: 75 },
  { name: "Oct", value: 80 },
  { name: "Nov", value: 70 },
  { name: "Dec", value: 85 },
];

const LineChart: React.FC = () => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* Cartesian Grid for background lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          {/* X-Axis for months */}
          <XAxis
            dataKey="name"
            stroke="#888"
            tick={{ fontSize: 12, fill: "#666" }}
          />

          {/* Y-Axis for values */}
          <YAxis
            stroke="#888"
            tick={{ fontSize: 12, fill: "#666" }}
            domain={[50, 100]} // Adjust based on your data range
          />

          {/* Tooltip for hover information */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            labelStyle={{ color: "#333" }}
          />

          {/* Gradient Area fill below the line */}
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2d2dc1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2d2dc1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#colorGradient)"
          />

          {/* Line for the health data */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2d2dc1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: "#2d2dc1", stroke: "#fff", strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;