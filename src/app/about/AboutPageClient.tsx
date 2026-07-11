"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/constants';
import { slugify } from '@/utils/slugify';
import { ChevronRight, BookOpen, Search, MessageSquare, Globe, ImageIcon, Bookmark, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
};

const featureCards = [
  {
    icon: BookOpen,
    title: "Browse the Complete Library",
    description: `Explore books across ${CATEGORIES.length - 1} categories including Tafsir, Politics, Theology, Economics, Jurisprudence, Social Issues, History, and Guidance.`,
    href: "/",
    color: "emerald"
  },
  {
    icon: Search,
    title: "AI Context Finder (Global Search)",
    description: "Search across all books simultaneously. Find which book, chapter, or page discusses a specific topic, quote, Quranic verse, or concept.",
    href: "/ai-context-finder",
    color: "blue"
  },
  {
    icon: MessageSquare,
    title: "AI-Powered Book Chat",
    description: "Select any book and ask questions in natural language. Get answers grounded in Maududi's actual text with citations — available in 6 languages.",
    href: "/",
    color: "purple"
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Read and chat in English, Urdu, Arabic, Turkish, Persian, and Bengali — with responses in the same language.",
    href: "/",
    color: "amber"
  },
  {
    icon: ImageIcon,
    title: "Image-Based Search",
    description: "Upload a photo of a book page, handwritten note, or printed text. The AI identifies the source book and provides context, translation, and related passages.",
    href: "/",
    color: "rose"
  },
  {
    icon: Bookmark,
    title: "Reading Progress & History",
    description: "Track your reading journey with bookmarks, reading history, and progress indicators across all books.",
    href: "/account",
    color: "indigo"
  },
];

const techStack = [
  { name: "Frontend", tech: "Next.js 15 (App Router), React 19, TypeScript", icon: "⚛️" },
  { name: "Styling", tech: "Tailwind CSS 4, Custom Design System", icon: "🎨" },
  { name: "Database", tech: "MongoDB (Books, Users, Chat History)", icon: "🍃" },
  { name: "AI/ML", tech: "Groq (Llama 3, Mixtral), Vector Embeddings", icon: "🤖" },
  { name: "Auth", tech: "Custom JWT + Google OAuth", icon: "🔐" },
  { name: "PDF Rendering", tech: "React-PDF, PDF.js", icon: "📄" },
  { name: "Image Processing", tech: "Tesseract.js (OCR), Sharp", icon: "🖼️" },
  { name: "Deployment", tech: "Vercel (Edge Functions), Docker", icon: "☁️" },
];

const dataSources = [
  { name: "Jamaat-e-Islami Pakistan", url: "https://jamaat.org" },
  { name: "Jamaat-e-Islami Hind", url: "https://jamaateislamihind.org" },
  { name: "Markazi Maktaba Islami Publishers, Delhi", url: null },
  { name: "Islamic Foundation, UK", url: null },
  { name: "Darussalam Publishers", url: null },
  { name: "Rekhta.org (Urdu Digital Library)", url: "https://rekhta.org" },
  { name: "Internet Archive / Archive.org", url: "https://archive.org" },
];

function FeatureCard({ feature }: { feature: typeof featureCards[0] }) {
  const colorClasses = {
    emerald: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20",
    blue: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20",
    purple: "border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-purple-50/30 dark:bg-purple-950/20",
    amber: "border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 bg-amber-50/30 dark:bg-amber-950/20",
    rose: "border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20",
    indigo: "border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20",
  };

  const Icon = feature.icon;
  return (
    <motion.div
      key={feature.title}
      variants={itemVariants}
      className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{feature.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">{feature.description}</p>
      <Link
        href={feature.href}
        className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        Explore
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

function CategoryCard({ category }: { category: string }) {
  const icons: Record<string, string> = {
    'Tafsir': '📜',
    'Politics': '🏛️',
    'Theology': '🧠',
    'Economics': '💰',
    'Jurisprudence': '⚖️',
    'Social Issues': '👥',
    'History': '📜',
    'Guidance': '🧭',
  };
  const slug = slugify(category);

  return (
    <motion.div
      key={category}
      variants={itemVariants}
      className="group"
    >
      <Link
        href={`/${slug}`}
        className="block p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{icons[category] || '📖'}</div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">{category}</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Browse books →</p>
      </Link>
    </motion.div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <motion.li variants={itemVariants} className="flex gap-4">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
        {step}
      </span>
      <div className="pt-1">
        <strong className="text-gray-800 dark:text-gray-200 text-base">{title}</strong>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </motion.li>
  );
}

export default function AboutPageClient() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(5,150,105,0.1),_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08),_transparent_50%)] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Digital Archive & AI Platform
            </motion.span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              About <span className="text-emerald-600 dark:text-emerald-400">Maududi's Legacy</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
              A digital platform dedicated to preserving, organizing, and making accessible the complete
              intellectual legacy of Sayyid Abul A&apos;la Maududi — scholar, philosopher, jurist,
              journalist, and founder of Jamaat-e-Islami.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/ai-context-finder"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
                Try AI Context Finder
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                Browse Library
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-teal-300/20 blur-3xl pointer-events-none animate-float-slow-reverse" />
      </section>

      {/* Mission Section */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Our <span className="text-emerald-600 dark:text-emerald-400">Mission</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Sayyid Abul A&apos;la Maududi (1903&ndash;1979) was one of the most systematic and
            influential Islamic thinkers of the modern era. Described by Wilfred Cantwell Smith as
            &ldquo;the most systematic thinker of modern Islam,&rdquo; his works span Quranic
            exegesis (Tafhim-ul-Quran), hadith, Islamic law, philosophy, political thought,
            economics, and social reform. Written originally in Urdu, his books have been translated
            into over 40 languages.
          </motion.p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "🛡️", title: "Preserve", desc: "Digitally archive the complete corpus of Maududi's books, booklets, and speeches in high-quality, readable formats." },
            { icon: "🗂️", title: "Organize", desc: "Structure the library by category, language, and theme for intuitive discovery and research." },
            { icon: "⚡", title: "Empower", desc: "Provide AI-powered tools that let anyone read, search, and converse with Maududi's ideas in their own language." },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why This Platform Exists */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-y border-emerald-100 dark:border-emerald-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 !text-emerald-900 dark:!text-emerald-100">Why This Platform Exists</h2>
            <p>
              For decades, students of Islamic thought have faced a persistent problem: Maududi&rsquo;s
              works — among the most systematic and comprehensive in modern Islamic literature — were
              scattered across physical libraries, fragmented PDFs, and inconsistent translations.
            </p>
            <p>
              This platform represents a new approach: a unified, intelligent, and accessible
              digital home for his complete intellectual output. By combining meticulous curation
              with modern AI, we aim to make his ideas as accessible as they are profound.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What You Can <span className="text-emerald-600 dark:text-emerald-400">Do Here</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful tools for researchers, students, and anyone interested in Islamic thought.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </section>

      {/* Library Categories */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Library <span className="text-emerald-600 dark:text-emerald-400">Categories</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore books organized by thematic categories spanning the breadth of Islamic scholarship.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CATEGORIES.filter(c => c !== 'All').map((cat) => (
            <CategoryCard key={cat} category={cat} />
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It <span className="text-emerald-600 dark:text-emerald-400">Works</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Five simple steps to explore, read, and engage with Maududi's complete works.
            </motion.p>
          </motion.div>

          <motion.ol variants={containerVariants} className="space-y-6 max-w-3xl mx-auto">
            <StepCard step={1} title="Explore Categories" description="Browse by topic: Tafsir, Politics, Theology, Economics, Jurisprudence, Social Issues, History, and Guidance." />
            <StepCard step={2} title="Select a Book" description="View details, description, page count, language availability, and related works." />
            <StepCard step={3} title="Read or Chat" description="Open the PDF reader, or click &ldquo;Chat with AI&rdquo; to ask questions about the book's content." />
            <StepCard step={4} title="Search Everything" description="Use the AI Context Finder to search across the entire library at once." />
            <StepCard step={5} title="Upload & Identify" description="Use Image Search to identify book pages, translate text, and find context instantly." />
          </motion.ol>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Technology <span className="text-emerald-600 dark:text-emerald-400">Stack</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built with modern technologies for performance, scalability, and developer experience.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {techStack.map((item, _index) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.tech}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Data Sources & Attribution */}
      <section className="py-20 sm:py-28 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Data Sources & <span className="text-emerald-600 dark:text-emerald-400">Attribution</span>
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                The books and metadata on this platform are sourced from publicly available digital
                archives, published editions, and the official Jamaat-e-Islami publications. We are
                committed to respecting intellectual property rights.
              </p>
              <p><strong>Primary sources include:</strong></p>
              <ul className="space-y-2">
                {dataSources.map((source, _index) => (
                  <li key={_index} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {source.name}
                      </a>
                    ) : (
                      <span>{source.name}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p>
                Biographical information is drawn from Wikipedia (CC BY-SA 4.0), Encyclopedia.com,
                Oxford Encyclopedia of Islam and the Muslim World, and official Jamaat-e-Islami
                biographical records.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                If you are a rights holder and believe content should be removed or attributed
                differently, please contact us.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Ready to Explore?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto"
          >
            Start your journey through Maududi's complete intellectual legacy today. Browse the library, chat with AI, or search across all works.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/ai-context-finder"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              Start AI Search
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Browse Library
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Built with Next.js, MongoDB, and Groq AI. An open-source project for the global Muslim
          community and scholars of Islamic thought.
        </p>
      </footer>
    </main>
  );
}