"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CATEGORIES } from '@/constants';
import { slugify } from '@/utils/slugify';
import {
  ChevronRight,
  BookOpen,
  Search,
  MessageSquare,
  Globe,
  ImageIcon,
  Bookmark,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  FolderOpen,

  Database,
  Brain,
  Lock,
  FileText,
  Image as ImageIconLucide,
  Cloud,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const as const },
  },
};

const featureCards = [
  {
    icon: BookOpen,
    title: 'Browse the Library',
    description: `Explore ${CATEGORIES.length - 1} curated categories — from Tafsir to Jurisprudence.`,
    href: '/',
    color: 'emerald',
    span: 'col-span-1 md:col-span-2 lg:col-span-2',
    height: 'min-h-[200px]',
  },
  {
    icon: Search,
    title: 'AI Context Finder',
    description:
      'Search across every book simultaneously. Find which chapter or page discusses any topic.',
    href: '/assistant',
    color: 'blue',
    span: 'col-span-1',
    height: 'min-h-[200px]',
  },
  {
    icon: MessageSquare,
    title: 'Book Chat',
    description:
      'Ask questions in natural language. Get answers grounded in Maududi\'s actual text.',
    href: '/',
    color: 'purple',
    span: 'col-span-1',
    height: 'min-h-[160px]',
  },
  {
    icon: Globe,
    title: '6 Languages',
    description:
      'Read and chat in English, Urdu, Arabic, Turkish, Persian, and Bengali.',
    href: '/',
    color: 'amber',
    span: 'col-span-1',
    height: 'min-h-[160px]',
  },
  {
    icon: ImageIcon,
    title: 'Image Search',
    description:
      'Upload a photo of a book page. The AI identifies the source and provides context.',
    href: '/',
    color: 'rose',
    span: 'col-span-1 md:col-span-2',
    height: 'min-h-[160px]',
  },
  {
    icon: Bookmark,
    title: 'Reading Progress',
    description:
      'Track your journey with bookmarks, history, and progress across all books.',
    href: '/account',
    color: 'indigo',
    span: 'col-span-1',
    height: 'min-h-[160px]',
  },
];

const techStack = [
  { name: 'Frontend', tech: 'Next.js 15, React 19, TypeScript', icon: Zap },
  { name: 'Styling', tech: 'Tailwind CSS 4, Custom Design System', icon: Sparkles },
  { name: 'Database', tech: 'MongoDB', icon: Database },
  { name: 'AI/ML', tech: 'Groq (Llama 3, Mixtral), Embeddings', icon: Brain },
  { name: 'Auth', tech: 'Custom JWT + Google OAuth', icon: Lock },
  { name: 'PDF', tech: 'React-PDF, PDF.js', icon: FileText },
  { name: 'Image', tech: 'Tesseract.js (OCR), Sharp', icon: ImageIconLucide },
  { name: 'Deploy', tech: 'Vercel Edge, Docker', icon: Cloud },
];

const dataSources = [
  { name: 'Jamaat-e-Islami Pakistan', url: 'https://jamaat.org' },
  { name: 'Jamaat-e-Islami Hind', url: 'https://jamaateislamihind.org' },
  { name: 'Markazi Maktaba Islami Publishers, Delhi', url: null },
  { name: 'Islamic Foundation, UK', url: null },
  { name: 'Darussalam Publishers', url: null },
  { name: 'Rekhta.org (Urdu Digital Library)', url: 'https://rekhta.org' },
  { name: 'Internet Archive / Archive.org', url: 'https://archive.org' },
];

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600',
    icon: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600',
    icon: 'text-blue-600 dark:text-blue-400',
    glow: 'group-hover:shadow-blue-500/10',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600',
    icon: 'text-purple-600 dark:text-purple-400',
    glow: 'group-hover:shadow-purple-500/10',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-600',
    icon: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-amber-500/10',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800/60 hover:border-rose-400 dark:hover:border-rose-600',
    icon: 'text-rose-600 dark:text-rose-400',
    glow: 'group-hover:shadow-rose-500/10',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600',
    icon: 'text-indigo-600 dark:text-indigo-400',
    glow: 'group-hover:shadow-indigo-500/10',
  },
};

function FeatureCard({ feature }: { feature: (typeof featureCards)[0] }) {
  const c = colorMap[feature.color as keyof typeof colorMap];
  const Icon = feature.icon;
  return (
    <motion.div
      variants={itemVariants}
      className={`group relative ${feature.span} ${feature.height}`}
    >
      <div
        className={`h-full p-6 sm:p-7 rounded-2xl border ${c.border} ${c.bg} transition-all duration-300 hover:shadow-xl ${c.glow} hover:-translate-y-1 flex flex-col`}
      >
        <div
          className={`w-11 h-11 rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-lg">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
          {feature.description}
        </p>
        <Link
          href={feature.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mt-4 group/link"
        >
          Explore
          <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category, index }: { category: string; index: number }) {
  const icons: Record<string, string> = {
    Tafsir: '\u{1F4DC}',
    Politics: '\u{1F3DB}',
    Theology: '\u{1F9E0}',
    Economics: '\u{1F4B0}',
    Jurisprudence: '\u2696\uFE0F',
    'Social Issues': '\u{1F465}',
    History: '\u{1F4DC}',
    Guidance: '\u{1F9ED}',
  };
  const slug = slugify(category);
  const delays = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { delay: delays[index] || 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const as const },
        },
      }}
    >
      <Link
        href={`/${slug}`}
        className="group relative block p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 dark:group-hover:from-emerald-950/20 dark:group-hover:to-teal-950/10 transition-all duration-300" />
        <div className="relative">
          <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform duration-300">
            {icons[category] || '\u{1F4D6}'}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-0.5">
            {category}
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Browse
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function StepItem({ step, title, description, index }: { step: number; title: string; description: string; index: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const as const },
        },
      }}
      className="relative flex gap-5 group"
    >
      <div className="flex flex-col items-center">
        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/25">
          {step}
        </span>
        {index < 4 && (
          <div className="w-px flex-1 bg-gradient-to-b from-emerald-300 to-transparent dark:from-emerald-700 mt-2" />
        )}
      </div>
      <div className="pb-8 pt-1.5">
        <strong className="text-gray-900 dark:text-white text-base block mb-0.5">
          {title}
        </strong>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function AboutPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <main className="min-h-screen">
      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-950/40 to-gray-950 dark:from-black dark:via-emerald-950/30 dark:to-black py-24 sm:py-32 lg:py-40"
      >
        {/* grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,150,105,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(5,150,105,0.04)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(5,150,105,0.15),transparent_60%)] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Digital Archive & AI Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
            >
              About{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Maududi&apos;s Legacy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10"
            >
              A digital platform dedicated to preserving, organizing, and making
              accessible the complete intellectual legacy of Sayyid Abul A&apos;la
              Maududi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                <Search className="w-4.5 h-4.5" aria-hidden="true" />
                Try AI Context Finder
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                <BookOpen className="w-4.5 h-4.5" aria-hidden="true" />
                Browse Library
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* decorative orbs */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl pointer-events-none" />
      </section>

      {/* ─── Mission: 3 pillar cards ─── */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-14"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Our{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Mission
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Maududi was described as &ldquo;the most systematic thinker of modern
            Islam.&rdquo; His works span Quranic exegesis, hadith, philosophy, political
            thought, and social reform &mdash; translated into over 40 languages.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 md:grid-cols-3"
        >
          {[
            {
              icon: Shield,
              title: 'Preserve',
              desc: 'Digitally archive the complete corpus of books, booklets, and speeches in high-quality, readable formats.',
              gradient: 'from-emerald-500 to-emerald-600',
            },
            {
              icon: FolderOpen,
              title: 'Organize',
              desc: 'Structure the library by category, language, and theme for intuitive discovery and research.',
              gradient: 'from-teal-500 to-cyan-500',
            },
            {
              icon: Zap,
              title: 'Empower',
              desc: 'Provide AI-powered tools that let anyone read, search, and converse with Maududi\'s ideas in their own language.',
              gradient: 'from-emerald-600 to-teal-600',
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="group relative p-7 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Why This Platform Exists ─── */}
      <section className="py-20 sm:py-28 border-y border-gray-100 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Why This Platform{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Exists
              </span>
            </h2>
            <div className="space-y-5 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                For decades, students of Islamic thought have faced a persistent problem:
                Maududi&rsquo;s works &mdash; among the most systematic and comprehensive
                in modern Islamic literature &mdash; were scattered across physical libraries,
                fragmented PDFs, and inconsistent translations.
              </p>
              <p>
                This platform represents a new approach: a unified, intelligent, and
                accessible digital home for his complete intellectual output. By combining
                meticulous curation with modern AI, we aim to make his ideas as accessible
                as they are profound.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features — Bento Grid ─── */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            What You Can{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Do Here
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
          >
            Powerful tools for researchers, students, and anyone interested in
            Islamic thought.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </section>

      {/* ─── Library Categories ─── */}
      <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-14 text-center"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Library{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Categories
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
            >
              Explore books organized by thematic categories spanning the breadth of
              Islamic scholarship.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CATEGORIES.filter((c) => c !== 'All').map((cat, i) => (
              <CategoryCard key={cat} category={cat} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Works
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Five simple steps to explore, read, and engage with Maududi&apos;s
              complete works.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <StepItem
              step={1}
              title="Explore Categories"
              description="Browse by topic: Tafsir, Politics, Theology, Economics, and more."
              index={0}
            />
            <StepItem
              step={2}
              title="Select a Book"
              description="View details, description, page count, and language availability."
              index={1}
            />
            <StepItem
              step={3}
              title="Read or Chat"
              description="Open the PDF reader, or click &ldquo;Chat with AI&rdquo; to ask questions."
              index={2}
            />
            <StepItem
              step={4}
              title="Search Everything"
              description="Use the AI Context Finder to search across the entire library."
              index={3}
            />
            <StepItem
              step={5}
              title="Upload & Identify"
              description="Use Image Search to identify book pages and find context instantly."
              index={4}
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Technology Stack ─── */}
      <section className="py-20 sm:py-28 border-y border-gray-100 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-14 text-center"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Technology{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Stack
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
            >
              Built with modern technologies for performance, scalability, and
              developer experience.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          >
            {techStack.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="group p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                    {item.tech}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Data Sources ─── */}
      <section className="py-20 sm:py-28 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Data Sources &{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Attribution
            </span>
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p className="leading-relaxed">
              The books and metadata on this platform are sourced from publicly
              available digital archives, published editions, and official
              Jamaat-e-Islami publications.
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Primary sources include:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dataSources.map((source, _i) => (
                <div
                  key={_i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {source.name}
                    </a>
                  ) : (
                    <span className="text-sm">{source.name}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 pt-2">
              If you are a rights holder and believe content should be removed or
              attributed differently, please contact us.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-br from-gray-950 via-emerald-950/40 to-gray-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,150,105,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(5,150,105,0.04)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(5,150,105,0.2),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
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
            className="text-lg text-gray-400 mb-10 max-w-xl mx-auto"
          >
            Start your journey through Maududi&apos;s complete intellectual legacy
            today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              Start AI Search
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Browse Library
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Mini footer ─── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Built with Next.js, MongoDB, and Groq AI. An open-source project for the
          global Muslim community and scholars of Islamic thought.
        </p>
      </footer>
    </main>
  );
}
