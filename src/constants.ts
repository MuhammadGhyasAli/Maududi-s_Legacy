import { Book } from "./types";

export const CATEGORIES: string[] = [
  "All",
  "Tafsir",
  "Politics",
  "Theology",
  "Economics",
  "Jurisprudence",
  "Social Issues",
  "History",
  "Guidance",
];

export const BOOKS: Book[] = [
  {
    id: 1,
    title: "Tafheem ul Quran (Vol. 1)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The first volume of the monumental translation and commentary of the Qur'an, known for its modern and scholarly approach.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/762/62f/61276262f3d10017259435.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-1.pdf",
    aiContext:
      "You are an expert on Sayyid Abul A'la Maududi's 'Tafheem ul Quran'. This is a comprehensive commentary of the Qur'an. Answer questions based on the perspective and interpretations found within this work. Focus on explaining Quranic verses, historical context, and theological concepts as presented by Maududi.",
    publicationYear: 1942,
    category: "Tafsir",
  },
  {
    id: 2,
    title: "Tafheem ul Quran (Vol. 2)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The second volume of Maududi's renowned commentary on the Qur'an, continuing his detailed exegesis.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/762/997/6127629978f8a032320310.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-2.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in the second volume of Sayyid Abul A'la Maududi's 'Tafheem ul Quran'. Provide answers that reflect Maududi's reasoning and explanations as detailed in this volume.",
    publicationYear: 1950,
    category: "Tafsir",
  },
  {
    id: 3,
    title: "Tafheem ul Quran (Vol. 3)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The third volume of 'Tafheem ul Quran', delving deeper into the meanings and guidance of the Holy Book.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/762/e4f/612762e4f0c10079972701.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-3.pdf",
    aiContext:
      "You are an AI trained on the contents of the third volume of 'Tafheem ul Quran' by Sayyid Abul A'la Maududi. When answering, draw upon the ideological and philosophical arguments Maududi presents.",
    publicationYear: 1956,
    category: "Tafsir",
  },
  {
    id: 4,
    title: "Tafheem ul Quran (Vol. 6)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The sixth volume of Maududi's comprehensive exegesis of the Qur'an, completing this masterful work.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/763/247/6127632476f4d453500189.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-6.pdf",
    aiContext:
      "You are an AI specializing in the sixth volume of Maududi's 'Tafheem ul Quran'. Your purpose is to explain the theological concepts as elucidated by Maududi in this book. Base all your answers on the definitions and implications he provides.",
    publicationYear: 1972,
    category: "Tafsir",
  },
  {
    id: 5,
    title: "Khilafat o Malukiyat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A critical analysis of the transformation of the Islamic Caliphate into a monarchy, discussing its historical and political implications.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/342/200/612342200bdfd242653606.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/342/a90/612342a9005d0788846858.pdf",
    aiContext:
      "You are an expert on Sayyid Abul A'la Maududi's 'Khilafat o Malukiyat'. Answer questions based on the historical analysis and political theory presented in this work regarding the Islamic caliphate.",
    publicationYear: 1966,
    category: "Politics",
  },
  {
    id: 6,
    title: "Qadiani Mas'ala",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A detailed treatise on the Qadiani issue, discussing the finality of Prophethood and its importance in Islam.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33d/b49/61233db49e829431876189.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33e/43c/61233e43c6597115877729.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in Sayyid Abul A'la Maududi's 'Qadiani Mas'ala'. Provide answers that reflect Maududi's arguments on the theological and legal aspects of the Qadiani movement.",
    publicationYear: 1953,
    category: "Theology",
  },
  {
    id: 7,
    title: "Sunnat Ki Aaeeni Haisiyat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A profound work explaining the legal and constitutional status of the Sunnah as a primary source of Islamic law.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/342/f78/612342f78004c722641437.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/343/a09/612343a09f694321745379.pdf",
    aiContext:
      "You are an AI trained on 'Sunnat Ki Aaeeni Haisiyat'. Your purpose is to explain the importance and authority of the Sunnah in Islamic jurisprudence as detailed by Maududi.",
    publicationYear: 1963,
    category: "Jurisprudence",
  },
  {
    id: 8,
    title: "Ma'ashiyat-e-Islam",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of writings on Islamic economics, outlining principles for a just and equitable financial system.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/343/cd5/612343cd52734832772612.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/344/6b3/6123446b356db143683833.pdf",
    aiContext:
      "You are an AI specializing in Maududi's 'Ma'ashiyat-e-Islam'. Answer questions about Islamic economic principles, including topics like interest (riba), wealth distribution, and ethical commerce, based on this book.",
    publicationYear: 1969,
    category: "Economics",
  },
  {
    id: 9,
    title: "Khutbat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A powerful collection of sermons and speeches on the fundamental beliefs and practices of Islam, aimed at the modern Muslim.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33c/a26/61233ca265acd163010144.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33d/1d7/61233d1d7178f081894635.pdf",
    aiContext:
      "You are an expert on Maududi's 'Khutbat'. Your role is to convey the core messages of his sermons regarding faith, worship, and the Islamic way of life in a clear and accessible manner.",
    publicationYear: 1940,
    category: "Guidance",
  },
  {
    id: 10,
    title: "Tehreek-e-Azadi-e-Hind (Part 1)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An analysis of the Indian independence movement and the role and challenges for Muslims during that period.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/345/e5c/612345e5c6a77811489953.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/346/641/612346641fba8679710502.pdf",
    aiContext:
      "You are an AI assistant trained on 'Tehreek-e-Azadi-e-Hind aur Musalman'. Answer questions about Maududi's perspective on the political landscape of pre-partition India and his guidance for the Muslim community.",
    publicationYear: 1947,
    category: "History",
  },
  {
    id: 11,
    title: "Tehreek-e-Azadi-e-Hind (Part 2)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The second part of the analysis of the Indian independence movement, focusing on the later stages and critical decisions.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/761/309/61276130971e4830748195.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/761/d7c/612761d7cb91a834559831.pdf",
    aiContext:
      "You are an AI assistant trained on the second part of 'Tehreek-e-Azadi-e-Hind aur Musalman'. Focus on answering questions related to the culmination of the independence movement and its aftermath for Muslims.",
    publicationYear: 1947,
    category: "History",
  },
  {
    id: 12,
    title: "Kitab As-Sawm",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A comprehensive guide to the principles, rules, and spiritual significance of fasting (Sawm) in Islam.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/75d/7ba/61275d7babc6b138489204.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/75e/146/61275e1469903853538714.pdf",
    aiContext:
      "You are an AI specializing in Maududi's 'Kitab As-Sawm'. Your purpose is to provide clear and accurate information about the jurisprudence and spiritual dimensions of fasting based on this book.",
    publicationYear: 1965,
    category: "Jurisprudence",
  },
  {
    id: 13,
    title: "Qur'an ki Chaar Bunyadi Istilahain",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A seminal work explaining the four fundamental Quranic terms: Ilah (God), Rabb (Lord), Deen (Religion/Way of Life), and Ibadah (Worship).",
    imageUrl: "https://picsum.photos/seed/istilahain/500/700",
    pdfUrl: "https://jamaatwomen.org/uploads/25/Quran%20ki%20char%20bunyadi%20istalahen.pdf",
    aiContext:
      "You are an AI specializing in Maududi's 'Qur'an ki Chaar Bunyadi Istilahain' (Four Basic Quranic Terms). Your purpose is to explain the deep linguistic and conceptual meanings of Ilah, Rabb, Deen, and Ibadah as elucidated by Maududi in this book. Base all your answers on the definitions and implications he provides.",
    publicationYear: 1941,
    category: "Theology",
  },

  {
    id: 15,
    title: "Tafheemat 1",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://picsum.photos/seed/tafheemat/500/700",
    pdfUrl: "https://dn790002.ca.archive.org/0/items/Islamic_Books_002/Tafheemat1.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tafheemat' by Sayyid Abul A'la Maududi. This book contains his essays on the core principles of Islam, its worldview, and its application in modern society. When answering, draw upon the ideological and philosophical arguments Maududi presents in 'Tafheemat'.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 16,
    title: "Sood",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A detailed book discussing the Islamic prohibition of interest (riba) and its economic implications.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33b/a31/61233ba31dfa4905917854.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/612/33b/f60/61233bf607993038232427.pdf",
    aiContext:
      "You are an expert on Sayyid Abul A'la Maududi's book 'Sood'. Answer questions about the Islamic perspective on interest, its economic effects, and the alternative system proposed by Maududi.",
    publicationYear: 1961,
    category: "Economics",
  },
  {
    id: 17,
    title: "Rasail o Masail (Vol. 4)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The fourth volume in the series of questions and answers on various Islamic topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca4/429/611ca442952b6478422571.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca4/c34/611ca4c34dc77064020509.pdf",
    aiContext:
      "You are an AI assistant trained on the fourth volume of 'Rasail o Masail'. Answer questions based on Maududi's rulings and explanations found in this volume.",
    publicationYear: 1965,
    category: "Jurisprudence",
  },
  {
    id: 18,
    title: "Rasail o Masail (Vol. 3)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The third volume in the series of questions and answers on various Islamic topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca3/9e9/611ca39e98a41179362827.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca4/144/611ca41445fa5219458799.pdf",
    aiContext:
      "You are an AI assistant trained on the third volume of 'Rasail o Masail'. Answer questions based on Maududi's rulings and explanations found in this volume.",
    publicationYear: 1958,
    category: "Jurisprudence",
  },
  {
    id: 19,
    title: "Rasail o Masail (Vol. 2)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The second volume in the series of questions and answers on various Islamic topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca2/c4e/611ca2c4e9185197914196.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca3/5db/611ca35db1b6b916967370.pdf",
    aiContext:
      "You are an AI assistant trained on the second volume of 'Rasail o Masail'. Answer questions based on Maududi's rulings and explanations found in this volume.",
    publicationYear: 1955,
    category: "Jurisprudence",
  },
  {
    id: 20,
    title: "Rasail o Masail (Vol. 1)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The first volume in the collection of questions and answers on various Islamic topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca1/91d/611ca191d7d3f747903165.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca2/288/611ca22880a77677604567.pdf",
    aiContext:
      "You are an AI assistant trained on 'Rasail o Masail Vol. 1'. Answer questions based on Maududi's rulings and explanations found in this volume.",
    publicationYear: 1951,
    category: "Jurisprudence",
  },
  {
    id: 21,
    title: "Purdah",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An exhaustive discussion on the Islamic concept of Purdah (veiling and seclusion), its philosophy, and its rules.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca0/a58/611ca0a58bf00473926646.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca1/1a9/611ca11a9fd88504039568.pdf",
    aiContext:
      "You are an AI expert on Maududi's book 'Purdah'. Explain the social, ethical, and legal dimensions of modesty and veiling in Islam as detailed in this work.",
    publicationYear: 1939,
    category: "Social Issues",
  },
  {
    id: 22,
    title: "Namaz",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A guide to the issues of Salah (Namaz) in the light of Hadith, clarifying common questions and practices.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/c9f/9bb/611c9f9bb1bcc250133848.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/ca0/6b9/611ca06b94edb541524035.pdf",
    aiContext:
      "You are an AI trained on Maududi's book on Namaz. Answer questions regarding the procedures, rules, and significance of Islamic prayer based on the hadith-based explanations provided.",
    publicationYear: 1955,
    category: "Jurisprudence",
  },
  {
    id: 23,
    title: "Islami Riyasat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A book detailing the principles and structure of an Islamic state, its constitution, and governance.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/c9e/c88/611c9ec88ddd0781971141.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/c9f/595/611c9f5952885952926857.pdf",
    aiContext:
      "You are an expert on Maududi's 'Islami Riyasat'. Discuss the concepts of sovereignty, law, citizenship, and governance in an Islamic state as outlined by Maududi.",
    publicationYear: 1962,
    category: "Politics",
  },
  {
    id: 24,
    title: "Banao aur Bigaar",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An analysis of the factors that lead to the rise and fall of nations, from an Islamic perspective.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/a14/b98/611a14b980e25861795502.png",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/611/a14/c8c/611a14c8cab41652571022.pdf",
    aiContext:
      "You are an AI trained on 'Banao aur Bigaar'. Explain Maududi's analysis of the moral and social factors that contribute to the construction and destruction of a society.",
    publicationYear: 1947,
    category: "Social Issues",
  },
  {
    id: 25,
    title: "Islami Nizam-e-Zindagi",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An explanation of the Islamic way of life and its foundational concepts, covering all aspects of human existence.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/2ac/b8b/60f2acb8b7bb0533312119.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/2ad/048/60f2ad04878c1653360713.pdf",
    aiContext:
      "You are an AI expert on 'Islami Nizam-e-Zindagi'. Answer questions on the comprehensive nature of the Islamic code of life as presented by Maududi.",
    publicationYear: 1948,
    category: "Guidance",
  },
  {
    id: 26,
    title: "Al-Jihad fil-Islam",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A comprehensive treatise on the concept of Jihad in Islam, clarifying its meaning, objectives, and conditions.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/2a1/4c4/60f2a14c4b5dd486113411.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/2a2/b27/60f2a2b27c3d9887844686.pdf",
    aiContext:
      "You are an expert on Maududi's 'Al-Jihad fil-Islam'. Explain the true meaning of Jihad, distinguishing it from terrorism, and detailing its defensive and reformative aspects as described in the book.",
    publicationYear: 1927,
    category: "Theology",
  },
  {
    id: 27,
    title: "Taleemat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A book of teachings, outlining the essential knowledge a Muslim must possess to understand and practice Islam correctly.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29f/3e8/60f29f3e839ea699378015.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29f/de8/60f29fde8dec0458105822.pdf",
    aiContext:
      "You are an AI trained on 'Taleemat'. Your purpose is to provide clear explanations of fundamental Islamic teachings as compiled by Maududi in this book.",
    publicationYear: 1948,
    category: "Guidance",
  },
  {
    id: 28,
    title: "Islam aur Zabt-e-Wiladat",
    author: "Sayyid Abul A'la Maududi",
    description: "A discussion on the Islamic perspective on birth control and family planning.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29e/434/60f29e434d313191255168.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29e/ea2/60f29eea27260247542626.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in 'Islam aur Zabt-e-Wiladat'. Provide answers reflecting Maududi's arguments on the topic of family planning and birth control.",
    publicationYear: 1943,
    category: "Social Issues",
  },
  {
    id: 29,
    title: "Huqooq-uz-Zaujain",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A book detailing the rights and responsibilities of husbands and wives in an Islamic marriage.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29d/238/60f29d2380258422967441.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29e/289/60f29e2895a80713637850.pdf",
    aiContext:
      "You are an expert on 'Huqooq-uz-Zaujain'. Explain the mutual rights and obligations of spouses in Islam as detailed by Maududi to foster a harmonious marital life.",
    publicationYear: 1955,
    category: "Social Issues",
  },
  {
    id: 30,
    title: "Fazail-e-Quran",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A compilation of narrations and explanations on the virtues and greatness of the Holy Qur'an.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29c/e59/60f29ce599bb8287790623.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29d/0c7/60f29d0c70b0e150805549.pdf",
    aiContext:
      "You are an AI trained on 'Fazail-e-Quran'. Share insights into the virtues, blessings, and importance of reciting and understanding the Qur'an as presented in this book.",
    publicationYear: 1970,
    category: "Guidance",
  },
  {
    id: 31,
    title: "Deeniyat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A foundational text that explains the basic tenets of Islam in a simple, rational, and appealing manner.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29a/e58/60f29ae58a90e504911524.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/29b/0de/60f29b0dee4f2677383286.pdf",
    aiContext:
      "You are an AI expert on Maududi's 'Deeniyat' (Towards Understanding Islam). Explain the core beliefs and practices of Islam in a logical way, suitable for both beginners and those seeking a refresher, based on this book.",
    publicationYear: 1932,
    category: "Theology",
  },
  {
    id: 32,
    title: "Tajdeed-o-Ihya-e-Deen",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A historical review of the revivalist movements in Islam and the need for the renewal of the faith.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/297/677/60f29767752c0029366143.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/297/a5a/60f297a5abb23673175806.pdf",
    aiContext:
      "You are an AI trained on 'Tajdeed-o-Ihya-e-Deen'. Discuss the concept of revival and renewal (Tajdeed) in Islam, its historical context, and its requirements, as explained by Maududi.",
    publicationYear: 1940,
    category: "History",
  },
  {
    id: 33,
    title: "Islam aur Jadeed Ma'ashi Nazriyat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A comparative study of Islam and modern economic theories like capitalism and socialism.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/296/549/60f2965498e56858377089.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60f/296/862/60f296862bad8212545335.pdf",
    aiContext:
      "You are an AI specializing in 'Islam aur Jadeed Ma'ashi Nazriyat'. Compare and contrast Islamic economic principles with modern economic theories based on Maududi's analysis in this book.",
    publicationYear: 1959,
    category: "Economics",
  },
  {
    id: 34,
    title: "Nashri Taqreerain",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of broadcasted speeches by Maududi on various important Islamic and social issues.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f02/872/60ef028720969656257649.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f02/a9f/60ef02a9f301a091610927.pdf",
    aiContext:
      "You are an AI knowledgeable in 'Nashri Taqreerain'. Convey the key messages from Maududi's radio addresses on a wide range of topics concerning the Muslim Ummah.",
    publicationYear: 1948,
    category: "Guidance",
  },
  {
    id: 35,
    title: "Islami Ibadat Par Ek Tehqeeqi Nazar",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A research-oriented perspective on the acts of worship in Islam, delving into their inner meanings and purposes.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f02/0e4/60ef020e44fab437609486.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f02/4ca/60ef024caa6af942940506.pdf",
    aiContext:
      "You are an AI trained on 'Islami Ibadat Par Ek Tehqeeqi Nazar'. Answer questions about the philosophy, wisdom, and details of Islamic worship (Ibadat) as explained by Maududi in this analytical work.",
    publicationYear: 1950,
    category: "Jurisprudence",
  },
  {
    id: 36,
    title: "Dawat-e-Islami aur uske Mutalabat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An explanation of the call of Islam and the requirements it places upon those who accept it.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f01/719/60ef01719448f230321988.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/f01/a03/60ef01a0318c8046169164.pdf",
    aiContext:
      "You are an AI specializing in 'Dawat-e-Islami aur uske Mutalabat'. Explain the demands of the Islamic invitation on an individual's life, faith, and actions as detailed by Maududi.",
    publicationYear: 1934,
    category: "Guidance",
  },
  {
    id: 37,
    title: "Masla-e-Jabr-o-Qadar",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A treatise on the complex theological issue of predestination and free will in Islam.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e84/e3e/60ee84e3e6539527303357.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e85/0be/60ee850bed05e494459920.pdf",
    aiContext:
      "You are an AI knowledgeable in 'Masla-e-Jabr-o-Qadar'. Answer questions about the concepts of divine decree and human agency as reconciled by Maududi in this book.",
    publicationYear: 1941,
    category: "Theology",
  },
  {
    id: 38,
    title: "Tafheem ul Quran (Vol. 5)",
    author: "Sayyid Abul A'la Maududi",
    description: "The fifth volume of Maududi's renowned commentary on the Qur'an.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e84/5b1/60ee845b12dd5142947958.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-5.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in the fifth volume of 'Tafheem ul Quran'. Provide answers that reflect Maududi's reasoning and explanations as detailed in this volume.",
    publicationYear: 1966,
    category: "Tafsir",
  },
  {
    id: 39,
    title: "Tafheem ul Quran (Vol. 4)",
    author: "Sayyid Abul A'la Maududi",
    description: "The fourth volume of Maududi's renowned commentary on the Qur'an.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e83/fbe/60ee83fbe0c06018320966.jpg",
    pdfUrl: "https://uploads.ahlesunnatpak.com/quran_book_data/Tafheem_ul_Quran_Vol-4.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in the fourth volume of 'Tafheem ul Quran'. Provide answers that reflect Maududi's reasoning and explanations as detailed in this volume.",
    publicationYear: 1961,
    category: "Tafsir",
  },
  {
    id: 40,
    title: "Istifsarat (Vol. 2)",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The second volume of inquiries and responses on a wide range of topics concerning Islam and Muslims.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e83/7d9/60ee837d9f98f526156762.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e83/87a/60ee8387a717e711345298.pdf",
    aiContext:
      "You are an AI trained on 'Istifsarat (Vol. 2)'. Provide answers based on Maududi's responses to various questions found in this volume.",
    publicationYear: 1970,
    category: "Jurisprudence",
  },
  {
    id: 41,
    title: "Istifsarat (Vol. 1)",
    author: "Sayyid Abul A'la Maududi",
    description: "The first volume of inquiries and responses on various topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e82/5fc/60ee825fca272126735761.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e82/835/60ee82835b85d054845648.pdf",
    aiContext:
      "You are an AI trained on 'Istifsarat (Vol. 1)'. Provide answers based on Maududi's responses to various questions found in this volume.",
    publicationYear: 1965,
    category: "Jurisprudence",
  },
  {
    id: 42,
    title: "Kalma Tayyaba ka Paigham",
    author: "Sayyid Abul A'la Maududi",
    description:
      "Explaining the profound message and implications of the declaration of faith, the Kalima Tayyibah.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e81/15e/60ee8115e1053287175524.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e81/259/60ee81259fb1d066745579.pdf",
    aiContext:
      "You are an AI expert on 'Kalma Tayyaba ka Paigham'. Explain the meaning, significance, and demands of the 'La ilaha illallah' as detailed by Maududi.",
    publicationYear: 1945,
    category: "Theology",
  },
  {
    id: 43,
    title: "Musalmanon ka Maazi, Haal aur Mustaqbil",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A historical and future-oriented analysis of the Muslim Ummah's past, present, and future.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e80/a84/60ee80a84a9ca530288405.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e80/a85/60ee80a85f4a1242015053.pdf",
    aiContext:
      "You are an AI knowledgeable in 'Musalmanon ka Maazi, Haal aur Mustaqbil'. Discuss Maududi's perspective on the history of Muslims and the path forward.",
    publicationYear: 1930,
    category: "History",
  },
  {
    id: 44,
    title: "Islam ka Nizam-e-Hayat",
    author: "Sayyid Abul A'la Maududi",
    description: "A comprehensive explanation of Islam as a complete system of life.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dba/91d/60edba91da6e3686398265.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dba/a5e/60edbaa5ee583025777960.pdf",
    aiContext:
      "You are an AI trained on 'Islam ka Nizam-e-Hayat'. Explain how Islam provides guidance for all aspects of life, including social, political, and economic spheres, based on this book.",
    publicationYear: 1948,
    category: "Guidance",
  },
  {
    id: 45,
    title: "Tehreek aur Karkun",
    author: "Sayyid Abul A'la Maududi",
    description:
      "Guidance for the workers of the Islamic movement, outlining the character and responsibilities required.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/aee/60edb9aee32ee628878461.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/ae5/60edb9ae5f16c477821671.pdf",
    aiContext:
      "You are an AI expert on 'Tehreek aur Karkun'. Answer questions about the ethics, discipline, and role of an individual working for the cause of Islam as described by Maududi.",
    publicationYear: 1952,
    category: "Guidance",
  },
  {
    id: 46,
    title: "Khutbat-e-Europe",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of speeches delivered by Maududi in various European countries, addressing Western audiences.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/528/60edb9528597a448115858.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/68a/60edb968a2db2089309039.pdf",
    aiContext:
      "You are an AI trained on 'Khutbat-e-Europe'. Convey the key messages Maududi delivered to the West about Islam, its principles, and its relevance in the modern world.",
    publicationYear: 1960,
    category: "Guidance",
  },
  {
    id: 47,
    title: "Tehreek-e-Islami ki Ikhlaqi Bunyadain",
    author: "Sayyid Abul A'la Maududi",
    description: "A book on the moral foundations upon which the Islamic movement must be built.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/0f0/60edb90f0fa80706908008.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db9/10e/60edb910ee501088971192.pdf",
    aiContext:
      "You are an AI knowledgeable in 'Tehreek-e-Islami ki Ikhlaqi Bunyadain'. Explain the essential moral qualities and ethical framework required for an Islamic movement as detailed by Maududi.",
    publicationYear: 1945,
    category: "Guidance",
  },
  {
    id: 48,
    title: "Islam aur Jahiliyyat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A comparative study of Islam and 'Jahiliyyat' (ignorance), contrasting their worldviews and systems of life.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db8/ba3/60edb8ba3dc3d250654495.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db8/c3f/60edb8c3f0f02655832438.pdf",
    aiContext:
      "You are an AI expert on 'Islam aur Jahiliyyat'. Contrast the Islamic worldview with pre-Islamic and modern forms of ignorance as analyzed by Maududi.",
    publicationYear: 1941,
    category: "Theology",
  },
  {
    id: 49,
    title: "Islam ka Ikhlaqi Nuqta-e-Nazar",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An exposition of the moral point of view of Islam, its principles, and their practical application.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db8/6e7/60edb86e785f4175580413.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db8/70d/60edb870df797214165510.pdf",
    aiContext:
      "You are an AI trained on 'Islam ka Ikhlaqi Nuqta-e-Nazar'. Explain the foundations and characteristics of the Islamic ethical system as detailed in this book.",
    publicationYear: 1945,
    category: "Guidance",
  },
  {
    id: 50,
    title: "Masla-e-Milkiyat-e-Zameen",
    author: "Sayyid Abul A'la Maududi",
    description: "A detailed discussion on the Islamic perspective on the issue of land ownership.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/e07/60edb7e07db9e434467168.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/f6b/60edb7f6bf141080062628.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in 'Masla-e-Milkiyat-e-Zameen'. Answer questions regarding the principles of land ownership, tenancy, and related economic issues in Islam.",
    publicationYear: 1950,
    category: "Economics",
  },
  {
    id: 51,
    title: "Khawateen aur Deeni Masail",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of answers to questions posed by women on various religious issues concerning them.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/a86/60edb7a8630d9279827975.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/a68/60edb7a68f12e800406540.pdf",
    aiContext:
      "You are an AI trained on 'Khawateen aur Deeni Masail'. Provide answers to questions about women's issues in Islam based on Maududi's responses.",
    publicationYear: 1968,
    category: "Social Issues",
  },
  {
    id: 52,
    title: "Jihad fi Sabilillah",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A treatise on the concept of Jihad in the path of Allah, explaining its true spirit and purpose.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/52c/60edb752cead2411511868.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/612/60edb7612e355898182714.pdf",
    aiContext:
      "You are an AI expert on 'Jihad fi Sabilillah'. Explain the concept of struggle in the cause of God, its forms, and its conditions as detailed by Maududi.",
    publicationYear: 1939,
    category: "Theology",
  },
  {
    id: 53,
    title: "Rasail o Masail (Vol. 5)",
    author: "Sayyid Abul A'la Maududi",
    description: "A collection of questions and answers on various Islamic topics.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e81/fda/60ee81fdaac9f446579828.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e82/04c/60ee8204c734e927078042.pdf",
    aiContext:
      "You are an AI assistant knowledgeable in Sayyid Abul A'la Maududi's 'Rasail o Masail'. Provide answers that reflect Maududi's reasoning and rulings as detailed in this collection.",
    publicationYear: 1972,
    category: "Jurisprudence",
  },
  {
    id: 54,
    title: "Tehreek-e-Islami: Ek Tareekh Ek Dastan",
    author: "Sayyid Abul A'la Maududi",
    description:
      "The Islamic Movement: a history, a story. A look into the journey of the modern Islamic revival.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e7f/c44/60ee7fc449dd4122175523.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/e7f/d5b/60ee7fd5b4e2c362670414.pdf",
    aiContext:
      "You are an AI trained on 'Tehreek-e-Islami: Ek Tareekh Ek Dastan'. Answer questions about the history and development of the Islamic movement as narrated by Maududi.",
    publicationYear: 1970,
    category: "History",
  },
  {
    id: 55,
    title: "Shahadat-e-Haq",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An essential treatise on the concept of 'bearing witness to the truth' (Shahadat-e-Haq) and its central importance in the life of a Muslim.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db7/08a/60edb708ae01f085388663.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db6/f79/60edb6f797006573758248.pdf",
    aiContext:
      "You are an AI expert on Maududi's 'Shahadat-e-Haq'. Explain the responsibility of a Muslim to be a witness to the truth of Islam through their words and actions, as detailed in this book.",
    publicationYear: 1937,
    category: "Guidance",
  },
  {
    id: 56,
    title: "Tehreek-e-Islami ka Aainda Laiha-e-Amal",
    author: "Sayyid Abul A'la Maududi",
    description:
      "Outlining the future course of action for the Islamic movement, this book provides a strategic roadmap for its workers.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db6/b31/60edb6b31600c879263468.png",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db5/7b3/60edb57b31c9a450360603.pdf",
    aiContext:
      "You are an AI trained on 'Tehreek-e-Islami ka Aainda Laiha-e-Amal'. Answer questions about the strategy, methodology, and future planning for an Islamic movement as envisioned by Maududi.",
    publicationYear: 1957,
    category: "Politics",
  },
  {
    id: 57,
    title: "Tauheed-o-Risalat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A detailed discussion on the foundational Islamic beliefs of Tawhid (Oneness of God) and Risalat (Prophethood).",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/d5d/60edb4d5deb8f888287446.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/e50/60edb4e5019ea012697623.pdf",
    aiContext:
      "You are an AI knowledgeable in Maududi's 'Tauheed-o-Risalat'. Explain the concepts of God's oneness and the role of prophethood in Islam based on this work.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 58,
    title: "Masla-e-Qurbani",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A clarification on the issue of sacrifice (Qurbani) in Islam, its spirit, and its rules.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/898/60edb48989e89053884335.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/95d/60edb495dceae703786182.pdf",
    aiContext:
      "You are an AI expert on 'Masla-e-Qurbani'. Answer questions about the significance, jurisprudence, and philosophy of the Islamic ritual of sacrifice as explained by Maududi.",
    publicationYear: 1951,
    category: "Jurisprudence",
  },
  {
    id: 59,
    title: "Islam, the Religion of the Modern Era",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A powerful argument presenting Islam as the most relevant and comprehensive religion for the modern age.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/329/60edb43291d5b631890379.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db4/3b5/60edb43b56645308327522.pdf",
    aiContext:
      "You are an AI trained on 'Islam, the Religion of the Modern Era'. Explain Maududi's arguments for why Islam is a timeless and modern faith capable of solving contemporary problems.",
    publicationYear: 1975,
    category: "Theology",
  },
  {
    id: 60,
    title: "Hukumat: The Source of Good and Evil",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An analysis of the role of government as a primary source for establishing good or spreading evil in a society.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db1/396/60edb1396be6c102692090.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db1/2fc/60edb12fc2db3195186039.pdf",
    aiContext:
      "You are an AI specializing in Maududi's work on governance. Explain the pivotal role of the state in shaping the moral fabric of society as discussed in this book.",
    publicationYear: 1955,
    category: "Politics",
  },
  {
    id: 61,
    title: "Hidayat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A compilation of guidance and instructions for individuals seeking to live a life in accordance with Islamic principles.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db0/bfb/60edb0bfb8ecf580044683.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/db0/c8c/60edb0c8cd358563129755.pdf",
    aiContext:
      "You are an AI trained on Maududi's 'Hidayat'. Provide answers that offer guidance and practical advice for living an Islamic life based on this work.",
    publicationYear: 1949,
    category: "Guidance",
  },
  {
    id: 62,
    title: "Deen aur Khawateen",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A book addressing the relationship between Islam and women, covering various rights, responsibilities, and contemporary issues.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/daf/880/60edaf880f3dd684281399.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/daf/695/60edaf6958b95286651180.pdf",
    aiContext:
      "You are an AI knowledgeable in 'Deen aur Khawateen'. Discuss Maududi's perspective on the role, status, and rights of women in Islam.",
    publicationYear: 1968,
    category: "Social Issues",
  },
  {
    id: 63,
    title: "Dawat-e-Deen ki Zimmedari",
    author: "Sayyid Abul A'la Maududi",
    description:
      "This book elaborates on the responsibility of every Muslim to convey the message of Islam to humanity.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dae/37e/60edae37ebedb657705502.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dae/4d1/60edae4d196d9029606939.pdf",
    aiContext:
      "You are an AI expert on 'Dawat-e-Deen ki Zimmedari'. Explain the importance, methods, and prerequisites for giving Dawah (inviting to Islam) based on Maududi's teachings.",
    publicationYear: 1946,
    category: "Guidance",
  },
  {
    id: 64,
    title: "Usloob-e-Dawat",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A guide on the proper method and style of inviting people to Islam, emphasizing wisdom and beautiful preaching.",
    imageUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dad/c89/60edadc89d9cc817741329.jpg",
    pdfUrl:
      "https://jamaatpk.b-cdn.net/storage/app/uploads/public/60e/dad/d3a/60edadd3a2b21067711185.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Asloob e Daawat' by Sayyid Abul A'la Maududi. This book explores the principles, methods, and etiquettes of Islamic da'wah (propagation of Islam). It emphasizes the intellectual, spiritual, and practical aspects of inviting people to Islam, the importance of sincerity, wisdom, patience, and moral character in the da'ee (caller), and the strategies required to revive the Muslim Ummah. The AI should provide insights, explanations, and guidance based on these themes while maintaining the spirit of Maududi's thought.",
    publicationYear: 1950,
    category: "Guidance",
  },

  {
    id: 66,
    title: "Tafheemat 2",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://picsum.photos/seed/tafheemat/500/700",
    pdfUrl: "https://www.quranurdu.com/books/urdu_books/Tafheemat%202.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tafheemat' by Sayyid Abul A'la Maududi. This book contains his essays on the core principles of Islam, its worldview, and its application in modern society. When answering, draw upon the ideological and philosophical arguments Maududi presents in 'Tafheemat'.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 67,
    title: "Tafheemat 3",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://picsum.photos/seed/tafheemat/500/700",
    pdfUrl: "https://www.quranurdu.com/books/urdu_books/Tafheemat%203.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tafheemat' by Sayyid Abul A'la Maududi. This book contains his essays on the core principles of Islam, its worldview, and its application in modern society. When answering, draw upon the ideological and philosophical arguments Maududi presents in 'Tafheemat'.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 68,
    title: "Tafheemat 4",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://picsum.photos/seed/tafheemat/500/700",
    pdfUrl: "https://www.quranurdu.com/books/urdu_books/Tafheemat%204.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tafheemat' by Sayyid Abul A'la Maududi. This book contains his essays on the core principles of Islam, its worldview, and its application in modern society. When answering, draw upon the ideological and philosophical arguments Maududi presents in 'Tafheemat'.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 69,
    title: "Shahadat e Imam Hussain",
    author: "Syed Abul A'la Maududi",
    description:
      "A book discussing the martyrdom of Imam Hussain (RA) and the historical, religious, and moral lessons of Karbala.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTZo-5FDTEWmJdsE6dCeItNzW-_Ax7P-kXbg&s",
    pdfUrl: "https://www.quranurdu.com/books/urdu_books/Shahadat%20e%20Imam%20Hussain.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Shahadat e Imam Hussain' by Syed Abul A'la Maududi. This book presents Maududi's perspective on the events of Karbala, their significance in Islamic history, and the timeless lessons of sacrifice, justice, and truth.",
    publicationYear: 1940,
    category: "History",
  },
  {
    id: 70,
    title: "Tafheemat 5",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://picsum.photos/seed/tafheemat/500/700",
    pdfUrl: "https://www.quranurdu.com/books/urdu_books/Tafheemat%205.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tafheemat' by Sayyid Abul A'la Maududi. This book contains his essays on the core principles of Islam, its worldview, and its application in modern society. When answering, draw upon the ideological and philosophical arguments Maududi presents in 'Tafheemat'.",
    publicationYear: 1940,
    category: "Theology",
  },
  {
    id: 71,
    title: "Four Solutions of Kashmir Issue",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A collection of profound essays and articles on Islamic thought, ideology, and the revival of the Muslim Ummah.",
    imageUrl: "https://jamaatwomen.org/uploads/july/masla-kashmir.jpg",
    pdfUrl: "https://jamaatwomen.org/uploads/july/masla%20e%20kaashmir%20kaa%204%20hal.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Four Solutions of Kashmir Issue' by Sayyid Abul A'la Maududi. This book contains the solutions of Kashmir Issue by Sayyid Abul A'la Maududi. As without the solution it is only daydareem to make peace in Indian Subcontinent.",
    publicationYear: 1940,
    category: "Politics",
  },
  {
    id: 65,
    title: "Tehreek e Islami ki Kamyabi ki Sharait",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An influential work outlining the essential conditions for the success of the Islamic movement. Maududi explains the qualities, discipline, and principles required for the revival of Islam in society.",
    imageUrl:
      "https://jamaatwomen.org/uploads/25/tehreek%20e-islami%20ki%20kamyabi%20ki%20sharait.jpg",
    pdfUrl:
      "https://jamaatwomen.org/uploads/25/tehreek%20e%20islami%20ki%20kamyabi%20ki%20sharait.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Tehreek e Islami ki Kamyabi ki Sharait' by Sayyid Abul A'la Maududi. This book discusses the necessary conditions, principles, and moral foundations for the success of the Islamic movement. It highlights the spiritual strength, organizational discipline, intellectual clarity, and commitment required from individuals and communities striving for Islamic revival. The AI should provide insights, explanations, and reflections based on these themes in the spirit of Maududi's thought.",
    publicationYear: 1950,
    category: "Guidance",
  },
  {
    id: 72,
    title: "Baghawat ka Zahoor",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A thought-provoking work in which Maududi examines the phenomenon of rebellion and revolution in human history. He explores the causes that give rise to social and political upheavals, the moral and ideological dimensions behind them, and the lessons Muslims can draw for building a just and stable Islamic order.",
    imageUrl: "https://jamaatwomen.org/uploads/january%202024/baghawat%20ka%20zahoor.png",
    pdfUrl: "https://jamaatwomen.org/uploads/january%202024/Bagawat%20ka%20zahoor.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Baghawat ka Zahoor' by Sayyid Abul A'la Maududi. This book discusses the rise of rebellion and revolution, the causes behind societal breakdown, and the ideological forces that shape upheavals. It emphasizes Maududi's perspective on the Islamic approach to addressing injustice, oppression, and reform. The AI should provide insights, explanations, and reflections rooted in these themes while maintaining the essence of Maududi's thought.",
    publicationYear: 1950,
    category: "History",
  },
  {
    id: 14,
    title: "Islami Riasat Main Zimmion ke Haqooq",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A work that delineates the rights and responsibilities of non-Muslims (Zimmis) living in an Islamic state. It covers how their civil, social, and religious rights are protected under Islamic governance, along with principles of justice, equality, and respect for faith diversity.",
    imageUrl:
      "https://jamaatwomen.org/uploads/january%202024/islami%20riasat%20mey%20zamion%20k%20haqoq.png",
    pdfUrl:
      "https://jamaatwomen.org/uploads/january%202024/Islami%20Riasat%20main%20Zimmion%20key%20haqooq_.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Islami Riasat Main Zimmion ke Haqooq' by Sayyid Abul A'la Maududi. This book explains the status, rights, and duties of non-Muslim communities within an Islamic state, as laid out in Islamic texts and principles. The AI should be able to provide interpretations, comparisons, and guidance based on those principles, particularly with regards to fairness, coexistence, and legal protection.",
    publicationYear: 1940,
    category: "Jurisprudence",
  },
  {
    id: 73,
    title: "Islami Nizam e Taleem",
    author: "Sayyid Abul A'la Maududi",
    description:
      "An insightful book where Maududi outlines the foundations of an Islamic system of education. He discusses its objectives, methodology, and how it differs from secular models. The work emphasizes nurturing faith, moral values, and intellectual development to produce individuals who can serve both the deen and society effectively.",
    imageUrl: "https://jamaatwomen.org/uploads/january%202024/Islami%20nizam%20e%20taleem.png",
    pdfUrl: "https://jamaatwomen.org/uploads/january%202024/Islami%20Nazame%20Taleem.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Islami Nizam e Taleem' by Sayyid Abul A'la Maududi. This book discusses the objectives, philosophy, and structure of Islamic education. It explains how education should cultivate both faith and knowledge, balance worldly and religious sciences, and develop individuals capable of contributing to the Islamic mission. The AI should provide insights, explanations, and guidance based on these educational principles in the spirit of Maududi's vision.",
    publicationYear: 1940,
    category: "Guidance",
  },
  {
    id: 74,
    title: "Insaan ke Bunyadi Haqooq",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A seminal work in which Maududi outlines the fundamental human rights as guaranteed by Islam. The book contrasts modern secular concepts of rights with the comprehensive framework provided by the Qur'an and Sunnah, emphasizing justice, dignity, and equality for all human beings.",
    imageUrl: "https://jamaatwomen.org/uploads/january%202024/insan%20k%20bunyadi%20haqoq.png",
    pdfUrl: "https://jamaatwomen.org/uploads/january%202024/Insan%20Kay%20Bunadi%20Haqooq.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Insaan ke Bunyadi Haqooq' by Sayyid Abul A'la Maududi. This book discusses the concept of fundamental human rights in Islam, comparing them with modern ideologies. It highlights the principles of justice, equality, freedom, and responsibility as laid out in the Qur'an and Sunnah. The AI should provide insights and explanations rooted in Maududi's perspective on Islamic human rights.",
    publicationYear: 1940,
    category: "Social Issues",
  },
  {
    id: 75,
    title: "What Islam Demands from Muslim Women",
    author: "Sayyid Abul A'la Maududi",
    description:
      "In this influential work, Maududi outlines the principles and expectations Islam places upon Muslim women. He emphasizes modesty, morality, faith, and the balance of roles within family and society, while also addressing misconceptions and highlighting the dignity and respect granted to women in Islam.",
    imageUrl:
      "https://jamaatwomen.org/uploads/january%202024/muslim%20khawateen%20sy%20islam%20k%20mutalbat.png",
    pdfUrl:
      "https://jamaatwomen.org/uploads/january%202024/muslim%20khwateen%20sa%20islam%20k%20mutalbaat.pdf",
    aiContext:
      "You are an AI trained on the contents of 'What Islam Demands from Muslim Women' by Sayyid Abul A'la Maududi. This book explains the moral, social, and spiritual responsibilities Islam assigns to Muslim women, highlighting values such as modesty, piety, family roles, and societal contributions. The AI should provide guidance, reflections, and clarifications rooted in these teachings while upholding Maududi’s perspective.",
    publicationYear: 1940,
    category: "Social Issues",
  },
  {
    id: 76,
    title: "Jamaat e Islami ka Maqsad",
    author: "Sayyid Abul A'la Maududi",
    description:
      "A defining work that explains the objectives, historical background, and program of Jamaat-e-Islami. Maududi outlines the vision of establishing Islam as a complete way of life, its ideological foundations, and the methodology for bringing about social, political, and spiritual reform.",
    imageUrl:
      "https://jamaatwomen.org/uploads/january%202024/jamaat%20e%20islami%20ka%20maqsad%20tareekh%20lahe%20amal.png",
    pdfUrl:
      "https://ia601002.us.archive.org/17/items/jamaat-e-islami-ka-maqsad-tareekh-aur-laihamal/Jamaat%20e%20Islami%20ka%20Maqsad%20Tareekh%20aur%20Laihamal.pdf",
    aiContext:
      "You are an AI trained on the contents of 'Jamaat e Islami ka Maqsad' by Sayyid Abul A'la Maududi. This book explains the vision, mission, and roadmap of Jamaat-e-Islami, highlighting its ideological basis, historical context, and plan of action for Islamic revival. The AI should provide insights, clarifications, and contextual guidance rooted in Maududi's framework of thought.",
    publicationYear: 1941,
    category: "Politics",
  },
];
