/**
 * Shortest Remaining Time First (SRTF) Preemptive Scheduling Algorithm
 * Preemptive version of SJF - switches to job with shortest remaining time
 */

export const srtf = (jobs) => {
  const jobsWithRemaining = jobs.map(j => ({
    ...j,
    remainingTime: j.burstTime
  }));
  
  let currentTime = 0;
  const ganttChart = [];
  const metrics = {
    waitingTimes: {},
    turnaroundTimes: {},
    completionTimes: {},
    contextSwitches: 0,
    deadlineMisses: 0
  };
  
  const maxTime = Math.max(...jobs.map(j => j.arrivalTime + j.burstTime)) * 2;
  let lastJobId = null;

  while (currentTime < maxTime) {
    // Get available jobs
    const availableJobs = jobsWithRemaining.filter(
      j => j.arrivalTime <= currentTime && j.remainingTime > 0
    );

    if (availableJobs.length === 0) {
      currentTime++;
      continue;
    }

    // Select job with shortest remaining time
    availableJobs.sort((a, b) => a.remainingTime - b.remainingTime);
    const selectedJob = availableJobs[0];

    // Track context switch
    if (lastJobId && lastJobId !== selectedJob.id) {
      metrics.contextSwitches++;
    }
    lastJobId = selectedJob.id;

    // Execute for 1 time unit
    const lastEntry = ganttChart[ganttChart.length - 1];
    if (lastEntry && lastEntry.jobId === selectedJob.id) {
      lastEntry.end = currentTime + 1;
      lastEntry.duration++;
    } else {
      ganttChart.push({
        jobId: selectedJob.id,
        jobName: selectedJob.name,
        start: currentTime,
        end: currentTime + 1,
        duration: 1
      });
    }

    selectedJob.remainingTime--;
    currentTime++;

    // Check if job completed
    if (selectedJob.remainingTime === 0) {
      metrics.completionTimes[selectedJob.id] = currentTime;
      metrics.turnaroundTimes[selectedJob.id] = currentTime - selectedJob.arrivalTime;
      metrics.waitingTimes[selectedJob.id] = metrics.turnaroundTimes[selectedJob.id] - selectedJob.burstTime;
      
      if (currentTime > selectedJob.deadline) {
        metrics.deadlineMisses++;
      }
    }

    // Check if all jobs completed
    if (jobsWithRemaining.every(j => j.remainingTime === 0)) {
      break;
    }
  }

  return { ganttChart, metrics };
};
