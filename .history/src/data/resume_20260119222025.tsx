import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, BookOpen, Palette, Music } from "lucide-react";

export const DATA = {
  name: "James Spalding",
  initials: "JS",
  url: "https://jamesspalding.org/",
  location: "Dublin, Ireland",
  locationLink: "https://www.google.com/maps/place/dublin+ireland",
  description:
    "Bilingual Creative Technologist specializing in rapid prototyping engineering, agentic AI orchestration, and product-led development. I turn ambitious visions into production-ready solutions.",
  summary: `I'm a Bilingual Creative Technologist with 12+ years bridging design, engineering, and product strategy. My core expertise lies in three interconnected disciplines:

**Rapid Prototyping Engineering** - I build production-quality MVPs at exceptional speed. From concept to deployed solution in days, not months. I've honed the craft of high-velocity development, knowing when to optimize for learning vs. scale, and how to architect systems that evolve gracefully.

**Agentic AI Orchestration** - I design and implement AI-native workflows where multiple AI agents collaborate to solve complex problems. I specialize in context management, prompt engineering, and building systems where AI amplifies human capability rather than replacing it. This includes orchestrating Claude, GPT, and custom agents to automate research, code generation, and decision support.

**Product-Led Thinking** - I approach every technical decision through the lens of user value. I facilitate workshops, define jobs-to-be-done, and lead teams to deliver outcomes, not just outputs. My process is hands-on and iterative, always keeping the user's needs and business goals at the center.

I thrive in environments where I can operate as a force multiplier, taking founder vision, translating it into technical architecture, and leading execution from concept through production delivery. I'm at my best when building the future alongside highly driven teams who value speed, craft, and impact.`,
  avatarUrl: "/me.png",
  skills: [
    // Core Expertise
    "Rapid Prototyping Engineering",
    "Agentic AI Orchestration",
    "Product-Led Development",
    "AI Context Management",
    "Multi-Agent Systems",
    // AI & Engineering
    "Claude API & Anthropic SDK",
    "OpenAI API & GPT Models",
    "Prompt Engineering",
    "AI-native Development",
    "LLM Application Architecture",
    // Technical Stack
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Vercel AI SDK",
    "TailwindCSS",
    "Postgres",
    "Prisma",
    "Docker",
    // Product & Strategy
    "Product Strategy",
    "Jobs-to-be-Done Framework",
    "Workshop Facilitation",
    "Cross-functional Leadership",
    "MVP Development",
    "Customer Discovery",
    // Additional
    "Cloud-native Systems",
    "System Thinking",
    "AR/VR",
    "Video Production",
    "Music Production",
    "Public Speaking"
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/story", icon: BookOpen, label: "My Story" },
    { href: "/design", icon: Palette, label: "Design" },
    { href: "/music", icon: Music, label: "Music" },
  ],
  contact: {
    email: "jamesspaldingles@gmail.com",
    tel: "+353-85-8408496",
    website: "https://jamesspalding.vercel.app/",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/PodJamz",
        icon: Icons.github,
        navbar: false,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/jameslawrencespalding/",
        icon: Icons.linkedin,
        navbar: false,
      },
      X: {
        name: "X",
        url: "https://x.com/James__Spalding",
        icon: Icons.x,
        navbar: false,
      },
      website: {
        name: "Website",
        url: "https://jamesspalding.vercel.app/",
        icon: Icons.globe,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Multiple Stealth AI Startups",
      href: "",
      badges: [],
      location: "Remote, Ireland",
      title: "Head of Product/CPO Consultant",
      logoUrl: "🥷",
      start: "Jan 2025",
      end: "Present",
      description:
        `Providing expert consulting to multiple stealth-mode AI startups across AI memory, Medical, Law, and Finance sectors, always bringing an eye for design to every product. Led end-to-end product initiatives, translating complex founder and visionary ideas into actionable technical requirements and MVPs, and guiding teams from initial concept through rapid prototyping to production delivery. Operated as a self-contained unit: facilitating collaborative workshops with founders, stakeholders, and users to define real jobs-to-be-done and value propositions, making decisions, running experiments, and owning delivery while multiplying the productivity of others around me. Championed AI-native, product-led development, leveraging modern tools and iterative cycles to accelerate learning, scale impact, and ensure every solution delivered real value to users and the business. Worked closely with engineers and product builders, fostering a culture of deep listening, collaborative problem-solving, and hands-on leadership, and driving adoption of modern, high velocity development practices. Built and iterated on cloud-native systems that scale across domains and teams, always focused on delivering practical, user-centered solutions in the most efficient way possible. Deepened expertise in AI context management and orchestration, and honed rapid prototyping skills for cross-domain products.`
    },
    {
      company: "MiAI Law",
      href: "https://miai.law/",
      badges: [],
      location: "Remote, Ireland",
      title: "AI Product Lead",
      logoUrl:
        "https://miai.law/wp-content/uploads/2024/08/footer-logo-new-1.png",
      start: "Nov 2024",
      end: "Jan 2025",
      description:
        `Delivered impactful front-end development for a cutting-edge AI Legal Research System. Focused on scalable, high-efficiency solutions tailored to the needs of top-tier law firms in Australia. Took ownership of product delivery from concept to launch, iterating quickly based on feedback. Integrated AI-powered features and automation to streamline legal research workflows. Developed advanced skills in legal tech, automation, and user-centric design for professional services.`
    },
    {
      company: "MarketSizer",
      href: "https://www.marketsizer.io/",
      badges: [],
      location: "Remote, Dublin",
      title: "Product Strategy Consultant",
      logoUrl: "/projects/marketsizer_logo.jpeg",
      start: "Mar 2024",
      end: "Oct 2024",
      description:
        `Spearheaded product acceleration and strategic growth initiatives. Delivered expert guidance on product strategy, user journey optimization, and agile front-end development. Led cross-functional teams to rapidly validate and deliver new product features. Used real user data and feedback to drive continuous improvement. Gained experience in market analysis, growth strategy, and agile product delivery at scale.`
    },
    {
      company: "Emergegen AI",
      href: "https://www.emergegen.ai/",
      badges: [],
      location: "Ireland",
      title: "Chief Product Officer",
      logoUrl: "/projects/emergegen_logo.jpeg",
      start: "Dec 2023",
      end: "Mar 2024",
      description:
        `Directed comprehensive AI roadmaps across diverse industries. Led executive strategy sessions, front-end product development, and cross-disciplinary innovation for financial and music sectors. Built and scaled AI-native solutions, focusing on long-term value and system sustainability. Mentored teams in modern development practices and experimentation. Expanded leadership in cross-industry AI, executive strategy, and sustainable product architecture.`
    },
    {
      company: "ESW",
      href: "https://esw.com/",
      badges: [],
      location: "Ireland",
      title: "Product Strategy Analyst",
      logoUrl: "/projects/esw_logo.jpeg",
      start: "Nov 2022",
      end: "Dec 2023",
      description:
        `Influenced product direction through in-depth trend analysis. Designed and conducted AI workshops that shaped strategic decisions and inspired innovative approaches within the organization. Championed a culture of experimentation and pragmatic problem-solving. Led initiatives that spanned teams and domains, driving measurable business impact. Strengthened skills in trend analysis, workshop facilitation, and stakeholder influence.`
    },
    {
      company:
        "Department of Children, Equality, Disability, Integration and Youth",
      href: "",
      badges: [],
      location: "Ireland",
      title:
        "Member - Autism Innovation Strategy Oversight and Advisory Group (Voluntary)",
      logoUrl: "/projects/dcediy_logo.jpeg",
      start: "Dec 2022",
      end: "Present",
      description:
        `Providing forward-thinking advice on national policy, driving progress in autism innovation. Actively shaping a more inclusive, empowered environment for neurodivergent communities. Collaborated with diverse stakeholders to influence national strategy and policy. Gained experience in advocacy, public sector engagement, and inclusive policy development.`
    },
    {
      company: "Vstage",
      href: "",
      badges: [],
      location: "Ireland",
      title: "Product Manager Consultant",
      logoUrl: "/vstage_logo.png",
      start: "Mar 2022",
      end: "Sep 2022",
      description:
        `Revitalized product capabilities by building an innovative AR product line. Managed agile workflows, defined strategic roadmaps, and guided multi-functional teams to success. Strengthened skills in AR/VR product development, agile project management, and cross-functional leadership. Delivered a new product line from concept to launch, learning to balance technical feasibility with user experience.`
    },
    {
      company: "Voalá Immersive Technology",
      href: "",
      badges: [],
      location: "Ireland",
      title: "Chief Product Officer & Founder",
      logoUrl: "/projects/voala_logo.jpeg",
      start: "Feb 2019",
      end: "Jan 2022",
      description:
        `Founded and led a pioneering AR startup. Secured key funding, steered product vision, drove software development, and executed a strategic go-to-market plan. Developed entrepreneurial skills, fundraising, and end-to-end product ownership. Learned to build and scale a team, and to navigate the challenges of early-stage growth.`
    },
    {
      company: "NICB (Dublin City University)",
      href: "",
      badges: [],
      location: "Ireland",
      title: "Facilities Engineer",
      logoUrl: "/projects/DCU_logo.jpeg",
      start: "Jul 2017",
      end: "Oct 2018",
      description:
        `Ensured the reliability and compliance of cutting-edge laboratory equipment. Delivered essential technical support, maintaining a safe, efficient research environment. Gained expertise in technical operations, compliance, and process improvement. Improved problem-solving skills and attention to detail in a high-stakes environment.`
    },
    {
      company: "TOMRA Sorting Food",
      href: "",
      badges: [],
      location: "Ireland",
      title: "Business Development Specialist (LATAM)",
      logoUrl: "/projects/TOMRA_logo.jpeg",
      start: "Apr 2016",
      end: "Apr 2017",
      description:
        `Strategized market expansion into Latin America through detailed competitor mapping and lead generation. Influenced high-level decisions on regional growth. Built skills in international business development, market research, and relationship management. Learned to adapt strategies for new markets and diverse cultures.`
    },
    {
      company: "Financial Way Group LLC",
      href: "",
      badges: [],
      location: "Remote",
      title: "Foreign Trade Representative",
      logoUrl: "",
      start: "Apr 2015",
      end: "Apr 2016",
      description:
        `Streamlined international trade operations by identifying reliable suppliers and negotiating favorable terms. Navigated complex legal frameworks to secure successful trade outcomes. Developed negotiation, contract management, and cross-border communication skills. Enhanced ability to manage risk and ensure compliance in global trade.`
    },
    {
      company: "Pracatum",
      href: "",
      badges: [],
      location: "Brazil",
      title: "English Language Teacher & Technologist",
      logoUrl: "",
      start: "Jul 2011",
      end: "Dec 2015",
      description:
        `Developed and implemented English language programs integrated with state-of-the-art learning technology. Enhanced educational outcomes through innovative course designs and IT solutions. Gained experience in curriculum design, educational technology, and classroom leadership. Learned to communicate complex ideas simply and adapt teaching to diverse learners.`
    },
    {
      company: "ReLOVEution",
      href: "",
      badges: [],
      location: "Brazil",
      title: "Band Manager",
      logoUrl: "",
      start: "Jun 2008",
      end: "Dec 2011",
      description:
        `Directed all facets of band management, from booking and payroll to branding and tours. Strengthened the group's market presence through strategic planning and marketing initiatives. Built skills in creative direction, event planning, and team coordination. Learned to manage projects end-to-end and foster a collaborative, creative environment.`
    },
  ],
  education: [
    {
      school: "Laureate Education, Brazil",
      href: "",
      degree:
        "Postgraduate Degree in Software Entrepreneurship & Startup Creation (NFQ Level 9)",
      logoUrl: "",
      start: "2018",
      end: "2019",
    },
    {
      school: "Universidade Estacio, Brazil",
      href: "",
      degree: "Diploma in Systems Analysis & Development (NFQ Level 7)",
      logoUrl: "",
      start: "2015",
      end: "2017",
    },
    {
      school: "Udemy",
      href: "https://udemy.com",
      degree: "Jira Agile Project Management Certification (2022)",
      logoUrl: "",
      start: "",
      end: "",
    },
    {
      school: "Adobe",
      href: "https://www.adobe.com",
      degree: "Adobe Certified Associate in Graphic Design & Illustration (2020)",
      logoUrl: "",
      start: "",
      end: "",
    },
  ],
  projects: [
    {
      title: "CodeQuality",
      href: "https://codequality-iamai.vercel.app",
      dates: "2025",
      active: true,
      description:
        "An AI-powered code quality dashboard built as a design engineering showcase for an xAI role application. Features intelligent code analysis through OpenAI integration, a clean modern interface, and production-ready architecture. A demonstration of rapid prototyping and polished UI/UX design thinking.",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "OpenAI API",
        "AI Gateway",
        "Vercel",
        "Design Engineering",
        "pnpm",
      ],
      links: [
        {
          type: "Website",
          href: "https://codequality-iamai.vercel.app",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "GitHub",
          href: "https://github.com/8gi-foundation/codequality",
          icon: <Icons.github className="size-3" />,
        }
      ],
      image: "",
      video: "",
    },
    {
      title: "AI James OS",
      href: "https://jamesspalding.org",
      dates: "2025",
      active: true,
      description:
        "A fully agentic portfolio operating system that started as a way to get hired but became something worth acquiring. Features 43 design themes, AI-native workflows with Claude & GPT orchestration, iOS-style interface, real-time prototyping sandbox, and multi-agent collaboration. Soon to become 8gent.app.",
      technologies: [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Claude API",
        "Anthropic SDK",
        "OpenAI API",
        "Vercel AI SDK",
        "Multi-Agent Orchestration",
        "Convex",
        "Framer Motion",
        "TailwindCSS",
        "43 Design Themes",
      ],
      links: [
        {
          type: "Website",
          href: "https://jamesspalding.org",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Coming Soon",
          href: "https://8gent.app",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "/projects/ai-james-os.png",
      video: "",
    },
    {
      title: "Good Peoples Ventures",
      href: "https://goodpeoplesventures.com",
      dates: "2025",
      active: true,
      description:
        "A creatively designed website for Good Peoples Ventures, a forward-thinking venture capital firm focused on investing in founders who build companies that matter. Built with a focus on visual storytelling, modern design principles, and an engaging user experience that reflects their mission of building better businesses by investing in people first.",
      technologies: [
        "Web Design",
        "Creative Development",
        "Modern UI/UX",
        "Visual Storytelling",
      ],
      links: [
        {
          type: "Website",
          href: "https://goodpeoplesventures.com",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "",
      video: "",
    },
    {
      title: "Way",
      href: "https://way-lovat.vercel.app",
      dates: "2025",
      active: true,
      description:
        "A contemplative AI experience inspired by Lao Tzu, featuring voice interactions (speech-to-text and text-to-speech), streaming responses, RAG-powered grounded reflections from the Tao Te Ching, and a beautiful real-time WebGPU water simulation that serves as the AI entity. Built to showcase how AI can feel like a calm companion rather than a tool.",
      technologies: [
        "Next.js 14",
        "TypeScript",
        "Vercel AI SDK",
        "OpenAI",
        "RAG",
        "Convex",
        "WebGPU",
        "WGSL",
        "Speech-to-Text",
        "Text-to-Speech",
        "Vector Search",
        "TailwindCSS",
      ],
      links: [
        {
          type: "Website",
          href: "https://way-lovat.vercel.app",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "/projects/way.png",
      video: "",
    },
    {
      title: "IAMAI Research",
      href: "https://iamai-research.vercel.app/",
      dates: "2025",
      active: true,
      description:
        "Phase 1 of giving AI superpowers to all is an advanced AI-powered research interface built with xAI's Grok model, featuring voice interactions through ElevenLabs, real-time weather data, flight tracking, and multi-modal capabilities. Integrates multiple APIs for comprehensive search results including maps, translations, and media content.",
      technologies: [
        "Next.js 14",
        "TypeScript",
        "TailwindCSS",
        "Shadcn UI",
        "ElevenLabs API",
        "xAI Grok",
        "Server Actions",
        "OpenWeather API",
        "Google Maps",
        "Mapbox",
        "Microsoft Translator",
      ],
      links: [
        {
          type: "Website",
          href: "https://iamai-research.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "/iamai-research.png",
      video: "",
    },
    {
      title: "Infinity School Dublin",
      href: "https://www.instagram.com/infinityschooldublin/profilecard/?igsh=dnQyZzQxa28ycHN4",
      dates: "2024",
      active: true,
      description:
        "A social project with fellow parents, professionals, and neurodiversity advocates aimed at establishing a special school for autistic children in North Dublin, fostering inclusive and community-driven education.",
      technologies: [
        "Social Innovation",
        "Neurodiversity Advocacy",
        "Community Organizing",
        "Inclusive Education",
      ],
      links: [
        {
          type: "Website",
          href: "https://www.instagram.com/infinityschooldublin/",
          icon: <Icons.globe className="size-3" />,
        }
      ],
      image: "/infinity-school.png",
      video: "",
    },
  ],
  hackathons: [
    {
      title: "Hackathon ESW AI Agents",
      dates: "October 23rd, 2023",
      location: "Dublin, Ireland",
      description:
        "Hosted an AI Agent hackathon for over 100 participants, focused on creating innovative solutions using AI agents.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPink5vzOq89eu7BQRRt6NODOE9BZbpPlv8g&s",
      links: [],
    },
  ],
} as const;