export const srtf = (jobs) => {
  const jobsWithRemaining = jobs.map(j=>({...j, remainingTime:j.burstTime}));
  let currentTime = 0;
  const ganttChart = [];
  const metrics = { waitingTimes:{}, turnaroundTimes:{}, completionTimes:{}, contextSwitches:0, deadlineMisses:0 };
  let lastJobId = null;
  const maxTime = Math.max(...jobs.map(j=>j.arrivalTime+j.burstTime))*2;

  while(currentTime<maxTime){
    const availableJobs = jobsWithRemaining.filter(j=>j.arrivalTime<=currentTime && j.remainingTime>0);
    if(!availableJobs.length){ currentTime++; continue; }
    availableJobs.sort((a,b)=>a.remainingTime-b.remainingTime);
    const selectedJob = availableJobs[0];

    if(lastJobId && lastJobId!==selectedJob.id) metrics.contextSwitches++;
    lastJobId=selectedJob.id;

    const lastEntry = ganttChart[ganttChart.length-1];
    if(lastEntry && lastEntry.jobId===selectedJob.id){
      lastEntry.end = currentTime+1;
      lastEntry.duration++;
    } else {
      ganttChart.push({
        jobId: selectedJob.id,
        jobName: selectedJob.name,
        start: currentTime,
        end: currentTime+1,
        duration:1,
        deadline: selectedJob.deadline  // ✅ Added deadline
      });
    }

    selectedJob.remainingTime--;
    currentTime++;

    if(selectedJob.remainingTime===0){
      metrics.completionTimes[selectedJob.id]=currentTime;
      metrics.turnaroundTimes[selectedJob.id]=currentTime-selectedJob.arrivalTime;
      metrics.waitingTimes[selectedJob.id]=metrics.turnaroundTimes[selectedJob.id]-selectedJob.burstTime;
      if(currentTime>selectedJob.deadline) metrics.deadlineMisses++;
    }
    if(jobsWithRemaining.every(j=>j.remainingTime===0)) break;
  }

  return { ganttChart, metrics };
};
