import React from "react";

const MetricsTable = ({ results }) => {
  const calculateAverages = (metrics) => {
    const waitingTimes = Object.values(metrics.waitingTimes);
    const turnaroundTimes = Object.values(metrics.turnaroundTimes);

    const avgWaiting =
      waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length;
    const avgTurnaround =
      turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length;

    const n = waitingTimes.length;
    const sumWaiting = waitingTimes.reduce((a, b) => a + b, 0);
    const sumSquaredWaiting = waitingTimes.reduce((a, b) => a + b * b, 0);
    const fairness = (sumWaiting * sumWaiting) / (n * sumSquaredWaiting);

    return {
      avgWaiting: avgWaiting.toFixed(2),
      avgTurnaround: avgTurnaround.toFixed(2),
      fairness: (fairness * 100).toFixed(1),
      deadlineMisses: metrics.deadlineMisses,
      contextSwitches: metrics.contextSwitches,
    };
  };

  const algorithmMetrics = Object.entries(results).map(([name, result]) => ({
    name,
    ...calculateAverages(result.metrics),
  }));

  const bestWaiting = Math.min(...algorithmMetrics.map(m => parseFloat(m.avgWaiting)));
  const bestTurnaround = Math.min(...algorithmMetrics.map(m => parseFloat(m.avgTurnaround)));
  const bestFairness = Math.max(...algorithmMetrics.map(m => parseFloat(m.fairness)));
  const leastDeadlineMisses = Math.min(...algorithmMetrics.map(m => m.deadlineMisses));
  const leastContextSwitches = Math.min(...algorithmMetrics.map(m => m.contextSwitches));

  const Badge = ({ children }) => (
    <span className="ml-2 inline-block min-w-[40px] text-center rounded-full bg-indigo-500 text-white px-2 py-0.5 text-xs font-semibold">
      {children}
    </span>
  );

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Performance Metrics Comparison
      </h3>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full border-collapse table-fixed">
          <thead className="bg-muted/50">
            <tr>
              {[
                { label: "Algorithm", width: "18%" },
                { label: "Avg Waiting Time (s)", width: "16%" },
                { label: "Avg Turnaround Time (s)", width: "18%" },
                { label: "Fairness Index (%)", width: "16%" },
                { label: "Deadline Misses", width: "16%" },
                { label: "Context Switches", width: "16%" },
              ].map((header, i) => (
                <th
                  key={i}
                  className={`px-3 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                  style={{ width: header.width }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border bg-card">
            {algorithmMetrics.map((metric, idx) => (
              <tr key={idx} className="hover:bg-muted/40 transition-colors text-sm">
                <td className="px-3 py-2 font-medium text-left text-foreground">
                  {metric.name}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {metric.avgWaiting}
                  {parseFloat(metric.avgWaiting) === bestWaiting ? (
                    <Badge>Best</Badge>
                  ) : (
                    <span className="inline-block w-[42px]" />
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {metric.avgTurnaround}
                  {parseFloat(metric.avgTurnaround) === bestTurnaround ? (
                    <Badge>Best</Badge>
                  ) : (
                    <span className="inline-block w-[42px]" />
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {metric.fairness}
                  {parseFloat(metric.fairness) === bestFairness ? (
                    <Badge>Best</Badge>
                  ) : (
                    <span className="inline-block w-[42px]" />
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {metric.deadlineMisses}
                  {metric.deadlineMisses === leastDeadlineMisses ? (
                    <Badge>Best</Badge>
                  ) : (
                    <span className="inline-block w-[42px]" />
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {metric.contextSwitches}
                  {metric.contextSwitches === leastContextSwitches ? (
                    <Badge>Best</Badge>
                  ) : (
                    <span className="inline-block w-[42px]" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <h4 className="font-semibold mb-2 text-foreground">Metric Definitions:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Waiting Time:</strong> Time a job spends in the ready queue before execution</li>
          <li><strong>Turnaround Time:</strong> Total time from arrival to completion</li>
          <li><strong>Fairness Index:</strong> Jain’s Fairness Index (higher = more fair, max 100%)</li>
          <li><strong>Deadline Misses:</strong> Number of jobs that exceeded their deadline</li>
          <li><strong>Context Switches:</strong> Number of times CPU switched between jobs</li>
        </ul>
      </div>
    </div>
  );
};

export default MetricsTable;
