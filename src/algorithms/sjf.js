export const sjf = (jobs) => {
  const remainingJobs = [...jobs];
  let currentTime = 0;
  const ganttChart = [];
  const metrics = { waitingTimes: {}, turnaroundTimes: {}, completionTimes: {}, contextSwitches: 0, deadlineMisses: 0 };

  while (remainingJobs.length > 0) {
    // Find jobs that have arrived
    const availableJobs = remainingJobs.filter(j => j.arrivalTime <= currentTime);

    // If no jobs available, CPU is idle -> Jump to next arrival
    if (!availableJobs.length) {
      currentTime = Math.min(...remainingJobs.map(j => j.arrivalTime));
      continue;
    }

    // Sort by Burst Time (Ascending)
    availableJobs.sort((a, b) => a.burstTime - b.burstTime);
    const selectedJob = availableJobs[0];

    const startTime = currentTime;
    const endTime = startTime + selectedJob.burstTime;

    ganttChart.push({
      jobId: selectedJob.id,
      jobName: selectedJob.name,
      start: startTime,
      end: endTime,
      duration: selectedJob.burstTime,
      deadline: selectedJob.deadline 
    });

    metrics.waitingTimes[selectedJob.id] = startTime - selectedJob.arrivalTime;
    metrics.turnaroundTimes[selectedJob.id] = endTime - selectedJob.arrivalTime;
    metrics.completionTimes[selectedJob.id] = endTime;
    
    if (endTime > selectedJob.deadline) metrics.deadlineMisses++;

    currentTime = endTime;
    if (ganttChart.length > 1) metrics.contextSwitches++;

    // Remove executed job
    remainingJobs.splice(remainingJobs.findIndex(j => j.id === selectedJob.id), 1);
  }

  return { ganttChart, metrics };
};