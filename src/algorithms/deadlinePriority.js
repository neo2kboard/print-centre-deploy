export const deadlinePriority = (jobs) => {
  const remainingJobs = [...jobs];
  let currentTime = 0;
  const ganttChart = [];
  const metrics = { waitingTimes: {}, turnaroundTimes: {}, completionTimes: {}, contextSwitches: 0, deadlineMisses: 0 };

  while (remainingJobs.length > 0) {
    const availableJobs = remainingJobs.filter(j => j.arrivalTime <= currentTime);
    
    // Idle handling
    if (!availableJobs.length) {
      currentTime = Math.min(...remainingJobs.map(j => j.arrivalTime));
      continue;
    }

    // Calculate Urgency Score
    // Formula: (Time Left until Deadline) * Priority
    // Lower score = Higher Urgency
    availableJobs.forEach(j => {
      const timeToDeadline = j.deadline - currentTime;
      // Note: If deadline passed, score becomes negative, increasing priority further
      j.urgencyScore = timeToDeadline * j.priority;
    });

    // Sort: Lowest Score First. Tie-breaker: Priority (1 is high, 4 is low)
    availableJobs.sort((a, b) => a.urgencyScore - b.urgencyScore || a.priority - b.priority);
    
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
    
    remainingJobs.splice(remainingJobs.findIndex(j => j.id === selectedJob.id), 1);
  }

  return { ganttChart, metrics };
};