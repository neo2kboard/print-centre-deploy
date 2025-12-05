export const fcfs = (jobs) => {
  // Sort by arrival time to be safe
  const sortedJobs = [...jobs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  let currentTime = 0;
  const ganttChart = [];
  const metrics = { waitingTimes: {}, turnaroundTimes: {}, completionTimes: {}, contextSwitches: 0, deadlineMisses: 0 };

  sortedJobs.forEach((job, index) => {
    // Handling Idle Time: If next job arrives later than current time, jump forward
    const startTime = Math.max(currentTime, job.arrivalTime);
    const endTime = startTime + job.burstTime;
    
    ganttChart.push({
      jobId: job.id,
      jobName: job.name,
      start: startTime,
      end: endTime,
      duration: job.burstTime,
      deadline: job.deadline
    });

    metrics.waitingTimes[job.id] = startTime - job.arrivalTime;
    metrics.turnaroundTimes[job.id] = endTime - job.arrivalTime;
    metrics.completionTimes[job.id] = endTime;
    
    if (endTime > job.deadline) metrics.deadlineMisses++;
    
    currentTime = endTime;
    
    // Only count context switch if there was a previous job
    if (index > 0) metrics.contextSwitches++;
  });

  return { ganttChart, metrics };
};