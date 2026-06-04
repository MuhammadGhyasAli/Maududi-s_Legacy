import React from "react";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Maududi's Legacy digital archive. Please read these terms carefully before using the Site.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: May 27, 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Acceptance of Terms</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          By accessing or using Maududi&apos;s Legacy (&ldquo;the Site&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the Site.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Description of Service</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Maududi&apos;s Legacy is a digital archive that provides access to the works of Sayyid Abul A&apos;la Maududi, including book browsing, online reading, and AI-powered chat functionality. The Site is offered free of charge for educational and research purposes.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. User Accounts</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          To access certain features (such as AI chat), you may need to create an account. You are responsible for:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1 mb-3">
          <li>Providing accurate and complete registration information</li>
          <li>Maintaining the confidentiality of your password</li>
          <li>All activities that occur under your account</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Acceptable Use</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">You agree not to:</p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
          <li>Use the Site for any unlawful purpose or in violation of any applicable laws</li>
          <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
          <li>Interfere with or disrupt the operation of the Site or servers</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Use the AI chat feature to generate harmful, abusive, or misleading content</li>
          <li>Scrape, crawl, or extract data from the Site without prior written permission</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Intellectual Property</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          The works of Sayyid Abul A&apos;la Maududi displayed on this Site are in the public domain or used with permission. The Site&apos;s software, design, and original content (excluding the literary works themselves) are open source under the MIT License.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          You may view, read, and interact with the content for personal, educational, and non-commercial purposes. Redistribution or commercial use of the literary works may require additional permissions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. AI Chat Disclaimer</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          The AI chat feature uses Groq AI (Llama 3.3 70B) to generate responses based on the book content and general knowledge. While we strive for accuracy, AI-generated responses may contain errors, omissions, or inaccuracies.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          You should not rely solely on AI responses for academic research or critical decision-making. Always verify information against primary sources. The AI may produce different responses to the same question and does not represent the views of the Site operators.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          By using the chat feature, you acknowledge that your messages will be processed by a third-party AI service (Groq) and should not contain sensitive personal information.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Third-Party Links and Services</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The Site may contain links to third-party websites or services (e.g., Google OAuth, GitHub). We are not responsible for the content, privacy practices, or terms of those third parties. Your interactions with third parties are solely between you and them.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Disclaimer of Warranties</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties, express or implied. We do not guarantee that the Site will be uninterrupted, secure, or error-free. We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Limitation of Liability</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          To the fullest extent permitted by law, Maududi&apos;s Legacy and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site, including but not limited to reliance on AI-generated content.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Termination</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We reserve the right to suspend or terminate your access to the Site at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to the Site, other users, or third parties.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Changes to Terms</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We may revise these Terms of Service at any time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of the Site after changes constitutes acceptance of the revised terms.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">12. Governing Law</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">13. Contact</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          For questions about these Terms, please contact us at:
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
          Email: <a href="mailto:legal@maududislegacy.com" className="text-brand-green dark:text-brand-green-dark hover:underline">legal@maududislegacy.com</a>
        </p>
      </section>
    </main>
  );
}
