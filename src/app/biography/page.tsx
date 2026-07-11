import React from "react";
import Image from "next/image";

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
  { title: "Tafhim-ul-Quran (Towards Understanding the Quran)", description: "6-volume thematic translation and commentary (1942–1972). His magnum opus presenting the Quran as a comprehensive guide for life." },
  { title: "Al-Jihad fil Islam (Jihad in Islam)", description: "600-page treatise published at age 24. Allama Iqbal called it 'the best explication of jihad in any language'." },
  { title: "Khutabat (Addresses to the Jamaat)", description: "Multi-volume collection of speeches and addresses to Jamaat-e-Islami members spanning decades." },
  { title: "Islamic Law and Constitution", description: "Systematic presentation of Islamic constitutional theory and its application to modern governance." },
  { title: "The Islamic Way of Life", description: "Comprehensive overview of Islam as a complete system covering belief, worship, ethics, and social order." },
  { title: "Human Rights in Islam", description: "Articulation of Islamic human rights framework predating the UN Declaration by decades." },
  { title: "Four Basic Quranic Terms", description: "Seminal work explaining Ilah, Rabb, Ibadah, and Deen — foundational concepts of Islamic theology." },
  { title: "Let Us Be Muslims", description: "Collection of Friday sermons calling Muslims to live by the comprehensive demands of their faith." },
];

const intellectualLegacy = [
  "Hakimiyyat Allah (Sovereignty of God) — Islam as a complete ideological system governing all aspects of life",
  "Jahiliyya (Modern Ignorance) — Concept that societies not governed by divine law live in a state of ignorance",
  "Islamic State Theory — Detailed framework for an Islamic political order based on consultation (shura) and divine law",
  "Islamic Economics — Interest-free banking, zakat as fiscal policy, and social welfare as state obligation",
  "Revival of Ijtihad — Advocated independent reasoning to address modern challenges within Islamic legal framework",
  "Islamic Da'wah Methodology — Systematic approach to inviting others to Islam through education and example",
];

const quickFacts = [
  { label: "Born", value: "25 Sep 1903, Aurangabad" },
  { label: "Died", value: "22 Sep 1979, Buffalo, NY" },
  { label: "Resting Place", value: "Ichhra, Lahore" },
  { label: "Era", value: "20th Century" },
  { label: "Jurisprudence", value: "Hanafi" },
  { label: "Movement", value: "Jamaat-e-Islami" },
  { label: "Works", value: "73+ books" },
  { label: "Magnum Opus", value: "Tafhim-ul-Quran" },
];

export default function BiographyPage() {
  return (
    <main className="max-w-6xl mx-auto px-4">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 dark:from-black dark:via-emerald-950 dark:to-gray-950 pt-16 pb-12 sm:pt-20 sm:pb-16 px-6 sm:px-10 mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(5,150,105,0.15),_transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Portrait */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-60 sm:w-56 sm:h-72 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/30">
              <Image
                src="/maududi-portrait.jpg"
                alt="Sayyid Abul A'la Maududi"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {/* Bio Info */}
          <div className="text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-3">
              Founder of Jamaat-e-Islami
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
              Sayyid Abul A&apos;la Maududi
            </h1>
            <p className="text-emerald-200/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-4">
              Islamic Scholar · Philosopher · Jurist · Journalist · Author of <em className="italic">Tafhim-ul-Quran</em>
            </p>
            <p className="text-gray-300 text-sm max-w-xl leading-relaxed">
              Described by Wilfred Cantwell Smith as &ldquo;the most systematic thinker of modern Islam,&rdquo; 
              his works covered Qur&rsquo;anic exegesis, hadith, law, philosophy, and history. 
              Translated into English, Arabic, Hindi, Bengali, and many other languages.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Facts Bar ── */}
      <section className="mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickFacts.map((f) => (
            <div key={f.label} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80">
              <div className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-1">{f.label}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Early Life & Education ── */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
            Life Timeline
          </h2>
          <div className="space-y-5">
            {timeline.map((item) => (
              <div
                key={item.year}
                className="relative pl-10 pb-6 border-l-2 border-emerald-200 dark:border-emerald-800 last:border-0 last:pb-0 group"
              >
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-900 group-hover:ring-emerald-200 dark:group-hover:ring-emerald-800 transition-all" />
                <div className="inline-block text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-700 px-2.5 py-0.5 rounded-full mb-2">{item.year}</div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Major Works ── */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
          Major Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {majorWorks.map((work, i) => (
            <div
              key={work.title}
              className="relative p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200"
            >
              <span className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                {i + 1}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{work.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{work.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Intellectual Contributions ── */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
          Key Intellectual Contributions
        </h2>
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-6">
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-200/50 dark:ring-emerald-800/50">
              <Image
                src="/author.png"
                alt="Sayyid Abul A'la Maududi"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 flex-1">
          {intellectualLegacy.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {index + 1}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── Legacy & Final Resting Place ── */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
            Legacy &amp; Final Resting Place
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              <p>
                In April 1979, Maududi&apos;s long-time kidney ailment worsened and he also developed heart problems. 
                He travelled to the United States for treatment and was hospitalised in Buffalo, New York, where his 
                second son worked as a physician. Following several surgical operations, he passed away on 
                22 September 1979 at age 75.
              </p>
              <p>
                His funeral prayer was led by Yusuf al-Qaradawi in Buffalo, after which his body was flown to 
                Lahore. A massive funeral procession through the city accompanied him to his final resting place. 
                He was buried in an unmarked grave at his residence in Ichhra, Lahore — a humble resting place 
                for a man whose ideas shaped Islamic thought across the globe.
              </p>
              <p>
                Today, his legacy endures through 73+ books translated into dozens of languages, the global 
                network of Jamaat-e-Islami, and the lasting impact of his Tafhim-ul-Quran, which remains one 
                of the most widely-read Quranic commentaries of the modern era.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src="/maududi-grave.jpg"
                  alt="Grave of Sayyid Abul A'la Maududi in Ichhra, Lahore"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Grave of Maududi at his residence in Ichhra, Lahore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
          Sources &amp; Further Reading
        </h2>
        <div className="max-w-3xl text-gray-600 dark:text-gray-400 space-y-3 text-sm">
          <p>Biographical information compiled from:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><a href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">Wikipedia</a> (CC BY-SA 4.0)</li>
            <li><a href="https://www.encyclopedia.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">Encyclopedia.com</a></li>
            <li>Oxford Encyclopedia of Islam and the Muslim World</li>
            <li>Official Jamaat-e-Islami biographical records</li>
            <li>Tafhim-ul-Quran introductions and author&apos;s prefaces</li>
            <li>Khutabat (collected addresses) volumes</li>
          </ul>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Images courtesy of Wikimedia Commons (CC BY-SA 3.0 / Public Domain).{'\n'}
            For deeper study, visit the <a href="https://jamaat.org/founder" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">official biography on Jamaat-e-Islami</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
