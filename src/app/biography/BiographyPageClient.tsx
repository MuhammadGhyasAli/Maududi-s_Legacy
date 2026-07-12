"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Users,
  Quote,
  Landmark,

  ExternalLink,

  Brain,
  Scale,
  Coins,
  Lightbulb,
  Megaphone,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const timeline = [
  { year: '1903', title: 'Birth', event: 'Born 25 September in Aurangabad, Hyderabad Deccan, British India. Youngest of three sons of Ahmad Hasan, a lawyer from a family tracing lineage to the Prophet Muhammad (PBUH) through Husayn ibn Ali and Khwaja Moinuddin Chishti.' },
  { year: '1909\u20131918', title: 'Early Education', event: 'Quran, Persian, Arabic, Urdu, and Islamic law under father\'s supervision at home. Translated Qasim Amin\'s \'The New Woman\' from Arabic to Urdu at age 11.' },
  { year: '1918', title: 'First Publication', event: 'First published article on electricity in Maarif magazine at age 15. Began journalistic career writing for Bijnore newspaper.' },
  { year: '1919\u20131920', title: 'Family Crisis & Self-Study', event: 'Father\'s paralysis and death left family destitute. Abandoned formal education, moved to Delhi, studied English and German, read Western philosophy intensively for five years.' },
  { year: '1920', title: 'First Editorial Role', event: 'Appointed editor of daily Taj (Jabalpur) at age 17.' },
  { year: '1921', title: 'Advanced Studies', event: 'Studied Arabic under Maulana Abdul Salam Niazi in Delhi. Appointed editor of daily Muslim. Began Dars-e-Nizami curriculum.' },
  { year: '1925', title: 'Principled Resignation', event: 'Appointed editor of Al-Jamiat (Delhi). Resigned when Jamiat aligned with Indian National Congress \u2014 a principled stand against composite nationalism.' },
  { year: '1926', title: 'Formal Certification', event: 'Earned Sanad of Uloom-e-Aqliya wa Naqliya from Darul Uloom Fatehpuri, Delhi.' },
  { year: '1927', title: 'Breakthrough Work', event: 'Published Al-Jihad fil Islam (600 pages) at age 24. Allama Iqbal praised it as \'the best explication of jihad in any language\'.' },
  { year: '1928', title: 'Hadith Certification', event: 'Received Sanad in Jami al-Tirmidhi and Muwatta Imam Malik from Darul Uloom Fatehpuri, Delhi.' },
  { year: '1932', title: 'Tarjuman al-Quran', event: 'Launched monthly journal Tarjuman al-Quran from Hyderabad \u2014 dedicated to Quranic interpretation and Islamic revivalism.' },
  { year: '1933\u20131937', title: 'Political Philosophy', event: 'Developed political philosophy: Islam as comprehensive ideology (hakimiyyat Allah), critique of secular nationalism, concept of jahiliyya.' },
  { year: '1937', title: 'Meeting Iqbal', event: 'Introduced to Allama Muhammad Iqbal by Chaudhry Niaz Ali Khan in Lahore. Iqbal invited him to Punjab.' },
  { year: '1938', title: 'Daru\'l-Islam Trust', event: 'Moved to Pathankot, Punjab to oversee Daru\'l-Islam Trust Institute established on Iqbal\'s advice.' },
  { year: '1941', title: 'Founded Jamaat-e-Islami', event: 'Founded Jamaat-e-Islami on 26 August in Lahore. First Ameer. Started with 75 members.' },
  { year: '1942', title: 'Tafhim-ul-Quran Begins', event: 'Began writing Tafhim-ul-Quran \u2014 his magnum opus, a 6-volume thematic translation and commentary. Work continued for 30 years.' },
  { year: '1947', title: 'Partition & Reorganization', event: 'Partition of India. Jamaat split along new borders. Maududi opposed partition as violating Islamic ummah unity.' },
  { year: '1948', title: 'Islamic Constitution Campaign', event: 'Campaign for Islamic constitution in Pakistan. Issued fatwa on jihad in Kashmir; imprisoned by Pakistani government.' },
  { year: '1953', title: 'Anti-Ahmadiyya Agitation', event: 'Sentenced to death by military court; commuted to life imprisonment, then overturned by Supreme Court after international pressure.' },
  { year: '1956', title: 'Constitutional Victory', event: 'Pakistan\'s first Constitution adopted \u2014 Objectives Resolution made preamble; Maududi\'s constitutional ideas partly incorporated.' },
  { year: '1958', title: 'Martial Law & Imprisonment', event: 'Jamaat-e-Islami banned by Martial Law Administrator Ayub Khan. Maududi imprisoned; released 1964.' },
  { year: '1961', title: 'Muslim World League', event: 'Founding member of Rabitat al-Alam al-Islami (Muslim World League), Mecca.' },
  { year: '1964', title: 'Imprisonment Again', event: 'Imprisoned again under Ayub Khan; released same year after public pressure.' },
  { year: '1971', title: 'Bangladesh Crisis', event: 'Bangladesh Liberation War crisis. Relinquished authority to East Pakistan Shura.' },
  { year: '1972', title: 'Magnum Opus Complete', event: 'Completed Tafhim-ul-Quran after 30 years (1942\u20131972). Resigned as Ameer of Jamaat-e-Islami in October.' },
  { year: '1973', title: 'Later Works', event: 'Published Tajdeed-e-Ihya-e-Deen and continued writing on Islamic civilization.' },
  { year: '1979', title: 'Passing', event: 'Passed away on 22 September in Buffalo, New York. Buried in Ichhra, Lahore. His funeral drew hundreds of thousands.' },
];

const majorWorks = [
  { title: 'Tafhim-ul-Quran', description: '6-volume thematic translation and commentary (1942\u20131972). His magnum opus presenting the Quran as a comprehensive guide for life.', year: '1942\u20131972', featured: true },
  { title: 'Al-Jihad fil Islam', description: '600-page treatise published at age 24. Allama Iqbal called it the best explication of jihad in any language.', year: '1927' },
  { title: 'Khutabat', description: 'Multi-volume collection of speeches and addresses to Jamaat-e-Islami members spanning decades.', year: '1941\u20131972' },
  { title: 'Islamic Law and Constitution', description: 'Systematic presentation of Islamic constitutional theory and its application to modern governance.', year: '1955' },
  { title: 'The Islamic Way of Life', description: 'Comprehensive overview of Islam as a complete system covering belief, worship, ethics, and social order.', year: '1948' },
  { title: 'Human Rights in Islam', description: 'Articulation of Islamic human rights framework predating the UN Declaration by decades.', year: '1976' },
  { title: 'Four Basic Quranic Terms', description: 'Seminal work explaining Ilah, Rabb, Ibadah, and Deen \u2014 foundational concepts of Islamic theology.', year: '1977' },
  { title: 'Let Us Be Muslims', description: 'Collection of Friday sermons calling Muslims to live by the comprehensive demands of their faith.', year: '1978' },
];

const intellectualLegacy = [
  { title: 'Hakimiyyat Allah', desc: 'Sovereignty of God \u2014 Islam as a complete ideological system governing all aspects of life', icon: Landmark },
  { title: 'Jahiliyya', desc: 'Concept that societies not governed by divine law live in a state of modern ignorance', icon: Brain },
  { title: 'Islamic State Theory', desc: 'Framework for an Islamic political order based on consultation (shura) and divine law', icon: Scale },
  { title: 'Islamic Economics', desc: 'Interest-free banking, zakat as fiscal policy, and social welfare as state obligation', icon: Coins },
  { title: 'Revival of Ijtihad', desc: 'Independent reasoning to address modern challenges within Islamic legal framework', icon: Lightbulb },
  { title: 'Islamic Da\'wah Methodology', desc: 'Systematic approach to inviting others to Islam through education and example', icon: Megaphone },
];

const quickFacts = [
  { icon: Calendar, label: 'Born', value: '25 Sep 1903, Aurangabad' },
  { icon: Calendar, label: 'Died', value: '22 Sep 1979, Buffalo, NY' },
  { icon: MapPin, label: 'Resting Place', value: 'Ichhra, Lahore' },
  { icon: Award, label: 'Era', value: '20th Century' },
  { icon: BookOpen, label: 'Jurisprudence', value: 'Hanafi' },
  { icon: Users, label: 'Movement', value: 'Jamaat-e-Islami' },
  { icon: BookOpen, label: 'Works', value: '73+ books' },
  { icon: Award, label: 'Magnum Opus', value: 'Tafhim-ul-Quran' },
];

const galleryImages = [
  { src: '/maududi-portrait.jpg', alt: 'Sayyid Abul A\'la Maududi \u2014 Portrait', caption: 'Portrait of Maududi in his study' },
  { src: '/author.png', alt: 'Maududi writing', caption: 'Maududi working on Tafhim-ul-Quran' },
  { src: '/maududi-grave.jpg', alt: 'Maududi\'s grave in Ichhra, Lahore', caption: 'Final resting place in Ichhra, Lahore' },
];

function TimelineItem({ item, index }: { item: (typeof timeline)[0]; index: number }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: isEven ? -30 : 30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
        },
      }}
      className="relative flex items-start gap-6 group"
    >
      {/* year badge */}
      <div className="flex-shrink-0 w-20 sm:w-24 text-right">
        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
          {item.year}
        </span>
      </div>

      {/* connector line + dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-950 shadow-sm z-10 group-hover:scale-125 transition-transform duration-300" />
        {index < timeline.length - 1 && (
          <div className="w-px flex-1 bg-gradient-to-b from-emerald-300 to-gray-200 dark:from-emerald-700 dark:to-gray-800 min-h-[3rem]" />
        )}
      </div>

      {/* content card */}
      <div className="flex-1 pb-8 -mt-1">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            {item.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {item.event}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function WorkCard({ work }: { work: (typeof majorWorks)[0] }) {
  const isFeatured = work.featured;
  return (
    <motion.div
      variants={itemVariants}
      className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
        isFeatured
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/60 md:col-span-2 lg:col-span-3'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 tracking-wide">
          {work.year}
        </span>
        {isFeatured && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white tracking-wide">
            Magnum Opus
          </span>
        )}
      </div>
      <h3
        className={`font-bold text-gray-900 dark:text-white mb-2 leading-snug ${
          isFeatured ? 'text-xl sm:text-2xl' : 'text-base'
        }`}
      >
        {work.title}
      </h3>
      <p
        className={`text-gray-500 dark:text-gray-400 leading-relaxed flex-1 ${
          isFeatured ? 'text-base' : 'text-sm'
        }`}
      >
        {work.description}
      </p>
    </motion.div>
  );
}

function LegacyItem({ item, index }: { item: (typeof intellectualLegacy)[0]; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        },
      }}
      className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">
          {item.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}

function FactCard({ fact }: { fact: (typeof quickFacts)[0] }) {
  const Icon = fact.icon;
  return (
    <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center hover:shadow-md transition-shadow duration-300">
      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" aria-hidden="true" />
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
        {fact.label}
      </p>
      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">
        {fact.value}
      </p>
    </div>
  );
}

function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="relative h-64 sm:h-80 md:h-96">
        {galleryImages.map((img, index) => (
          <motion.div
            key={img.src}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="text-white text-sm font-medium">{img.caption}</p>
              <p className="text-white/60 text-xs mt-0.5">
                {index + 1} / {galleryImages.length}
              </p>
            </div>
          </motion.div>
        ))}

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-20"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-20"
          aria-label="Next image"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* dots */}
        <div className="absolute bottom-5 right-5 sm:right-6 flex gap-1.5 z-20">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-1.5'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BiographyPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <main className="min-h-screen">
      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-950/40 to-gray-950 dark:from-black dark:via-emerald-950/30 dark:to-black pt-20 pb-16 sm:pt-28 sm:pb-24"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,150,105,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(5,150,105,0.04)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(5,150,105,0.12),transparent_60%)] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex-shrink-0"
            >
              <motion.div
                style={{ scale: portraitScale }}
                className="relative w-52 h-64 sm:w-60 sm:h-76 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10"
              >
                <Image
                  src="/maududi-portrait.jpg"
                  alt="Sayyid Abul A'la Maududi"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 256px, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
              <div className="absolute -bottom-3 -right-3 sm:bottom-4 sm:right-4 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30">
                1903–1979
              </div>
            </motion.div>

            {/* Bio Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-center md:text-left flex-1"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-5">
                <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
                Scholar &bull; Philosopher &bull; Jurist &bull; Journalist
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
                Sayyid Abul A&apos;la{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Maududi
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Founder of Jamaat-e-Islami, author of{' '}
                <em className="text-gray-300 not-italic font-medium">Tafhim-ul-Quran</em>,
                and one of the most systematic Islamic thinkers of the modern era.
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300 text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  Wikipedia
                </a>
                <a
                  href="https://jamaat.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300 text-sm shadow-lg shadow-emerald-600/25"
                >
                  <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
                  Jamaat-e-Islami
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* decorative orbs */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl pointer-events-none" />
      </section>

      {/* ─── Quick Facts + Gallery ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Quick Facts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="lg:sticky lg:top-24">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  Quick Facts
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickFacts.map((fact, index) => (
                    <FactCard key={index} fact={fact} />
                  ))}
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
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">
                Photo Gallery
              </h3>
              <Gallery />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="py-16 sm:py-24 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Life{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Timeline
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Key milestones in the life of one of Islam&apos;s most influential
              modern thinkers.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {timeline.map((item, index) => (
              <TimelineItem key={item.year} item={item} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Major Works ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Major{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Works
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              A selection of his most influential publications spanning over five
              decades.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {majorWorks.map((work) => (
              <WorkCard key={work.title} work={work} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Intellectual Legacy ─── */}
      <section className="py-16 sm:py-24 border-y border-gray-100 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Intellectual{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Legacy
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Core concepts that shaped modern Islamic political thought and continue
              to influence scholars worldwide.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {intellectualLegacy.map((item, index) => (
              <LegacyItem key={index} item={item} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Sources ─── */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Sources &{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Attribution
            </span>
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p className="leading-relaxed">
              Biographical information is drawn from{' '}
              <a href="https://en.wikipedia.org/wiki/Abul_A%27la_Maududi" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Wikipedia (CC BY-SA 4.0)</a>,{' '}
              <a href="https://www.encyclopedia.com/people/history/south-asian-biographies/abul-ala-maududi" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Encyclopedia.com</a>,{' '}
              <a href="https://global.oup.com/academic/product/encyclopedia-of-islam-and-the-muslim-world-9780199754564" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Oxford Encyclopedia of Islam and the Muslim World</a>,
              and official{' '}
              <a href="https://jamaat.org" target="_blank" rel="noopener noreferrer" className="underline decoration-emerald-500/30 hover:decoration-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Jamaat-e-Islami</a>{' '}
              biographical records. The timeline synthesizes these authoritative sources.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              If you are a rights holder and believe content should be removed or
              attributed differently, please contact us.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-br from-gray-950 via-emerald-950/40 to-gray-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,150,105,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(5,150,105,0.04)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(5,150,105,0.2),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
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
            className="text-lg text-gray-400 mb-10 max-w-xl mx-auto"
          >
            Browse the complete library, read books online, or chat with AI about
            Maududi&apos;s writings.
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
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-600/25"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Browse Library
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all duration-300"
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
