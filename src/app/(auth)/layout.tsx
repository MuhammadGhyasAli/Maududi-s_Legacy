import Link from 'next/link';
import Image from 'next/image';

export default function AuthFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-brand-bg-dark">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Maududi's Legacy"
              width={160}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        <div className="bg-white dark:bg-brand-card-dark rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/50 p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
