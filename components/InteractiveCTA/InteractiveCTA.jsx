'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { slugify } from '../../utils/slugify';
import Link from 'next/link';
import './InteractiveCTA.css';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is your primary workspace vibe?",
    options: [
      { text: "Minimalist & Dark (Late night terminal hacker style)", scores: { vader: 3, demadog: 2 } },
      { text: "Cosmic & Ambient (Vibrant RGB grids, glowing custom rigs)", scores: { grogu: 3, groot: 2 } },
      { text: "Mystical & Classic (Warm wood, soft candle-light, books)", scores: { throne: 3, sortinghat: 2 } },
      { text: "Tactical & Clean (Sleek EDC gears, highly organized layouts)", scores: { knife: 3, vader: 1 } }
    ]
  },
  {
    id: 2,
    question: "When facing a complex problem, what is your mindset?",
    options: [
      { text: "Focus entirely on order, rules, and authority", scores: { vader: 3, throne: 2 } },
      { text: "Embrace the strange, chaotic, and unknown", scores: { demadog: 3, sortinghat: 1 } },
      { text: "Seek creative solutions, out of the box", scores: { sortinghat: 3, groot: 2 } },
      { text: "Solve it with high-precision mechanics and tools", scores: { knife: 3, vader: 1 } }
    ]
  },
  {
    id: 3,
    question: "What is your input device / weapon of choice?",
    options: [
      { text: "Custom mechanical keyboard with clicky switches (Tactile & Loud)", scores: { demadog: 2, sortinghat: 2 } },
      { text: "Ultra-thin, silent keyboard (Low profile & Stealth)", scores: { vader: 3, throne: 1 } },
      { text: "Lubed linear switch custom mechanical keyboard (Smooth & Thocky)", scores: { grogu: 2, groot: 3 } },
      { text: "Ergonomic split keyboard / trackball setup (Precision & Comfort)", scores: { knife: 3, throne: 2 } }
    ]
  },
  {
    id: 4,
    question: "How do you fuel your working sessions?",
    options: [
      { text: "Black coffee or pure Espresso (No nonsense energy)", scores: { vader: 3, throne: 2 } },
      { text: "Matcha, green tea, or loose leaf tea (Calm, structured focus)", scores: { sortinghat: 3, grogu: 2 } },
      { text: "Sugar-free energy drinks or cold brew sodas (Chaotic bursts)", scores: { demadog: 3, knife: 2 } },
      { text: "Pure chilled water / sparkling water (Clean & Hydrated)", scores: { groot: 3, grogu: 1 } }
    ]
  },
  {
    id: 5,
    question: "What is your ultimate desk companion theme?",
    options: [
      { text: "Sci-Fi & Cyberpunk (Dystopian, synthwave, neon)", scores: { vader: 2, grogu: 3 } },
      { text: "High-Fantasy & Ancient Lore (Stone, runes, swords)", scores: { throne: 3, sortinghat: 3 } },
      { text: "Comics & Cinematic Superheroes (Bold, inspiring, action)", scores: { groot: 3, vader: 1 } },
      { text: "Anime, Pop Culture & Gaming (Vibrant, nostalgic, playful)", scores: { demadog: 2, knife: 3 } }
    ]
  }
];

const RECOMMENDATIONS = [
  {
    id: "vader",
    productName: "Darth Vader",
    heading: "The Commander of Your Desk",
    reason: "Your workspace values structure, power, and deep concentration. Darth Vader stands as a sentinel of order for your desk."
  },
  {
    id: "demadog",
    productName: "Demadog",
    heading: "The Hawkins Sentinel",
    reason: "You thrive in the shadows of the code. A Demadog artifact is the ultimate companion to show your affinity for the strange."
  },
  {
    id: "grogu",
    productName: "Grogu",
    heading: "The Cosmic Companion",
    reason: "Your RGB setup screams celestial magic. Grogu brings a serene, cosmic aura to your glowing battle-station."
  },
  {
    id: "groot",
    productName: "Groot",
    heading: "The Guardian of Growth",
    reason: "You love playful, celestial energy. Groot is the perfect organic, extraterrestrial asset to bring life to your desk."
  },
  {
    id: "throne",
    productName: "Iron Throne",
    heading: "The Sovereign Seat",
    reason: "You value historic epics and ultimate goals. The Iron Throne anchors your desk in high-fantasy prestige."
  },
  {
    id: "sortinghat",
    productName: "Sorting Hat",
    heading: "The Oracle of Wisdom",
    reason: "Your workspace is a study of spells and knowledge. The Sorting Hat represents wisdom and creative curation."
  },
  {
    id: "knife",
    productName: "Butterfly Knife 1",
    heading: "The Master Fidget Tool",
    reason: "You need tactile feedback to process thoughts. A high-precision fidget trainer keeps your hands busy and mind focused."
  }
];

const InteractiveCTA = ({ products = [] }) => {
  const [step, setStep] = useState(0); // 0: Start, 1-5: Questions, 6: Result
  const [answers, setAnswers] = useState({});
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [recInfo, setRecInfo] = useState(null);
  const { addToCart } = useCart();

  const handleStart = () => {
    setAnswers({});
    setMatchedProduct(null);
    setRecInfo(null);
    setStep(1);
  };

  const handleOptionSelect = (optScores) => {
    const nextAnswers = { ...answers, [step]: optScores };
    setAnswers(nextAnswers);

    if (step < QUIZ_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Calculate total score for each recommendation
      const totals = {
        vader: 0,
        demadog: 0,
        grogu: 0,
        groot: 0,
        throne: 0,
        sortinghat: 0,
        knife: 0
      };

      // Aggregate scores from all answers
      Object.values(nextAnswers).forEach(scores => {
        if (scores) {
          Object.entries(scores).forEach(([recId, value]) => {
            if (totals[recId] !== undefined) {
              totals[recId] += value;
            }
          });
        }
      });

      // Find the recommendation ID with the highest score
      let bestRecId = "vader"; // Fallback
      let highestScore = -1;
      Object.entries(totals).forEach(([recId, score]) => {
        if (score > highestScore) {
          highestScore = score;
          bestRecId = recId;
        }
      });

      const rec = RECOMMENDATIONS.find(r => r.id === bestRecId) || RECOMMENDATIONS[0];
      setRecInfo(rec);

      const matched = products.find(p => p.Name.toLowerCase().includes(rec.productName.toLowerCase()));
      setMatchedProduct(matched || null);
      setStep(QUIZ_QUESTIONS.length + 1);
    }
  };

  return (
    <section className="quiz-section">
      <div className="quiz-glow-1" />
      <div className="quiz-glow-2" />

      <div className="quiz-container">
        <div className="quiz-panel">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div className="quiz-icon-wrapper">
                  💡
                </div>
                <h2 className="quiz-title">
                  Which Universe Owns Your Desk?
                </h2>
                <p className="quiz-desc">
                  Find the perfect handcrafted pop-culture collectible that fits your developer workflow and desk aesthetic. Take the 30-second quiz.
                </p>
                <button
                  onClick={handleStart}
                  className="quiz-start-btn"
                >
                  Initiate Alignment
                </button>
              </motion.div>
            )}

            {step >= 1 && step <= QUIZ_QUESTIONS.length && (
              <motion.div
                key={`q-${step}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <span className="quiz-step-indicator">
                  Question {step} of {QUIZ_QUESTIONS.length}
                </span>
                <h3 className="quiz-question-text">
                  {QUIZ_QUESTIONS[step - 1].question}
                </h3>
                <div className="quiz-options-grid">
                  {QUIZ_QUESTIONS[step - 1].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt.scores)}
                      className="quiz-option-btn"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === QUIZ_QUESTIONS.length + 1 && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <span className="quiz-result-indicator">
                  Alignment Match Found
                </span>
                <h3 className="quiz-result-heading">
                  {recInfo?.heading}
                </h3>
                <p className="quiz-result-reason">
                  {recInfo?.reason}
                </p>

                {matchedProduct ? (
                  <div className="quiz-product-card">
                    <img
                      src={matchedProduct.ImageURL || '/products/placeholder.webp'}
                      alt={matchedProduct.Name}
                      className="quiz-product-img"
                    />
                    <div className="quiz-product-info">
                      <span className="quiz-product-category">{matchedProduct.Category}</span>
                      <h4 className="quiz-product-name">{matchedProduct.Name}</h4>
                      <p className="quiz-product-desc">{matchedProduct.Description}</p>
                      
                      <div className="quiz-product-footer">
                        <span className="quiz-product-price">₹{matchedProduct.Price}</span>
                        <div className="quiz-actions">
                          <Link
                            href={`/products/${slugify(matchedProduct.Name)}`}
                            className="quiz-btn-details"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => addToCart(matchedProduct)}
                            className="quiz-btn-acquire"
                          >
                            Acquire
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="quiz-fallback">
                    <h4 className="quiz-fallback-title">Collectible Match: {recInfo?.productName}</h4>
                    <p className="quiz-fallback-desc">The dynamic item details are currently loading. Browse our overall registry collection.</p>
                    <Link
                      href="/products"
                      className="quiz-fallback-btn"
                    >
                      View Catalog
                    </Link>
                  </div>
                )}

                <button
                  onClick={handleStart}
                  className="quiz-reset-btn"
                >
                  Recalibrate Alignment
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InteractiveCTA;
