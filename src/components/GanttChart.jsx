import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "../hooks/use-mobile";

// Define job-specific colors
const COLORS = {
  J1: "hsl(var(--chart-1))",
  J2: "hsl(var(--chart-2))",
  J3: "hsl(var(--chart-3))",
  J4: "hsl(var(--chart-4))",
  J5: "hsl(var(--chart-5))",
  J6: "hsl(var(--accent))",
};

// Determine bar color based on deadline
const getBarColor = (entry) => {
  // Red if missed deadline, otherwise job-specific color
  return entry.end > entry.deadline
    ? "hsl(var(--destructive))"
    : COLORS[entry.jobId] || "hsl(var(--primary))";
};

// Custom tooltip for job info
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs sm:text-sm max-w-[200px]">
        <p className="font-semibold text-foreground">{data.jobName}</p>
        <p className="text-muted-foreground">Start: {data.start}s</p>
        <p className="text-muted-foreground">End: {data.end}s</p>
        <p className="text-muted-foreground">Duration: {data.duration}s</p>
        <p className="text-muted-foreground">Deadline: {data.deadline}s</p>
        {data.end > data.deadline && (
          <p className="text-[hsl(var(--destructive))] font-medium">
            ⚠ Missed Deadline
          </p>
        )}
      </div>
    );
  }
  return null;
};

const GanttChart = ({ data, algorithm }) => {
  const isMobile = useIsMobile();

  // Create unique keys for repeated job segments
  const jobCounts = {};
  const groupedData = data.map((seg) => {
    jobCounts[seg.jobName] = (jobCounts[seg.jobName] || 0) + 1;
    return {
      jobId: seg.jobId,
      jobName: seg.jobName,
      jobKey: `${seg.jobName}-${jobCounts[seg.jobName]}`,
      start: seg.start,
      end: seg.end,
      duration: seg.end - seg.start,
      deadline: seg.deadline, // required for red bar logic
    };
  });

  const chartHeight = isMobile ? 280 : 340;
  const leftMargin = isMobile ? 20 : 40;

  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm ${
        isMobile ? "p-3" : "p-6"
      }`}
    >
      <h3
        className={`${
          isMobile ? "text-base text-center mb-4" : "text-lg mb-4"
        } font-semibold text-foreground`}
      >
        Gantt Chart: {algorithm}
      </h3>

      <div className="w-full flex justify-center overflow-x-auto">
        <div
          className={`${
            isMobile ? "w-[420px] sm:w-[480px]" : "w-full max-w-5xl"
          } h-[260px] sm:h-[340px] flex justify-center`}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={groupedData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: leftMargin,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                label={
                  !isMobile
                    ? {
                        value: "Time (seconds)",
                        position: "insideBottom",
                        offset: -10,
                      }
                    : undefined
                }
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                type="category"
                dataKey="jobKey"
                width={isMobile ? 50 : 70}
                tickFormatter={(v) => v.split("-")[0]}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} wrapperStyle={{ outline: "none" }} />

              {/* Invisible start to offset bars */}
              <Bar dataKey="start" stackId="a" fill="transparent" />

              {/* Duration bars */}
              <Bar dataKey="duration" stackId="a">
                {groupedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center gap-2 mt-5 justify-center text-xs ${isMobile ? "text-[11px]" : "text-sm"} text-muted-foreground`}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[hsl(var(--destructive))]" />
          <span>Missed Deadline</span>
        </div>
        <span className="ml-4 text-[0.75rem]">On time if not red</span>
      </div>
    </div>
  );
};

export default GanttChart;
