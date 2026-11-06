export interface WisdomSnippet {
  id: string;
  lessonId: string;
  lessonTitle: string;
  category: "Teachings" | "Meditation" | "Getting Started" | "Life of Buddha" | "Ethics";
  author: string;
  suttaRef: string;
  paliVerse?: string;
  paliMeaning?: string;
  quote: string;
  explanation: string;
  dailyPractice: string;
  theme: string;
}

export const WISDOM_SNIPPETS: WisdomSnippet[] = [
  {
    id: "wisdom-mind-everything",
    lessonId: "karma-rebirth",
    lessonTitle: "The Law of Kamma & Dependent Origination",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 1-2 (Yamaka Vagga)",
    paliVerse: "Mano-pubbaṅgamā dhammā, mano-seṭṭhā mano-mayā.",
    paliMeaning: "Mind precedes all mental states. Mind is their chief; they are mind-made.",
    quote: "The mind is everything. What you think, what you nurture in thought, that you ultimately become.",
    explanation: "If one speaks or acts with an uncorrupted, pure mind, happiness follows them as closely and unfailingly as their own shadow.",
    dailyPractice: "Pause three times today before speaking or reacting. Check whether your underlying intention is rooted in goodwill or frustration.",
    theme: "Mastery of Mind & Intention"
  },
  {
    id: "wisdom-hatred-love",
    lessonId: "five-precepts",
    lessonTitle: "The Five Precepts (Panca Sila)",
    category: "Ethics",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 5",
    paliVerse: "Na hi verena verāni, sammantīdha kudācanaṁ. Averena ca sammanti, esa dhammo sanantano.",
    paliMeaning: "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is an eternal law.",
    quote: "Hatred never ceases through hatred; by loving-kindness alone does it cease. This is a timeless cosmic truth.",
    explanation: "Retaliation and bitterness only fuel the cycle of distress. Forgiveness and Metta (goodwill) dissolve suffering from its root.",
    dailyPractice: "Mentally radiate genuine peace and forgiveness towards someone you recently felt annoyed or impatient with.",
    theme: "Loving-Kindness & Peace"
  },
  {
    id: "wisdom-conquer-self",
    lessonId: "eightfold-path",
    lessonTitle: "The Noble Eightfold Path (Ariya Atthangika Magga)",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 103",
    paliVerse: "Yo sahassaṁ sahassena, saṅgāme mānuse jine. Ekañca jeyyamattānaṁ, sa ve saṅgāmajuttamo.",
    paliMeaning: "Though one should conquer in battle thousands upon thousands of men, yet he who conquers himself is the greatest conqueror.",
    quote: "Though one may conquer a million warriors on the battlefield, the one who conquers oneself is the supreme victor.",
    explanation: "True strength is not dominating outer circumstances or people, but governing our own anger, cravings, and pride through discernment.",
    dailyPractice: "Catch yourself when impulse urges you to indulge or complain. Restrain the urge and take three deep breaths.",
    theme: "Self-Discipline & Inner Power"
  },
  {
    id: "wisdom-breath-stillness",
    lessonId: "meditation-anapanasati",
    lessonTitle: "Mindfulness of Breathing (Anapanasati Meditation)",
    category: "Meditation",
    author: "Gautama Buddha",
    suttaRef: "Anapanasati Sutta (MN 118)",
    paliVerse: "Dīghaṁ vā assasanto 'Dīghaṁ assasāmī'ti pajānāti.",
    paliMeaning: "Breathing in long, he discerns: 'I am breathing in long.' Breathing out long, he discerns: 'I am breathing out long.'",
    quote: "Mindfulness of the breath, when developed and cultivated, is of great fruit and great benefit, bringing the mind to untroubled serenity.",
    explanation: "The breath is your constant anchor to the present moment. Where the breath settles quietly, turbulent thoughts naturally dissolve.",
    dailyPractice: "Spend 2 minutes right now observing 10 calm in-and-out breaths at the tip of the nostrils without forcing them.",
    theme: "Breath Anchor & Present Awareness"
  },
  {
    id: "wisdom-noble-truth-peace",
    lessonId: "noble-truths",
    lessonTitle: "The Four Noble Truths (Catur-Arya Sacca)",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Dhammacakkappavattana Sutta (SN 56.11)",
    paliVerse: "Idaṁ kho pana, bhikkhave, dukkhanirodho ariyasaccaṁ: yo tassāyeva taṇhāya asesavirāganirodho.",
    paliMeaning: "Now this is the noble truth of the cessation of suffering: the complete fading away and cessation of that very craving.",
    quote: "Peace is not the absence of trouble in the world; it is the absence of craving and grasping in the mind.",
    explanation: "Suffering does not come from things changing, but from our refusal to accept that things change. Letting go of clinging brings instantaneous ease.",
    dailyPractice: "Identify one expectation you have been holding tightly today. Gently loosen your grip and allow things to unfold naturally.",
    theme: "Letting Go & Cessation"
  },
  {
    id: "wisdom-self-refuge",
    lessonId: "karma-rebirth",
    lessonTitle: "The Law of Kamma & Dependent Origination",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 160",
    paliVerse: "Attā hi attano nātho, ko hi nātho paro siyā? Attanā hi sudantena, nāthaṁ labhati dullabhaṁ.",
    paliMeaning: "One is one's own refuge; for what other refuge could there be? With a well-trained self, one obtains a refuge hard to gain.",
    quote: "You are your own refuge. Who else could protect you? Through a well-trained, clear mind, you gain a sanctuary that none can destroy.",
    explanation: "Outer blessings and circumstances fluctuate, but the wisdom and virtue you develop within your own heart remain your unfailing protection.",
    dailyPractice: "Take responsibility for your state of mind today rather than expecting outer events or others to guarantee your happiness.",
    theme: "Self-Reliance & Spiritual Refuge"
  },
  {
    id: "wisdom-contentment-wealth",
    lessonId: "five-precepts",
    lessonTitle: "The Five Precepts (Panca Sila)",
    category: "Getting Started",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 204",
    paliVerse: "Ārogyaparamā lābhā, santuṭṭhiparamaṁ dhanaṁ. Vissāsaparamā ñāti, nibbānaṁ paramaṁ sukhaṁ.",
    paliMeaning: "Health is the supreme gift; contentment is the supreme wealth; a trustworthy friend is the supreme kinsman; Nibbana is supreme bliss.",
    quote: "Contentment (Santutthi) with what is present is the greatest wealth one can possess in this world.",
    explanation: "The person who always wants more is endlessly impoverished, while the one who appreciates what is right here is already wealthy and free.",
    dailyPractice: "List three simple things you already possess right now (breath, safety, shelter, family) and feel heartfelt gratitude for them.",
    theme: "Contentment & Gratitude"
  },
  {
    id: "wisdom-meditation-wisdom",
    lessonId: "meditation-anapanasati",
    lessonTitle: "Mindfulness of Breathing (Anapanasati Meditation)",
    category: "Meditation",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 282",
    paliVerse: "Yogā ve jāyatī bhūri, ayogā bhūrisaṅkhayo. Etaṁ dvedhāpathaṁ ñatvā, bhavāya vibhavāya ca.",
    paliMeaning: "From meditation wisdom springs; without meditation wisdom wanes. Recognizing this twofold path, let one conduct oneself towards growth.",
    quote: "Wisdom is born of stillness and meditation; through neglect of meditation, clarity wanes. Choose the path that nourishes your inner light.",
    explanation: "Book learning alone cannot overcome mental turmoil. Daily quiet meditation transforms intellectual knowledge into lived discernment.",
    dailyPractice: "Set aside 5 to 10 minutes this evening in silence, putting away all screens, to simply sit in calm reflection.",
    theme: "Stillness & Insight"
  },
  {
    id: "wisdom-middle-way",
    lessonId: "eightfold-path",
    lessonTitle: "The Noble Eightfold Path (Ariya Atthangika Magga)",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Ariyapariyesana Sutta (MN 26)",
    paliVerse: "Majjhimā paṭipadā tathāgatena abhisambuddhā.",
    paliMeaning: "The Middle Path has been awakened to by the Tathagata, giving rise to vision and knowledge, leading to peace.",
    quote: "Like the strings of a lute: when tuned too tight they snap; when tuned too slack they make no sound. Balance in all things is the Middle Path.",
    explanation: "Avoid the extremes of harsh self-punishment and careless indulgence. A gentle, steady, and joyful balance brings lasting progress.",
    dailyPractice: "Find where in your daily routine you are pushing too hard or slacking off, and gently re-center towards calm moderation.",
    theme: "The Middle Way (Majjhima Patipada)"
  },
  {
    id: "wisdom-impermanence",
    lessonId: "noble-truths",
    lessonTitle: "The Four Noble Truths (Catur-Arya Sacca)",
    category: "Teachings",
    author: "Gautama Buddha",
    suttaRef: "Dhammapada, Verse 277",
    paliVerse: "Sabbe saṅkhārā aniccā'ti, yadā paññāya passati. Atha nibbindatī dukkhe, esa maggo visuddhiyā.",
    paliMeaning: "All conditioned phenomena are impermanent. When one sees this with insight, one turns away from suffering. This is the path of purity.",
    quote: "All conditioned things arise, change, and pass away. When one sees this truth directly with insight, sorrow fades away.",
    explanation: "Pain arises when we demand permanence from a world that is constantly flowing. Understanding impermanence brings gentle acceptance and freedom.",
    dailyPractice: "When faced with an uncomfortable emotion today, silently remind yourself: 'This too will pass. It is impermanent.'",
    theme: "Anicca (Universal Impermanence)"
  },
  {
    id: "wisdom-gentle-speech",
    lessonId: "five-precepts",
    lessonTitle: "The Five Precepts (Panca Sila)",
    category: "Ethics",
    author: "Gautama Buddha",
    suttaRef: "Subhasita Sutta (Sutta Nipata 3.3)",
    paliVerse: "Subhāsitaṁ uttamamāhu santo, dhammaṁ bhaṇe nādhammaṁ taṁ dutiyaṁ.",
    paliMeaning: "The wise say that well-spoken speech is supreme: speak what is righteous, not unrighteous; speak what is agreeable, not disagreeable; speak what is true, not false.",
    quote: "Better than a thousand hollow words is a single word that gives rise to peace and clarity.",
    explanation: "Speech is an immense creative power. Words spoken with kindness, truthfulness, and timely consideration heal wounds and build unity.",
    dailyPractice: "Before speaking in any meeting or family conversation today, ensure your words pass the three gates: Is it true? Is it kind? Is it necessary?",
    theme: "Right Speech & Compassion"
  },
  {
    id: "wisdom-great-renunciation",
    lessonId: "life-of-buddha",
    lessonTitle: "Life of Gautama Buddha: From Prince to Enlightenment",
    category: "Life of Buddha",
    author: "Gautama Buddha",
    suttaRef: "Ariyapariyesana Sutta (MN 26)",
    paliVerse: "Kusalagavesī anuttaraṁ santivarapadaṁ pariyesamāno.",
    paliMeaning: "Seeking the wholesome, searching for the unexcelled state of supreme peace.",
    quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    explanation: "Prince Siddhartha stepped away from worldly luxuries not out of despair, but from the heroic determination to find a cure for universal suffering.",
    dailyPractice: "Let go of an unnecessary mental worry about tomorrow. Give yourself permission to be fully awake to this current moment.",
    theme: "The Noble Search for Truth"
  }
];

// Helper: Calculate day of year (0 - 365)
export function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Get deterministic daily wisdom for today
export function getTodayWisdom(): WisdomSnippet {
  const dayOfYear = getDayOfYear();
  const index = dayOfYear % WISDOM_SNIPPETS.length;
  return WISDOM_SNIPPETS[index];
}

// Get random wisdom (optionally avoiding the current one)
export function getRandomWisdom(currentId?: string): WisdomSnippet {
  const available = currentId 
    ? WISDOM_SNIPPETS.filter(s => s.id !== currentId) 
    : WISDOM_SNIPPETS;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || WISDOM_SNIPPETS[0];
}

export function getWisdomById(id: string): WisdomSnippet | undefined {
  return WISDOM_SNIPPETS.find(s => s.id === id);
}

// Local Storage for Bookmarked Wisdom Quotes
const SAVED_WISDOM_KEY = "lanka_saved_wisdom_quotes";
const WISDOM_REFLECTIONS_KEY = "lanka_wisdom_reflections";

export function getSavedWisdomIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_WISDOM_KEY);
    return raw ? JSON.parse(raw) : ["wisdom-mind-everything"];
  } catch {
    return ["wisdom-mind-everything"];
  }
}

export function toggleSaveWisdom(wisdomId: string): { isSaved: boolean; allSaved: string[] } {
  try {
    const current = getSavedWisdomIds();
    let updated: string[];
    let isSaved: boolean;
    if (current.includes(wisdomId)) {
      updated = current.filter(id => id !== wisdomId);
      isSaved = false;
    } else {
      updated = [wisdomId, ...current];
      isSaved = true;
    }
    localStorage.setItem(SAVED_WISDOM_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("lanka_saved_wisdom_updated", { detail: { wisdomId, isSaved } }));
    return { isSaved, allSaved: updated };
  } catch {
    return { isSaved: false, allSaved: [] };
  }
}

export function isWisdomSaved(wisdomId: string): boolean {
  return getSavedWisdomIds().includes(wisdomId);
}

// Reflections storage
export function getWisdomReflection(wisdomId: string): string {
  try {
    const raw = localStorage.getItem(WISDOM_REFLECTIONS_KEY);
    if (!raw) return "";
    const map = JSON.parse(raw);
    return map[wisdomId] || "";
  } catch {
    return "";
  }
}

export function saveWisdomReflection(wisdomId: string, note: string): void {
  try {
    const raw = localStorage.getItem(WISDOM_REFLECTIONS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[wisdomId] = note;
    localStorage.setItem(WISDOM_REFLECTIONS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Error saving wisdom reflection:", err);
  }
}
