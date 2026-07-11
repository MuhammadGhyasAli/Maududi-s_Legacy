"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Calendar, BookOpen, Award, Users, Quote, Landmark } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const timeline = [
  { year: "1903", title: "Birth", event: "Born 25 September in Aurangabad, Hyderabad Deccan, British India. Youngest of three sons of Ahmad Hasan, a lawyer from a family tracing lineage to the Prophet Muhammad (PBUH) through Husayn ibn Ali and Khwaja Moinuddin Chishti." },
  { year: "1909–1918", title: "Early Education", event: "Quran, Persian, Arabic, Urdu, and Islamic law under father's supervision at home. Translated Qasim Amin's 'The New Woman' from Arabic to Urdu at age 11." },
  { year: "1918", title: "First Publication", event: "First published article on electricity in Maarif magazine at age 15. Began journalistic career writing for Bijnore newspaper." },
  { year: "1919–1920", title: "Family Crisis & Self-Study", event: "Father's paralysis and death left family destitute. Abandoned formal education, moved to Delhi, studied English and German, read Western philosophy (Fichte, Hegel, Comte, Mill, Darwin) intensively for five years." },
  { year: "1920", title: "First Editorial Role", event: "Appointed editor of daily Taj (Jabalpur) at age 17." },
  { year: "1921", title: "Advanced Studies", event: "Studied Arabic under Maulana Abdul Salam Niazi in Delhi. Appointed editor of daily Muslim. Began Dars-e-Nizami curriculum and philosophical theology studies under Jamiat Ulema-e-Hind influence." },
  { year: "1925", title: "Principled Resignation", event: "Appointed editor of Al-Jamiat (Delhi), organ of Jamiat Ulema-e-Hind. Resigned when Jamiat aligned with Indian National Congress — a principled stand against composite nationalism." },
  { year: "1926", title: "Formal Certification", event: "Earned Sanad of Uloom-e-Aqliya wa Naqliya (rational and transmitted sciences) from Darul Uloom Fatehpuri, Delhi." },
  { year: "1927", title: "Breakthrough Work", event: "Published first major work: Al-Jihad fil Islam (600 pages) at age 24. Allama Muhammad Iqbal praised it as 'the best explication of jihad in any language' and recommended it to every scholar." },
  { year: "1928", title: "Hadith Certification", event: "Received Sanad in Jami al-Tirmidhi and Muwatta Imam Malik from Darul Uloom Fatehpuri, Delhi." },
  { year: "1932", title: "Tarjuman al-Quran", event: "Launched monthly journal Tarjuman al-Quran from Hyderabad — dedicated to Quranic interpretation and Islamic revivalism. Hyderabad government supported with 300 subscriptions for libraries." },
  { year: "1933–1937", title: "Political Philosophy", event: "Developed political philosophy: Islam as comprehensive ideology (hakimiyyat Allah), critique of secular nationalism, concept of jahiliyya (modern ignorance), and Islamic state theory. Wrote 'Muslims and the Present Political Crisis'." },
  { year: "1937", title: "Meeting Iqbal", event: "Introduced to Allama Muhammad Iqbal by Chaudhry Niaz Ali Khan in Lahore. Iqbal invited him to Punjab." },
  { year: "1938", title: "Daru'l-Islam Trust", event: "Moved to Pathankot, Punjab to oversee Daru'l-Islam Trust Institute (waqf) established on Iqbal's advice. Continued Tarjuman al-Quran from there." },
  { year: "1941", title: "Founded Jamaat-e-Islami", event: "Founded Jamaat-e-Islami on 26 August in Lahore, British India. First Ameer (leader). Supported by Amin Ahsan Islahi, Muhammad Manzoor Naumani, Abul Hassan Ali Nadvi, Naeem Siddiqui. Started with 75 members." },
  { year: "1942", title: "Tafhim-ul-Quran Begins", event: "Began writing Tafhim-ul-Quran (Towards Understanding the Quran) — his magnum opus, a 6-volume thematic translation and commentary. Work continued for 30 years." },
  { year: "1947", title: "Partition & Reorganization", event: "Partition of India. Jamaat split along new borders: Jamaat-e-Islami Pakistan (led by Maududi, HQ moved to Lahore), Jamaat-e-Islami Hind (India, led by Maulana Abul Lais Islahi), later Bangladesh Jamaat-e-Islami and Kashmir units. Maududi opposed partition as violating Islamic ummah unity." },
  { year: "1948", title: "Islamic Constitution Campaign", event: "Campaign for Islamic constitution in Pakistan. Issued fatwa on jihad in Kashmir; imprisoned by Pakistani government. Released in 1950 after Objectives Resolution (1949) accepted Islamic principles." },
  { year: "1953", title: "Anti-Ahmadiyya Agitation", event: "Anti-Ahmadiyya agitation in Punjab. Authored 'The Qadiani Problem' booklet. Sentenced to death by military court; commuted to life imprisonment, then overturned by Supreme Court after international pressure." },
  { year: "1956", title: "Constitutional Victory", event: "Pakistan's first Constitution adopted — Objectives Resolution made preamble; Maududi's constitutional ideas partly incorporated." },
  { year: "1958", title: "Martial Law & Imprisonment", event: "Jamaat-e-Islami banned by Martial Law Administrator Field Marshal Ayub Khan. Maududi imprisoned; released 1964." },
  { year: "1961", title: "Muslim World League", event: "Founding member of Rabitat al-Alam al-Islami (Muslim World League), Mecca." },
  { year: "1964", title: "Imprisonment Again", event: "Imprisoned again under Ayub Khan; released same year after public pressure." },
  { year: "1971", title: "Bangladesh Crisis", event: "Bangladesh Liberation War crisis. Relinquished authority to East Pakistan Shura; opposed military action but maintained organizational unity." },
  { year: "1972", title: "Magnum Opus Complete", event: "Completed Tafhim-ul-Quran after 30 years (1942–1972). Resigned as Ameer of Jamaat-e-Islami in October; succeeded by Mian Tufail Mohammad (Pakistan)." },
  { year: "1973", title: "Later Works", event: "Published Tajdeed-e-Ihya-e-Deen (Renewal and Revival of Religion) and continued writing on Islamic civilization." },
  { year: "1979", title: "Passing", event: "Passed away on 22 September in Buffalo, New York, USA. Buried in Ichhra, Lahore, Pakistan. His funeral drew hundreds of thousands. Legacy endures through his 73+ books, Jamaat-e-Islami's global network, and the lasting impact of his Tafhim-ul-Quran." },
];

const majorWorks = [
  { title: "Tafhim-ul-Quran (Towards Understanding the Quran)", description: "6-volume thematic translation and commentary (1942–1972). His magnum opus presenting the Quran as a comprehensive guide for life.", year: "1942–1972" },
  { title: "Al-Jihad fil Islam (Jihad in Islam)", description: "600-page treatise published at age 24. Allama Iqbal called it 'the best explication of jihad in any language'.", year: "1927" },
  { title: "Khutabat (Addresses to the Jamaat)", description: "Multi-volume collection of speeches and addresses to Jamaat-e-Islami members spanning decades.", year: "1941–1972" },
  { title: "Islamic Law and Constitution", description: "Systematic presentation of Islamic constitutional theory and its application to modern governance.", year: "1955" },
  { title: "The Islamic Way of Life", description: "Comprehensive overview of Islam as a complete system covering belief, worship, ethics, and social order.", year: "1948" },
  { title: "Human Rights in Islam", description: "Articulation of Islamic human rights framework predating the UN Declaration by decades.", year: "1976" },
  { title: "Four Basic Quranic Terms", description: "Seminal work explaining Ilah, Rabb, Ibadah, and Deen — foundational concepts of Islamic theology.", year: "1977" },
  { title: "Let Us Be Muslims", description: "Collection of Friday sermons calling Muslims to live by the comprehensive demands of their faith.", year: "1978" },
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
  { icon: Calendar, label: "Born", value: "25 Sep 1903, Aurangabad" },
  { icon: Calendar, label: "Died", value: "22 Sep 1979, Buffalo, NY" },
  { icon: MapPin, label: "Resting Place", value: "Ichhra, Lahore" },
  { icon: Award, label: "Era", value: "20th Century" },
  { icon: BookOpen, label: "Jurisprudence", value: "Hanafi" },
  { icon: Users, label: "Movement", value: "Jamaat-e-Islami" },
  { icon: BookOpen, label: "Works", value: "73+ books" },
  { icon: Award, label: "Magnum Opus", value: "Tafhim-ul-Quran" },
];

const galleryImages = [
  { src: "/maududi-portrait.jpg", alt: "Sayyid Abul A'la Maududi — Portrait", caption: "Portrait of Maududi in his study" },
  { src: "/author.png", alt: "Maududi writing", caption: "Maududi working on Tafhim-ul-Quran" },
  { src: "/maududi-grave.jpg", alt: "Maududi's grave in Ichhra, Lahore", caption: "Final resting place in Ichhra, Lahore" },
];

function TimelineItem({ item, _index, _isLast }: { item: typeof timeline[0]; _index: number; _isLast: boolean }) {
  return (
    <motion.div
      key={item.year}
      variants={itemVariants}
      className="relative flex gap-6 pb-12"
    >
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-400" aria-hidden="true" />
      
      <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center z-10 shadow-lg ring-4 ring-white dark:ring-gray-900">
        <span className="text-white text-xs font-bold leading-none">{item.year.split('–')[0]}</span>
      </div>
      
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{item.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.event}</p>
      </div>
    </motion.div>
  );
}

function WorkCard({ work }: { work: typeof majorWorks[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">{work.year}</span>
        <BookOpen className="w-5 h-5 text-emerald-500" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base leading-snug">{work.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">{work.description}</p>
    </motion.div>
  );
}

function LegacyItem({ item }: { item: string }) {
  return (
    <motion.li
      whileHover={{ x: 8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <Quote className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{item}</span>
    </motion.li>
  );
}

function FactCard({ fact }: { fact: typeof quickFacts[0] }) {
  const Icon = fact.icon;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center"
    >
      <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" aria-hidden="true" />
      <p className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">{fact.label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fact.value}</p>
    </motion.div>
  );
}

function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const next = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div className="relative h-64 sm:h-80">
        {galleryImages.map((img, index) => (
          <motion.div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            initial={{ opacity: index === currentIndex ? 1 : 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm">
              {img.caption}
            </div>
          </motion.div>
        ))}
        
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg z-20"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg z-20"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BiographyPageClient() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 dark:from-black dark:via-emerald-950 dark:to-gray-950 pt-16 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(5,150,105,0.15),_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08),_transparent_50%)] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
          >
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex-shrink-0 relative"
            >
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/30">
                <Image
                  src="/maududi-portrait.jpg"
                  alt="Sayyid Abul A'la Maududi"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900">
                <span className="text-white text-xl font-bold">1903–1979</span>
              </div>
            </motion.div>
            
            {/* Bio Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center md:text-left flex-1"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium mb-4"
              >
                <Landmark className="w-4 h-4" aria-hidden="true" />
                Scholar • Philosopher • Jurist • Journalist
              </motion.span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Sayyid Abul A'la Maududi
              </h1>
              
              <p className="text-lg sm:text-xl text-emerald-200 mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Founder of Jamaat-e-Islami, author of <em className="italic">Tafhim-ul-Quran</em>, and one of the most systematic Islamic thinkers of the modern era.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/20"
                >
                  <span>Wikipedia</span>
                </a>
                <a
                  href="https://jamaat.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                >
                  <Landmark className="w-4 h-4" aria-hidden="true" />
                  Jamaat-e-Islami
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Facts + Gallery */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Quick Facts - Sticky on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-4">
                <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    Quick Facts
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {quickFacts.map((fact, index) => (
                      <FactCard key={index} fact={fact} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Photo Gallery</h3>
              <Gallery />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Life <span className="text-emerald-600 dark:text-emerald-400">Timeline</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Key milestones in the life of one of Islam's most influential modern thinkers.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative pl-8"
          >
            {timeline.map((item, index) => (
              <TimelineItem key={item.year} item={item} index={index} isLast={index === timeline.length - 1} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Major Works */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Major <span className="text-emerald-600 dark:text-emerald-400">Works</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A selection of his most influential publications spanning over five decades.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {majorWorks.map((work) => (
              <WorkCard key={work.title} work={work} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Intellectual Legacy */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-y border-emerald-100 dark:border-emerald-900/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Intellectual <span className="text-emerald-600 dark:text-emerald-400">Legacy</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Core concepts that shaped modern Islamic political thought and continue to influence scholars worldwide.
            </p>
          </motion.div>

          <motion.ul
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {intellectualLegacy.map((item, index) => (
              <LegacyItem key={index} item={item} />
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Sources & Attribution */}
      <section className="py-16 sm:py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Sources & <span className="text-emerald-600 dark:text-emerald-400">Attribution</span>
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
              <p>
                Biographical information is drawn from Wikipedia (CC BY-SA 4.0), Encyclopedia.com,
                Oxford Encyclopedia of Islam and the Muslim World, and official Jamaat-e-Islami
                biographical records. The timeline synthesizes these authoritative sources.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                If you are a rights holder and believe content should be removed or attributed
                differently, please contact us.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Explore His Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto"
          >
            Browse the complete library, read books online, or chat with AI about Maududi's writings.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Browse Library
            </Link>
            <Link
              href="/ai-context-finder"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Quote className="w-5 h-5" aria-hidden="true" />
              AI Context Finder
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}