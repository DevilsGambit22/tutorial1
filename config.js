window.ACFA_CONFIG = {
  // Chess.com club URL ID used by the Public API.
  clubSlug: "and-chess-for-all-sidebar-academy",
  newestMemberLimit: 5,
  memberGoal: 100,

  // These values appear only if the Chess.com API is temporarily unavailable.
  memberCountFallback: 16,
  newestMembersFallback: [
    "Username1",
    "Username2",
    "Username3",
    "Username4",
    "Username5"
  ],

  events: [
    { date: "2026-08-05", title: "Beginner HTML Lesson", type: "lesson" },
    { date: "2026-08-12", title: "Sidebar Design Workshop", type: "workshop" },
    { date: "2026-08-19", title: "Community Showcase", type: "showcase" }
  ],
  codeTips: [
    {
      label: "CSS",
      code: "display: grid; grid-template-columns: repeat(2, 1fr);",
      explanation: "CSS Grid creates clean columns that can collapse into one column on mobile."
    },
    {
      label: "HTML",
      code: "<section aria-labelledby=\"section-title\">...</section>",
      explanation: "Semantic HTML improves structure, accessibility, and readability."
    },
    {
      label: "JAVASCRIPT",
      code: "localStorage.setItem('acfaTheme', theme);",
      explanation: "Local storage remembers a visitor’s preference without needing a database."
    },
    {
      label: "CSS",
      code: "width: min(100%, 760px);",
      explanation: "The min() function keeps a layout responsive while limiting its maximum width."
    }
  ]
};
