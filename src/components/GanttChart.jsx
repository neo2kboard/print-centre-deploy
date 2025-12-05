import React, { useState, useRef } from "react";
import { useIsMobile } from "../hooks/use-mobile";

// --- 1. Helper Functions ---

// Generate color based on Job ID
const getJobColor = (jobId) => {
  const idNum = parseInt(jobId.replace(/\D/g, ""), 10) || 1;
  const colorIndex = ((idNum - 1) % 5) + 1;
  return `hsl(var(--chart-${colorIndex}))`;
};

// --- 2. Tooltip Component (The "Comprehensive" one you liked) ---
const Tooltip = ({ data, position }) => {
  if (!data) return null;

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg p-3 shadow-xl text-xs sm:text-sm max-w-[200px] pointer-events-none transition-opacity duration-75"
      style={{
        left: position.x + 15, // Offset slightly from cursor
        top: position.y + 15,
      }}
    >
      <p className="font-semibold text-foreground">{data.jobName}</p>
      <div className="space-y-1 mt-1">
        <p className="text-muted-foreground">Start: <span className="text-foreground">{data.start}s</span></p>
        <p className="text-muted-foreground">End: <span className="text-foreground">{data.end}s</span></p>
        <p className="text-muted-foreground">Duration: <span className="text-foreground">{data.duration}s</span></p>
        <p className="text-muted-foreground">Deadline: <span className="text-foreground">{data.deadline}s</span></p>
        {data.end > data.deadline && (
          <p className="text-[hsl(var(--destructive))] font-medium mt-1">
            ⚠ Missed Deadline
          </p>
        )}
      </div>
    </div>
  );
};

const GanttChart = ({ data, algorithm }) => {
  const isMobile = useIsMobile();
  
  // State for the custom tooltip
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Calculate dimensions
  const maxTime = Math.max(...data.map((d) => d.end), 1);
  
  // Dynamic Width: If time is long, make chart wider to allow scrolling
  // 1 second = 20px (adjust this multiplier to zoom in/out)
  const pxPerSecond = 20; 
  const minChartWidth = Math.max(600, maxTime * pxPerSecond);

  // 2. Extract Unique Jobs (Sorted by ID usually looks best)
  const uniqueJobs = Array.from(new Set(data.map((d) => d.jobId)))
    .map((id) => {
      const jobInfo = data.find((d) => d.jobId === id);
      return { id, name: jobInfo.jobName, deadline: jobInfo.deadline };
    })
    .sort((a, b) => {
        // Sort numerically J1, J2, J10...
        const numA = parseInt(a.id.replace(/\D/g, ""), 10);
        const numB = parseInt(b.id.replace(/\D/g, ""), 10);
        return numA - numB;
    });

  // 3. Helper for positioning bars
  const getPosition = (time) => `${(time / maxTime) * 100}%`;

  // 4. Mouse Handlers
  const handleMouseEnter = (e, segment) => {
    setTooltipInfo(segment);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipInfo(null);
  };

  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm ${isMobile ? "p-3" : "p-6"}`}>
      <h3 className={`${isMobile ? "text-base text-center mb-4" : "text-lg mb-4"} font-semibold text-foreground`}>
        Gantt Chart: {algorithm}
      </h3>

      {/* --- SCROLLABLE AREA START --- */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        {/* We force a minimum width based on time duration to ensure X-Scroll triggers */}
        <div className="relative" style={{ minWidth: `${minChartWidth}px` }}>
          
          {/* Header (Time Scale) */}
          <div className="flex justify-between text-xs text-muted-foreground border-b border-border pb-2 mb-2 pl-[110px] pr-2">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <span key={pct} style={{ left: `${pct * 100}%`, position: 'absolute', transform: 'translateX(-50%)', paddingLeft: pct === 0 ? '240px' : '0' }}>
                {Math.floor(maxTime * pct)}s
              </span>
            ))}
          </div>

          {/* Rows Container */}
          <div className="space-y-3 mt-6">
            {uniqueJobs.map((job) => (
              <div key={job.id} className="flex items-center group relative h-8">
                
                {/* Y-Axis Label (Fixed Width) */}
                <div className="absolute left-0 w-[100px] text-sm font-medium text-foreground truncate pr-2 z-10 bg-card">
                  {job.name} <span className="text-xs text-muted-foreground ml-1">({job.id})</span>
                </div>

                {/* Timeline Track */}
                <div className="absolute left-[110px] right-0 h-full bg-muted/30 rounded-md overflow-hidden">
                  
                  {/* Deadline Line */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-red-400/50 z-0"
                    style={{ left: getPosition(job.deadline) }}
                  />

                  {/* Data Segments */}
                  {data
                    .filter((d) => d.jobId === job.id)
                    .map((seg, idx) => {
                      const isLate = seg.end > seg.deadline;
                      const color = isLate ? "hsl(var(--destructive))" : getJobColor(job.id);
                      const duration = seg.end - seg.start;
                      
                      return (
                        <div
                          key={idx}
                          onMouseEnter={(e) => handleMouseEnter(e, { ...seg, duration })}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          className="absolute h-full top-0 rounded-sm cursor-pointer hover:brightness-110 hover:shadow-md z-10 flex items-center justify-center border-r border-white/20"
                          style={{
                            left: getPosition(seg.start),
                            width: getPosition(duration),
                            backgroundColor: color,
                          }}
                        >
                          {/* Inner Text (Only if space permits) */}
                          {(duration / maxTime) * minChartWidth > 30 && (
                             <span className="text-[10px] text-white font-bold drop-shadow-md select-none">
                               {duration}s
                             </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Footer */}
          <div className="mt-4 border-t border-border pt-2 pl-[110px] text-xs text-muted-foreground text-center">
             Time (Seconds) — Scroll to view full history
          </div>

        </div>
      </div>
      {/* --- SCROLLABLE AREA END --- */}

      {/* Legend */}
      <div className={`flex items-center gap-4 mt-2 justify-center text-xs ${isMobile ? "text-[11px]" : "text-sm"} text-muted-foreground`}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[hsl(var(--destructive))]" />
          <span>Missed Deadline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-0.5 h-3 bg-red-400/50" />
          <span>Deadline Marker</span>
        </div>
      </div>

      {/* Render the Custom Tooltip via Portal/Fixed Pos */}
      {tooltipInfo && (
        <Tooltip data={tooltipInfo} position={mousePos} />
      )}
    </div>
  );
};

export default GanttChart;