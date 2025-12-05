// src/data/generateJobs.ts

// 1. Define Categories to ensure realism
const JOB_TYPES = {
  heavy: [
    "Thesis Print", "Dissertation Draft", "Project Report", "Research Paper", "Design Portfolio"
  ],
  medium: [
    "Lab Manual", "Exam Papers", "Club Poster", "Code Documentation", "Budget Report"
  ],
  light: [
    "CS101 Assignment", "Flyer Design", "Lecture Notes", "Internship Resume", "Visa Application", 
    "Meeting Minutes", "Syllabus", "Event Tickets"
  ]
};

export const generateRandomJobs = (count: number) => {
  const jobs = [];
  
  for (let i = 1; i <= count; i++) {
    // 2. Randomly decide the "weight" of this job
    // 20% chance of Heavy, 30% Medium, 50% Light
    const rand = Math.random();
    let category = "light";
    if (rand < 0.2) category = "heavy";
    else if (rand < 0.5) category = "medium";

    // 3. Pick a name based on category
    const namesList = JOB_TYPES[category as keyof typeof JOB_TYPES];
    const name = namesList[Math.floor(Math.random() * namesList.length)];

    // 4. Generate Pages & Burst based on category
    let pages = 0;
    if (category === "heavy") {
      pages = Math.floor(Math.random() * 80) + 70; // 70 - 150 pages
    } else if (category === "medium") {
      pages = Math.floor(Math.random() * 40) + 25; // 25 - 65 pages
    } else {
      pages = Math.floor(Math.random() * 20) + 5;  // 5 - 25 pages
    }

    // 5. Calculate Realistic Burst Time
    // Assumption: Printer speed is approx 3 pages per simulation second
    const burstTime = Math.ceil(pages / 3);

    // 6. Arrival Time (Spread out more to account for longer bursts)
    const arrivalTime = Math.floor(Math.random() * 30); 

    // 7. Deadline Calculation
    // Logic: Arrival + Burst + (Buffer based on priority/difficulty)
    const buffer = Math.floor(Math.random() * 30) + 10;
    const deadline = arrivalTime + burstTime + buffer;

    // 8. Priority (1-4)
    // Random, but Heavy jobs slightly more likely to be higher priority (lower number)
    let priority = Math.floor(Math.random() * 4) + 1;
    if (category === "heavy" && Math.random() > 0.5) priority = 1;

    jobs.push({
      id: `J${i}`,
      name: name,
      arrivalTime,
      burstTime,
      deadline,
      priority,
      pages
    });
  }

  // Sort by arrival time
  return jobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
};