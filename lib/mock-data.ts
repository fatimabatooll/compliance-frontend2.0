export type Role = "admin" | "consultant";

export type QuestionType = "text" | "mcq" | "binary" | "multiselect";

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  status: "evaluated" | "in-progress" | "pending";
  readinessScore: number;
  lastUpdated: string;
  consultant: string;
  logo: string;
  evaluationProgress?: number; // percentage for in-progress
}

export interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  maturity: string;
}

export interface TrendPoint {
  month: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  selectedOption?: number | number[];
}

export interface Dimension {
  id: string;
  domain: string;
  name: string;
  questions: Question[];
}

export const companies: Company[] = [
  {
    id: "1",
    name: "Apex Technologies",
    industry: "Technology",
    size: "5,000+",
    status: "evaluated",
    readinessScore: 78,
    lastUpdated: "2026-02-01",
    consultant: "Sarah Chen",
    logo: "AT",
  },
  {
    id: "2",
    name: "NovaCorp Industries",
    industry: "Manufacturing",
    size: "2,000-5,000",
    status: "evaluated",
    readinessScore: 62,
    lastUpdated: "2026-01-28",
    consultant: "James Rivera",
    logo: "NC",
  },
  {
    id: "3",
    name: "Meridian Health",
    industry: "Healthcare",
    size: "10,000+",
    status: "in-progress",
    readinessScore: 45,
    lastUpdated: "2026-02-05",
    consultant: "Sarah Chen",
    logo: "MH",
    evaluationProgress: 35,
  },
  {
    id: "4",
    name: "Stellar Finance",
    industry: "Financial Services",
    size: "1,000-2,000",
    status: "evaluated",
    readinessScore: 85,
    lastUpdated: "2026-01-15",
    consultant: "James Rivera",
    logo: "SF",
  },
  {
    id: "5",
    name: "GreenWave Energy",
    industry: "Energy",
    size: "500-1,000",
    status: "pending",
    readinessScore: 0,
    lastUpdated: "2026-02-08",
    consultant: "Sarah Chen",
    logo: "GW",
  },
  {
    id: "6",
    name: "Quantum Labs",
    industry: "Research",
    size: "200-500",
    status: "in-progress",
    readinessScore: 33,
    lastUpdated: "2026-02-04",
    consultant: "James Rivera",
    logo: "QL",
    evaluationProgress: 62,
  },
  {
    id: "7",
    name: "CloudBridge Solutions",
    industry: "Technology",
    size: "2,000-5,000",
    status: "evaluated",
    readinessScore: 91,
    lastUpdated: "2026-01-20",
    consultant: "Sarah Chen",
    logo: "CB",
  },
  {
    id: "8",
    name: "Pacific Retail Group",
    industry: "Retail",
    size: "10,000+",
    status: "in-progress",
    readinessScore: 54,
    lastUpdated: "2026-02-02",
    consultant: "James Rivera",
    logo: "PR",
    evaluationProgress: 48,
  },
];

export const domainScores: DomainScore[] = [
  {
    domain: "Strategy & Vision",
    score: 82,
    maxScore: 100,
    maturity: "Advanced",
  },
  {
    domain: "Data Infrastructure",
    score: 68,
    maxScore: 100,
    maturity: "Intermediate",
  },
  {
    domain: "Talent & Skills",
    score: 55,
    maxScore: 100,
    maturity: "Developing",
  },
  {
    domain: "Technology Stack",
    score: 75,
    maxScore: 100,
    maturity: "Advanced",
  },
  {
    domain: "Governance & Ethics",
    score: 60,
    maxScore: 100,
    maturity: "Intermediate",
  },
  {
    domain: "Culture & Change",
    score: 48,
    maxScore: 100,
    maturity: "Developing",
  },
  {
    domain: "Partnerships & Ecosystem",
    score: 71,
    maxScore: 100,
    maturity: "Advanced",
  },
  {
    domain: "ROI & Value Realization",
    score: 64,
    maxScore: 100,
    maturity: "Intermediate",
  },
];

export const trendData: TrendPoint[] = [
  { month: "Sep", score: 35 },
  { month: "Oct", score: 42 },
  { month: "Nov", score: 50 },
  { month: "Dec", score: 58 },
  { month: "Jan", score: 68 },
  { month: "Feb", score: 78 },
];

export const radarData = [
  { dimension: "Strategy", value: 82, fullMark: 100 },
  { dimension: "Data", value: 68, fullMark: 100 },
  { dimension: "Talent", value: 55, fullMark: 100 },
  { dimension: "Tech", value: 75, fullMark: 100 },
  { dimension: "Governance", value: 60, fullMark: 100 },
  { dimension: "Culture", value: 48, fullMark: 100 },
  { dimension: "Partners", value: 71, fullMark: 100 },
  { dimension: "ROI", value: 64, fullMark: 100 },
];

export const strengthsAndGaps = [
  { area: "Strategy & Vision", strength: 82, gap: 18 },
  { area: "Technology Stack", strength: 75, gap: 25 },
  { area: "Partnerships & Ecosystem", strength: 71, gap: 29 },
  { area: "Data Infrastructure", strength: 68, gap: 32 },
  { area: "Governance & Ethics", strength: 60, gap: 40 },
  { area: "ROI & Value Realization", strength: 64, gap: 36 },
  { area: "Talent & Skills", strength: 55, gap: 45 },
  { area: "Culture & Change", strength: 48, gap: 52 },
];

// 8 Domains, 2 Dimensions each, 5 Questions per Dimension
export const dimensions: Dimension[] = [
  // Domain 1: Strategy & Vision
  {
    id: "d1-1",
    domain: "Strategy & Vision",
    name: "Strategic Direction",
    questions: [
      {
        id: "q1-1-1",
        text: "Does your organization have a formal GenAI strategy documented and approved by leadership?",
        type: "mcq",
        options: [
          "No strategy exists",
          "Informal discussions only",
          "Draft strategy in development",
          "Formal strategy documented",
          "Strategy actively executed with KPIs",
        ],
      },
      {
        id: "q1-1-2",
        text: "Briefly describe your organization's primary GenAI objectives for the next 12-18 months.",
        type: "text",
        placeholder: "Enter your GenAI objectives...",
      },
      {
        id: "q1-1-3",
        text: "Is there executive sponsorship for GenAI initiatives?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q1-1-4",
        text: "How well-defined are the GenAI use cases that align with business objectives?",
        type: "mcq",
        options: [
          "No use cases identified",
          "Few ad-hoc experiments",
          "Several use cases explored",
          "Prioritized use case roadmap",
          "Integrated into business strategy",
        ],
      },
      {
        id: "q1-1-5",
        text: "Which GenAI application areas are you currently exploring? (Select all that apply)",
        type: "multiselect",
        options: [
          "Customer service chatbots",
          "Content generation",
          "Data analysis & insights",
          "Code generation",
          "Predictive analytics",
          "Other",
        ],
      },
    ],
  },
  {
    id: "d1-2",
    domain: "Strategy & Vision",
    name: "Business Case & ROI",
    questions: [
      {
        id: "q1-2-1",
        text: "Has your organization developed financial projections for GenAI initiatives?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q1-2-2",
        text: "What is the estimated business impact of GenAI on your organization?",
        type: "mcq",
        options: [
          "Not yet evaluated",
          "Minimal impact expected",
          "Moderate efficiency gains",
          "Significant revenue opportunity",
          "Transformational business impact",
        ],
      },
      {
        id: "q1-2-3",
        text: "Describe the key business drivers for GenAI adoption in your organization.",
        type: "text",
        placeholder: "Enter key business drivers...",
      },
      {
        id: "q1-2-4",
        text: "Are there established ROI metrics or KPIs for GenAI projects?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q1-2-5",
        text: "What governance structure exists for GenAI investment decisions?",
        type: "mcq",
        options: [
          "No formal governance",
          "Ad-hoc approval process",
          "Basic review committee",
          "Structured steering committee",
          "Enterprise-wide governance board",
        ],
      },
    ],
  },

  // Domain 2: Data Infrastructure
  {
    id: "d2-1",
    domain: "Data Infrastructure",
    name: "Data Readiness",
    questions: [
      {
        id: "q2-1-1",
        text: "How would you rate your organization's data quality and accessibility for AI/ML workloads?",
        type: "mcq",
        options: [
          "Poor / siloed data",
          "Basic data warehousing",
          "Centralized with quality issues",
          "Well-governed data lake",
          "Enterprise data mesh / fabric",
        ],
      },
      {
        id: "q2-1-2",
        text: "What is your primary data storage infrastructure?",
        type: "multiselect",
        options: [
          "On-premise databases",
          "Cloud data warehouse (Snowflake, BigQuery, etc.)",
          "Data lake (S3, ADLS, etc.)",
          "Vector databases",
          "Real-time streaming platform",
          "Legacy mainframe systems",
        ],
      },
      {
        id: "q2-1-3",
        text: "Are your data sources properly catalogued and documented?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q2-1-4",
        text: "What percentage of enterprise data is readily available for AI/ML use?",
        type: "mcq",
        options: ["<20%", "20-40%", "40-60%", "60-80%", ">80%"],
      },
      {
        id: "q2-1-5",
        text: "Describe any data quality or integration challenges.",
        type: "text",
        placeholder: "Enter data challenges...",
      },
    ],
  },
  {
    id: "d2-2",
    domain: "Data Infrastructure",
    name: "Data Pipelines & Governance",
    questions: [
      {
        id: "q2-2-1",
        text: "Are there established data pipelines capable of feeding GenAI models?",
        type: "mcq",
        options: [
          "No pipelines",
          "Manual data preparation",
          "Semi-automated ETL",
          "Automated pipelines",
          "Real-time streaming infrastructure",
        ],
      },
      {
        id: "q2-2-2",
        text: "How mature is your data governance framework?",
        type: "mcq",
        options: [
          "Non-existent",
          "Ad-hoc policies",
          "Documented policies",
          "Enforced governance",
          "Automated governance with monitoring",
        ],
      },
      {
        id: "q2-2-3",
        text: "Is data lineage and metadata management implemented?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q2-2-4",
        text: "What data privacy & compliance frameworks are in place?",
        type: "multiselect",
        options: [
          "GDPR",
          "CCPA",
          "HIPAA",
          "SOC 2",
          "ISO 27001",
          "Data residency requirements",
          "None/Basic",
        ],
      },
      {
        id: "q2-2-5",
        text: "How frequently is data refreshed for AI models?",
        type: "mcq",
        options: [
          "Ad-hoc / manual",
          "Weekly",
          "Daily",
          "Real-time / streaming",
          "Varies by use case",
        ],
      },
    ],
  },

  // Domain 3: Talent & Skills
  {
    id: "d3-1",
    domain: "Talent & Skills",
    name: "AI Talent Assessment",
    questions: [
      {
        id: "q3-1-1",
        text: "What is the current AI/ML talent density in your organization?",
        type: "mcq",
        options: [
          "No dedicated AI talent",
          "1-2 individual contributors",
          "Small AI team (3-10)",
          "Dedicated AI center of excellence (10+)",
          "AI skills distributed across teams",
        ],
      },
      {
        id: "q3-1-2",
        text: "How many people in your organization have hands-on GenAI experience?",
        type: "mcq",
        options: ["0", "1-5", "6-20", "21-50", "50+"],
      },
      {
        id: "q3-1-3",
        text: "What skill gaps do you anticipate in GenAI domain?",
        type: "multiselect",
        options: [
          "Prompt engineering",
          "LLM fine-tuning",
          "AI architecture design",
          "Data science fundamentals",
          "ML operations (MLOps)",
          "AI ethics & governance",
          "No significant gaps",
        ],
      },
      {
        id: "q3-1-4",
        text: "Do you plan to hire external AI talent or build internal capability?",
        type: "mcq",
        options: [
          "Not planning GenAI initiatives",
          "Primarily hire externally",
          "Mix of hiring and internal development",
          "Focus on internal upskilling",
          "Already have strong internal capability",
        ],
      },
      {
        id: "q3-1-5",
        text: "Describe your current AI hiring and retention challenges.",
        type: "text",
        placeholder: "Enter AI talent challenges...",
      },
    ],
  },
  {
    id: "d3-2",
    domain: "Talent & Skills",
    name: "Learning & Development",
    questions: [
      {
        id: "q3-2-1",
        text: "Are there active upskilling programs for GenAI capabilities?",
        type: "mcq",
        options: [
          "No programs",
          "Self-directed learning",
          "Occasional workshops",
          "Structured training program",
          "Continuous learning culture with certifications",
        ],
      },
      {
        id: "q3-2-2",
        text: "What GenAI learning initiatives are in place? (Select all that apply)",
        type: "multiselect",
        options: [
          "Online courses (Coursera, Udemy, etc.)",
          "Internal workshops and brown bags",
          "External AI training partners",
          "Certifications (AWS, Google Cloud AI, etc.)",
          "GenAI Proof-of-Concept projects",
          "Hackathons or innovation labs",
          "No structured initiatives",
        ],
      },
      {
        id: "q3-2-3",
        text: "Is there a mentoring or knowledge-sharing program for AI skills?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q3-2-4",
        text: "What is the annual budget for AI/ML training per employee?",
        type: "mcq",
        options: ["$0", "$100-500", "$500-1,000", "$1,000-2,000", "$2,000+"],
      },
      {
        id: "q3-2-5",
        text: "How do you measure the effectiveness of AI training programs?",
        type: "text",
        placeholder: "Describe measurement approach...",
      },
    ],
  },

  // Domain 4: Technology Stack
  {
    id: "d4-1",
    domain: "Technology Stack",
    name: "Cloud & Infrastructure",
    questions: [
      {
        id: "q4-1-1",
        text: "What is your current cloud infrastructure readiness for GenAI workloads?",
        type: "mcq",
        options: [
          "On-premise only",
          "Basic cloud migration",
          "Cloud-native for some workloads",
          "Full cloud-native with GPU access",
          "Multi-cloud with ML-optimized infrastructure",
        ],
      },
      {
        id: "q4-1-2",
        text: "Which cloud providers are you using?",
        type: "multiselect",
        options: [
          "AWS",
          "Google Cloud",
          "Microsoft Azure",
          "On-premise",
          "Hybrid setup",
          "Multiple cloud providers",
        ],
      },
      {
        id: "q4-1-3",
        text: "Do you have GPU capacity or access for model training and inference?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q4-1-4",
        text: "What model serving infrastructure do you use or plan to use?",
        type: "mcq",
        options: [
          "Manual model deployment",
          "Docker containers",
          "Kubernetes orchestration",
          "Serverless (Lambda, Cloud Functions, etc.)",
          "Managed ML service (SageMaker, Vertex AI, etc.)",
        ],
      },
      {
        id: "q4-1-5",
        text: "What is your approach to managing AI model versions and rollback?",
        type: "text",
        placeholder: "Describe your model versioning strategy...",
      },
    ],
  },
  {
    id: "d4-2",
    domain: "Technology Stack",
    name: "MLOps & LLMOps",
    questions: [
      {
        id: "q4-2-1",
        text: "Do you have MLOps / LLMOps practices in place?",
        type: "mcq",
        options: [
          "No ML operations",
          "Manual model deployment",
          "Basic CI/CD for models",
          "Mature MLOps pipeline",
          "Full LLMOps with monitoring and feedback loops",
        ],
      },
      {
        id: "q4-2-2",
        text: "What ML/AI tools and platforms are you currently using?",
        type: "multiselect",
        options: [
          "TensorFlow / PyTorch",
          "Scikit-learn",
          "LangChain / LlamaIndex",
          "OpenAI API / Anthropic",
          "Hugging Face",
          "In-house solutions",
          "No current tooling",
        ],
      },
      {
        id: "q4-2-3",
        text: "Is model performance monitoring and alerting implemented?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q4-2-4",
        text: "What observability and logging infrastructure exists for AI models?",
        type: "mcq",
        options: [
          "Basic logging only",
          "Centralized logging",
          "Full observability (logs, metrics, traces)",
          "Dedicated AI monitoring platform",
          "Enterprise-wide observability with AI-specific features",
        ],
      },
      {
        id: "q4-2-5",
        text: "Describe your approach to handling model drift and retraining.",
        type: "text",
        placeholder: "Describe model management approach...",
      },
    ],
  },

  // Domain 5: Governance & Ethics
  {
    id: "d5-1",
    domain: "Governance & Ethics",
    name: "AI Ethics & Risk",
    questions: [
      {
        id: "q5-1-1",
        text: "Does your organization have an AI ethics framework?",
        type: "mcq",
        options: [
          "No framework",
          "Awareness only",
          "Draft guidelines",
          "Published and enforced framework",
          "Continuous ethics review board",
        ],
      },
      {
        id: "q5-1-2",
        text: "What ethical considerations are addressed? (Select all that apply)",
        type: "multiselect",
        options: [
          "Bias and fairness",
          "Transparency and explainability",
          "Data privacy",
          "Environmental impact",
          "Societal impact",
          "Model security",
          "Not yet addressed",
        ],
      },
      {
        id: "q5-1-3",
        text: "Are there mechanisms for monitoring AI bias and fairness?",
        type: "mcq",
        options: [
          "No monitoring",
          "Ad-hoc testing",
          "Periodic audits",
          "Automated bias detection",
          "Real-time monitoring with remediation",
        ],
      },
      {
        id: "q5-1-4",
        text: "Is there a policy on responsible AI use for employees?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q5-1-5",
        text: "Describe your approach to AI transparency and explainability.",
        type: "text",
        placeholder: "Enter transparency approach...",
      },
    ],
  },
  {
    id: "d5-2",
    domain: "Governance & Ethics",
    name: "Compliance & Risk Management",
    questions: [
      {
        id: "q5-2-1",
        text: "Which regulatory frameworks are you complying with for AI?",
        type: "multiselect",
        options: [
          "EU AI Act",
          "GDPR",
          "Industry-specific regulations",
          "Internal compliance standards",
          "No formal compliance structure",
        ],
      },
      {
        id: "q5-2-2",
        text: "Is there a formal risk assessment process for AI/GenAI initiatives?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q5-2-3",
        text: "What are your top AI-related risks or concerns?",
        type: "text",
        placeholder: "Describe key AI risks...",
      },
      {
        id: "q5-2-4",
        text: "Do you have incident response procedures for AI model failures?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q5-2-5",
        text: "How is AI model performance and security audited?",
        type: "mcq",
        options: [
          "No audits",
          "Ad-hoc reviews",
          "Annual audits",
          "Quarterly reviews with security testing",
          "Continuous monitoring and automated compliance",
        ],
      },
    ],
  },

  // Domain 6: Culture & Change
  {
    id: "d6-1",
    domain: "Culture & Change",
    name: "Organizational Culture",
    questions: [
      {
        id: "q6-1-1",
        text: "How would you describe the organizational attitude toward GenAI adoption?",
        type: "mcq",
        options: [
          "Resistant / fearful",
          "Skeptical but curious",
          "Open to experimentation",
          "Actively embracing",
          "AI-first culture",
        ],
      },
      {
        id: "q6-1-2",
        text: "What are the main concerns regarding GenAI adoption? (Select all that apply)",
        type: "multiselect",
        options: [
          "Job displacement",
          "Data privacy and security",
          "Reliability and hallucinations",
          "Regulatory compliance",
          "Lack of internal expertise",
          "High implementation costs",
          "No significant concerns",
        ],
      },
      {
        id: "q6-1-3",
        text: "Are there employee concerns about GenAI replacing human roles?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q6-1-4",
        text: "What is the level of cross-functional collaboration on GenAI initiatives?",
        type: "mcq",
        options: [
          "Siloed AI team",
          "IT-led with some business input",
          "Regular cross-functional meetings",
          "Embedded business and IT collaboration",
          "Enterprise-wide collaborative culture",
        ],
      },
      {
        id: "q6-1-5",
        text: "Describe communication strategy for GenAI initiatives to employees.",
        type: "text",
        placeholder: "Enter communication strategy...",
      },
    ],
  },
  {
    id: "d6-2",
    domain: "Culture & Change",
    name: "Change Management",
    questions: [
      {
        id: "q6-2-1",
        text: "Is there a structured change management process for AI initiatives?",
        type: "mcq",
        options: [
          "No process",
          "Reactive approach",
          "Basic change plans",
          "Structured methodology",
          "Embedded change management culture",
        ],
      },
      {
        id: "q6-2-2",
        text: "What change management activities are planned or underway?",
        type: "multiselect",
        options: [
          "Executive stakeholder alignment",
          "Employee awareness campaigns",
          "Training and skill development",
          "Pilot programs or quick wins",
          "Feedback collection and iteration",
          "Change resistance management",
          "No formal plan",
        ],
      },
      {
        id: "q6-2-3",
        text: "Are there quick-win projects to demonstrate GenAI value?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q6-2-4",
        text: "How are GenAI successes and learnings shared across the organization?",
        type: "mcq",
        options: [
          "No formal sharing",
          "Ad-hoc discussions",
          "Quarterly townhalls",
          "Regular newsletters and forums",
          "Embedded in governance and processes",
        ],
      },
      {
        id: "q6-2-5",
        text: "What is your approach to iterating based on feedback?",
        type: "text",
        placeholder: "Describe feedback iteration process...",
      },
    ],
  },

  // Domain 7: Partnerships & Ecosystem
  {
    id: "d7-1",
    domain: "Partnerships & Ecosystem",
    name: "External Partnerships",
    questions: [
      {
        id: "q7-1-1",
        text: "Are you leveraging external AI/GenAI vendors or partners?",
        type: "mcq",
        options: [
          "No external partnerships",
          "Evaluating vendors",
          "Single vendor partnership",
          "Multiple strategic partners",
          "Integrated ecosystem of partners",
        ],
      },
      {
        id: "q7-1-2",
        text: "Which types of external partnerships are you pursuing?",
        type: "multiselect",
        options: [
          "AI consulting firms",
          "Cloud providers (AWS, Azure, GCP)",
          "SaaS AI tools providers",
          "Model providers (OpenAI, Anthropic, etc.)",
          "System integrators",
          "Academic institutions",
          "No external partnerships",
        ],
      },
      {
        id: "q7-1-3",
        text: "Do you have integration with third-party AI APIs or models?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q7-1-4",
        text: "What is your approach to vendor lock-in risk?",
        type: "mcq",
        options: [
          "Not considered",
          "Minimal consideration",
          "Active mitigation strategy",
          "Multi-vendor approach",
          "Open-source first with proprietary fallback",
        ],
      },
      {
        id: "q7-1-5",
        text: "Describe your vendor evaluation and onboarding criteria.",
        type: "text",
        placeholder: "Enter vendor evaluation criteria...",
      },
    ],
  },
  {
    id: "d7-2",
    domain: "Partnerships & Ecosystem",
    name: "Open Source & Standards",
    questions: [
      {
        id: "q7-2-1",
        text: "What is your organization's open-source AI strategy?",
        type: "mcq",
        options: [
          "Not using open-source AI",
          "Limited open-source adoption",
          "Moderate adoption of open-source",
          "Heavy reliance on open-source",
          "Contributing back to open-source community",
        ],
      },
      {
        id: "q7-2-2",
        text: "Which open-source AI tools/frameworks are you using?",
        type: "multiselect",
        options: [
          "TensorFlow",
          "PyTorch",
          "Hugging Face Transformers",
          "LangChain",
          "LLaMA",
          "Llama 2",
          "Not using open-source",
        ],
      },
      {
        id: "q7-2-3",
        text: "Are you participating in AI standards development or consortiums?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q7-2-4",
        text: "What industry standards are you adopting for AI?",
        type: "multiselect",
        options: [
          "MLflow",
          "ONNX",
          "ISO/IEC standards",
          "NIST AI RMF",
          "Internal standards only",
          "No standards",
        ],
      },
      {
        id: "q7-2-5",
        text: "How do you manage open-source licensing and compliance?",
        type: "text",
        placeholder: "Describe OSS compliance approach...",
      },
    ],
  },

  // Domain 8: ROI & Value Realization
  {
    id: "d8-1",
    domain: "ROI & Value Realization",
    name: "Business Impact Measurement",
    questions: [
      {
        id: "q8-1-1",
        text: "Have you measured the business impact of GenAI initiatives so far?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q8-1-2",
        text: "What metrics do you use to measure GenAI success?",
        type: "multiselect",
        options: [
          "Productivity gains",
          "Cost savings",
          "Revenue impact",
          "Customer satisfaction",
          "Time-to-market improvement",
          "Employee productivity",
          "No formal metrics",
        ],
      },
      {
        id: "q8-1-3",
        text: "What quantifiable benefits have been realized from GenAI?",
        type: "text",
        placeholder: "Describe measured benefits...",
      },
      {
        id: "q8-1-4",
        text: "What has been your total investment in GenAI initiatives?",
        type: "mcq",
        options: [
          "$0 (not yet invested)",
          "$1K-100K",
          "$100K-500K",
          "$500K-2M",
          "$2M+",
        ],
      },
      {
        id: "q8-1-5",
        text: "What is your expected ROI timeline for GenAI investments?",
        type: "mcq",
        options: [
          "Not evaluated",
          "3-6 months",
          "6-12 months",
          "1-2 years",
          "2+ years / Long-term investment",
        ],
      },
    ],
  },
  {
    id: "d8-2",
    domain: "ROI & Value Realization",
    name: "Scaling & Future Vision",
    questions: [
      {
        id: "q8-2-1",
        text: "What is your plan for scaling GenAI beyond pilot projects?",
        type: "mcq",
        options: [
          "No scaling plans",
          "Evaluating feasibility",
          "Scaling to specific departments",
          "Enterprise-wide rollout planned",
          "Already scaling across organization",
        ],
      },
      {
        id: "q8-2-2",
        text: "What are the biggest barriers to GenAI adoption in your organization?",
        type: "multiselect",
        options: [
          "Technical complexity",
          "Lack of skills",
          "Data quality issues",
          "Regulatory concerns",
          "Cost/Budget constraints",
          "Organizational resistance",
          "No significant barriers",
        ],
      },
      {
        id: "q8-2-3",
        text: "Describe your organization's GenAI vision for the next 3 years.",
        type: "text",
        placeholder: "Enter your 3-year GenAI vision...",
      },
      {
        id: "q8-2-4",
        text: "Are you planning to build proprietary GenAI capabilities?",
        type: "binary",
        options: ["Yes", "No"],
      },
      {
        id: "q8-2-5",
        text: "What investment is planned for GenAI in the next 12 months?",
        type: "mcq",
        options: [
          "No planned investment",
          "$1K-50K",
          "$50K-500K",
          "$500K-2M",
          "$2M+",
        ],
      },
    ],
  },
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getMaturityLabel(score: number): string {
  if (score >= 100) return "Professional";
  if (score >= 75) return "Transformative";
  if (score >= 50) return "Explorer";
  if (score >= 25) return "Learner";
  return "Initial";
}

export function getMaturityColor(score: number): string {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-chart-3";
  return "text-destructive";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "evaluated":
      return "bg-accent/15 text-accent border-accent/30";
    case "in-progress":
      return "bg-primary/15 text-primary border-primary/30";
    case "pending":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  companiesCount: number;
}

export const consultants: Consultant[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    email: "sarah.chen@sidathyder.com",
    createdAt: "2024-01-15",
    companiesCount: 5,
  },
  {
    id: "c2",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@sidathyder.com",
    createdAt: "2024-01-20",
    companiesCount: 3,
  },
  {
    id: "c3",
    name: "Maria Rodriguez",
    email: "maria.rodriguez@sidathyder.com",
    createdAt: "2024-02-01",
    companiesCount: 4,
  },
  {
    id: "c4",
    name: "James Wilson",
    email: "james.wilson@sidathyder.com",
    createdAt: "2024-02-05",
    companiesCount: 6,
  },
  {
    id: "c5",
    name: "Emily Chang",
    email: "emily.chang@sidathyder.com",
    createdAt: "2024-02-10",
    companiesCount: 2,
  },
];

export function getConsultantById(id: string): Consultant | undefined {
  return consultants.find((c) => c.id === id);
}

export function getCompaniesByConsultant(consultantId: string): Company[] {
  return companies.filter(
    (c) => c.consultant === getConsultantById(consultantId)?.name,
  );
}
