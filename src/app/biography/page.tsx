import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Biography of Sayyid Abul A'la Maududi",
  description:
    "Learn about the life, works, and legacy of Sayyid Abul A'la Maududi, one of the most influential Islamic scholars and thinkers of the 20th century.",
};

const timeline = [
  { year: "1903", event: "Born on 25 September in Aurangabad, Hyderabad State, colonial India, into a respected religious family." },
  { year: "1918", event: "Started his career as a journalist for the Bijnore newspaper at age 15." },
  { year: "1920", event: "Appointed as editor of the daily Taj, based in Jabalpur." },
  { year: "1921", event: "Learned Arabic from Maulana Abdul Salam Niazi in Delhi; appointed editor of the daily Muslim." },
  { year: "1925", event: "Appointed as editor of Al-Jameeah, Delhi — his first major editorial role in an Islamic newspaper." },
  { year: "1927", event: "Published Al Jihad fil Islam, his first major book at age 24, hailed by Muhammad Iqbal as the best explication of jihad in any language." },
  { year: "1928", event: "Took Sanad in Jami Al-Tirmidhi and Muatta Imam Malik from Darul Uloom Fatehpuri, Delhi." },
  { year: "1933", event: "Started Tarjuman-ul-Qur'an from Hyderabad, a monthly journal dedicated to Quranic interpretation." },
  { year: "1937", event: "Introduced to Allama Muhammad Iqbal by Chaudhry Niaz Ali Khan at Lahore." },
  { year: "1938", event: "Moved to Pathankot from Hyderabad Deccan and joined the Dar ul Islam Trust Institute, established on Iqbal's advice." },
  { year: "1941", event: "Founded Jamaat-e-Islami Hind at Lahore, British India; appointed as its first Ameer (leader)." },
  { year: "1942", event: "Began writing Tafhim-ul-Quran, his magnum opus commentary of the Quran." },
  { year: "1947", event: "Jamaat-e-Islami headquarters relocated to Lahore, Pakistan after the partition." },
  { year: "1948", event: "Campaign for an Islamic constitution in Pakistan; imprisoned for issuing a fatwa on jihad in Kashmir." },
  { year: "1949", event: "Pakistani government accepted Jamaat's resolution for an Islamic constitution; released from jail in 1950." },
  { year: "1953", event: "Sentenced to death for his role in the anti-Ahmadiyya agitation and his booklet The Qadiani Problem; commuted to life imprisonment, later overturned." },
  { year: "1958", event: "Jamaat-e-Islami banned by Martial Law Administrator Field Marshal Ayub Khan." },
  { year: "1964", event: "Imprisoned again; released the same year." },
  { year: "1971", event: "Relinquished his authority to the East Pakistan Shura amid the Bangladesh separation crisis." },
  { year: "1972", event: "Completed Tafhim-ul-Quran after 30 years of work; resigned as Ameer of Jamaat-e-Islami." },
  { year: "1978", event: "Published his last book Seerat-e-Sarwar-e-Aalam in two volumes." },
  { year: "1979", event: "Awarded the first King Faisal International Prize for service to Islam. Died on 22 September in Buffalo, New York. Buried in Ichhra, Lahore." },
];

const majorWorks = [
  {
    title: "Tafhim-ul-Quran",
    description: "His magnum opus: a six-volume Urdu translation and thematic commentary of the Quran completed over 30 years. Widely read across South Asia and translated into multiple languages.",
  },
  {
    title: "Al Jihad fil Islam",
    description: "Written at age 24, a comprehensive 600-page explication of the Islamic concept of Jihad. Hailed by Allama Muhammad Iqbal as the finest work on the subject in any language.",
  },
  {
    title: "Towards Understanding Islam",
    description: "A foundational text on Islamic beliefs and practices, translated into dozens of languages worldwide and used as an introductory work for new Muslims and students.",
  },
  {
    title: "Purdah & the Status of Women in Islam",
    description: "An exhaustive discussion of the Islamic concept of veiling, its philosophy, social implications, and the status of women in Islamic society.",
  },
  {
    title: "The Islamic Law and Constitution",
    description: "A detailed work on the principles, structure, and constitution of an Islamic state, including governance models and legal frameworks.",
  },
  {
    title: "Let us be Muslims",
    description: "A collection of speeches and writings calling Muslims to revive their faith and practice Islam as a complete way of life.",
  },
  {
    title: "The Islamic Way of Life",
    description: "A concise exposition of Islam as a comprehensive system encompassing worship, morality, family, economics, and politics.",
  },
  {
    title: "Four Basic Quranic Terms",
    description: "A seminal work explaining the four fundamental Quranic terms — Ilah, Rabb, Deen, and Ibadah — and their implications for Islamic thought.",
  },
  {
    title: "Economic System of Islam",
    description: "A systematic presentation of Islamic economic principles, including prohibitions on interest (riba), zakat, and the ethical framework for wealth.",
  },
  {
    title: "Human Rights in Islam",
    description: "An exposition of the Islamic perspective on human rights, contrasting it with Western declarations and highlighting Islamic guarantees.",
  },
  {
    title: "The Qadiani Problem",
    description: "A controversial booklet examining the theological status of the Ahmadiyya movement, which led to his 1953 death sentence (later commuted).",
  },
  {
    title: "Caliphate and Kingship (Khilafat o Malookiat)",
    description: "A historical analysis of the transition from the Rashidun Caliphate to dynastic kingship in Islamic history and its political implications.",
  },
];

export default function BiographyPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-brand-navy dark:to-brand-bg-dark">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-amber-100/30 dark:bg-amber-900/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-emerald/30 shadow-lg">
              <span className="text-4xl" aria-hidden="true">📝</span>
            </div>
            <p className="text-sm font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-4">
              Biography
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 leading-tight mb-4">
              Sayyid Abul A&apos;la
              <span className="gradient-text block mt-1">Maududi</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              1903 &ndash; 1979 &middot; Islamic scholar, philosopher, jurist, journalist, and founder of Jamaat-e-Islami
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <span aria-hidden="true">📖</span> 77+ Works
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <span>🌍</span> Translated into 40+ Languages
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <span>📜</span> 6-Volume Quran Commentary
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Early Life */}
      <section className="py-16 md:py-20 bg-white dark:bg-brand-bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-gray-100 mb-8">
              Early Life &amp; Education
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                Sayyid Abul A&apos;la Maududi was born on 25 September 1903 in Aurangabad, 
                Hyderabad Deccan (present-day Maharashtra, India). He was the youngest of three 
                sons born to Ahmad Hasan, a lawyer by profession who was deeply religious. His 
                family traced its lineage to the Prophet Muhammad (peace be upon him) through 
                the Chishti Sufi lineage. His father ensured he received a strong traditional 
                education at home, studying the Quran, Persian, Arabic, and Urdu from an early age.
              </p>
              <p>
                Rather than pursuing Western-style university education, Maududi immersed himself 
                in the traditional Islamic sciences. In 1921 he studied Arabic under Maulana Abdul 
                Salam Niazi in Delhi, and later took Sanad certificates in Jami Al-Tirmidhi and 
                Muatta Imam Malik from Darul Uloom Fatehpuri, Delhi (1928). He also earned the 
                Sanad of Uloom e Aqaliya wa Naqalia from the same institution in 1926. Alongside 
                his religious studies, he was a voracious reader of Western philosophy, history, 
                and political thought.
              </p>
              <p>
                Maududi began his journalistic career at the age of 15 in 1918, writing for the 
                Bijnore newspaper. By 1920 he was appointed editor of the daily <em>Taj</em> in 
                Jabalpur, and the following year he became editor of the daily <em>Muslim</em>. 
                In 1925 he took on the editorship of <em>Al-Jameeah</em> in Delhi, which gave him 
                a platform for his emerging Islamic revivalist ideas. In 1927, at just 24, he 
                published his first major book, <em>Al Jihad fil Islam</em> — a 600-page work that 
                Allama Muhammad Iqbal would later praise as the best explication of jihad in any 
                language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-emerald-50/40 dark:bg-brand-navy/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-gray-100 mb-12 text-center">
              Life Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-500 to-amber-400 dark:from-emerald-700 dark:via-emerald-600 dark:to-amber-600" />
              {timeline.map((item, i) => (
                <div key={item.year} className={`relative flex items-start gap-6 mb-10 md:mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'text-right pr-10' : 'text-left pl-10'}`}>
                    <div className={`bg-white dark:bg-brand-card-dark rounded-2xl p-5 shadow-sm border border-emerald-100/60 dark:border-white/5 ${i % 2 === 0 ? '' : ''}`}>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.event}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shadow-emerald/30 shadow-sm flex-shrink-0">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="ml-3 md:hidden font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {item.year}
                    </span>
                  </div>
                  <div className="md:hidden flex-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">
                      {item.year}
                    </span>
                    <div className="bg-white dark:bg-brand-card-dark rounded-2xl p-4 shadow-sm border border-emerald-100/60 dark:border-white/5">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.event}
                      </p>
                    </div>
                  </div>
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'pl-10' : 'pr-10'}`}>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Major Works */}
      <section className="py-16 md:py-20 bg-white dark:bg-brand-bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-gray-100 mb-8">
              Major Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Maududi authored 73 books, 120 booklets and pamphlets, and made more than 1,000 
              speeches and press statements over his lifetime. His writings combine deep scholarship 
              with accessible language, making complex Islamic concepts understandable to the 
              common reader. His major works translated into English include:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {majorWorks.map((work) => (
                <div key={work.title} className="bg-emerald-50/40 dark:bg-brand-card-dark rounded-2xl p-6 border border-emerald-100/60 dark:border-white/5 hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                    {work.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {work.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium shadow-emerald hover:shadow-lg transition-all duration-200"
              >
                <span aria-hidden="true">📚</span> Browse All Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-emerald-50/40 to-white dark:from-brand-navy/30 dark:to-brand-bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-gray-100 mb-8">
              Legacy &amp; Influence
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                Described by Wilfred Cantwell Smith as &ldquo;the most systematic thinker of modern 
                Islam,&rdquo; Maududi&rsquo;s intellectual legacy has shaped Islamic thought across the 
                globe. His works &mdash; covering Quranic exegesis, hadith, law, philosophy, and 
                history &mdash; have been translated into Arabic, English, Persian, Turkish, Bengali, 
                Malay, Swahili, Hindi, Tamil, Kannada, Burmese, Malayalam, and dozens of other 
                languages, reaching millions of readers worldwide. In 1979 he became the first 
                recipient of the King Faisal International Award for his service to Islam.
              </p>
              <p>
                <strong>Pakistan and South Asia.</strong> Through Jamaat-e-Islami, which he founded 
                in 1941, Maududi established an organized movement for Islamic revival with 
                branches in Pakistan, India, Bangladesh, Kashmir, and Sri Lanka. The party is 
                thought to have been instrumental in generating support for making Pakistan an 
                Islamic state and in influencing General Zia-ul-Haq&rsquo;s Islamization policies in 
                the 1970s&ndash;80s, including the Hudood Ordinances and separate electorates for 
                non-Muslims. In return, tens of thousands of Jamaat members and sympathisers were 
                given positions in the judiciary and civil service during Zia&rsquo;s administration. 
                South Asia&rsquo;s diaspora, including significant numbers in Britain, was hugely 
                influenced by his work.
              </p>
              <p>
                <strong>Arab world and beyond.</strong> Muslim Brotherhood founder Hassan al-Banna 
                and ideologue Sayyid Qutb both read and drew from Maududi&rsquo;s writings. Qutb 
                borrowed and expanded Maududi&rsquo;s concepts of modern jahiliyya (pre-Islamic 
                ignorance) and the need for an Islamist revolutionary vanguard. His ideas also 
                influenced Abdullah Azzam, the Palestinian Islamist jurist who revitalized the 
                concept of jihad in Afghanistan and beyond.
              </p>
              <p>
                <strong>Iran and Turkey.</strong> Maududi had a significant impact on Shia Iran; 
                Ayatollah Ruhollah Khomeini is reputed to have met him as early as 1963 and later 
                translated his works into Persian. Iranian revolutionary rhetoric continues to 
                draw on his themes. In Turkey, where his name is rendered Mevdudi, his full oeuvre 
                became available from the mid-1960s, making him an influential figure within local 
                religious circles.
              </p>
              <p>
                While his views have been subject to debate and criticism, his contribution to 
                modern Islamic thought is undeniable. He was among the first Muslim scholars to 
                systematically address the challenges of modernity, secularism, and Western 
                hegemony from an Islamic framework, offering a comprehensive vision of Islam as 
                a complete system of life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-white dark:bg-brand-bg-dark border-t border-emerald-100/60 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-brand-card-dark border border-gray-200/60 dark:border-white/5">
                <p className="text-3xl font-bold gradient-text mb-1">73</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Books</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-brand-card-dark border border-gray-200/60 dark:border-white/5">
                <p className="text-3xl font-bold gradient-text mb-1">40+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Languages</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-brand-card-dark border border-gray-200/60 dark:border-white/5">
                <p className="text-3xl font-bold gradient-text mb-1">1941</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Jamaat-e-Islami Founded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="py-8 bg-white dark:bg-brand-bg-dark border-t border-emerald-100/60 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              This biography incorporates material from the Wikipedia article 
              &ldquo;<a href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Abul A&apos;la Maududi</a>&rdquo; 
              (CC BY-SA 4.0). Some passages have been adapted for this presentation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
