export const roundRobin = (jobs, timeQuantum = 2) => {
  const jobsWithRemaining = jobs.map(j => ({ ...j, remainingTime: j.burstTime }));
  let currentTime = 0;
  
  const ganttChart = [];
  const readyQueue = [];
  const metrics = { waitingTimes: {}, turnaroundTimes: {}, completionTimes: {}, contextSwitches: 0, deadlineMisses: 0 };
  
  // Track which jobs have been added to queue to prevent duplicates
  const addedToQueue = new Set();
  let lastJobId = null;

  // Add initial jobs at time 0
  jobsWithRemaining
    .filter(j => j.arrivalTime === 0)
    .forEach(j => {
      readyQueue.push(j);
      addedToQueue.add(j.id);
    });

  // Loop until queue is empty AND all jobs are processed
  while (readyQueue.length > 0 || jobsWithRemaining.some(j => j.remainingTime > 0)) {
    
    // If Queue is empty but jobs remain, jump time to next arrival
    if (readyQueue.length === 0) {
      currentTime++;
      // Check for new arrivals at this new time
      jobsWithRemaining.forEach(j => {
        if (j.arrivalTime <= currentTime && j.remainingTime > 0 && !addedToQueue.has(j.id)) {
          readyQueue.push(j);
          addedToQueue.add(j.id);
        }
      });
      continue;
    }

    const currentJob = readyQueue.shift();

    // Context Switch Check
    if (lastJobId && lastJobId !== currentJob.id) metrics.contextSwitches++;
    lastJobId = currentJob.id;

    // Execute for Quantum OR Remaining Time (whichever is smaller)
    const executionTime = Math.min(timeQuantum, currentJob.remainingTime);
    const startTime = currentTime;
    const endTime = startTime + executionTime;

    ganttChart.push({
      jobId: currentJob.id,
      jobName: currentJob.name,
      start: startTime,
      end: endTime,
      duration: executionTime,
      deadline: currentJob.deadline
    });

    currentJob.remainingTime -= executionTime;
    currentTime = endTime;

    // CRITICAL STEP: Check for new arrivals BEFORE re-queueing the current job
    // This ensures "Fairness" - new jobs get a turn before the current one goes again
    jobsWithRemaining.forEach(j => {
      if (j.arrivalTime <= currentTime && j.remainingTime > 0 && !addedToQueue.has(j.id)) {
        readyQueue.push(j);
        addedToQueue.add(j.id);
      }
    });

    // If job is not done, put back in queue
    if (currentJob.remainingTime > 0) {
      readyQueue.push(currentJob);
    } else {
      // Job Done
      metrics.completionTimes[currentJob.id] = currentTime;
      metrics.turnaroundTimes[currentJob.id] = currentTime - currentJob.arrivalTime;
      metrics.waitingTimes[currentJob.id] = metrics.turnaroundTimes[currentJob.id] - currentJob.burstTime;
      if (currentTime > currentJob.deadline) metrics.deadlineMisses++;
    }
  }

  return { ganttChart, metrics };
};