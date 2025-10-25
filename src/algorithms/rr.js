/**
 * Round Robin (RR) Scheduling Algorithm
 * Each job gets a fixed time quantum in circular order
 */

export const roundRobin = (jobs, timeQuantum = 2) => {
  const jobsWithRemaining = jobs.map(j => ({
    ...j,
    remainingTime: j.burstTime
  }));
  
  let currentTime = 0;
  const ganttChart = [];
  const readyQueue = [];
  const metrics = {
    waitingTimes: {},
    turnaroundTimes: {},
    completionTimes: {},
    contextSwitches: 0,
    deadlineMisses: 0
  };

  // Add initial jobs to ready queue
  jobsWithRemaining
    .filter(j => j.arrivalTime === 0)
    .forEach(j => readyQueue.push(j));

  let lastJobId = null;

  while (readyQueue.length > 0 || jobsWithRemaining.some(j => j.remainingTime > 0)) {
    // Add newly arrived jobs to queue
    jobsWithRemaining
      .filter(j => j.arrivalTime <= currentTime && j.remainingTime > 0 && !readyQueue.includes(j))
      .forEach(j => {
        if (!readyQueue.includes(j)) {
          readyQueue.push(j);
        }
      });

    if (readyQueue.length === 0) {
      currentTime++;
      continue;
    }

    const currentJob = readyQueue.shift();
    
    // Track context switch
    if (lastJobId && lastJobId !== currentJob.id) {
      metrics.contextSwitches++;
    }
    lastJobId = currentJob.id;

    const executionTime = Math.min(timeQuantum, currentJob.remainingTime);
    const startTime = currentTime;
    const endTime = startTime + executionTime;

    ganttChart.push({
      jobId: currentJob.id,
      jobName: currentJob.name,
      start: startTime,
      end: endTime,
      duration: executionTime
    });

    currentJob.remainingTime -= executionTime;
    currentTime = endTime;

    // Add newly arrived jobs before re-adding current job
    jobsWithRemaining
      .filter(j => j.arrivalTime > startTime && j.arrivalTime <= currentTime && 
                   j.remainingTime > 0 && !readyQueue.includes(j) && j.id !== currentJob.id)
      .forEach(j => readyQueue.push(j));

    if (currentJob.remainingTime > 0) {
      readyQueue.push(currentJob);
    } else {
      // Job completed
      metrics.completionTimes[currentJob.id] = currentTime;
      metrics.turnaroundTimes[currentJob.id] = currentTime - currentJob.arrivalTime;
      metrics.waitingTimes[currentJob.id] = metrics.turnaroundTimes[currentJob.id] - currentJob.burstTime;
      
      if (currentTime > currentJob.deadline) {
        metrics.deadlineMisses++;
      }
    }
  }

  return { ganttChart, metrics };
};
