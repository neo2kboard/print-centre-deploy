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

const COLORS = {
  J1: "hsl(var(--chart-1))",
  J2: "hsl(var(--chart-2))",
  J3: "hsl(var(--chart-3))",
  J4: "hsl(var(--chart-4))",
  J5: "hsl(var(--chart-5))",
  J6: "hsl(var(--accent))",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs sm:text-sm max-w-[200px]">
        <p className="font-semibold text-foreground">{data.jobName}</p>
        <p className="text-muted-foreground">Start: {data.start}s</p>
        <p className="text-muted-foreground">End: {data.end}s</p>
        <p className="text-muted-foreground">Duration: {data.duration}s</p>
      </div>
    );
  }
  return null;
};

const GanttChart = ({ data, algorithm }) => {
  const isMobile = useIsMobile();

  // ✅ Make each segment unique (even same job multiple times)
  const jobCounts = {};
  const groupedData = data.map((seg) => {
    jobCounts[seg.jobName] = (jobCounts[seg.jobName] || 0) + 1;
    return {
      jobId: seg.jobId,
      jobName: seg.jobName,
      jobKey: `${seg.jobName}-${jobCounts[seg.jobName]}`, // unique key
      start: seg.start,
      end: seg.end,
      duration: seg.end - seg.start,
    };
  });

  const chartHeight = isMobile ? 280 : 340;
  const leftMargin = isMobile ? 40 : 60;

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
            isMobile
              ? "w-[420px] sm:w-[480px]"
              : "w-full max-w-5xl"
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

              {/* ✅ use jobKey for unique rows but display only jobName */}
              <YAxis
                type="category"
                dataKey="jobKey"
                width={isMobile ? 50 : 70}
                tickFormatter={(v) => v.split("-")[0]} // show "J1" not "J1-2"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                wrapperStyle={{ outline: "none" }}
              />

              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="duration" stackId="a">
                {groupedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.jobId] || "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
