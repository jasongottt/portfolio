/**
 * Roles for the Experience section, newest first. `points` and `tech` can be
 * left out for a role that hasn't started yet. `project` is optional: when it
 * matches a project title, the entry gets a link that opens that project.
 */
export const experience = [
  {
    role: "Software Engineer Intern",
    org: "ReliaQuest",
    detail: "Incoming",
    dates: "Summer 2027",
    location: "Tampa, FL",
  },
  {
    role: "XR Undergraduate Researcher",
    org: "Purdue University",
    detail: "Dr. Voicu S. Popescu",
    dates: "May 2026 – Sep 2026",
    location: "Remote",
    points: [
      "Built a Unity VR system that turns spoken commands into real-time object behavior in under two seconds, using a locally hosted Qwen model to write Lua.",
      "Made the generated code safe to run live with a sandboxed, allowlisted API, syntax validation, automatic repair that recovers 80% of failed runs, and runtime rollback.",
    ],
    tech: "Unity, C#, Lua, Ollama, Meta Quest 3",
    project: "Real Time Code Injection",
  },
  {
    role: "AI Agent Development Intern",
    org: "Euterpe",
    dates: "May 2026 – Aug 2026",
    location: "Remote",
    points: [
      "Worked on an AI agent that connects to DAWs like Ableton and FL Studio over MIDI and APIs, reads the project, and proposes arrangement, sound design, and mix changes.",
      "Built and tested parts of a project-aware RAG pipeline for retrieval and tool selection, plus the backend worker that processes user interaction data.",
    ],
    tech: "TypeScript, React, Rust",
  },
  {
    role: "Software Engineer",
    org: "Hack The Future",
    dates: "Oct 2025 – Present",
    location: "West Lafayette, IN",
    points: [
      "Building a full-stack web app for Sheltering Wings, a local nonprofit with 30-50 employees, with separate manager and user dashboards for scheduling, chores, and check-in/check-out.",
      "Working on a cross-functional team of 10+ developers, designers, and leads in an agile process, directly with the client.",
    ],
    tech: "React, MongoDB",
    project: "Sheltering Wings",
  },
  {
    role: "Frontend Development Intern",
    org: "King of the Curve",
    dates: "Sep 2025 – Mar 2026",
    location: "Remote",
    points: [
      "Built responsive mobile and web UI in Flutter, including gamified study tools for medical students, on a platform with 400,000+ users and 16,000+ monthly actives.",
      "Turned Figma prototypes into accessible, reusable components that kept the look and interactions consistent across the platform.",
    ],
    tech: "Flutter, Dart, Figma",
  },
];
