import { BuddhismCourse } from "../types/buddhismCourse";

export const CANONICAL_PRIMARY_COURSES: BuddhismCourse[] = [
  {
    id: "theravada-foundations",
    title: "Foundations of Theravada Buddhism: The Noble Path",
    subtitle: "The comprehensive canonical introduction to the life of the Buddha, Dhamma, and Sangha",
    desc: "Authored by Ven. Dr. K. Sri Dhammananda and curated from ancient canonical commentaries. This course systematically explores the Four Noble Truths, the Noble Eightfold Path, Kamma and Rebirth, and the Three Universal Characteristics with primary Pali sutta citations.",
    category: "Theravada Fundamentals",
    level: "Beginner",
    durationWeeks: 6,
    estimatedHours: 18,
    coverImage: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Ven. Dr. K. Sri Dhammananda",
      title: "Chief Sangha Nayaka & Senior Scholar",
      avatar: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200",
      affiliation: "Theravada Buddhist Council & Monastic Education Trust",
      isCanonicalVerified: true
    },
    source: {
      name: "Theravada Canonical Archive",
      url: "https://suttacentral.net",
      license: "Public Dhamma Distribution (Creative Commons / Open Dhamma Archive)",
      isCanonicalCurriculum: true
    },
    rating: 4.95,
    reviewsCount: 382,
    enrolledCount: 1420,
    objectives: [
      "Understand the historical timeline of Gautama Buddha from Prince Siddhartha to Parinibbana",
      "Analyze the Four Noble Truths (Dukkha, Samudaya, Nirodha, Magga) in personal daily life",
      "Master the practical implementation of the Noble Eightfold Path across Sila, Samadhi, and Panna",
      "Comprehend the law of Kamma, Cetana (volition), and the cycles of Dependent Origination",
      "Integrate the Five Precepts (Panca Sila) as an unshakeable ethical compass"
    ],
    prerequisites: [
      "Open mind and sincere willingness to reflect on one's thoughts and actions",
      "No prior knowledge of Pali or Buddhism required"
    ],
    paliGlossary: [
      {
        term: "Dukkha",
        phonetic: "dook-kuh",
        meaning: "Suffering, unsatisfactoriness, impermanence, stress",
        context: "The first noble truth acknowledging the inherent friction in conditioned existence."
      },
      {
        term: "Tanha",
        phonetic: "tuhn-hah",
        meaning: "Thirst, craving, attachment",
        context: "The second noble truth identifying craving as the root origin of suffering."
      },
      {
        term: "Nibbana",
        phonetic: "nib-bah-nuh",
        meaning: "Extinguishment of greed, hatred, and delusion; supreme peace",
        context: "The third noble truth representing ultimate liberation."
      },
      {
        term: "Magga",
        phonetic: "muhg-guh",
        meaning: "The Noble Path leading to the cessation of suffering",
        context: "The fourth noble truth structured into eight practical factors."
      },
      {
        term: "Cetana",
        phonetic: "chay-tuh-nah",
        meaning: "Volition, deliberate intention",
        context: "The core criterion for determining whether an action produces karmic fruit."
      }
    ],
    modules: [
      {
        id: "mod-1-life-buddha",
        moduleNumber: 1,
        title: "The Historical Buddha & The Quest for Truth",
        overview: "Discover Prince Siddhartha Gautama's early life in Kapilavastu, his encounter with the Four Sights, the Great Renunciation, ascetic strivings, and supreme awakening under the Bodhi tree at Bodh Gaya.",
        lessons: [
          {
            id: "les-1-1-four-sights",
            title: "The Palace Life and the Four Sights",
            durationMinutes: 20,
            suttaReference: "Ariyapariyesana Sutta (MN 26)",
            summary: "Explore how encountering aging, sickness, death, and a serene ascetic shattered Siddhartha's sheltered illusions and sparked the universal quest for liberation.",
            contentSections: [
              {
                heading: "The Discontent with Ephemeral Pleasure",
                text: "Born into luxury in Lumbini, Prince Siddhartha was provided with three distinct seasonal palaces and sheltered from unpleasant realities. Yet deep within his contemplative mind arose a persistent realization: all physical pleasures are bound to end, and all beings are subject to decay.",
                bulletPoints: [
                  "Old Age: The inevitable loss of youth and physical vitality",
                  "Sickness: The vulnerability of the human body to disease",
                  "Death: The certainty of mortality separating all loved ones",
                  "The Ascetic: The inspiring vision of a tranquil mind striving for the deathless"
                ],
                quote: {
                  text: "Why do I, being myself subject to birth, aging, illness, and death, seek that which is also subject to these things? What if I were to seek the unborn, unaging, unailing, deathless, supreme security from bondage — Nibbana?",
                  source: "Majjhima Nikaya 26 (Ariyapariyesana Sutta)"
                }
              },
              {
                heading: "The Great Renunciation (Maha-Abhinikkhamana)",
                text: "At the age of twenty-nine, recognizing that remaining in the palace would only perpetuate the cycle of ignorance, Prince Siddhartha made the courageous decision to renounce his royal inheritance. Crossing the river Anoma, he cut his hair, exchanged silk garments for the simple robes of a mendicant, and embarked on his six-year spiritual quest."
              }
            ],
            practicalExercise: {
              title: "Reflection on Impermanence (Anicca Bhavana)",
              duration: "10 minutes",
              instructions: [
                "Sit comfortably in a quiet space with your spine naturally erect.",
                "Observe five things in your present surroundings that have changed over the past year.",
                "Bring gentle awareness to the natural changing rhythm of your breath.",
                "Notice that breath cannot be frozen or held permanently; every inhalation must naturally surrender to an exhalation."
              ]
            },
            canonicalResourceUrl: "https://suttacentral.net/mn26/en/sujato"
          },
          {
            id: "les-1-2-supreme-enlightenment",
            title: "The Middle Way & Supreme Enlightenment under the Bodhi Tree",
            durationMinutes: 25,
            suttaReference: "Maha-Saccaka Sutta (MN 36)",
            summary: "How extreme self-mortification failed, leading Siddhartha to discover the Middle Way (Majjhima Patipada) and attain supreme awakening under the Bodhi tree.",
            contentSections: [
              {
                heading: "Abandoning Extremes: The Tuning of the Lute",
                text: "For six rigorous years in the forest of Uruvela, the Bodhisatta practiced severe ascetic penance alongside the five ascetics. He reduced his food to a single grain of rice, until his spine was visible through his stomach. Realizing that tormenting the body only weakened the mind without awakening wisdom, he recalled the gentle absorption he experienced as a youth under the Rose-Apple tree.",
                bulletPoints: [
                  "Extreme of Sensual Indulgence (Kamasukhallikanuyoga): Blind chase of sensory desires",
                  "Extreme of Self-Mortification (Attakilamathanuyoga): Tormenting the flesh without purifying the mind",
                  "The Middle Way (Majjhima Patipada): Nourishing the body reasonably to sustain clear, unwavering mindfulness"
                ]
              },
              {
                heading: "The Night of Awakening at Bodh Gaya",
                text: "Sitting beneath the sacred Bodhi tree (Ficus religiosa), Siddhartha made his historic resolve: 'Let my skin, sinews, and bones dry up, let the flesh and blood of my body dry up, but I will not rise from this seat until I have attained supreme enlightenment.' During the three watches of that full-moon night in Vesak, he systematically realized the knowledge of past lives, the workings of Kamma, and the total destruction of mental defilements."
              }
            ],
            practicalExercise: {
              title: "Finding the Middle Way in Daily Energy",
              duration: "15 minutes",
              instructions: [
                "Assess your current daily schedule: Are you pushing into burnout (too tight) or drifting into complacency (too loose)?",
                "Identify one daily activity where applying moderate, sustainable effort will yield superior peace and focus."
              ]
            }
          }
        ],
        quiz: [
          {
            id: "q-1-1",
            question: "What were the 'Four Sights' witnessed by Prince Siddhartha outside his Kapilavastu palace?",
            options: [
              "A King, a General, a Priest, and a Merchant",
              "An Old Person, a Sick Person, a Corpse, and a Calm Ascetic",
              "A Drought, a Flood, an Earthquake, and a Rainbow",
              "A Golden Deer, a Lotus Pool, a Sacred Fire, and a Hermit"
            ],
            correctAnswerIndex: 1,
            explanation: "The Four Sights were an aged man, an ailing man, a deceased body, and a tranquil wandering ascetic, revealing universal suffering and the possibility of spiritual liberation."
          },
          {
            id: "q-1-2",
            question: "Why did the Bodhisatta abandon severe asceticism before attaining enlightenment?",
            options: [
              "His companions abandoned him first",
              "He ran out of food and water",
              "He recognized that physical torment weakens the mind and does not lead to transcendent wisdom",
              "A royal messenger asked him to return home"
            ],
            correctAnswerIndex: 2,
            explanation: "In the Maha-Saccaka Sutta, the Buddha explains that tormenting the physical body drained his cognitive strength without eliminating mental defilements, leading him to the balanced Middle Way."
          }
        ]
      },
      {
        id: "mod-2-four-noble-truths",
        moduleNumber: 2,
        title: "The Four Noble Truths (Catur-Arya Sacca)",
        overview: "The heart of the Dhamma revealed at the Deer Park in Isipatana (Sarnath). Understand the diagnosis of suffering, its psychological cause, the reality of cessation, and the step-by-step path.",
        lessons: [
          {
            id: "les-2-1-dukkha-truth",
            title: "The Truth of Suffering (Dukkha Sacca)",
            durationMinutes: 25,
            suttaReference: "Dhammacakkappavattana Sutta (SN 56.11)",
            summary: "A realistic and profound diagnosis of the three levels of Dukkha: physical pain, the distress of change, and the friction of conditioned existence.",
            contentSections: [
              {
                heading: "The Three Dimensions of Dukkha",
                text: "Buddhism is neither pessimistic nor overly optimistic; it is profoundly realistic. The Buddha did not deny that sensory delights exist; rather, he pointed out that because all conditioned things are impermanent, clinging to them inevitably produces stress when they shift.",
                bulletPoints: [
                  "Dukkha-dukkha: Ordinary physical distress, toothaches, sickness, grief, and physical discomfort",
                  "Viparinama-dukkha: Suffering produced by change and the fading of pleasant experiences",
                  "Sankhara-dukkha: The pervasive existential vulnerability of conditioned aggregates (Khandhas)"
                ]
              }
            ],
            practicalExercise: {
              title: "Mindful Investigation of Friction",
              duration: "10 minutes",
              instructions: [
                "Notice the next time a minor frustration occurs today (traffic, waiting in line, a slow webpage).",
                "Instead of reacting with anger, mentally label it: 'This is Dukkha arising due to unmet expectations.'",
                "Observe the physical sensation in your chest or jaw without tightening."
              ]
            }
          },
          {
            id: "les-2-2-samudaya-nirodha",
            title: "Origin & Cessation: Craving (Tanha) and Nibbana",
            durationMinutes: 30,
            suttaReference: "Mahasatipatthana Sutta (DN 22)",
            summary: "Examine the psychological mechanics of Kama-tanha, Bhava-tanha, and Vibhava-tanha, and the liberating extinguishment that is Nibbana.",
            contentSections: [
              {
                heading: "The Root Mechanism: Threefold Craving (Tanha)",
                text: "Craving is not merely wishing for something; it is the compulsive mental hunger that attaches to pleasant sensations and recoils from unpleasant ones.",
                bulletPoints: [
                  "Kama-tanha: Craving for sensory stimulation (tastes, sights, physical comforts)",
                  "Bhava-tanha: Craving for becoming, status, immortality, and permanent self-affirmation",
                  "Vibhava-tanha: Craving for annihilation, avoidance, and destructive escapism"
                ]
              },
              {
                heading: "The Reality of Nirodha (Cessation)",
                text: "Nibbana literally means 'to extinguish' or 'cool down', as a fire ceases when its fuel is no longer supplied. When the fuel of greed (Lobha), aversion (Dosa), and delusion (Moha) is extinguished, pristine peace, clarity, and boundless loving-kindness remain."
              }
            ]
          }
        ],
        quiz: [
          {
            id: "q-2-1",
            question: "Which of the following describes 'Viparinama-dukkha'?",
            options: [
              "Direct physical pain from an injury",
              "Suffering caused by the impermanence and inevitable change of pleasant situations",
              "The pain of hunger during a fast",
              "A nightmare during sleep"
            ],
            correctAnswerIndex: 1,
            explanation: "Viparinama-dukkha is the subtle suffering that arises because pleasant things, relationships, and states of happiness inevitably change, decay, or separate."
          }
        ]
      },
      {
        id: "mod-3-eightfold-path",
        moduleNumber: 3,
        title: "The Noble Eightfold Path (Ariya Atthangika Magga)",
        overview: "A comprehensive guide to living the Dhamma through the three trainings of Wisdom (Panna), Moral Virtue (Sila), and Mental Concentration (Samadhi).",
        lessons: [
          {
            id: "les-3-1-wisdom-sila",
            title: "Panna & Sila: Right View, Intention, Speech, Action & Livelihood",
            durationMinutes: 30,
            suttaReference: "Magga-vibhanga Sutta (SN 45.8)",
            summary: "Cultivating clear vision of reality, harmless intentions, wholesome communication, and ethical professional conduct in the modern economy.",
            contentSections: [
              {
                heading: "The Division of Wisdom (Panna)",
                text: "Right View (Samma Ditthi) is seeing things as they truly are — understanding the Four Noble Truths and the law of cause and effect. Right Intention (Samma Sankappa) directs the will toward renunciation (Nekkhamma), loving-kindness (Metta), and non-cruelty (Avihimsa)."
              },
              {
                heading: "The Division of Ethical Conduct (Sila)",
                text: "Morality is the indispensable foundation for mental tranquility. Right Speech abstains from falsehood, slander, harsh language, and idle gossip. Right Action protects life, respects property, and honors intimate commitments. Right Livelihood avoids businesses that traffic in weapons, living beings, meat, intoxicants, or poisons."
              }
            ]
          },
          {
            id: "les-3-2-samadhi-training",
            title: "Samadhi: Right Effort, Right Mindfulness & Right Concentration",
            durationMinutes: 30,
            suttaReference: "Anapanasati Sutta (MN 118)",
            summary: "Developing the inner laboratory of the mind through the four right efforts, four foundations of mindfulness, and unified meditative absorption.",
            contentSections: [
              {
                heading: "The Four Great Efforts (Samma Vayama)",
                text: "1. Preventing unarisen unwholesome thoughts from arising. 2. Abandoning unwholesome thoughts that have already arisen. 3. Cultivating wholesome states not yet present. 4. Maintaining and perfecting wholesome states that are already present.",
                bulletPoints: [
                  "Right Mindfulness (Samma Sati): Anchored in body, feelings, mind states, and dhammas",
                  "Right Concentration (Samma Samadhi): Unwavering single-pointed serenity that pierces ignorance"
                ]
              }
            ]
          }
        ],
        quiz: [
          {
            id: "q-3-1",
            question: "Which three factors constitute the Sila (Moral Virtue) training in the Noble Eightfold Path?",
            options: [
              "Right View, Right Intention, Right Effort",
              "Right Speech, Right Action, Right Livelihood",
              "Right Mindfulness, Right Concentration, Right View",
              "Right Effort, Right Mindfulness, Right Intention"
            ],
            correctAnswerIndex: 1,
            explanation: "Sila consists of Right Speech (Samma Vaca), Right Action (Samma Kammanta), and Right Livelihood (Samma Ajiva)."
          }
        ]
      }
    ]
  },
  {
    id: "vipassana-masterclass",
    title: "Insight Meditation (Vipassana): 6-Stage Masterclass",
    subtitle: "A systematic experiential guide to mindfulness of breathing, body scanning, and insight wisdom",
    desc: "Formulated according to the classical Satipatthana Sutta and the renowned guidance of ancient forest traditions and Ven. Mahasi Sayadaw. Learn to sit, walk, observe physical sensations, decode mental hindrances, and awaken direct experiential insight into impermanence (Anicca) and non-self (Anatta).",
    category: "Meditation & Sati",
    level: "All Levels",
    durationWeeks: 6,
    estimatedHours: 24,
    coverImage: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Ven. Mahasi Tradition Faculty",
      title: "Senior Vipassana Meditation Preceptors",
      avatar: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=200",
      affiliation: "Theravada Forest Tradition & Meditation Council",
      isCanonicalVerified: true
    },
    source: {
      name: "Theravada Meditation Centre",
      url: "https://suttacentral.net/mn10",
      license: "Public Educational Dhamma Resource",
      isCanonicalCurriculum: true
    },
    rating: 4.98,
    reviewsCount: 512,
    enrolledCount: 2180,
    objectives: [
      "Establish a stable, pain-free daily meditation posture (sitting, walking, and daily continuity)",
      "Master Anapanasati (mindfulness of breath) to calm the nervous system and develop concentration",
      "Overcome the Five Mental Hindrances (Sensory desire, ill-will, restlessness, sloth, and doubt)",
      "Observe Vedana (feelings) without habitual craving or aversion",
      "Cultivate the Seven Factors of Awakening (Bojjhanga) leading to radiant inner freedom"
    ],
    prerequisites: [
      "A quiet corner and 15–30 minutes of dedicated practice time each day"
    ],
    paliGlossary: [
      {
        term: "Vipassana",
        phonetic: "vi-puhs-suh-nah",
        meaning: "Insight, clear-seeing, intuitive penetration into reality",
        context: "Meditation that directly observes the three marks of existence: Anicca, Dukkha, Anatta."
      },
      {
        term: "Anapanasati",
        phonetic: "ah-nah-pah-nah-sah-ti",
        meaning: "Mindfulness of in-and-out breathing",
        context: "The 16-step meditation technique praised by the Buddha as universally applicable."
      },
      {
        term: "Cankama",
        phonetic: "chahn-kuh-muh",
        meaning: "Walking meditation, mindful pacing",
        context: "Alternating sitting and walking to balance physical energy and mental concentration."
      },
      {
        term: "Nivarana",
        phonetic: "nee-vah-ruh-nuh",
        meaning: "The Five Mental Hindrances that cloud meditative clarity",
        context: "Sensory desire, ill-will, sloth/torpor, restlessness/remorse, and skeptical doubt."
      }
    ],
    modules: [
      {
        id: "mod-v-1-breath-posture",
        moduleNumber: 1,
        title: "Stage 1: Posture, Stillness & The Natural Breath",
        overview: "Establishing the physical container for meditation. Learn proper spinal alignment, releasing bodily tension, and resting attention at the nostrils without force.",
        lessons: [
          {
            id: "les-v-1-1-anapanasati-foundations",
            title: "Anchoring the Mind: The Anapanasati Breath",
            durationMinutes: 20,
            suttaReference: "Anapanasati Sutta (MN 118)",
            summary: "Learn how to observe the natural touch of air at the nostrils or upper lip without altering, deepening, or forcing the breath.",
            contentSections: [
              {
                heading: "The Breath as the Primary Anchor",
                text: "The breath is the bridge between the conscious mind and the autonomic nervous system. Unlike thoughts, which jump into the past or future, breath is always occurring right here in the present moment.",
                bulletPoints: [
                  "Breathing in long, one discerns: 'I am breathing in long'",
                  "Breathing in short, one discerns: 'I am breathing in short'",
                  "Aware of the entire breath body, one breathes in and out",
                  "Calming the bodily formations, one settles into tranquil presence"
                ]
              }
            ],
            practicalExercise: {
              title: "15-Minute Anapanasati Session",
              duration: "15 minutes",
              instructions: [
                "Sit with spine upright, hands resting gently on your lap.",
                "Close your eyes softly and take three slow, conscious breaths to release facial and shoulder tension.",
                "Bring receptive awareness to the small triangle between the nostrils and upper lip.",
                "When thoughts wander, simply note 'wandering' with a smile and return gently to the physical touch of the breath."
              ]
            }
          }
        ],
        quiz: [
          {
            id: "qv-1-1",
            question: "During natural Anapanasati breath meditation, should you control or force the rhythm of your breathing?",
            options: [
              "Yes, you must hold your breath for 10 seconds between each cycle",
              "No, you observe the natural breath exactly as it is, whether long or short",
              "Yes, you must breathe only through your mouth",
              "Yes, you should count backwards from 500"
            ],
            correctAnswerIndex: 1,
            explanation: "Anapanasati develops bare attention by observing the breath in its natural state without attempting to manipulate or control its rhythm."
          }
        ]
      },
      {
        id: "mod-v-2-hindrances",
        moduleNumber: 2,
        title: "Stage 2: Deconstructing the Five Mental Hindrances (Nivarana)",
        overview: "Transforming meditation obstacles into portals of insight. Understand how desire, anger, laziness, anxiety, and doubt operate, and how to dissolve them.",
        lessons: [
          {
            id: "les-v-2-1-nivarana-remedies",
            title: "Recognizing & Subduing the Five Hindrances",
            durationMinutes: 25,
            suttaReference: "Satipatthana Sutta (MN 10)",
            summary: "Specific antidotes for sloth and torpor, restless worrying, obsessive desires, and skeptical paralysis.",
            contentSections: [
              {
                heading: "The Five Obstacles",
                text: "When water is mixed with dye (sensory desire), boiling with heat (ill-will), choked with algae (sloth), churned by wind (restlessness), or placed in murky dark (doubt), it cannot reflect your face. So too, a mind clouded by the hindrances cannot see Dhamma clearly.",
                bulletPoints: [
                  "Kamachanda (Sensory Desire): Countered by Asubha (reflection on impermanence)",
                  "Byapada (Ill-will / Irritation): Countered by Metta (universal loving-kindness)",
                  "Thina-middha (Sloth & Torpor): Countered by bright light, posture correction, and vigorous walking meditation",
                  "Uddhacca-kukkucca (Restlessness & Worry): Countered by mindful slowing down and relaxing the exhale",
                  "Vicikiccha (Skeptical Doubt): Countered by study, inquiry, and clear experiential testing"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "sutta-study-course",
    title: "The Buddha and His Teachings: In-Depth Canonical Sutta Studies",
    subtitle: "Verse-by-verse exploration of fundamental discourses from the Pali Nikayas",
    desc: "Drawing from the celebrated scholarship of Ven. Narada Mahathera and canonical Tipitaka commentaries, this course guides students through key discourses from the Digha, Majjhima, and Samyutta Nikayas. Learn to read suttas in context, parse Pali technical terms, and extract direct guidelines for contemporary life.",
    category: "Sutta Studies",
    level: "Intermediate",
    durationWeeks: 8,
    estimatedHours: 32,
    coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Ven. Narada Mahathera",
      title: "Renowned Pali Scholar & Vajirarama Missionary",
      avatar: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=200",
      affiliation: "Vajirarama Monastic Society & Canonical Sutta Library",
      isCanonicalVerified: true
    },
    source: {
      name: "Tipitaka Pali Canon Archives",
      url: "https://suttacentral.net",
      license: "Free Buddhist Education & Sutta Distribution",
      isCanonicalCurriculum: true
    },
    rating: 4.96,
    reviewsCount: 290,
    enrolledCount: 940,
    objectives: [
      "Master the structure and classification of the Tipitaka (Vinaya, Sutta, Abhidhamma)",
      "Analyze the Dhammacakkappavattana Sutta (The Setting in Motion of the Dhamma Wheel)",
      "Examine the Anattalakkhana Sutta (The Discourse on the Non-Self Characteristic)",
      "Apply the Kalama Sutta framework for rational inquiry and independent verification of truth",
      "Recite and contemplate the Karaniya Metta Sutta (The Hymn of Universal Loving-Kindness)"
    ],
    prerequisites: [
      "Basic familiarity with the Four Noble Truths and Noble Eightfold Path"
    ],
    paliGlossary: [
      {
        term: "Sutta",
        phonetic: "soot-tuh",
        meaning: "Discourse, thread of teachings delivered by the Buddha or his chief disciples",
        context: "The core scripture contained within the five Nikayas of the Pali canon."
      },
      {
        term: "Anatta",
        phonetic: "uh-nuht-tah",
        meaning: "Non-self, insubstantiality, absence of an unchanging permanent soul",
        context: "The distinctive Buddhist insight distinguishing it from all other contemporary philosophies."
      },
      {
        term: "Metta",
        phonetic: "may-tah",
        meaning: "Benevolence, goodwill, boundless unconditional friendliness",
        context: "The first of the four Brahma-viharas (sublime attitudes of the awakened heart)."
      }
    ],
    modules: [
      {
        id: "mod-s-1-first-two-suttas",
        moduleNumber: 1,
        title: "The Foundational Discourses: Dhammacakka & Anattalakkhana Sutta",
        overview: "The two discourses that sparked the Sangha in the Deer Park of Sarnath. Analyze the awakening of Ven. Kondanna and the liberation of the first five disciples.",
        lessons: [
          {
            id: "les-s-1-1-dhammacakka",
            title: "Setting in Motion the Wheel of Dhamma (SN 56.11)",
            durationMinutes: 30,
            suttaReference: "Dhammacakkappavattana Sutta",
            summary: "The historical context of the first sermon, the declaration of the Middle Way, and the 12-fold insight into the Four Noble Truths.",
            contentSections: [
              {
                heading: "The Three Turns and Twelve Modes (Tiparivattam Dvadassakaram)",
                text: "The Buddha proclaimed that his awakening was not complete until he experienced each of the Four Noble Truths through three successive turns of understanding: Sacca-nana (understanding the truth), Kicca-nana (understanding the duty required), and Kata-nana (knowing the duty has been accomplished)."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "abhidhamma-daily-life",
    title: "Abhidhamma in Daily Life: The Science of Mind & Consciousness",
    subtitle: "Practical Theravada psychology based on the canonical higher teachings",
    desc: "Authored by Nina van Gorkom and hosted in foundational Buddhist study archives. This course demystifies the Abhidhamma Pitaka into crystal-clear daily observations. Explore the 89 types of consciousness (Citta), the 52 mental factors (Cetasikas), matter (Rupa), and the peace of Nibbana.",
    category: "Abhidhamma",
    level: "Advanced",
    durationWeeks: 8,
    estimatedHours: 28,
    coverImage: "https://images.unsplash.com/photo-1616089308104-58276f5716bb?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Nina van Gorkom & Abhidhamma Faculty",
      title: "Author & International Abhidhamma Specialist",
      avatar: "https://images.unsplash.com/photo-1616089308104-58276f5716bb?auto=format&fit=crop&q=80&w=200",
      affiliation: "Advanced Dhamma Studies Society",
      isCanonicalVerified: true
    },
    source: {
      name: "Abhidhamma Pitaka Studies",
      url: "https://suttacentral.net/pitaka/abhidhamma",
      license: "Public Educational Dhamma Archive",
      isCanonicalCurriculum: true
    },
    rating: 4.92,
    reviewsCount: 178,
    enrolledCount: 680,
    objectives: [
      "Distinguish between conventional reality (Sammuti Sacca) and ultimate reality (Paramattha Sacca)",
      "Understand the four ultimate realities: Citta, Cetasika, Rupa, and Nibbana",
      "Identify wholesome (Kusala) and unwholesome (Akusala) mental factors in the moment of their arising",
      "Trace the cognitive thought-process (Citta Vithi) through sensory and mind doors"
    ],
    prerequisites: [
      "Completion of basic Buddhism course or equivalent study"
    ],
    paliGlossary: [
      {
        term: "Citta",
        phonetic: "chit-tuh",
        meaning: "Consciousness, the knowing of an object",
        context: "The fundamental awareness present in every moment of experience."
      },
      {
        term: "Cetasika",
        phonetic: "chay-tuh-si-kuh",
        meaning: "Mental factors, mental concomitants",
        context: "The 52 qualities (such as greed, generosity, mindfulness, or anger) that color each moment of Citta."
      },
      {
        term: "Paramattha",
        phonetic: "puh-ruh-muht-tuh",
        meaning: "Ultimate truth, fundamental experiential reality",
        context: "Analyzing experience down to its elemental characteristics without conceptual naming."
      }
    ],
    modules: [
      {
        id: "mod-a-1-citta-cetasika",
        moduleNumber: 1,
        title: "The Ultimate Realities: Citta & Cetasika",
        overview: "Discover how every moment of consciousness arises with specific mental companions, coloring human emotions and reactions.",
        lessons: [
          {
            id: "les-a-1-1-what-is-citta",
            title: "Citta: The Knowing Nature of the Mind",
            durationMinutes: 25,
            suttaReference: "Dhammasangani (Abhidhamma Pitaka)",
            summary: "Understanding the difference between the mind that knows and the mental factors that color that knowing.",
            contentSections: [
              {
                heading: "The Stream of Conscious Moments",
                text: "In Abhidhamma, there is no permanent entity or soul behind our perceptions. Instead, rapid momentary flashes of consciousness arise and pass away in unbroken succession, each conditioning the next."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "buddhist-ethics-family",
    title: "Buddhist Ethics & Harmonious Family Life (Sigalovada Sutta)",
    subtitle: "The Vinaya for lay practitioners: friendship, marital respect, parent-child harmony, and fair economics",
    desc: "Revered as the 'Code of Discipline for Laypeople' (Gihi Vinaya). Based on ancient social ethics commentaries, this course translates ancient Buddhist interpersonal wisdom into practical family relationships, ethical investment, debt management, and workplace harmony.",
    category: "Buddhist Ethics",
    level: "Beginner",
    durationWeeks: 4,
    estimatedHours: 12,
    coverImage: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Lay Dhamma Education Council",
      title: "Family Counseling & Social Ethics Guild",
      avatar: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=200",
      affiliation: "Community Welfare & Social Ethics Wing",
      isCanonicalVerified: true
    },
    source: {
      name: "Digha Nikaya Social Suttas",
      url: "https://suttacentral.net/dn31",
      license: "Public Educational Resource",
      isCanonicalCurriculum: true
    },
    rating: 4.97,
    reviewsCount: 245,
    enrolledCount: 1120,
    objectives: [
      "Understand the symbolism of worshiping the Six Directions as mutual social duties",
      "Cultivate the reciprocal responsibilities between parents and children, husbands and wives",
      "Recognize the traits of true spiritual friends (Kalyana-mitta) versus deceitful companions",
      "Apply Buddhist principles of wealth management, fair wages, and generous philanthropy"
    ],
    prerequisites: ["None"],
    paliGlossary: [
      {
        term: "Kalyana-mitta",
        phonetic: "kuhl-yah-nuh-mit-tuh",
        meaning: "Noble friend, virtuous companion on the path",
        context: "The Buddha declared that noble friendship is the whole of the holy life."
      },
      {
        term: "Dana",
        phonetic: "dah-nuh",
        meaning: "Generosity, giving, sharing resources with an open heart",
        context: "The starting foundation of all wholesome karmic merit."
      }
    ],
    modules: [
      {
        id: "mod-e-1-six-directions",
        moduleNumber: 1,
        title: "The Six Directions of Reciprocal Duty",
        overview: "Transforming ritual bowing into genuine relational responsibility toward parents, teachers, spouse, friends, workers, and spiritual teachers.",
        lessons: [
          {
            id: "les-e-1-1-parents-children",
            title: "The East: Honoring Parents & Nurturing Children",
            durationMinutes: 20,
            suttaReference: "Sigalovada Sutta (DN 31)",
            summary: "The five sacred duties children owe their parents and the five duties parents owe their children.",
            contentSections: [
              {
                heading: "The Reciprocal Circle of Care",
                text: "The Buddha taught that parents are the first teachers and early Brahmas of their children. In return, children support their parents in old age, preserve family traditions, protect family honor, and perform wholesome deeds on their behalf."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "paritta-pali-chanting",
    title: "Pali Canonical Chanting & Paritta Sutra Pronunciation",
    subtitle: "Learn the sacred chants of protection, loving-kindness, and devotional reflection",
    desc: "A hands-on devotional training course featuring authentic audio chanting guides from the Sri Lankan and Theravada monastic traditions. Learn the correct meter and pronunciation of Vandana, Ti-Sarana, Panca Sila, Maha Mangala Sutta, Ratana Sutta, and Karaniya Metta Sutta.",
    category: "Pali & Chanting",
    level: "All Levels",
    durationWeeks: 4,
    estimatedHours: 10,
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
    instructor: {
      name: "Ven. Sangha Masters of Sri Lanka",
      title: "Chanting Preceptors & Monastic Choir",
      avatar: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200",
      affiliation: "Theravada Monastic Chanting Archive",
      isCanonicalVerified: true
    },
    source: {
      name: "Theravada Monastic Chants",
      url: "https://suttacentral.net/kn/khp",
      license: "Public Monastic Chanting Archive",
      isCanonicalCurriculum: true
    },
    rating: 4.99,
    reviewsCount: 310,
    enrolledCount: 1650,
    objectives: [
      "Master standard Pali vowel pronunciations (short and long vowels, retroflex consonants)",
      "Recite the Three Refuges and Five Precepts with accurate rhythmic cadence",
      "Understand the poetic and spiritual meaning of the Great Protection Sutras (Paritta)",
      "Establish a serene 10-minute morning and evening devotional chanting routine at home"
    ],
    prerequisites: ["None"],
    paliGlossary: [
      {
        term: "Paritta",
        phonetic: "puh-rit-tuh",
        meaning: "Protection, safety, warding off misfortune through the power of truth",
        context: "Chants composed of the Buddha's words recited to inspire peace and invoke spiritual blessings."
      },
      {
        term: "Sadhu",
        phonetic: "sah-dhoo",
        meaning: "Well said, wholesome, it is good, amen",
        context: "Exclaimed three times in joyful approval of Dhamma speech or merit."
      }
    ],
    modules: [
      {
        id: "mod-p-1-refuges-precepts",
        moduleNumber: 1,
        title: "The Great Refuges & Moral Foundations",
        overview: "Opening prayers, paying homage to the Supreme Buddha (Namo Tassa), taking refuge in the Triple Gem, and undertaking the Five Precepts in Pali.",
        lessons: [
          {
            id: "les-p-1-1-namo-tassa-refuges",
            title: "Namo Tassa & Saranagamana (Taking the Three Refuges)",
            durationMinutes: 15,
            suttaReference: "Khuddakapatha (KN 1)",
            summary: "Pronunciation breakdown, melodic meter, and contemplative meaning of Buddham, Dhammam, and Sangham Saranam Gacchami.",
            contentSections: [
              {
                heading: "The Triple Homage",
                text: "Namo Tassa Bhagavato Arahato Sammasambuddhassa — 'Homage to the Blessed One, the Worthy One, the Fully Awakened One.' Repeating this three times calms the heart and centers the intention on liberation."
              }
            ]
          }
        ]
      }
    ]
  }
];

export const CANONICAL_QUICK_TEMPLATES = [
  {
    templateId: "tpl-four-noble-truths-intensive",
    title: "4-Week Four Noble Truths Intensive Workshop",
    category: "Theravada Fundamentals" as const,
    level: "Beginner" as const,
    durationWeeks: 4,
    estimatedHours: 12,
    desc: "A hands-on practical workshop exploring each Noble Truth with daily mindful journaling and sutta reflections.",
    objectives: [
      "Recognize everyday Dukkha without denial or aversion",
      "Trace cravings back to sensory triggers and subtle mental demands",
      "Experience moments of temporary cessation (Tadanga Nirodha) in meditation",
      "Build a personal daily checklist based on the Eightfold Path"
    ],
    suggestedModules: [
      { title: "Week 1: Diagnosis of Dukkha in Modern Life", lessonsCount: 3 },
      { title: "Week 2: Investigating Craving & Subtle Attachments", lessonsCount: 3 },
      { title: "Week 3: The Cooling of Nirodha & Mental Freedom", lessonsCount: 2 },
      { title: "Week 4: The Eightfold Action Plan for 2026", lessonsCount: 4 }
    ]
  },
  {
    templateId: "tpl-metta-loving-kindness",
    title: "Cultivating Universal Loving-Kindness (Metta Bhavana) Course",
    category: "Meditation & Sati" as const,
    level: "All Levels" as const,
    durationWeeks: 3,
    estimatedHours: 9,
    desc: "Step-by-step training based on the Karaniya Metta Sutta: radiating goodwill toward oneself, benefactors, neutral persons, difficult persons, and all sentient beings.",
    objectives: [
      "Break down barriers of resentment, grudge-holding, and envy",
      "Radiate genuine loving-kindness in all ten directions of space",
      "Cultivate the 11 benefits of Metta meditation recorded in the Anguttara Nikaya"
    ],
    suggestedModules: [
      { title: "Module 1: Cultivating Self-Compassion & Healing the Heart", lessonsCount: 3 },
      { title: "Module 2: Radiating Goodwill to Loved Ones & Neutral Beings", lessonsCount: 2 },
      { title: "Module 3: Dissolving Barriers with Difficult Persons & All Beings", lessonsCount: 3 }
    ]
  },
  {
    templateId: "tpl-dhammapada-verse-by-verse",
    title: "Dhammapada: The Path of Truth Verse-by-Verse Study",
    category: "Sutta Studies" as const,
    level: "Intermediate" as const,
    durationWeeks: 6,
    estimatedHours: 18,
    desc: "A contemplative study of the most cherished Buddhist classic, exploring twin verses, vigilance (Appamada), mind training, and the Arahat.",
    objectives: [
      "Memorize and reflect on central verses of the Dhammapada",
      "Understand the historical background stories (Dhammapada Atthakatha)",
      "Apply verses directly to ethical dilemmas and emotional turmoil"
    ],
    suggestedModules: [
      { title: "Chapter 1: The Twin Verses (Yamakavagga)", lessonsCount: 3 },
      { title: "Chapter 2: Vigilance & Heedfulness (Appamadavagga)", lessonsCount: 2 },
      { title: "Chapter 3: Mind Training & Guarding Thoughts (Cittavagga)", lessonsCount: 3 }
    ]
  }
];
