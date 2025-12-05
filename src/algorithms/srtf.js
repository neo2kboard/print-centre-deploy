export const srtf = (jobs) => {
  // Create a deep copy to manage remaining time
  const jobsWithRemaining = jobs.map((j) => ({ ...j, remainingTime: j.burstTime }));
  
  let currentTime = 0;
  let completedCount = 0; // Track how many jobs are done
  const n = jobs.length;
  
  const ganttChart = [];
  const metrics = {
    waitingTimes: {},
    turnaroundTimes: {},
    completionTimes: {},
    contextSwitches: 0,
    deadlineMisses: 0,
  };
  
  let lastJobId = null;

  // LOOP until all jobs are completed
  while (completedCount < n) {
    // 1. Find jobs that have arrived AND are not finished
    const availableJobs = jobsWithRemaining.filter(
      (j) => j.arrivalTime <= currentTime && j.remainingTime > 0
    );

    // If CPU is idle (no jobs yet)
    if (availableJobs.length === 0) {
      // Optional: Record "Idle" time in Gantt chart if you want
      currentTime++;
      continue;
    }

    // 2. Sort by Remaining Time (Ascending)
    // TIE BREAKER: If remaining time is equal, pick the one that arrived first (FCFS)
    availableJobs.sort((a, b) => {
      if (a.remainingTime === b.remainingTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.remainingTime - b.remainingTime;
    });

    const selectedJob = availableJobs[0];

    // 3. Check for Context Switch
    // We only count it if the ID changed and the previous ID wasn't null
    if (lastJobId && lastJobId !== selectedJob.id) {
      metrics.contextSwitches++;
    }
    lastJobId = selectedJob.id;

    // 4. Update Gantt Chart
    // Optimization: If the same job is continuing, extend the previous block
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
        duration: 1,
        deadline: selectedJob.deadline,
      });
    }

    // 5. Process the job for 1 second
    selectedJob.remainingTime--;
    currentTime++;

    // 6. Check if Job is Finished
    if (selectedJob.remainingTime === 0) {
      completedCount++; // Increment counter
      
      const finishTime = currentTime;
      metrics.completionTimes[selectedJob.id] = finishTime;
      metrics.turnaroundTimes[selectedJob.id] = finishTime - selectedJob.arrivalTime;
      metrics.waitingTimes[selectedJob.id] = 
        metrics.turnaroundTimes[selectedJob.id] - selectedJob.burstTime;

      if (finishTime > selectedJob.deadline) {
        metrics.deadlineMisses++;
      }
    }
  }

  return { ganttChart, metrics };
};