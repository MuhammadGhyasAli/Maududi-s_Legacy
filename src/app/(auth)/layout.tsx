import Link from 'next/link';
import Image from 'next/image';

export default function AuthFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50/80 dark:bg-brand-bg-dark">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400 rounded-full blur-3xl opacity-60" />
        </div>

        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-lg text-center">
          {/* Logo */}
          <div className="mb-8 inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 ring-1 ring-white/20">
            <Image
              src="/logo.png"
              alt="Maududi's Legacy"
              width={48}
              height={48}
              className="object-contain brightness-0 invert"
            />
            <div className="text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">Maududi&apos;s Legacy</h2>
              <p className="text-sm text-emerald-200/80">Islamic Scholar & Thinker</p>
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
            Explore the depths of Islamic thought
          </h1>
          <p className="text-emerald-100/80 text-base leading-relaxed max-w-md mx-auto">
            Access the complete works of Syed Abul A&apos;la Maududi — Tafsir, politics, economics, jurisprudence, and more.
          </p>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 gap-3 max-w-sm mx-auto">
            {[
              { icon: '📖', text: 'Full library of works' },
              { icon: '🤖', text: 'AI-powered book chat' },
              { icon: '📄', text: 'Built-in PDF reader' },
              { icon: '🌙', text: 'Arabic & Urdu support' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 ring-1 ring-white/10">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-emerald-50/90 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Maududi's Legacy"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-base font-bold text-gray-800 dark:text-gray-100">
              Maududi&apos;s Legacy
            </span>
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-brand-card-dark rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-200/80 dark:border-gray-700/50 p-8 sm:p-10">
              {children}
            </div>

            {/* Back to home link */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}