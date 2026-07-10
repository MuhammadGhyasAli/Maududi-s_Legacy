TOPIC_KEYWORDS: dict[str, list[str]] = {
    "Tafsir": [
        "quran", "tafsir", "tafheem", "surah", "ayah", "verse",
        "revelation", "interpretation", "quranic", "exegesis",
        "surah al", "ayat", "mushaf", "wahy",
    ],
    "Politics": [
        "politics", "government", "state", "caliphate", "khilafat",
        "democracy", "shura", "constitution", "sovereignty", "political",
        "governance", "nation", "citizen", "ruler", "authority",
    ],
    "Theology": [
        "god", "allah", "islam", "faith", "belief", "tawheed",
        "prophet", "afterlife", "hereafter", "iman", "kufr", "shirk",
        "creator", "worship", "divine", "revelation", "qadr",
    ],
    "Economics": [
        "economics", "riba", "interest", "zakat", "wealth", "property",
        "trade", "economy", "finance", "poverty", "charity", "sadaqah",
        "capitalism", "socialism", "labor", "earning",
    ],
    "Jurisprudence": [
        "fiqh", "jurisprudence", "islamic law", "shariah", "hudud",
        "punishment", "marriage", "divorce", "inheritance", "halal",
        "haram", "fatwa", "ruling", "evidence", "sunna",
    ],
    "Social Issues": [
        "social", "society", "women", "family", "education", "culture",
        "moral", "ethics", "justice", "rights", "freedom", "equality",
        "community", "reform", "corruption",
    ],
    "History": [
        "history", "historical", "civilization", "medina", "mecca",
        "caliph", "muslim world", "islamic history", "medieval",
        "ottoman", "abad", "era", "century",
    ],
    "Guidance": [
        "guidance", "advice", "spiritual", "character", "piety", "taqwa",
        "prayer", "fasting", "hajj", "salah", "dua", "remembrance",
        "purification", "repentance", "tazkiyah", "sabr",
    ],
}


def extract_topics_from_text(text: str) -> list[str]:
    """Extract topics from user message text using keyword matching."""
    text_lower = text.lower()
    matched: list[str] = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                matched.append(topic)
                break
    return matched


def merge_topics(existing: list[str], new: list[str]) -> list[str]:
    """Merge new topics into existing list, preserving order."""
    seen = set(existing)
    merged = list(existing)
    for t in new:
        if t not in seen:
            merged.append(t)
            seen.add(t)
    return merged
