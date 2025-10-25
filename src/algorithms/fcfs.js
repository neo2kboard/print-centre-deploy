/**
 * First Come First Serve (FCFS) Scheduling Algorithm
 * Jobs are executed in the order they arrive
 */

export const fcfs = (jobs) => {
  const sortedJobs = [...jobs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let currentTime = 0;
  const ganttChart = [];
  const metrics = {
    waitingTimes: {},
    turnaroundTimes: {},
    completionTimes: {},
    contextSwitches: 0,
    deadlineMisses: 0
  };

  sortedJobs.forEach((job, index) => {
    const startTime = Math.max(currentTime, job.arrivalTime);
    const endTime = startTime + job.burstTime;
    
    ganttChart.push({
      jobId: job.id,
      jobName: job.name,
      start: startTime,
      end: endTime,
      duration: job.burstTime
    });

    metrics.waitingTimes[job.id] = startTime - job.arrivalTime;
    metrics.turnaroundTimes[job.id] = endTime - job.arrivalTime;
    metrics.completionTimes[job.id] = endTime;
    
    if (endTime > job.deadline) {
      metrics.deadlineMisses++;
    }

    currentTime = endTime;
    
    if (index > 0) {
      metrics.contextSwitches++;
    }
  });

  return { ganttChart, metrics };
};
