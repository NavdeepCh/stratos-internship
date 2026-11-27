const domain = (id, name, emoji, description, skills, project, extra = {}) => ({
  id, name, emoji, description, skills, project, specializations: [], ...extra
});

export const internshipCatalog = {
  instant: {
    id: "instant",
    name: "Instant Internship Certificate",
    route: "/",
    description: "Explore the existing Stratos virtual internship program.",
    theme: "green",
    durationOptions: [],
    specializations: [
      "MERN Stack (MongoDB, Express, React, Node)", "Spring Boot & Angular", "Python Django & Vue.js",
      "Generative AI & LLM Fine-Tuning", "Computer Vision & OpenCV", "Natural Language Processing (NLP)",
      "Android App Dev (Kotlin & Jetpack Compose)", "AWS Cloud Architecture & Terraform", "DevOps & Kubernetes Deployment"
    ],
    projectRequirements: [],
    milestoneRequirements: [],
    domains: [
      "Software Development", "Artificial Intelligence & GenAI", "Cloud Computing & DevOps",
      "Cyber Security & Ethical Hacking", "Data Science & Analytics", "Mobile App Development",
      "Aerospace Engineering Simulation", "Automotive & EV Technology", "Embedded Systems & IoT",
      "Robotics & Automation", "Management & Entrepreneurship", "Human Resources Management",
      "Digital Marketing & Growth", "Banking & Financial Services", "Retail & Supply Chain Mgmt",
      "UI/UX Product Design", "Media & Video Production", "Apparel & Fashion Design",
      "Cyber Law & Compliance", "Psychology & Counseling"
    ].map((name) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name, specializations: [] })),
    plans: [
      { id: "instant-basic", name: "Tier 1: Basic Virtual Internship", displayPriceINR: 99, benefits: ["Standard Virtual Internship Track", "Certificate PDF after task completion", "Basic email support"] },
      { id: "instant-qr", name: "Tier 2: Instant PDF Certificate & QR ID", displayPriceINR: 199, benefits: ["Instant PDF certificate in email", "Secure QR code ID verification", "Guaranteed seat allocation", "Official virtual offer letter", "30-page project report kit"] },
      { id: "instant-vip", name: "Tier 3: Stratos VIP Career Accelerator", displayPriceINR: 299, benefits: ["Instant PDF and QR ID in email", "Professional resume review", "Verified LinkedIn recommendation badge", "1-on-1 career and placement guidance", "Lifetime access to project templates"] }
    ],
    payment: { checkoutEnabled: true, currentLiveAmountPaise: 100, currency: "INR" },
    enrollment: { available: true, deadline: null, googleFormUrl: "" }
  },
  "short-term": {
    id: "short-term",
    name: "Short-Term Internship",
    route: "/short-term-internships/",
    description: "Focused, project-based virtual internships for practical experience in a flexible duration.",
    theme: "green",
    durationOptions: [2, 4, 6],
    specializations: [],
    projectRequirements: ["Complete one assigned practical project at the selected plan's complexity.", "Follow the project guidelines and submit required deliverables.", "Certificate eligibility requires successful project evaluation."],
    milestoneRequirements: [],
    payment: { checkoutEnabled: false, ownerApproved: false, currency: "INR" },
    enrollment: { available: false, deadline: null, googleFormUrl: "" },
    plans: [
      { id: "short-starter", name: "Starter", weeks: 2, proposedPriceINR: 199, level: "Beginner", projectScope: "One beginner mini project", benefits: ["Project guidelines", "Project submission facility", "Certificate after approval", "QR-based verification"] },
      { id: "short-professional", name: "Professional", weeks: 4, proposedPriceINR: 399, level: "Intermediate", projectScope: "One intermediate practical project", recommended: true, recommendationLabel: "Balanced scope", benefits: ["Structured guidelines", "Project evaluation", "Detailed feedback", "Certificate after approval", "QR-based verification"] },
      { id: "short-advanced", name: "Advanced", weeks: 6, proposedPriceINR: 599, level: "Advanced", projectScope: "Advanced project with additional deliverables", benefits: ["Detailed feedback", "Improvement recommendations", "Certificate after approval", "QR-based verification"] }
    ],
    domains: [
      domain("web-development", "Web Development", "🌐", "Create accessible, responsive websites with core browser technologies.", ["HTML", "CSS", "JavaScript"], "Responsive portfolio website", { specializations: ["Responsive design", "Accessibility"] }),
      domain("frontend-development", "Frontend Development", "🎨", "Build interactive interfaces that adapt to different screens.", ["Responsive UI", "JavaScript"], "Interactive dashboard"),
      domain("backend-development", "Backend Development", "⚙️", "Learn server-side programming and design practical APIs.", ["APIs", "Server-side programming"], "Task management API"),
      domain("full-stack-development", "Full Stack Development", "💻", "Connect a user interface, application logic, and persistent data.", ["Frontend", "Backend", "Databases"], "Student management application"),
      domain("python-programming", "Python Programming", "🐍", "Use Python fundamentals to automate a useful everyday task.", ["Python fundamentals", "Automation"], "Expense tracker"),
      domain("java-programming", "Java Programming", "☕", "Practice object-oriented programming and collections in Java.", ["OOP", "Collections"], "Library management system"),
      domain("artificial-intelligence", "Artificial Intelligence", "🧠", "Explore foundational AI concepts through a bounded assistant project.", ["AI fundamentals"], "FAQ assistant"),
      domain("machine-learning", "Machine Learning", "🤖", "Train and explain a small predictive model using suitable sample data.", ["Classification", "Regression"], "Prediction model"),
      domain("data-science", "Data Science", "📊", "Explore a dataset and communicate findings with clear visualizations.", ["Pandas", "Data visualization"], "Dataset exploration project"),
      domain("data-analytics", "Data Analytics", "📈", "Turn structured data into clear, decision-oriented reporting.", ["Excel", "SQL", "Dashboards"], "Sales analysis dashboard"),
      domain("cybersecurity", "Cybersecurity", "🔐", "Practice defensive security fundamentals in an authorized local test environment.", ["Security fundamentals", "Safe testing"], "Defensive audit of a local test environment"),
      domain("android-development", "Android Development", "📱", "Build a small Android application using a supported native toolkit.", ["Android", "Kotlin or Java"], "To-do application"),
      domain("cloud-computing", "Cloud Computing", "☁️", "Learn cloud fundamentals by deploying a static project.", ["Cloud fundamentals", "Deployment"], "Static website deployment"),
      domain("database-management", "Database Management", "🗄️", "Model structured information and query it with relational techniques.", ["SQL", "Schema design"], "Inventory database"),
      domain("ui-ux-design", "UI/UX Design", "🖌️", "Translate user needs into wireframes and an interactive prototype.", ["Wireframes", "Prototyping"], "Mobile application prototype"),
      domain("digital-marketing", "Digital Marketing", "📣", "Plan an ethical digital campaign with measurable objectives.", ["SEO", "Campaign planning"], "Digital marketing strategy"),
      domain("internet-of-things", "Internet of Things", "📡", "Model sensor-driven behavior using safe, simulated inputs.", ["Sensors", "Embedded fundamentals"], "Simulated environmental monitor"),
      domain("software-testing", "Software Testing", "🧪", "Practice structured test design and clear defect reporting.", ["Test cases", "Bug reporting"], "Web application test report"),
      domain("devops-fundamentals", "DevOps Fundamentals", "⚡", "Automate a basic software build using version control and CI concepts.", ["Git", "CI/CD"], "Automated build workflow"),
      domain("business-analytics", "Business Analytics", "💼", "Summarize business metrics and present an evidence-based analysis.", ["Business metrics", "Reporting"], "Business performance analysis")
    ]
  },
  "long-term": {
    id: "long-term",
    name: "Long-Term Internship",
    route: "/long-term-internships/",
    description: "Structured, multi-stage practical projects to strengthen technical knowledge and professional project experience.",
    theme: "blue",
    durationOptions: [8, 12, 16],
    specializations: [],
    projectRequirements: ["Complete a structured major or capstone project.", "Submit milestone work and technical documentation.", "Complete project testing, demonstration, and final evaluation as required by the selected plan."],
    milestoneRequirements: [2, 3, 4],
    payment: { checkoutEnabled: false, ownerApproved: false, currency: "INR" },
    enrollment: { available: false, deadline: null, googleFormUrl: "" },
    plans: [
      { id: "long-foundation", name: "Foundation", weeks: 8, proposedPriceINR: 499, milestones: 2, level: "Foundation", benefits: ["Structured major project", "Two milestones", "Final project report", "Project evaluation", "QR-verifiable certificate after approval"] },
      { id: "long-professional", name: "Professional", weeks: 12, proposedPriceINR: 799, milestones: 3, level: "Intermediate / Advanced", recommended: true, recommendationLabel: "Balanced scope", benefits: ["Major project", "Three milestones", "Technical documentation", "Detailed feedback", "QR-verifiable certificate after approval"] },
      { id: "long-advanced", name: "Advanced", weeks: 16, proposedPriceINR: 1199, milestones: 4, level: "Capstone", benefits: ["Comprehensive capstone", "Four milestones", "Documentation and testing", "Demonstration", "Final evaluation", "QR-verifiable certificate after approval"] }
    ],
    domains: [
      domain("full-stack-engineering", "Full Stack Engineering", "💻", "Design and implement an end-to-end web product with clear data boundaries.", ["Frontend", "Backend", "Database design"], "Internship management application", { overview: "Build a multi-feature web application with a coherent interface and persistent data.", objectives: ["Model user workflows", "Connect UI and API layers", "Document deployment and limitations"], milestones: ["Requirements and data model", "Core workflows and integration", "Testing and final demonstration"], deliverables: ["Source repository", "Working demo", "Architecture notes", "Test summary"] }),
      domain("backend-engineering", "Backend Engineering", "⚙️", "Build a reliable server-side service with documented interfaces.", ["HTTP APIs", "Data modeling", "Validation"], "Secure REST API and database architecture", { overview: "Implement an API with clear request validation, data ownership, and error handling.", objectives: ["Design resource-oriented endpoints", "Apply input validation", "Test failure and success paths"], milestones: ["API and schema design", "Core endpoints and tests", "Security review and documentation"], deliverables: ["API source", "Endpoint documentation", "Automated tests", "Deployment guide"] }),
      domain("advanced-frontend-engineering", "Advanced Frontend Engineering", "🌐", "Develop an accessible, responsive dashboard with reusable interface patterns.", ["JavaScript or TypeScript", "Responsive UI", "Accessibility"], "Responsive application dashboard", { overview: "Create a polished application interface backed by representative states and validated user flows.", objectives: ["Establish reusable components", "Handle loading and error states", "Verify responsive and accessible behavior"], milestones: ["Information architecture and prototype", "Interactive feature implementation", "Accessibility and responsive review"], deliverables: ["Source repository", "Interactive demo", "Design rationale", "Accessibility checklist"] }),
      domain("java-software-engineering", "Java Software Engineering", "☕", "Structure a Java application into maintainable modules and testable services.", ["Java", "OOP", "Collections and testing"], "Multi-module Java application", { overview: "Deliver a modular application with defined responsibilities and persistent sample data.", objectives: ["Apply object-oriented design", "Separate domain and infrastructure code", "Write focused tests"], milestones: ["Requirements and class design", "Feature modules", "Integration tests and report"], deliverables: ["Java source", "Build instructions", "Test results", "Technical report"] }),
      domain("python-application-development", "Python Application Development", "🐍", "Build a maintainable Python tool for processing and presenting useful data.", ["Python", "Data processing", "Testing"], "Automated data processing platform", { overview: "Create a repeatable data-processing workflow with clear input and output contracts.", objectives: ["Validate incoming data", "Build reusable processing stages", "Explain assumptions and limitations"], milestones: ["Data and workflow design", "Processing pipeline", "Validation and results presentation"], deliverables: ["Python source", "Sample data", "Automated tests", "Usage documentation"] }),
      domain("artificial-intelligence", "Artificial Intelligence", "🧠", "Create a bounded AI assistant that answers from a defined document set.", ["AI concepts", "Prompt evaluation", "Data handling"], "Document-based AI assistant", { overview: "Prototype an assistant grounded in a limited, cited collection of sample documents.", objectives: ["Define scope and refusal behavior", "Evaluate answer quality", "Document privacy and limitations"], milestones: ["Use cases and source documents", "Retrieval and answer workflow", "Evaluation and safety notes"], deliverables: ["Prototype", "Source and setup guide", "Evaluation examples", "Limitations report"] }),
      domain("machine-learning", "Machine Learning", "🤖", "Build a reproducible model pipeline and explain its predictive behavior.", ["Python", "Model evaluation", "Data preparation"], "End-to-end predictive analytics pipeline", { overview: "Prepare a dataset, compare baseline models, and report evaluation results.", objectives: ["Prevent data leakage", "Select suitable metrics", "Interpret performance limits"], milestones: ["Question and data audit", "Baseline and model comparison", "Reproducibility and final report"], deliverables: ["Notebook or scripts", "Data-source notes", "Evaluation report", "Reproduction steps"] }),
      domain("deep-learning", "Deep Learning", "🧬", "Develop and assess an image classification prototype using suitable sample data.", ["Neural network basics", "Python", "Model evaluation"], "Image classification application", { overview: "Train or adapt a small image classifier and expose results through a simple demo.", objectives: ["Prepare data responsibly", "Measure model behavior", "Explain confidence and failure cases"], milestones: ["Dataset and baseline", "Model and demo", "Testing and limitations"], deliverables: ["Model workflow", "Demo", "Evaluation metrics", "Data and limitations notes"] }),
      domain("data-science", "Data Science", "📊", "Investigate a meaningful question using reproducible analysis and visual evidence.", ["Python", "Statistics", "Visualization"], "Comprehensive data analysis project", { overview: "Conduct a complete exploratory analysis and communicate evidence-based findings.", objectives: ["Assess data quality", "Use appropriate analytical methods", "Communicate uncertainty"], milestones: ["Question and data audit", "Analysis and visualizations", "Findings and review"], deliverables: ["Reproducible notebook", "Visual summary", "Source notes", "Final report"] }),
      domain("data-engineering", "Data Engineering", "🗃️", "Create a small, testable ETL pipeline and reporting-ready data model.", ["SQL", "ETL", "Data quality"], "ETL pipeline and reporting database", { overview: "Transform sample source data into a documented analytical schema.", objectives: ["Design repeatable transformations", "Track data quality", "Make pipeline outputs queryable"], milestones: ["Source and schema design", "ETL implementation", "Quality checks and reporting"], deliverables: ["Pipeline source", "Schema diagram", "Quality report", "Run instructions"] }),
      domain("business-intelligence", "Business Intelligence", "📈", "Turn a realistic dataset into an interactive, decision-oriented dashboard.", ["Metrics", "Data modeling", "Visualization"], "Interactive business intelligence dashboard", { overview: "Build a dashboard that defines and presents a consistent set of business metrics.", objectives: ["Define metric calculations", "Choose clear visual encodings", "Document data caveats"], milestones: ["Stakeholder questions and metrics", "Dashboard build", "Validation and presentation"], deliverables: ["Dashboard", "Metric glossary", "Data notes", "Presentation"] }),
      domain("cybersecurity", "Cybersecurity", "🔐", "Design defensive monitoring and remediation for an authorized lab environment.", ["Security fundamentals", "Logging", "Threat modeling"], "Defensive security monitoring and remediation in an authorized lab", { overview: "Use a deliberately local or simulated lab to identify and document defensive improvements.", objectives: ["Define authorization and scope", "Review safe sample telemetry", "Prioritize remediation"], milestones: ["Scope and threat model", "Detection and remediation plan", "Validation and report"], deliverables: ["Lab setup", "Defensive findings", "Remediation checklist", "Scope statement"] }),
      domain("cloud-engineering", "Cloud Engineering", "☁️", "Deploy a web application with documented configuration and operational checks.", ["Cloud fundamentals", "Networking", "Deployment"], "Scalable web application deployment", { overview: "Deploy a sample application and describe how its key components scale and fail.", objectives: ["Map application components", "Configure a deployment pipeline", "Document cost and availability assumptions"], milestones: ["Architecture and deployment plan", "Working deployment", "Observability and final review"], deliverables: ["Architecture diagram", "Deployment source", "Demo URL", "Operations notes"] }),
      domain("devops-engineering", "DevOps Engineering", "⚡", "Automate build and release steps with basic monitoring and verification.", ["Git", "CI/CD", "Observability"], "CI/CD pipeline with monitoring", { overview: "Create a repeatable delivery workflow for a sample application.", objectives: ["Automate builds and tests", "Use environment-safe configuration", "Add useful deployment checks"], milestones: ["Workflow design", "CI/CD implementation", "Monitoring and documentation"], deliverables: ["Pipeline configuration", "Test evidence", "Monitoring view", "Runbook"] }),
      domain("mobile-application-development", "Mobile Application Development", "📱", "Plan, implement, and test a cohesive mobile application experience.", ["Mobile UI", "Application state", "Testing"], "Complete mobile application", { overview: "Build a multi-screen mobile application around a clear user task.", objectives: ["Define navigation and state", "Handle errors and empty states", "Test core flows"], milestones: ["User flows and prototype", "Application implementation", "Testing and demo"], deliverables: ["Application source", "Demo or recording", "Test cases", "Setup guide"] }),
      domain("iot-engineering", "IoT Engineering", "📡", "Model a connected monitoring system safely with simulated devices and telemetry.", ["Sensors", "Embedded concepts", "Data visualization"], "Simulated smart monitoring platform", { overview: "Simulate device readings and build a simple view of system status.", objectives: ["Define a safe simulated device model", "Process sensor-like data", "Visualize normal and alert states"], milestones: ["Device and data model", "Simulation and dashboard", "Testing and report"], deliverables: ["Simulation source", "Dashboard", "Data format", "Safety and limitations notes"] }),
      domain("software-quality-assurance", "Software Quality Assurance", "🧪", "Create a maintainable automated test suite for a sample application.", ["Test design", "Automation", "Bug reporting"], "Automated application testing suite", { overview: "Test essential user flows with clear coverage and actionable failure reports.", objectives: ["Prioritize risk-based cases", "Automate stable flows", "Communicate defects clearly"], milestones: ["Test strategy", "Automation suite", "Results and recommendations"], deliverables: ["Test plan", "Automated tests", "Execution report", "Defect examples"] }),
      domain("database-engineering", "Database Engineering", "🗄️", "Model a database and evaluate query behavior on a representative dataset.", ["SQL", "Schema design", "Performance analysis"], "Database design and performance analysis", { overview: "Design a relational data model and compare query plans using safe sample data.", objectives: ["Normalize core entities", "Use indexes appropriately", "Report measured query behavior"], milestones: ["Requirements and schema", "Queries and indexes", "Performance analysis"], deliverables: ["Schema and seed data", "Queries", "Measured results", "Design report"] }),
      domain("product-design-ui-ux", "Product Design and UI/UX", "🎨", "Research a user problem and turn it into a tested, navigable digital prototype.", ["User flows", "Wireframing", "Prototyping"], "Complete digital product prototype", { overview: "Design a coherent product flow grounded in a small set of user needs.", objectives: ["Define the target problem", "Prototype key interactions", "Use feedback to refine the experience"], milestones: ["Problem framing", "Prototype and design system", "Usability review and handoff"], deliverables: ["Research summary", "Prototype", "Design rationale", "Handoff notes"] }),
      domain("software-architecture", "Software Architecture", "🏗️", "Design and implement a modular system with clear boundaries and tradeoffs.", ["System design", "Data flow", "Testing"], "Modular software system", { overview: "Translate requirements into a small system with documented interfaces and component responsibilities.", objectives: ["Identify system boundaries", "Explain key design tradeoffs", "Validate components with tests"], milestones: ["Requirements and architecture", "Modular implementation", "Integration and review"], deliverables: ["Architecture decision notes", "Working source", "Tests", "Deployment and maintenance guide"] })
    ]
  },
  summer: {
    id: "summer",
    name: "Summer Internship",
    route: "/summer-internships/",
    description: "Structured summer programs for college students to develop practical skills and complete meaningful projects during an academic break.",
    theme: "amber",
    durationOptions: [4, 6, 8],
    specializations: [],
    projectRequirements: ["Complete a project matched to the selected plan and domain.", "Document project work and complete evaluation.", "Provide a final demonstration where required by the selected plan."],
    milestoneRequirements: ["No stated milestone", "One progress milestone", "Multiple milestones"],
    payment: { checkoutEnabled: false, ownerApproved: false, currency: "INR" },
    enrollment: { available: false, deadline: null, googleFormUrl: "" },
    plans: [
      { id: "summer-explorer", name: "Explorer", weeks: 4, proposedPriceINR: 299, level: "Beginner", benefits: ["Beginner-friendly project", "Project guidelines", "Final evaluation", "QR-verifiable certificate after approval"] },
      { id: "summer-career-builder", name: "Career Builder", weeks: 6, proposedPriceINR: 599, level: "Intermediate", recommended: true, recommendationLabel: "Balanced scope", benefits: ["Intermediate project", "Progress milestone", "Project documentation", "Detailed feedback", "QR-verifiable certificate after approval"] },
      { id: "summer-career-plus", name: "Career Plus", weeks: 8, proposedPriceINR: 899, level: "Comprehensive", benefits: ["Comprehensive project", "Multiple milestones", "Final demonstration", "Detailed evaluation", "QR-verifiable certificate after approval"] }
    ],
    domains: [
      domain("web-development", "Web Development", "🌐", "Create a responsive, accessible site using core web standards.", ["HTML", "CSS", "JavaScript"], "A personal portfolio with project cards and a contact section.", { objective: "Practice semantic HTML, responsive layout, and accessible interactions.", deliverables: ["Source code", "Responsive screenshots", "Short project README"] }),
      domain("full-stack-development", "Full Stack Development", "💻", "Connect a clear frontend workflow to a small backend and data store.", ["Frontend", "APIs", "Database basics"], "A study planner that stores tasks and displays upcoming work.", { objective: "Understand how UI, API, and data layers work together.", deliverables: ["Application source", "Setup instructions", "Demo or screenshots"] }),
      domain("python-programming", "Python Programming", "🐍", "Use Python to solve a practical data or automation problem.", ["Python basics", "Functions", "File handling"], "A personal expense summary tool using sample CSV data.", { objective: "Practice data validation, reusable functions, and readable output.", deliverables: ["Python scripts", "Sample input", "Results summary"] }),
      domain("java-development", "Java Development", "☕", "Apply object-oriented concepts to a manageable Java application.", ["Java", "Classes", "Collections"], "A library catalog with search and checkout status.", { objective: "Use classes and collections to represent application data.", deliverables: ["Java source", "Build/run instructions", "Test examples"] }),
      domain("artificial-intelligence", "Artificial Intelligence", "🧠", "Prototype a narrowly scoped assistant using a small, approved FAQ set.", ["AI concepts", "Prompt design", "Evaluation"], "A campus FAQ helper that responds from a short source document.", { objective: "Explore bounded use cases, answer evaluation, and limitations.", deliverables: ["Prototype", "Source FAQ", "Example evaluation cases"] }),
      domain("machine-learning", "Machine Learning", "🤖", "Train and evaluate a simple model with a public or synthetic dataset.", ["Python", "Data preparation", "Metrics"], "A classification model with a small explainable results page.", { objective: "Learn train/test separation and basic model evaluation.", deliverables: ["Notebook or scripts", "Dataset source", "Metrics summary"] }),
      domain("data-science", "Data Science", "📊", "Investigate a focused question and communicate results visually.", ["Python", "Pandas", "Visualization"], "An exploratory report on a public dataset.", { objective: "Practice cleaning, summarizing, and explaining data.", deliverables: ["Notebook", "Charts", "Findings and limitations"] }),
      domain("data-analytics", "Data Analytics", "📈", "Transform spreadsheet or SQL data into useful summary metrics.", ["Excel or SQL", "Charts", "Reporting"], "A sales trends dashboard using a sample dataset.", { objective: "Define useful metrics and communicate them clearly.", deliverables: ["Analysis workbook or SQL", "Dashboard", "Metric notes"] }),
      domain("cybersecurity", "Cybersecurity", "🔐", "Learn defensive security through a local or simulated safe environment.", ["Security basics", "Risk identification", "Reporting"], "A security checklist and remediation report for a deliberately vulnerable local demo app.", { objective: "Practice authorized, non-invasive review and prioritization.", deliverables: ["Scope statement", "Defensive findings", "Remediation checklist"] }),
      domain("android-development", "Android Development", "📱", "Build a small mobile application with a clear user flow.", ["Android basics", "Kotlin or Java", "UI state"], "A to-do list with add, complete, and filter actions.", { objective: "Practice mobile layouts, state, and input handling.", deliverables: ["App source", "Screenshots or demo", "Run instructions"] }),
      domain("cloud-computing", "Cloud Computing", "☁️", "Deploy a static project and describe its basic hosting setup.", ["Cloud concepts", "Static hosting", "DNS basics"], "A portfolio deployed to a cloud static hosting service.", { objective: "Understand deployment steps and environment configuration.", deliverables: ["Source repository", "Demo URL", "Deployment notes"] }),
      domain("internet-of-things", "Internet of Things", "📡", "Explore device data and sensor events with a safe simulation.", ["Sensors", "Data formats", "Basic dashboards"], "A simulated room monitor with temperature and humidity readings.", { objective: "Model sensor readings and display normal or alert conditions.", deliverables: ["Simulation", "Dashboard or chart", "Data format notes"] }),
      domain("ui-ux-design", "UI/UX Design", "🖌️", "Design a simple mobile flow from user need through interactive prototype.", ["User flows", "Wireframes", "Prototyping"], "A campus event discovery app prototype.", { objective: "Practice hierarchy, interaction design, and accessible states.", deliverables: ["Wireframes", "Interactive prototype", "Design rationale"] }),
      domain("digital-marketing", "Digital Marketing", "📣", "Plan a measurable campaign using transparent, user-respecting practices.", ["SEO basics", "Content planning", "Metrics"], "A content and SEO plan for a fictional student resource site.", { objective: "Connect audience needs, content, and measurable outcomes.", deliverables: ["Campaign brief", "Content calendar", "Measurement plan"] }),
      domain("software-testing", "Software Testing", "🧪", "Test a sample web app and report findings with reproducible steps.", ["Test cases", "Exploratory testing", "Bug reports"], "A browser-based test report for a sample booking flow.", { objective: "Practice test design, prioritization, and clear defect reporting.", deliverables: ["Test cases", "Defect reports", "Summary of coverage"] }),
      domain("devops", "DevOps", "⚡", "Automate a basic build and test workflow for a sample repository.", ["Git", "CI basics", "Build automation"], "A simple CI workflow that runs checks on each change.", { objective: "Understand version control triggers and automated validation.", deliverables: ["Workflow file", "Test run evidence", "Setup notes"] }),
      domain("database-management", "Database Management", "🗄️", "Design a small relational schema and query representative records.", ["SQL", "Tables", "Relationships"], "An inventory database with queries for stock and reorder status.", { objective: "Practice schema design, joins, and data integrity.", deliverables: ["Schema", "Seed data", "Example queries"] }),
      domain("business-analytics", "Business Analytics", "💼", "Explain a business question using clearly defined sample metrics.", ["Business metrics", "Spreadsheets", "Reporting"], "A monthly performance report for a fictional small business.", { objective: "Translate measures into concise, decision-oriented findings.", deliverables: ["Metric definitions", "Charts or report", "Recommendations with assumptions"] }),
      domain("entrepreneurship-product-development", "Entrepreneurship and Product Development", "🚀", "Turn a student problem into a small, testable product concept.", ["Problem discovery", "Value proposition", "Prototyping"], "A campus resource exchange concept with a clickable MVP prototype.", { objective: "Practice problem framing, validation planning, and product scope.", deliverables: ["Problem brief", "Prototype", "Validation plan"] }),
      domain("software-development", "Software Development", "🧩", "Plan and implement a small software tool with clear requirements.", ["Programming basics", "Version control", "Testing"], "A study session planner with saved schedules and reminders shown in-app.", { objective: "Practice requirements, incremental implementation, and testing.", deliverables: ["Source code", "Test checklist", "Usage guide"] })
    ]
  }
};


// Shared project catalog: each brief includes deliverables and a review rubric.
const additions = {
  "CSE / IT": [ ["Frontend Development","Responsive interface","HTML, CSS, JavaScript"], ["Backend Development","Validated REST service","HTTP, APIs, testing"], ["Computer Networks","Simulated campus network","TCP/IP, subnetting"], ["Game Development","Playable puzzle game","Game logic, testing"], ["Blockchain Development","Local ledger simulation","Hashing, data structures"], ["Software Engineering","Requirements and testable application","Design, Git, testing"] ],
  "AI & Data Science": [["Deep Learning","Image classifier on public data","Neural networks, evaluation"],["Generative AI","Grounded FAQ prototype","Prompt design, evaluation"],["Natural Language Processing","Text classification report","Tokenization, metrics"],["Computer Vision","Image inspection prototype","Image processing, metrics"],["Data Engineering","Batch data pipeline","ETL, validation"],["Business Intelligence","Interactive metrics dashboard","SQL, visualization"]],
  "ECE": [["Embedded Systems","Simulated sensor controller","Microcontrollers, simulation"],["VLSI Design","Simulated logic circuit","HDL, verification"],["Digital Electronics","Digital counter simulation","Logic gates, timing"],["Communication Systems","Signal modulation simulation","Signals, analysis"],["Robotics","Simulated obstacle avoidance","Control, simulation"],["PCB Design","Low-voltage PCB layout exercise","Schematic, layout"]],
  "EEE": [["Power Systems","Simulated load analysis","Power flow, modeling"],["Renewable Energy","Solar sizing study","Energy, spreadsheets"],["Electric Vehicles","Battery range model","Energy, modeling"],["Control Systems","Feedback controller simulation","Control, response"],["Industrial Automation","Simulated conveyor logic","PLC concepts, simulation"]],
  "Mechanical": [["CAD and Product Design","Parametric bracket model","CAD, dimensions"],["Automotive Engineering","Vehicle efficiency study","Mechanics, analysis"],["Manufacturing Technology","Process planning study","Manufacturing, quality"],["Mechanical Design","Conceptual linkage model","Mechanics, CAD"],["Mechatronics","Simulated actuator system","Mechanics, controls"]],
  "Civil": [["Construction Management","Sample construction schedule","Planning, estimation"],["Structural Design","Educational beam model","Statics, simulation"],["AutoCAD","Dimensioned floor plan","Drafting, CAD"],["Building Information Modeling","Sample building information model","BIM, documentation"],["Sustainable Infrastructure","Comparative materials study","Sustainability, analysis"]],
  "Business": [["Human Resource Management","Sample onboarding plan","HR, process design"],["Finance","Fictional budget analysis","Budgeting, spreadsheets"],["Supply Chain Management","Inventory planning model","Logistics, forecasting"],["Project Management","Project schedule and risk register","Planning, risk"],["Operations Management","Process improvement study","Operations, metrics"]],
  "Creative": [["Graphic Design","Brand identity concept","Typography, layout"],["Product Design","User-tested prototype","Research, prototyping"],["Content Creation","Editorial content portfolio","Writing, editing"],["Social Media Management","Sample campaign calendar","Content strategy, analytics"]]
};
const branchFor = name => /artificial|machine learning|data science|data analytics|deep learning|vision|generative|natural language/i.test(name) ? "AI & Data Science" : /iot|internet of things|embedded|robot/i.test(name) ? "ECE" : /marketing|business|entrepreneur/i.test(name) ? "Business" : /ui\/ux|design/i.test(name) ? "Creative" : "CSE / IT";
for (const [id, prefix, prices, weeks] of [["short-term","short",[0,99,299],[2,4,6]],["long-term","long",[0,199,399],[8,12,16]],["summer","summer",[0,149,349],[4,6,8]]]) {
 const c = internshipCatalog[id];
 const basic = ["Practical project and guidelines","Project submission and evaluation","Free digital completion certificate after approval","Unique certificate ID and QR verification","Download through My Internships"];
 c.plans = ["Basic","Professional","Premium"].map((name,i)=>({id:`${prefix}-${name.toLowerCase()}`,name,level:name,weeks:weeks[i],priceINR:prices[i],amountPaise:prices[i]*100,certificateIncluded:true,instantPdfIncluded:false,instantPdfAddonAvailable:i===2,recommended:i===1,recommendationLabel:"Recommended",benefits:[...basic,...(i>0?["Expanded project scope","Detailed evaluation feedback","Enhanced certificate design"]:[]),...(i===2?["Advanced project","Premium certificate design"]:[])]}));
 c.domains.forEach(d=>{d.branch=branchFor(d.name);d.difficulty=id==="long-term"?"Intermediate":"Beginner";d.categoryAvailability=[id];d.projectRequirements=["Submit project artifacts and a report", "Demonstrate results and limitations"];});
 for(const [branch,entries] of Object.entries(additions)) for(const [name,project,skills] of entries){
  const key=name.toLowerCase().replace(/[^a-z0-9]+/g,"-"); if(c.domains.some(d=>d.id===key||d.name===name)) continue;
  const scope=id==="long-term"?"Build, test and document a multi-stage":id==="summer"?"Prototype and present a portfolio-ready":"Create a focused";
  c.domains.push(domain(key,name,"◈",`${scope} ${project.toLowerCase()}.`,skills.split(", "),project,{branch,overview:project,difficulty:id==="long-term"?"Intermediate":"Beginner",categoryAvailability:[id],objective:`Apply ${skills} to the project.`,objectives:[`Apply ${skills}`,"Evaluate results"],milestones:["Design","Implementation","Evaluation"],deliverables:["Project artifacts","Test or evaluation report","Demonstration"],projectRequirements:["Submit artifacts, explain approach and evaluate results"],reviewRequired:true}));
 }
}
for (const category of Object.values(internshipCatalog)) {
  category.availableDomains = category.domains.map(({ id, name }) => ({ id, name }));
  category.availableSpecializations = [
    ...category.specializations,
    ...category.domains.flatMap((item) => item.specializations)
  ];
  category.pricingTiers = category.plans;
  category.durationOptions = category.durationOptions.map((weeks) => ({ weeks }));
  category.planBenefits = Object.fromEntries(category.plans.map((plan) => [plan.id, plan.benefits]));
  category.enrollmentAvailability = category.enrollment.available;
  category.actualEnrollmentDeadlines = category.enrollment.deadline ? [category.enrollment.deadline] : [];
  category.googleForm = { url: category.enrollment.googleFormUrl, configured: Boolean(category.enrollment.googleFormUrl) };
}

export function getInternshipCategory(categoryId) {
  return internshipCatalog[categoryId] || null;
}
