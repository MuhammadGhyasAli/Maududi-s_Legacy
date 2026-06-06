export const metadata = {
  title: "About Maududi's Legacy",
  description:
    "A comprehensive digital archive preserving and providing intelligent access to the complete works of Sayyid Abul A'la Maududi (1903–1979), one of the most influential Islamic scholars of the 20th century. Browse 77+ books, read online, and chat with AI trained on his writings.",
};

import Link from 'next/link';
import { CATEGORIES } from '@/constants';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          About Maududi's Legacy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          A digital platform dedicated to preserving, organizing, and making accessible the complete
          intellectual legacy of Sayyid Abul A&apos;la Maududi — scholar, philosopher, jurist,
          journalist, and founder of Jamaat-e-Islami.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
          <p>
            Sayyid Abul A&apos;la Maududi (1903&ndash;1979) was one of the most systematic and
            influential Islamic thinkers of the modern era. Described by Wilfred Cantwell Smith as
            &ldquo;the most systematic thinker of modern Islam,&rdquo; his works span Quranic
            exegesis (Tafhim-ul-Quran), hadith, Islamic law, philosophy, political thought,
            economics, and social reform. Written originally in Urdu, his books have been translated
            into over 40 languages including Arabic, English, Persian, Turkish, Bengali, Malay,
            Swahili, and many regional languages of South Asia.
          </p>
          <p>
            Despite this vast reach, accessing Maududi&rsquo;s complete works in a structured,
            searchable, and interactive format has remained a challenge. Physical copies are
            scattered, digital versions are fragmented across platforms, and there is no unified
            way to explore his ideas thematically or ask questions grounded in his actual writings.
          </p>
          <p>
            <strong>Maududi&rsquo;s Legacy</strong> was built to solve this. Our mission is threefold:
          </p>
          <ul>
            <li><strong>Preserve</strong> — Digitally archive the complete corpus of Maududi&rsquo;s 73+ books, 120+ booklets, and 1,000+ speeches in high-quality, readable formats.</li>
            <li><strong>Organize</strong> — Structure the library by category (Tafsir, Hadith, Fiqh, Politics, Economics, Philosophy, Biography, Social Reform), language, and theme for intuitive discovery.</li>
            <li><strong>Empower</strong> — Provide AI-powered tools that let anyone — students, researchers, or general readers — read, search, and converse with Maududi&rsquo;s ideas in their own language.</li>
          </ul>
        </div>
      </section>

      <section className="mb-16 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why This Platform Exists</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">
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
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What You Can Do Here</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="📚"
            title="Browse the Complete Library"
            description={`Explore 77+ books across ${CATEGORIES.length - 1} categories: ${CATEGORIES.filter(c => c !== 'All').join(', ')}.`}
          />
          <FeatureCard
            icon="📖"
            title="Read Books Online"
            description="Access PDF versions directly in your browser with responsive viewing, page navigation, zoom, and download options. No external apps required."
          />
          <FeatureCard
            icon="🤖"
            title="AI-Powered Book Chat"
            description="Select any book and ask questions in natural language. Get answers grounded in Maududi&rsquo;s actual text with citations — available in English, Urdu, Arabic, Turkish, Persian, and Bengali."
          />
          <FeatureCard
            icon="🔍"
            title="AI Context Finder (Global Search)"
            description="Search across all books simultaneously. Find which book, chapter, or page discusses a specific topic, quote, Quranic verse, or concept."
          />
          <FeatureCard
            icon="🖼️"
            title="Image-Based Search"
            description="Upload a photo of a book page, handwritten note, or printed text. The AI identifies the source book and provides context, translation, and related passages."
          />
          <FeatureCard
            icon="🌍"
            title="Multi-Language Support"
            description="Read and chat in 6 languages: English, Urdu, Arabic, Turkish, Persian, and Bengali — with responses in the same language."
          />
          <FeatureCard
            icon="📊"
            title="Reading Progress & History"
            description="Track your reading journey with bookmarks, reading history, and progress indicators across all books."
          />
          <FeatureCard
            icon="🔗"
            title="Share & Cite"
            description="Generate proper citations, share specific passages, and export notes for academic or personal use."
          />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Library Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.filter(c => c !== 'All').map((cat) => {
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
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={cat}
                href={`/${slug}`}
                className="block p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all duration-200"
              >
                <div className="text-2xl mb-2">{icons[cat] || '📖'}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cat}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Browse books →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
        <ol className="space-y-4 text-gray-600 dark:text-gray-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              1
            </span>
              <div>
                <strong className="text-gray-800 dark:text-gray-200">Explore Categories</strong> — Browse by topic: {CATEGORIES.filter(c => c !== 'All').slice(0, 4).join(', ')}, etc.
              </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Select a Book</strong> — View details, description, page count, language availability, and related works.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              3
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Read or Chat</strong> — Open the PDF reader, or click &ldquo;Chat with AI&rdquo; to ask questions about the book&rsquo;s content.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              4
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Search Everything</strong> — Use the AI Context Finder to search across the entire library at once.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              5
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Upload & Identify</strong> — Use Image Search to identify book pages, translate text, and find context instantly.
            </div>
          </li>
        </ol>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technology Stack</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Frontend", tech: "Next.js 15 (App Router), React 19, TypeScript" },
            { name: "Styling", tech: "Tailwind CSS 4, Custom Design System" },
            { name: "Database", tech: "MongoDB (Books, Users, Chat History)" },
            { name: "AI/ML", tech: "Groq (Llama 3, Mixtral), Vector Embeddings" },
            { name: "Authentication", tech: "NextAuth.js (Email, Google, GitHub)" },
            { name: "PDF Rendering", tech: "React-PDF, PDF.js" },
            { name: "Image Processing", tech: "Tesseract.js (OCR), Sharp" },
            { name: "Deployment", tech: "Vercel (Edge Functions), Docker" },
          ].map((item) => (
            <div key={item.name} className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.tech}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Sources & Attribution</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-3">
          <p>
            The books and metadata on this platform are sourced from publicly available digital
            archives, published editions, and the official Jamaat-e-Islami publications. We are
            committed to respecting intellectual property rights.
          </p>
          <p>
            <strong>Primary sources include:</strong>
          </p>
          <ul>
            <li>Jamaat-e-Islami Pakistan official publications (<a href="https://jamaat.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">jamaat.org</a>)</li>
            <li>Jamaat-e-Islami Hind archives (<a href="https://jamaateislamihind.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">jamaateislamihind.org</a>)</li>
            <li>Markazi Maktaba Islami Publishers, Delhi</li>
            <li>Islamic Foundation, UK (English translations)</li>
            <li>Darussalam Publishers (international editions)</li>
            <li>Rekhta.org (Urdu digital library)</li>
            <li>Internet Archive / Archive.org</li>
          </ul>
          <p>
            Biographical information is drawn from Wikipedia (CC BY-SA 4.0), Encyclopedia.com,
            Oxford Encyclopedia of Islam and the Muslim World, and official Jamaat-e-Islami
            biographical records.
          </p>
          <p className="text-sm">
            If you are a rights holder and believe content should be removed or attributed
            differently, please contact us.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Built with Next.js, MongoDB, and Groq AI. An open-source project for the global Muslim
          community and scholars of Islamic thought.
        </p>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="text-2xl mb-3" aria-hidden="true">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}