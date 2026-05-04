/**
 * Educational articles catalog — used for related-articles cards and the Learning hub.
 */
window.ARTICLES_CATALOG = [
  {
    id: "cbc-overview",
    title: "Understanding Kenya’s CBC: A Clear Overview",
    slug: "cbc-overview.html",
    excerpt:
      "What the Competency-Based Curriculum is, how it is structured, and what it means for learners and families.",
    image: "assets/img/class.jpg",
    date: "2026-01-10",
    author: "Little Feet Academy",
  },
  {
    id: "importance-of-cbc",
    title: "Why CBC Matters for Today’s Learners",
    slug: "importance-of-cbc.html",
    excerpt:
      "How competency-based learning builds skills, confidence, and real-world readiness from an early age.",
    image: "assets/img/kids2.jpg",
    date: "2026-01-12",
    author: "Little Feet Academy",
  },
  {
    id: "cbc-vs-844",
    title: "CBC vs. 8-4-4: Key Differences Explained",
    slug: "cbc-vs-844.html",
    excerpt:
      "A side-by-side look at objectives, assessment, and classroom practice under CBC compared with the 8-4-4 system.",
    image: "assets/img/student.jpg",
    date: "2026-01-14",
    author: "Little Feet Academy",
  },
  {
    id: "understanding-cbe",
    title: "Understanding Competency-Based Education (CBE)",
    slug: "understanding-cbe.html",
    excerpt:
      "Definitions, principles, and how CBE shapes teaching and learning in Kenyan schools today.",
    image: "assets/img/science-club.jpg",
    date: "2026-01-16",
    author: "Little Feet Academy",
  },
  {
    id: "cbc-impact",
    title: "The Impact of CBC on Students and Classrooms",
    slug: "cbc-impact.html",
    excerpt:
      "Observed benefits for engagement, collaboration, and holistic growth when CBC is implemented well.",
    image: "assets/img/class.jpg",
    date: "2026-01-18",
    author: "Little Feet Academy",
  },
  {
    id: "cbc-challenges",
    title: "Common CBC Challenges — and How Schools Respond",
    slug: "cbc-challenges.html",
    excerpt:
      "Honest look at resources, time, and training — plus practical ways schools and parents can support success.",
    image: "assets/img/class.jpg",
    date: "2026-01-20",
    author: "Little Feet Academy",
  },
  {
    id: "role-of-parents",
    title: "The Role of Parents in a CBC Journey",
    slug: "role-of-parents.html",
    excerpt:
      "How families can reinforce competencies at home and partner with teachers for lasting outcomes.",
    image: "assets/img/kids2.jpg",
    date: "2026-01-22",
    author: "Little Feet Academy",
  },
  {
    id: "our-school-cbc",
    title: "How Little Feet Academy Implements CBC",
    slug: "our-school-cbc.html",
    excerpt:
      "Our approach to pathways, assessment for learning, and nurturing every child in Ongata Rongai.",
    image: "assets/img/student.jpg",
    date: "2026-01-24",
    author: "Little Feet Academy",
  },
];

/**
 * Return up to `count` related articles (excludes current id; rotates start for variety per page).
 */
window.getRelatedArticles = function (currentId, count) {
  const n = typeof count === "number" ? count : 3;
  const others = window.ARTICLES_CATALOG.filter(function (a) {
    return a.id !== currentId;
  });
  if (others.length === 0) return [];
  let start = 0;
  for (let i = 0; i < currentId.length; i++) {
    start += currentId.charCodeAt(i);
  }
  start = start % others.length;
  const out = [];
  const take = Math.min(n, others.length);
  for (let k = 0; k < take; k++) {
    out.push(others[(start + k) % others.length]);
  }
  return out;
};
