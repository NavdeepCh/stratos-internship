export const projectDefinitions = {
  "Java Development": {
    title: "Student Management System",
    description: "Build a Java application that creates, updates, searches, and removes student records.",
    technologies: ["Java", "Object-oriented programming", "File or database persistence"],
    deliverables: ["Source code", "GitHub repository", "Demo URL", "Short README"],
    rubric: ["Working core features", "Code organization", "Input validation", "Testing", "Documentation"]
  },
  "Python Development": {
    title: "Data Analysis Application",
    description: "Analyze a dataset and present clear findings using charts and a reproducible workflow.",
    technologies: ["Python", "Pandas", "Visualization library"],
    deliverables: ["Source code", "Dataset or source description", "GitHub repository", "Results summary"],
    rubric: ["Data quality handling", "Analysis correctness", "Visualization", "Reproducibility", "Documentation"]
  },
  "Web Development": {
    title: "Responsive Portfolio Website",
    description: "Build an accessible, responsive portfolio demonstrating selected work.",
    technologies: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Responsive source code", "GitHub repository", "Public demo URL"],
    rubric: ["Responsive behavior", "Accessibility", "Visual consistency", "Interactivity", "Code quality"]
  },
  "Full-Stack Development": {
    title: "Task Management Web Application",
    description: "Build a task management application with persistent records and basic account separation.",
    technologies: ["Frontend framework or HTML", "Backend", "Database"],
    deliverables: ["Application source", "GitHub repository", "Demo URL", "Setup instructions"],
    rubric: ["CRUD behavior", "Authentication or data separation", "Error handling", "Testing", "Documentation"]
  },
  "Data Science": {
    title: "Dataset Analysis and Visualization",
    description: "Ask a clear question, analyze a dataset, and communicate evidence visually.",
    technologies: ["Python", "Pandas", "Visualization library"],
    deliverables: ["Notebook or scripts", "Dataset source", "GitHub repository", "Results report"],
    rubric: ["Question clarity", "Analysis validity", "Visual communication", "Limitations", "Documentation"]
  }
};

export function getProject(track) {
  return projectDefinitions[track] || null;
}
