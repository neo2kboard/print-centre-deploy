import { useState } from "react";
import GanttChart from "../components/GanttChart";
import MetricsTable from "../components/MetricsTable";
import { fcfs } from "../algorithms/fcfs";
import { sjf } from "../algorithms/sjf";
import { srtf } from "../algorithms/srtf";
import { roundRobin } from "../algorithms/rr";
import { deadlinePriority } from "../algorithms/deadlinePriority";

// CHANGED: We still import sampleJobs as the default starting data
import sampleJobs from "../data/sampleJobs.json"; 
// NEW: Import the generator we just created
import { generateRandomJobs } from "../data/generateJobs"; 

import { PrinterIcon, PlayIcon, RotateCcw, RefreshCw } from "lucide-react"; // Added RefreshCw icon
import { toast } from "../hooks/use-toast";

export default function Index() {
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("FCFS");
  const [isRunning, setIsRunning] = useState(false);

  // NEW: Store jobs in state instead of using the raw import directly
  // We initialize it with sampleJobs so the app doesn't start empty
  const [jobs, setJobs] = useState<any[]>(sampleJobs);

  // NEW: Function to handle randomizing
  const handleRandomize = () => {
    const newData = generateRandomJobs(10); // Generate 6 random jobs
    setJobs(newData);
    setResults(null); // Clear old results
    toast({
      title: "Data Randomized",
      description: "Generated 6 new random print jobs.",
    });
  };

  // --- Simulation Function ---
  const runSimulation = async () => {
    setIsRunning(true);
    try {
      // CHANGED: Pass 'jobs' (the state) instead of 'sampleJobs'
      const simulationResults = {
        FCFS: fcfs(JSON.parse(JSON.stringify(jobs))), // Use deep copy to avoid bugs
        SJF: sjf(JSON.parse(JSON.stringify(jobs))),
        SRTF: srtf(JSON.parse(JSON.stringify(jobs))),
        "Round Robin": roundRobin(JSON.parse(JSON.stringify(jobs)), 2),
        "Deadline Priority": deadlinePriority(JSON.parse(JSON.stringify(jobs))),
      };
      setResults(simulationResults);

      toast({
        title: "Simulation Complete",
        description: "Visualization and metrics have been generated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong during the simulation.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // --- Reset Function ---
  const resetSimulation = () => {
    setResults(null);
    setActiveTab("FCFS");
    // Optional: You can choose to reset the data back to sampleJobs here if you want
    // setJobs(sampleJobs); 
    toast({
      title: "🔄 Simulation Reset",
      description: "All data cleared. Ready for a new run.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <PrinterIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold">
              University Print-Centre Queue
            </h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Simulation Controls</h2>
              <p className="text-sm text-gray-500">
                {/* CHANGED: Use dynamic length */}
                Dataset: {jobs.length} print jobs with varying priorities and
                deadlines
              </p>
            </div>

            <div className="flex gap-3">
               {/* NEW: Randomize Button */}
               <button
                onClick={handleRandomize}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className="w-5 h-5" />
                Random Data
              </button>

              <button
                onClick={runSimulation}
                disabled={isRunning}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition
                  ${
                    isRunning
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
              >
                <PlayIcon className="w-5 h-5" />
                {isRunning ? "Running..." : "Run Simulation"}
              </button>

              {results && (
                <button
                  onClick={resetSimulation}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sample Jobs */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">University Print Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CHANGED: Map over 'jobs' (state) instead of 'sampleJobs' (constant) */}
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{job.name}</span>
                  <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                    {job.id}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    Arrival: {job.arrivalTime}s | Burst: {job.burstTime}s
                  </p>
                  <p>
                    Deadline: {job.deadline}s | Priority: {job.priority}
                  </p>
                  <p className="text-gray-500">{job.pages} pages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Tabs */}
            <div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Object.keys(results).map((algorithm) => (
                  <button
                    key={algorithm}
                    onClick={() => setActiveTab(algorithm)}
                    className={`px-4 py-2 rounded-md font-medium ${
                      activeTab === algorithm
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {algorithm}
                  </button>
                ))}
              </div>

              {/* Gantt Chart */}
              <div className="bg-white rounded-xl shadow p-6">
                <GanttChart
                  data={results[activeTab].ganttChart}
                  algorithm={activeTab}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-xl shadow p-6">
              <MetricsTable results={results} />
            </div>
          </div>
        )}

        {/* Algorithm Descriptions (This part remains exactly the same as your code) */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Algorithm Descriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* ... rest of your descriptions code ... */}
             {[
              {
                title: "FCFS (First Come First Serve)",
                desc: "Non-preemptive algorithm that processes jobs in arrival order. Simple but can cause convoy effect.",
              },
              {
                title: "SJF (Shortest Job First)",
                desc: "Non-preemptive algorithm that selects shortest job from ready queue. Minimizes average waiting time.",
              },
              {
                title: "SRTF (Shortest Remaining Time First)",
                desc: "Preemptive SJF that switches to job with shortest remaining time. Optimal for minimum average waiting time.",
              },
              {
                title: "Round Robin",
                desc: "Time-sharing algorithm with fixed time quantum (2s). Provides fair CPU allocation and good response time.",
              },
              {
                title: "Deadline Priority",
                desc: "Combines deadline urgency with priority levels. Calculates urgency score to minimize deadline misses.",
              },
            ].map((algo) => (
              <div key={algo.title}>
                <h4 className="font-semibold text-indigo-600 mb-1">
                  {algo.title}
                </h4>
                <p className="text-sm text-gray-600">{algo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            University Print-Centre Queue Simulation | CPU Scheduling Algorithm
            Visualization
          </p>
        </div>
      </footer>
    </div>
  );
}