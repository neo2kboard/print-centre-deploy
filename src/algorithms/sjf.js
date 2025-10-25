/**
 * Shortest Job First (SJF) Non-Preemptive Scheduling Algorithm
 * Selects the job with the shortest burst time from ready queue
 */

export const sjf = (jobs) => {
  const remainingJobs = [...jobs];
  let currentTime = 0;
  const ganttChart = [];
  const metrics = {
    waitingTimes: {},
    turnaroundTimes: {},
    completionTimes: {},
    contextSwitches: 0,
    deadlineMisses: 0
  };

  while (remainingJobs.length > 0) {
    // Get jobs that have arrived by current time
    const availableJobs = remainingJobs.filter(j => j.arrivalTime <= currentTime);
    
    if (availableJobs.length === 0) {
      // No jobs available, jump to next arrival
      currentTime = Math.min(...remainingJobs.map(j => j.arrivalTime));
      continue;
    }

    // Select job with shortest burst time
    availableJobs.sort((a, b) => a.burstTime - b.burstTime);
    const selectedJob = availableJobs[0];
    
    const startTime = currentTime;
    const endTime = startTime + selectedJob.burstTime;
    
    ganttChart.push({
      jobId: selectedJob.id,
      jobName: selectedJob.name,
      start: startTime,
      end: endTime,
      duration: selectedJob.burstTime
    });

    metrics.waitingTimes[selectedJob.id] = startTime - selectedJob.arrivalTime;
    metrics.turnaroundTimes[selectedJob.id] = endTime - selectedJob.arrivalTime;
    metrics.completionTimes[selectedJob.id] = endTime;
    
    if (endTime > selectedJob.deadline) {
      metrics.deadlineMisses++;
    }

    currentTime = endTime;
    
    if (ganttChart.length > 1) {
      metrics.contextSwitches++;
    }

    // Remove selected job
    const index = remainingJobs.findIndex(j => j.id === selectedJob.id);
    remainingJobs.splice(index, 1);
  }

  return { ganttChart, metrics };
};
