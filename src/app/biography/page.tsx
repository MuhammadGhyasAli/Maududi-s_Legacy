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
  { year: "Towards Understanding the Qur'an", a 6-volume translation and commentary of the Qur'an by Maududi which Maududi spent many years writing (which was begun in Muharram, 1361 A.H./February 1942).