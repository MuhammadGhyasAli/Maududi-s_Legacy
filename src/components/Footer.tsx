import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/50 dark:bg-brand-navy/50 border-t border-emerald-100/60 dark:border-white/5 mt-auto">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-brand-green dark:text-brand-green-dark">
              Maududi's Legacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
              Preserving and providing intelligent access to the literary works of Sayyid Abul A'la Maududi through modern AI technology.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200">
                  Book Catalog
                </Link>
              </li>
              <li>
                <Link href="/ai-context-finder" className="hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200">
                  AI Search
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="#" className="hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-emerald-100/60 dark:border-white/5 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Maududi's Legacy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
