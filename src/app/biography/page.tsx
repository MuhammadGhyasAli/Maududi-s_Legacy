import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Biography of Sayyid Abul A'la Maududi (1903–1979)",
  description:
    "Comprehensive biography of Sayyid Abul A'la Maududi — Islamic scholar, philosopher, jurist, journalist, founder of Jamaat-e-Islami, and author of Tafhim-ul-Quran. Based on Wikipedia, Encyclopedia.com, Oxford Encyclopedia of Islam, and official Jamaat-e-Islami sources.",
};

const timeline = [
  { year: "1903", event: "Born 25 September in Aurangabad, Hyderabad Deccan, British India. Youngest of three sons of Ahmad Hasan, a lawyer from a family tracing lineage to the Prophet Muhammad (PBUH) through Husayn ibn Ali and Khwaja Moinuddin Chishti." },
  { year: "1909–1918", event: "Early education at home: Quran, Persian, Arabic, Urdu, and Islamic law under father's supervision. Translated Qasim Amin's 'The New Woman' from Arabic to Urdu at age 11." },
  { year: "1918", event: "First published article on electricity in Maarif magazine at age 15. Began journalistic career writing for Bijnore newspaper." },
  { year: "1919–1920", event: "Father's paralysis and death left family destitute. Maududi abandoned formal education, moved to Delhi, studied English and German, and read Western philosophy (Fichte, Hegel, Comte, Mill, Darwin, etc.) intensively for five years." },
  { year: "1920", event: "Appointed editor of daily Taj (Jabalpur) at age 17." },
  { year: "1921", event: "Studied Arabic under Maulana Abdul Salam Niazi in Delhi. Appointed editor of daily Muslim. Began Dars-e-Nizami curriculum and philosophical theology studies under Jamiat Ulema-e-Hind influence." },
  { year: "1925", event: "Appointed editor of Al-Jamiat (Delhi), organ of Jamiat Ulema-e-Hind. Resigned in 1925 when Jamiat aligned with Indian National Congress — a principled stand against composite nationalism." },
  { year: "1926", event: "Earned Sanad of Uloom-e-Aqliya wa Naqliya (rational and transmitted sciences) from Darul Uloom Fatehpuri, Delhi." },
  { year: "1927", event: "Published first major work: Al-Jihad fil Islam (600 pages) at age 24. Allama Muhammad Iqbal praised it as 'the best explication of jihad in any language' and recommended it to every scholar." },
  { year: "1928", event: "Received Sanad in Jami al-Tirmidhi and Muwatta Imam Malik from Darul Uloom Fatehpuri, Delhi." },
  { year: "1932", event: "Launched monthly journal Tarjuman al-Quran from Hyderabad — dedicated to Quranic interpretation and Islamic revivalism. Hyderabad government supported with 300 subscriptions for libraries." },
  { year: "1933–1937", event: "Developed political philosophy: Islam as comprehensive ideology (hakimiyyat Allah), critique of secular nationalism, concept of jahiliyya (modern ignorance), and Islamic state theory. Wrote 'Muslims and the Present Political Crisis'." },
  { year: "1937", event: "Introduced to Allama Muhammad Iqbal by Chaudhry Niaz Ali Khan in Lahore. Iqbal invited him to Punjab." },
  { year: "1938", event: "Moved to Pathankot, Punjab to oversee Daru'l-Islam Trust Institute (waqf) established on Iqbal's advice. Continued Tarjuman al-Quran from there." },
  { year: "1941", event: "Founded Jamaat-e-Islami on 26 August in Lahore, British India. First Ameer (leader). Supported by Amin Ahsan Islahi, Muhammad Manzoor Naumani, Abul Hassan Ali Nadvi, Naeem Siddiqui. Started with 75 members." },
  { year: "1942", event: "Began writing Tafhim-ul-Quran (Towards Understanding the Quran) — his magnum opus, a 6-volume thematic translation and commentary. Work continued for 30 years." },
  { year: "1947", event: "Partition of India. Jamaat split along new borders: Jamaat-e-Islami Pakistan (led by Maududi, HQ moved to Lahore), Jamaat-e-Islami Hind (India, led by Maulana Abul Lais Islahi), later Bangladesh Jamaat-e-Islami and Kashmir units. Maududi opposed partition as violating Islamic ummah unity." },
  { year: "1948", event: "Campaign for Islamic constitution in Pakistan. Issued fatwa on jihad in Kashmir; imprisoned by Pakistani government. Released in 1950 after Objectives Resolution (1949) accepted Islamic principles." },
  { year: "1953", event: "Anti-Ahmadiyya agitation in Punjab. Authored 'The Qadiani Problem' booklet. Sentenced to death by military court; commuted to life imprisonment, then overturned by Supreme Court after international pressure." },
  { year: "1956", event: "Pakistan's first Constitution adopted — Objectives Resolution made preamble; Maududi's constitutional ideas partly incorporated." },
  { year: "1958", event: "Jamaat-e-Islami banned by Martial Law Administrator Field Marshal Ayub Khan. Maududi imprisoned; released 1964." },
  { year: "1961", event: "Founding member of Rabitat al-Alam al-Islami (Muslim World League), Mecca." },
  { year: "1964", event: "Imprisoned again under Ayub Khan; released same year after public pressure." },
  { year: "1971", event: "Bangladesh Liberation War crisis. Relinquished authority to East Pakistan Shura; opposed military action but maintained organizational unity." },
  { year: "1972", event: "Completed Tafhim-ul-Quran after 30 years (1942–1972). Resigned as Ameer of Jamaat-e-Islami in October; succeeded by Mian Tufail Mohammad (Pakistan)." },
  { year: "1973", event: "Published Tajdeed-e-Ihya-e-Deen (Renewal and Revival of Religion) and continued writing on Islamic civilization." },
  { year: "1979", event: "Passed away on 22 September in Buffalo, New York, USA. Buried in Ichhra, Lahore, Pakistan. His funeral drew hundreds of thousands. Legacy endures through his 73+ books, Jamaat-e-Islami's global network, and the ongoing impact of his Tafhim-ul-Quran." },
];

const majorWorks = [
  {
    title: "Tafhim-ul-Quran (Towards Understanding the Quran)",
    description: "6-volume thematic translation and commentary (1942–1972). His magnum opus presenting the Quran as a comprehensive guide for life.",
  },
  {
    title: "Al-Jihad fil Islam (Jihad in Islam)",
    description: "600-page treatise published at age 24. Allama Iqbal called it 'the best explication of jihad in any language'.",
  },
  {
    title: "Khutabat (Addresses to the Jamaat)",
    description: "Multi-volume collection of speeches and addresses to Jamaat-e-Islami members spanning decades.",
  },
  {
    title: "Islamic Law and Constitution",
    description: "Systematic presentation of Islamic constitutional theory and its application to modern governance.",
  },
  {
    title: "The Islamic Way of Life",
    description: "Comprehensive overview of Islam as a complete system covering belief, worship, ethics, and social order.",
  },
  {
    title: "Human Rights in Islam",
    description: "Articulation of Islamic human rights framework predating the UN Declaration by decades.",
  },
  {
    title: "Four Basic Quranic Terms",
    description: "Seminal work explaining Ilah, Rabb, Ibadah, and Deen — foundational concepts of Islamic theology.",
  },
  {
    title: "Let Us Be Muslims",
    description: "Collection of Friday sermons calling Muslims to live by the comprehensive demands of their faith.",
  },
];

const intellectualLegacy = [
  "Hakimiyyat Allah (Sovereignty of God) — Islam as a complete ideological system governing all aspects of life",
  "Jahiliyya (Modern Ignorance) — Concept that societies not governed by divine law live in a state of ignorance",
  "Islamic State Theory — Detailed framework for an Islamic political order based on consultation (shura) and divine law",
  "Islamic Economics — Interest-free banking, zakat as fiscal policy, and social welfare as state obligation",
  "Revival of Ijtihad — Advocated independent reasoning to address modern challenges within Islamic legal framework",
  "Islamic Da'wah Methodology — Systematic approach to inviting others to Islam through education and example",
];

export default function BiographyPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Biography of Sayyid Abul A'la Maududi
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          1903–1979 | Islamic Scholar, Philosopher, Jurist, Journalist, Founder of Jamaat-e-Islami, Author of
          <em className="italic">Tafhim-ul-Quran</em>
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Life Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div
              key={item.year}
              className="relative pl-8 pb-8 border-l-2 border-emerald-200 dark:border-emerald-800 last:border-0"
            >
              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-900" />
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">{item.year}</div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.event}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Major Works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {majorWorks.map((work) => (
            <div
              key={work.title}
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{work.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{work.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Intellectual Contributions</h2>
        <ul className="space-y-3">
          {intellectualLegacy.map((item, index) => (
            <li
              key={index}
              className="flex gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <p className="text-gray-600 dark:text-gray-400">{item}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sources & Further Reading</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-3">
          <p>
            Biographical information compiled from:
          </p>
          <ul>
            <li><a href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">Wikipedia</a> (CC BY-SA 4.0)</li>
            <li><a href="https://www.encyclopedia.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">Encyclopedia.com</a></li>
            <li>Oxford Encyclopedia of Islam and the Muslim World</li>
            <li>Official Jamaat-e-Islami biographical records</li>
            <li>Tafhim-ul-Quran introductions and author's prefaces</li>
            <li>Khutabat (collected addresses) volumes</li>
          </ul>
          <p className="text-sm">
            For deeper study, explore the <Link href="/category/biography" className="underline hover:text-emerald-600">Biography &amp; Seerah category</Link> in our library.
          </p>
        </div>
      </section>
    </main>
  );
}