export const metadata = {
  title: "About — Maududi's Legacy",
  description:
    "Learn about Maududi's Legacy — a digital archive preserving and providing intelligent access to the works of Sayyid Abul A'la Maududi.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
        About This Project
      </h1>

      {/* Motive */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Our Purpose
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          Sayyid Abul A'la Maududi (1903&ndash;1979) was one of the most influential
          Islamic scholars of the 20th century. His writings on Quranic commentary,
          Islamic philosophy, politics, and social reform have shaped the understanding
          of millions around the world.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          This website brings Maududi&rsquo;s key works together in one place, making
          them accessible to anyone with an internet connection. Whether you are a
          student, a researcher, or someone simply curious about Islamic thought,
          you can browse the books, read them online, and ask questions about their
          content through our AI-powered chat feature.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The goal is to preserve and spread the scholarly legacy of Maududi using
          modern technology &mdash; bridging centuries-old wisdom with the tools of
          today.
        </p>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          What You Can Do Here
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon="📚"
            title="Browse the Library"
            description="Explore 77 books across multiple categories including Tafsir, Islamic Philosophy, Political Thought, and more."
          />
          <FeatureCard
            icon="🤖"
            title="AI-Powered Chat"
            description="Ask any question about a book and get answers based on Maududi's own writings and interpretations."
          />
          <FeatureCard
            icon="🔍"
            title="AI Context Finder"
            description="Search across all books at once. Find which book contains a specific topic, quote, or concept."
          />
          <FeatureCard
            icon="🌍"
            title="Multi-Language Support"
            description="Chat in English, Urdu, Arabic, Turkish, Persian, or Bengali &mdash; and get responses in the same language."
          />
          <FeatureCard
            icon="📖"
            title="Read Online"
            description="Access PDF versions of books directly in your browser for convenient reading."
          />
          <FeatureCard
            icon="🖼️"
            title="Image-Powered Search"
            description="Upload an image of a book page or text, and the AI will identify the source and provide context."
          />
        </div>
      </section>

      {/* How It Works (simple) */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          How It Works
        </h2>
        <ol className="space-y-4 text-gray-600 dark:text-gray-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              1
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Pick a category</strong> &mdash;
              Browse by topic such as Tafsir, Political Thought, or Biography.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Choose a book</strong> &mdash;
              Click on any book to see its description and details.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              3
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Read or chat</strong> &mdash;
              Open the PDF to read, or click &ldquo;Chat with AI&rdquo; to ask questions
              about the book&rsquo;s content.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
              4
            </span>
            <div>
              <strong className="text-gray-800 dark:text-gray-200">Search everything</strong> &mdash;
              Use the AI Context Finder to search across all books at once.
            </div>
          </li>
        </ol>
      </section>

      {/* Tech note — one line */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Built with Next.js, MongoDB, and Groq AI.
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
