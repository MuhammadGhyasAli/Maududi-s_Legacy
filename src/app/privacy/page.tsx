import React from "react";

export const metadata = {
  title: "Privacy Policy — Maududi's Legacy",
  description:
    "Privacy Policy for Maududi's Legacy digital archive. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: May 27, 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Introduction</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          Maududi&apos;s Legacy (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at maududislegacy.com (the &ldquo;Site&rdquo;).
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          By using the Site, you agree to the collection and use of information in accordance with this policy.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Information We Collect</h2>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.1 Personal Information</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
          When you register for an account, we collect:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1 mb-3">
          <li>Email address</li>
          <li>Username</li>
          <li>Display name (optional)</li>
          <li>Password (stored as a bcrypt hash — we never store plain-text passwords)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          If you sign in via Google OAuth, we receive your Google profile email, name, and Google ID from Google (subject to Google&apos;s privacy policy).
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.2 Chat Data</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          When you use the AI chat feature, your messages (including any images you upload) are sent to Groq AI (a third-party service) for processing. We do not store chat logs server-side beyond what is required for the immediate response.
        </p>

        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.3 Automatically Collected Information</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          When you visit the Site, we may automatically collect:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1 mb-3">
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Referring URL</li>
          <li>IP address (for analytics and security)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. How We Use Your Information</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">We use the collected information to:</p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
          <li>Create and manage your account</li>
          <li>Provide AI chat responses to your queries</li>
          <li>Send password reset emails when requested</li>
          <li>Improve the Site and user experience</li>
          <li>Ensure the security and integrity of our services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Third-Party Services</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
          Our Site uses the following third-party services:
        </p>
        <ul className="space-y-3 pl-2">
          <li className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <strong className="text-gray-800 dark:text-gray-200">Groq AI</strong>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Processes chat messages and images to generate AI responses. Your messages are subject to Groq&apos;s privacy policy.</p>
          </li>
          <li className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <strong className="text-gray-800 dark:text-gray-200">MongoDB Atlas</strong>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cloud database provider that stores account information, book metadata, and other application data.</p>
          </li>
          <li className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <strong className="text-gray-800 dark:text-gray-200">Nodemailer (Gmail)</strong>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Used to send password reset emails to your registered email address.</p>
          </li>
          <li className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <strong className="text-gray-800 dark:text-gray-200">Google OAuth</strong>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Optional social login. If enabled, Google shares your email and profile name with us.</p>
          </li>
          <li className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <strong className="text-gray-800 dark:text-gray-200">Vercel</strong>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hosting provider for the Site. Vercel may collect standard server logs.</p>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Data Storage and Security</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          Your personal data is stored in MongoDB Atlas, a cloud database provider with industry-standard security measures. Passwords are hashed using bcrypt with 12 salt rounds before storage.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          We implement reasonable technical and organizational measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. Data Retention</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          We retain your account information for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within a reasonable timeframe, subject to legal retention requirements.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Chat messages are processed in real time and are not retained on our servers after the response is delivered.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Local Storage</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          We use browser localStorage to store:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1 mb-3">
          <li><strong>auth_token</strong> — JWT token for maintaining your login session</li>
          <li><strong>theme</strong> — Your preferred color theme (light/dark/system)</li>
          <li><strong>maududi_cache_*</strong> — Cached API responses for improved performance (30-minute TTL)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We do not use cookies for tracking or advertising purposes. All locally stored data stays on your device and is not sent to third parties except as necessary to authenticate your session.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Your Rights</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
          Depending on your jurisdiction (e.g., GDPR for EU residents, CCPA for California residents), you may have the right to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict processing of your data</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
          To exercise these rights, please contact us at the email address below.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Children&apos;s Privacy</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Our Site is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Changes to This Policy</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of the Site after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Contact</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
          Email: privacy@maududislegacy.com
        </p>
      </section>
    </main>
  );
}
