import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Engineering", slug: "engineering" },
  { name: "Security", slug: "security" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence" },
  { name: "Frontend", slug: "frontend" },
  { name: "Databases", slug: "databases" },
  { name: "Design", slug: "design" }
];

const DEMO_ARTICLES = [
  {
    title: "Building the Next Generation of SaaS Applications",
    slug: "building-the-next-generation",
    excerpt: "An exhaustive look into how the best engineering teams are transitioning from heavy SPAs to server-driven UI, cutting bundle sizes by 80%.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1618401471353-b98a5233c591?auto=format&fit=crop&q=80&w=1600",
    categorySlug: "engineering",
    authorName: "David Chen"
  },
  {
    title: "Zero Trust Security Architecture in 2026",
    slug: "zero-trust-architecture",
    excerpt: "Why perimeter-based security is dead and how modern enterprises are adopting identity-first zero trust models.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    categorySlug: "security",
    authorName: "Elena Rodriguez"
  },
  {
    title: "The Rise of Autonomous AI Agents",
    slug: "autonomous-ai-agents",
    excerpt: "Moving beyond chat interfaces: how autonomous agents are reshaping developer workflows and CI/CD pipelines.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    categorySlug: "artificial-intelligence",
    authorName: "Sarah Jenkins"
  },
  {
    title: "Mastering Tailwind CSS v4",
    slug: "mastering-tailwind-v4",
    excerpt: "A deep dive into the new engine, dynamic utilities, and how it dramatically simplifies your CSS architecture.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=800",
    categorySlug: "frontend",
    authorName: "Marcus Wei"
  },
  {
    title: "Scaling PostgreSQL for Global Read Access",
    slug: "scaling-postgresql",
    excerpt: "Techniques for setting up robust read replicas and handling global traffic with sub-50ms latency.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    categorySlug: "databases",
    authorName: "Alex Thompson"
  },
  {
    title: "The Psychology of Minimalist UI Design",
    slug: "minimalist-ui-psychology",
    excerpt: "Why stripping away features often leads to higher user engagement and better product metrics.",
    content: "Full content here...",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
    categorySlug: "design",
    authorName: "Jessica Lin"
  }
];

async function main() {
  console.log("Seeding Database...");
  
  // Clear existing
  await prisma.article.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_id",
      email: "demo@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      profileImage: "https://i.pravatar.cc/150?img=11"
    }
  });

  // 2. Create Categories
  for (const cat of CATEGORIES) {
    await prisma.category.create({
      data: { name: cat.name, slug: cat.slug }
    });
  }

  // 3. Create Articles
  const categories = await prisma.category.findMany();
  
  for (let i = 0; i < DEMO_ARTICLES.length; i++) {
    const article = DEMO_ARTICLES[i];
    const cat = categories.find(c => c.slug === article.categorySlug);
    if (!cat) continue;

    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - i); // Stagger dates

    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        isPublished: true,
        publishedAt: publishedDate,
        authorId: user.id,
        categoryId: cat.id
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
