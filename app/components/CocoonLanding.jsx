"use client";

import React, { useState, useEffect, useRef } from "react";
import { Gift, Menu, Home, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

const CYCLE_WORDS = ["Taste", "AI", "Brand"];

const ART_CARDS = [
  { name: "Taste", images: ["/gallery/taste-1.jpg", "/gallery/taste-2.jpg", "/gallery/taste-3.jpg"] },
  { name: "AI", images: ["/gallery/ai-1.jpg", "/gallery/ai-2.jpg", "/gallery/ai-3.jpg"] },
  { name: "Brand", images: ["/gallery/brand-1.jpg", "/gallery/brand-2.jpg", "/gallery/brand-3.jpg"] },
];

// Horizontally scrolling showcase of individual pieces, placed right after
// the "For the Art of Work" section. Swap images/titles for real work.
const WORK_CAROUSEL_CARDS = [
  { title: "Field Notes", category: "Taste", image: "/gallery/taste-1.jpg" },
  { title: "Signal & Noise", category: "AI", image: "/gallery/ai-1.jpg" },
  { title: "Mark Making", category: "Brand", image: "/gallery/brand-1.jpg" },
  { title: "Quiet Hours", category: "Taste", image: "/gallery/taste-2.jpg" },
  { title: "Model Behavior", category: "AI", image: "/gallery/ai-2.jpg" },
  { title: "Voice & Form", category: "Brand", image: "/gallery/brand-2.jpg" },
  { title: "Slow Craft", category: "Taste", image: "/gallery/taste-3.jpg" },
  { title: "Trained Eye", category: "AI", image: "/gallery/ai-3.jpg" },
];

// Only 3 photos total for the showcase — they rotate through the three
// slots (main / left / right) as the word cycles, rather than swapping
// to different images per word.
const SHOWCASE_IMAGES = ["/Blue  (1).jpg", "/Blue  (1).jpg", "/Blue  (1).jpg", "/Blue  (1).jpg", "/Blue  (1).jpg", "/Blue  (1).jpg"];

// Each state defines where the "main" (center, oversized) slot and the two
// side slots sit, plus their rotation/scale. Coordinates are px offsets from
// dead-center of the composition.
const OBJECT_STATES = [
  {
    // state 0 — "Taste": main object centered, sides low and wide
    main: { x: 0, y: -10, rotate: -8, scale: 1 },
    left: { x: -270, y: 150, rotate: -14, scale: 0.8 },
    right: { x: 270, y: 150, rotate: 12, scale: 0.8 },
  },
  {
    // state 1 — "AI": main object larger, shifted right, darker/denser feel
    main: { x: 70, y: 10, rotate: 5, scale: 1.18 },
    left: { x: -300, y: 170, rotate: -8, scale: 0.65 },
    right: { x: 190, y: 100, rotate: 16, scale: 0.42 },
  },
  {
    // state 2 — "Brand": main object shifted left/up, warmer tone
    main: { x: -80, y: 25, rotate: -14, scale: 1.05 },
    left: { x: -170, y: 190, rotate: 8, scale: 0.6 },
    right: { x: 280, y: 130, rotate: -10, scale: 0.55 },
  },
];

// Which of the 3 persistent images occupies which slot at each state — the
// images themselves never change, only which slot they animate into.
const SLOT_ASSIGNMENTS = [
  { main: 0, left: 1, right: 2 },
  { main: 1, left: 2, right: 0 },
  { main: 2, left: 0, right: 1 },
];

// Only the "Brand" state gets the warmer tone treatment.
const WARM_TONE = "sepia(0.35) saturate(1.3) hue-rotate(-8deg) brightness(1.03)";
const NEUTRAL_TONE = "none";

const ROSTER = [
  { initials: "MV", name: "Mara Voss", craft: "Michelin-starred chef", hue: "#C9A135" },
  { initials: "IC", name: "Idris Cole", craft: "Grammy-winning producer", hue: "#7A2331" },
  { initials: "EP", name: "Elena Petrova", craft: "Olympic distance coach", hue: "#4A6B5C" },
  { initials: "JR", name: "Jonas Reyes", craft: "Bestselling novelist", hue: "#8C5A2B" },
  { initials: "PN", name: "Priya Nair", craft: "Venture-backed founder", hue: "#5C4A8C" },
  { initials: "TB", name: "Tomas Berg", craft: "Pritzker-finalist architect", hue: "#2B6B8C" },
];

const TESTIMONIALS = [
  {
    quote:
      "I've tried a dozen learning apps. This is the first one where I actually finish the lesson instead of closing the tab.",
    name: "Dara O.",
    role: "Member since 2025",
    hue: "#C9A135",
    initials: "DO",
  },
  {
    quote:
      "The lessons feel like sitting in on a masterclass, not watching a tutorial. Worth it for the production value alone.",
    name: "Femi A.",
    role: "Member since 2024",
    hue: "#5C4A8C",
    initials: "FA",
  },
  {
    quote:
      "I signed up for one topic and ended up finishing three. That's the whole trick of this platform, honestly.",
    name: "Sasha K.",
    role: "Member since 2026",
    hue: "#4A6B5C",
    initials: "SK",
  },
];

// Desktop nav — each top-level item opens a dropdown of sub-pages.
// Swap the `href` values for real routes (or Next.js Link `href`s) when wiring up routing.
const NAV_ITEMS = [
  {
    label: "Courses",
    href: "/courses",
    items: [
      { label: "Tab", href: "/courses/tab" },
      { label: "Test", href: "/courses/test" },
      { label: "Brand", href: "/courses/brand" },
    ],
  },
  {
    label: "Adventure",
    href: "/adventure",
    items: [
      { label: "Museum Sightings", href: "/adventure/museum-sightings" },
      { label: "Entering The Moon", href: "/adventure/entering-the-moon" },
    ],
  },
  {
    label: "Memorabilia",
    href: "/memorabilia",
    items: [
      { label: "Event 1", href: "/memorabilia/event-1" },
      { label: "Event 2", href: "/memorabilia/event-2" },
      { label: "Event 3", href: "/memorabilia/event-3" },
    ],
  },
  {
    label: "Conference",
    href: "/conference",
    items: [
      { label: "Conference 1.0", href: "/conference/1-0" },
      { label: "Conference 2.0", href: "/conference/2-0" },
      { label: "Conference 3.0", href: "/conference/3-0" },
      { label: "Cocoon Conference 4.0", href: "/conference/cocoon-4-0" },
    ],
  },
];

// Real social handles — replace with The Cocoon's actual profile URLs.
const SOCIAL_LINKS = {
  Twitter: "https://twitter.com/thecocoonhq",
  Instagram: "https://instagram.com/thecocoonhq",
  YouTube: "https://youtube.com/@thecocoonhq",
  LinkedIn: "https://linkedin.com/company/thecocoonhq",
};

const FAQ_CATEGORIES = [
  {
    category: "General",
    items: [
      {
        q: "What is The Cocoon?",
        a: "The Cocoon is a membership that gives you video lessons taught by leading practitioners across craft, leadership, science, and more.",
      },
      {
        q: "What's included in a Cocoon membership?",
        a: "Every membership includes unlimited access to the full lesson library, downloadable workbooks, and new lessons added monthly.",
      },
      {
        q: "Where can I watch?",
        a: "Stream on the web, or on our iOS, Android, and TV apps — pick up a lesson on one device and continue on another.",
      },
      {
        q: "Which lessons are right for me?",
        a: "Take the quick quiz at the top of this page, or browse by topic — most members start with one and end up exploring several.",
      },
    ],
  },
  {
    category: "Pricing & payment",
    items: [
      {
        q: "How much does The Cocoon cost?",
        a: "Membership starts at $10/month when billed annually, and includes access to every lesson on the platform.",
      },
      {
        q: "Will I be charged taxes?",
        a: "Applicable sales tax or VAT is calculated at checkout based on your billing location.",
      },
      {
        q: "How does the 30-day guarantee work?",
        a: "If The Cocoon isn't for you, request a full refund within 30 days of your purchase — no conditions attached.",
      },
    ],
  },
];

export default function CocoonLanding() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [artIndexes, setArtIndexes] = useState({ Taste: 0, AI: 0, Brand: 0 });
  const [openNav, setOpenNav] = useState(null); // which top-level nav item's dropdown is open
  const navRef = useRef(null);

  // Close any open nav dropdown on outside click / Escape
  useEffect(() => {
    if (openNav === null) return;
    const handlePointer = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenNav(null);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpenNav(null);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openNav]);

  // Refs for the GSAP-driven "Our Focus" composition
  const showcaseRef = useRef(null);
  const wordRef = useRef(null);
  const cursorRef = useRef(null);
  const imgWrapRefs = [useRef(null), useRef(null), useRef(null)]; // position/rotation/scale
  const imgFloatRefs = [useRef(null), useRef(null), useRef(null)]; // continuous subtle float
  const imgToneRefs = [useRef(null), useRef(null), useRef(null)]; // warm-tone filter

  useEffect(() => {
    gsap.registerPlugin(TextPlugin);

    const wrapEls = imgWrapRefs.map((r) => r.current);
    const floatEls = imgFloatRefs.map((r) => r.current);
    const toneEls = imgToneRefs.map((r) => r.current);
    const wordEl = wordRef.current;
    const cursorEl = cursorRef.current;
    if (!wordEl || wrapEls.some((el) => !el)) return;

    // Initialize first word
    wordEl.textContent = CYCLE_WORDS[0];

    // Blinking cursor — runs continuously
    const cursorBlink = cursorEl
      ? gsap.to(cursorEl, {
          opacity: 0,
          repeat: -1,
          yoyo: true,
          duration: 0.5,
          ease: "power2.inOut",
        })
      : null;

    // Initialize each image at its state-0 slot position.
    const initial = OBJECT_STATES[0];
    const initialSlots = SLOT_ASSIGNMENTS[0];
    ["main", "left", "right"].forEach((slot) => {
      const idx = initialSlots[slot];
      gsap.set(wrapEls[idx], { ...initial[slot], transformOrigin: "50% 50%" });
    });
    toneEls.forEach((el) => el && gsap.set(el, { filter: NEUTRAL_TONE }));

    // Continuous, independent subtle floating
    const floatTweens = floatEls.map((el, i) =>
      gsap.to(el, {
        y: i % 2 === 0 ? 10 : -10,
        rotation: i % 2 === 0 ? 1.5 : -1.5,
        duration: 2.6 + i * 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    );

    // Master typewriter timeline — loops forever
    const mainTl = gsap.timeline({ repeat: -1 });

    CYCLE_WORDS.forEach((word, index) => {
      const nextIndex = (index + 1) % CYCLE_WORDS.length;
      const nextWord = CYCLE_WORDS[nextIndex];
      const cfg = OBJECT_STATES[index];
      const nextCfg = OBJECT_STATES[nextIndex];
      const slots = SLOT_ASSIGNMENTS[index];
      const nextSlots = SLOT_ASSIGNMENTS[nextIndex];

      const wordTl = gsap.timeline();

      // 1. Animate images to current word's composition
      wordTl.to(wrapEls[slots.main], { ...cfg.main, duration: 0.6, ease: "back.out(1.4)" }, 0);
      wordTl.to(wrapEls[slots.left], { ...cfg.left, duration: 0.5, ease: "power2.out" }, 0.05);
      wordTl.to(wrapEls[slots.right], { ...cfg.right, duration: 0.65, ease: "power2.out" }, 0.1);

      // Warm tone only on the "Brand" state's main slot
      toneEls.forEach((el, i) => {
        if (!el) return;
        const willBeWarm = index === 2 && i === slots.main;
        wordTl.to(el, { filter: willBeWarm ? WARM_TONE : NEUTRAL_TONE, duration: 0.5, ease: "power1.inOut" }, 0.1);
      });

      // 2. Hold on full word + composition
      wordTl.to({}, { duration: 1.2 });

      // 3. Backspace current word letter-by-letter
      wordTl.to(wordEl, {
        duration: word.length * 0.08,
        text: { value: "", rtl: true },
        ease: "none",
      });

      // 4. Transition images toward next composition while backspacing
      wordTl.to(wrapEls[nextSlots.main], { ...nextCfg.main, duration: 0.4, ease: "power2.in" }, "<");
      wordTl.to(wrapEls[nextSlots.left], { ...nextCfg.left, duration: 0.35, ease: "power2.in" }, "<0.05");
      wordTl.to(wrapEls[nextSlots.right], { ...nextCfg.right, duration: 0.45, ease: "power2.in" }, "<0.05");

      // 5. Type out next word
      wordTl.to(wordEl, {
        duration: nextWord.length * 0.1,
        text: { value: nextWord },
        ease: "none",
      });

      mainTl.add(wordTl);
    });

    return () => {
      mainTl.kill();
      if (cursorBlink) cursorBlink.kill();
      floatTweens.forEach((t) => t.kill());
      gsap.killTweensOf([...wrapEls, ...toneEls, wordEl]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden pb-16 sm:pb-0"
      style={{
        background: "#0B0A08",
        color: "#F3ECD9",
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');

        .lumen-display { font-family: 'Poppins', serif; }
        .lumen-mono { font-family: 'Poppins', monospace; letter-spacing: 0.08em; }

        .lumen-cone {
          background: conic-gradient(from 200deg at 50% -10%, transparent 0deg, rgba(201,161,53,0.18) 15deg, transparent 40deg);
          animation: lumen-sweep 14s linear infinite;
        }
        @keyframes lumen-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .lumen-marquee-track {
          display: flex;
          width: max-content;
          animation: lumen-scroll 32s linear infinite;
        }
        @keyframes lumen-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes lumen-blink {
          50% { opacity: 0; }
        }

        .lumen-pop-main {
          animation: lumen-pop-main 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes lumen-pop-main {
          0% { opacity: 0; transform: rotate(-8deg) scale(0.3); }
          60% { opacity: 1; transform: rotate(-8deg) scale(1.08); }
          100% { opacity: 1; transform: rotate(-8deg) scale(1); }
        }

        .lumen-pop-left {
          animation: lumen-pop-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes lumen-pop-left {
          0% { opacity: 0; transform: rotate(-6deg) scale(0.3); }
          60% { opacity: 1; transform: rotate(-6deg) scale(1.08); }
          100% { opacity: 1; transform: rotate(-6deg) scale(1); }
        }

        .lumen-pop-right {
          animation: lumen-pop-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes lumen-pop-right {
          0% { opacity: 0; transform: rotate(6deg) scale(0.3); }
          60% { opacity: 1; transform: rotate(6deg) scale(1.08); }
          100% { opacity: 1; transform: rotate(6deg) scale(1); }
        }

        .lumen-col-mask {
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
        }
        .lumen-col-up {
          animation: lumen-col-scroll 26s linear infinite;
        }
        .lumen-col-down {
          animation: lumen-col-scroll 26s linear infinite reverse;
        }
        @keyframes lumen-col-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        .lumen-check {
          border: 1px solid rgba(243,236,217,0.3);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .lumen-check-row:hover .lumen-check {
          border-color: rgba(201,161,53,0.7);
        }
        .lumen-check-row[data-active="true"] .lumen-check {
          background: #C9A135;
          border-color: #C9A135;
        }
        .lumen-check-row {
          border-bottom: 1px solid rgba(243,236,217,0.08);
          transition: background 0.2s ease;
        }
        .lumen-check-row:hover {
          background: rgba(243,236,217,0.04);
        }

        .lumen-faq-chevron {
          transition: transform 0.2s ease;
        }
        .lumen-faq-chevron[data-open="true"] {
          transform: rotate(180deg);
        }
        .lumen-faq-answer {
          overflow: hidden;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }

        .lumen-chip {
          border: 1px solid rgba(243,236,217,0.25);
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .lumen-chip:hover {
          border-color: rgba(201,161,53,0.6);
        }
        .lumen-chip[data-active="true"] {
          background: #C9A135;
          border-color: #C9A135;
          color: #201803;
        }

        .lumen-card {
          filter: brightness(0.55) saturate(0.7);
          transition: filter 0.25s ease, transform 0.25s ease;
        }
        .lumen-card:hover,
        .lumen-card:focus-within {
          filter: brightness(1) saturate(1);
          transform: translateY(-4px);
        }

        .lumen-input:focus-visible,
        .lumen-chip:focus-visible,
        .lumen-btn:focus-visible {
          outline: 2px solid #C9A135;
          outline-offset: 2px;
        }

        .lumen-nav-dropdown-item {
          transition: color 0.15s ease, transform 0.15s ease;
          padding: 4px 0;
        }
        .lumen-nav-dropdown-item:hover {
          color: #8C6A2B;
          transform: translateX(2px);
        }

        .lumen-card-marquee-track {
          animation: lumen-card-scroll 36s linear infinite;
        }
        .lumen-card-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes lumen-card-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lumen-cone, .lumen-marquee-track, .lumen-card-marquee-track { animation: none !important; }
        }
      `}</style>

      {/* Nav */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "#F3ECE0",
          borderBottom: "1px solid rgba(11,10,8,0.08)",
        }}
        onMouseLeave={() => setOpenNav(null)}
      >
        <div className="flex items-center justify-between px-6 md:px-10 py-3">
          <div className="flex items-center gap-2">
            <img src="/assets/The_Cocoon_Logo_Type_2.png" alt="theCocoon Logo" style={{ height: "44px", width: "auto" }} />
            <span className="lumen-display text-2xl md:text-3xl" style={{ color: "#0B0A08" }}>
              theCocoon
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isOpen = openNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setOpenNav(item.label)}
                  onClick={() => setOpenNav(isOpen ? null : item.label)}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  className="text-sm flex items-center gap-1"
                  style={{ color: "#3A3226", background: "none", border: "none", cursor: "pointer" }}
                >
                  {item.label}
                  <span
                    style={{
                      color: "#8C8577",
                      display: "inline-block",
                      transition: "transform 0.2s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            <button
              className="lumen-btn text-sm font-medium px-5 py-2.5 rounded-full"
              style={{ background: "#0B0A08", color: "#F3ECE0" }}
            >
              Become a Member
            </button>
          </div>
        </div>

        {/* Full-width mega menu — spans the entire page, anchored to the header */}
        {openNav && (
          <div
            className="absolute left-0 right-0 top-full"
            style={{
              background: "#FFFFFF",
              borderTop: "1px solid rgba(11,10,8,0.08)",
              boxShadow: "0 24px 50px rgba(11,10,8,0.14)",
            }}
          >
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
              <p
                className="lumen-mono text-xs mb-6"
                style={{ color: "#B3AC9C", letterSpacing: "0.12em" }}
              >
                {openNav.toUpperCase()}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  columnGap: "32px",
                  rowGap: "20px",
                }}
              >
                {NAV_ITEMS.find((n) => n.label === openNav)?.items.map((sub) => (
                  <a
                    key={sub.label}
                    href={sub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpenNav(null)}
                    className="lumen-nav-dropdown-item block"
                    style={{ color: "#241F16" }}
                  >
                    <span className="lumen-display text-2xl">{sub.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "680px" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,10,8,0.85) 0%, rgba(11,10,8,0.35) 55%, rgba(11,10,8,0.15) 100%)",
          }}
        />

        <div
          className="relative z-10 flex flex-col items-center justify-end px-6 md:px-16"
          style={{ minHeight: "680px", paddingTop: "150px", paddingBottom: "64px" }}
        >
          <div className="flex items-end justify-center gap-4 md:gap-8 mb-6">
            <span className="lumen-mono text-xs md:text-sm" style={{ color: "#B8B2A2" }}>
              Announcing
            </span>
            <h1
              className="lumen-display leading-none text-center"
              style={{
                color: "#F3ECD9",
                fontWeight: 500,
                fontSize: "clamp(4rem, 14vw, 9rem)",
              }}
            >
              TAB
            </h1>
            <span className="lumen-mono text-xs md:text-sm" style={{ color: "#B8B2A2" }}>
              2026
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="lumen-btn text-sm font-medium px-8 py-3 rounded-md flex items-center gap-2"
              style={{ background: "#3E4A34", color: "#F3ECD9" }}
            >
              Become a Member <ArrowRight size={16} />
            </button>
            <button
              className="lumen-btn text-sm font-medium px-8 py-3 rounded-md"
              style={{ border: "1px solid rgba(243,236,217,0.4)", color: "#F3ECD9" }}
            >
              Explore Programs
            </button>
          </div>
        </div>
      </section>

      {/* For the Art of Work */}
      <section className="py-24 px-6" style={{ background: "#F3ECE0" }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="lumen-display text-4xl md:text-5xl" style={{ color: "#241F16" }}>
            For the Art of Work
          </h2>
        </div>

        <div className="max-w-3xl grid grid-cols-3 gap-6">
          {ART_CARDS.map((card, i) => {
            const activeIndex = artIndexes[card.name] ?? 0;
            const goTo = (index) =>
              setArtIndexes((prev) => ({
                ...prev,
                [card.name]: (index + card.images.length) % card.images.length,
              }));

            return (
              <div
                key={card.name}
                className="rounded-lg overflow-hidden"
                style={{
                  background: "#FBF7EF",
                  border: i === 0 ? "1px solid #7C9473" : "1px solid rgba(11,10,8,0.1)",
                }}
              >
                <div className="group relative" style={{ aspectRatio: "1 / 1" }}>
                  <img
                    src={card.images[activeIndex]}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label={`Show previous ${card.name} image`}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(11,10,8,0.55)", color: "#F3ECD9" }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label={`Show next ${card.name} image`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(11,10,8,0.55)", color: "#F3ECD9" }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex justify-center gap-2 py-3">
                  {card.images.map((_, d) => (
                    <button
                      key={d}
                      type="button"
                      aria-label={`Show ${card.name} image ${d + 1}`}
                      onClick={() => goTo(d)}
                      className="rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        background: d === activeIndex ? "#241F16" : "rgba(11,10,8,0.2)",
                      }}
                    />
                  ))}
                </div>

                <div className="px-4 pb-4 text-center">
                  <p className="lumen-display text-lg" style={{ color: "#241F16" }}>
                    {card.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Card carousel — sits right after "For the Art of Work" */}
      <section className="py-24 px-6" style={{ background: "#F3ECE0" }}>
        <div className="max-w-6xl mx-auto mb-8">
          <h3 className="lumen-display text-2xl md:text-3xl" style={{ color: "#241F16" }}>
            More From the Studio
          </h3>
        </div>

        <div className="overflow-hidden">
          <div className="lumen-card-marquee-track flex gap-6 w-max">
            {[0, 1].map((rep) => (
              <React.Fragment key={rep}>
                {WORK_CAROUSEL_CARDS.map((card, i) => (
                  <div
                    key={card.title + rep + i}
                    className="flex-shrink-0 rounded-lg overflow-hidden"
                    style={{ width: "280px", aspectRatio: "4 / 5" }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive Experiences */}
      <section className="py-28 px-6" style={{ background: "#0B0A08" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="lumen-mono text-xs mb-6"
            style={{ color: "#C9A135", letterSpacing: "0.14em" }}
          >
            IMMERSIVE EXPERIENCES
          </p>
          <h3
            className="lumen-display italic mb-8"
            style={{ color: "#F3ECD9", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
          >
            1,000+ customised tracks to elevate your mindset and feelings
          </h3>
          <p
            className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
            style={{ color: "#8C8577" }}
          >
            With a push of a button — experience brain changing hypnotic audios, sound healings,
            meditations and instant mood elevations. Take charge of your mind.
          </p>
        </div>
      </section>

      {/* Marquee */}
      <div
        className="overflow-hidden py-3"
        style={{ borderTop: "1px solid rgba(243,236,217,0.1)", borderBottom: "1px solid rgba(243,236,217,0.1)" }}
      >
        <div className="lumen-marquee-track">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center">
              {["CRAFT", "LEADERSHIP", "SCIENCE", "MUSIC", "DESIGN", "WELLNESS", "WRITING"].map(
                (word) => (
                  <span
                    key={word + rep}
                    className="lumen-mono text-xs px-6"
                    style={{ color: "#8C8577" }}
                  >
                    {word} <span style={{ color: "#C9A135" }}>★</span>
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cycling word showcase — GSAP-driven composition */}
      <section
        ref={showcaseRef}
        className="relative overflow-hidden py-32 px-6 text-center"
        style={{
          background: "#F3ECE0",
          backgroundImage:
            "linear-gradient(rgba(11,10,8,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,10,8,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <span
          className="inline-block lumen-mono text-xs px-4 py-2 rounded-full mb-10"
          style={{ border: "1px solid rgba(11,10,8,0.25)", color: "#3A3226" }}
        >
          Our Focus
        </span>

        <div className="relative mx-auto" style={{ minHeight: "420px", maxWidth: "900px" }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <span
              ref={wordRef}
              className="lumen-display leading-none"
              style={{
                fontSize: "clamp(6rem, 16vw, 12rem)",
                color: "#241F16",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            />
            <span
              ref={cursorRef}
              style={{
                display: "inline-block",
                width: "4px",
                height: "clamp(5.5rem, 14vw, 11rem)",
                background: "#241F16",
                marginLeft: "6px",
                verticalAlign: "middle",
              }}
            />
          </div>

          {/* Three persistent images — GSAP animates each between the main/left/right
              slot positions defined in OBJECT_STATES; none of them ever swap src. */}
          {SHOWCASE_IMAGES.map((src, i) => (
            <div
              key={src}
              ref={imgWrapRefs[i]}
              className="hidden md:block absolute rounded-md shadow-lg"
              style={{
                top: "50%",
                left: "50%",
                width: "210px",
                height: "144px",
                marginTop: "-72px",
                marginLeft: "-105px",
                zIndex: 2,
                willChange: "transform",
              }}
            >
              <div ref={imgFloatRefs[i]} style={{ width: "100%", height: "100%" }}>
                <img
                  ref={imgToneRefs[i]}
                  src={src}
                  alt=""
                  className="rounded-md"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    boxShadow: "0 12px 30px rgba(11,10,8,0.25)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device showcase — phone / laptop / headset bento, sits right before the footer */}
      <section className="py-24 px-6" style={{ background: "#F3ECE0" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block lumen-mono text-xs px-4 py-2 rounded-full mb-6"
              style={{ border: "1px solid rgba(11,10,8,0.25)", color: "#3A3226" }}
            >
              Everywhere You Create
            </span>
            <h3 className="lumen-display text-3xl md:text-4xl" style={{ color: "#241F16" }}>
              Your studio, wherever you are
            </h3>
          </div>

          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "minmax(0, 320px) 1fr",
              gridTemplateRows: "1fr 1fr",
            }}
          >
            {/* Phone mockup — spans both rows on the left */}
            <div
              className="hidden md:block"
              style={{ gridColumn: "1", gridRow: "1 / 3" }}
            >
              <div
                className="relative mx-auto rounded-[2.4rem] overflow-hidden"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  aspectRatio: "9 / 18.5",
                  background: "#0B0A08",
                  border: "10px solid #0B0A08",
                  boxShadow: "0 30px 60px rgba(11,10,8,0.22)",
                }}
              >
                {/* status bar */}
                <div
                  className="flex items-center justify-between px-4 pt-3 pb-2 lumen-mono"
                  style={{ color: "#F3ECD9", fontSize: "10px" }}
                >
                  <span>9:41</span>
                  <span style={{ color: "#8C8577" }}>●●●●</span>
                </div>

                {/* top controls */}
                <div className="flex items-center justify-between px-4 mb-4">
                  <span style={{ color: "#8C8577", fontSize: "16px" }}>×</span>
                  <div className="flex items-center gap-3" style={{ color: "#8C8577", fontSize: "12px" }}>
                    <span>↗</span>
                    <span>♡</span>
                  </div>
                </div>

                {/* cover art */}
                <div className="px-4">
                  <div
                    className="rounded-md flex items-end p-4"
                    style={{
                      aspectRatio: "1 / 1",
                      background: "linear-gradient(135deg, #C9A135 0%, #6B4E9B 55%, #241F16 100%)",
                    }}
                  >
                    <p className="lumen-display text-sm leading-tight" style={{ color: "#F3ECD9" }}>
                      Building Your Creative Practice
                    </p>
                  </div>
                </div>

                {/* title + progress */}
                <div className="px-4 mt-4">
                  <p className="text-xs mb-3" style={{ color: "#F3ECD9" }}>
                    Building Your Creative Practice
                  </p>
                  <div
                    className="relative rounded-full mb-1"
                    style={{ height: "3px", background: "rgba(243,236,217,0.15)" }}
                  >
                    <div
                      className="absolute left-0 top-0 rounded-full"
                      style={{ height: "3px", width: "35%", background: "#C9A135" }}
                    />
                  </div>
                  <div
                    className="flex justify-between lumen-mono"
                    style={{ fontSize: "9px", color: "#8C8577" }}
                  >
                    <span>08:12</span>
                    <span>23:40</span>
                  </div>
                </div>

                {/* playback controls */}
                <div className="flex items-center justify-center gap-6 mt-5">
                  <span className="lumen-mono" style={{ color: "#8C8577", fontSize: "10px" }}>15</span>
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{ width: "46px", height: "46px", background: "#F3ECD9" }}
                  >
                    <div className="flex gap-1">
                      <div style={{ width: "3px", height: "14px", background: "#0B0A08" }} />
                      <div style={{ width: "3px", height: "14px", background: "#0B0A08" }} />
                    </div>
                  </div>
                  <span className="lumen-mono" style={{ color: "#8C8577", fontSize: "10px" }}>15</span>
                </div>

                {/* chapter dots */}
                <div className="flex items-center justify-center gap-3 mt-5">
                  {["#3A3226", "#C9A135", "#3A3226"].map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-full"
                      style={{
                        width: idx === 1 ? "34px" : "26px",
                        height: idx === 1 ? "34px" : "26px",
                        background: c,
                        border: idx === 1 ? "2px solid #F3ECD9" : "none",
                      }}
                    />
                  ))}
                </div>

                {/* about section */}
                <div className="px-4 mt-5">
                  <p className="lumen-mono text-[9px] mb-2" style={{ color: "#6B655A" }}>
                    ABOUT THIS SESSION
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#8C8577" }}>
                    A guided studio session on finding your creative voice.
                  </p>
                </div>
              </div>
            </div>

            {/* Laptop mockup — top right */}
            <div style={{ gridColumn: "2", gridRow: "1" }} className="flex items-center justify-center">
              <div className="w-full" style={{ maxWidth: "480px" }}>
                <div
                  className="rounded-t-lg overflow-hidden"
                  style={{
                    background: "#F8F4EA",
                    border: "8px solid #D9D2C2",
                    borderBottom: "none",
                  }}
                >
                  <div style={{ aspectRatio: "16 / 10", padding: "16px" }}>
                    {/* browser nav */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="lumen-display italic text-sm" style={{ color: "#241F16" }}>
                        The Cocoon
                      </span>
                      <div
                        className="hidden sm:flex items-center gap-3 lumen-mono"
                        style={{ fontSize: "8px", color: "#8C8577" }}
                      >
                        <span style={{ color: "#241F16" }}>For You</span>
                        <span>Trending</span>
                        <span>Circles</span>
                        <span>Opportunities</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#8C8577" }}>⚲ ⚙</div>
                    </div>

                    <p className="lumen-mono text-[9px] mb-2" style={{ color: "#6B655A" }}>
                      WHAT'S LIVE NOW
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { bg: "#C9A135", label: "Mastering Your Craft" },
                        { bg: "#6B4E9B", label: "Pitch With Confidence" },
                        { bg: "#3A3226", label: "The Founders Circle" },
                      ].map((c) => (
                        <div key={c.label}>
                          <div
                            className="rounded mb-1"
                            style={{ aspectRatio: "16 / 10", background: c.bg }}
                          />
                          <p className="text-[7px]" style={{ color: "#3A3226" }}>{c.label}</p>
                        </div>
                      ))}
                    </div>

                    <p className="lumen-mono text-[9px] mb-2" style={{ color: "#6B655A" }}>
                      GROW WITH THE COCOON
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Set your goals", "Track your growth", "Meet your circle"].map((t) => (
                        <div
                          key={t}
                          className="rounded px-2 py-2"
                          style={{ background: "rgba(11,10,8,0.05)" }}
                        >
                          <p className="text-[7px]" style={{ color: "#3A3226" }}>{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* laptop base */}
                <div
                  style={{
                    height: "12px",
                    background: "#D9D2C2",
                    borderRadius: "0 0 8px 8px",
                  }}
                />
                <div
                  className="mx-auto"
                  style={{
                    width: "40%",
                    height: "4px",
                    background: "#C7BFAC",
                    borderRadius: "0 0 6px 6px",
                  }}
                />
              </div>
            </div>

            {/* Headset mockup — bottom right */}
            <div style={{ gridColumn: "2", gridRow: "2" }} className="flex items-center justify-center py-6">
              <div
                className="relative"
                style={{
                  width: "min(100%, 360px)",
                  aspectRatio: "16 / 8",
                  borderRadius: "999px",
                  background: "linear-gradient(180deg, #4A4740 0%, #1C1A16 55%, #0B0A08 100%)",
                  boxShadow: "0 25px 50px rgba(11,10,8,0.25)",
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "14%",
                    background: "linear-gradient(135deg, #3A3226 0%, #0B0A08 60%)",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    left: "-4%",
                    top: "38%",
                    width: "9%",
                    height: "24%",
                    background: "#2A2721",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    right: "-4%",
                    top: "38%",
                    width: "9%",
                    height: "24%",
                    background: "#2A2721",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile fallback — stacked, simplified */}
          <div className="md:hidden grid grid-cols-1 gap-6 mt-2">
            <div
              className="rounded-2xl px-6 py-8 text-center"
              style={{ background: "#0B0A08" }}
            >
              <p className="lumen-mono text-xs" style={{ color: "#8C8577" }}>ON THE GO</p>
              <p className="lumen-display text-lg mt-2" style={{ color: "#F3ECD9" }}>
                Sessions in your pocket
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-16" style={{ borderTop: "1px solid rgba(243,236,217,0.1)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {[
            { title: "Courses", links: ["Articles", "Sitemap", "Gift cards", "Member wins"] },
            { title: "Conference", links: ["Careers", "Newsroom", "Security", "Support"] },
            { title: "Adventure", links: ["Terms", "Privacy", "Learner guidelines", "Cookie choices"] },
            {
              title: "Follow",
              links: Object.keys(SOCIAL_LINKS),
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="lumen-mono text-xs mb-4" style={{ color: "#C9A135" }}>
                {col.title.toUpperCase()}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const isSocial = col.title === "Follow";
                  return (
                    <li key={link}>
                      <a
                        href={isSocial ? SOCIAL_LINKS[link] : "#"}
                        target={isSocial ? "_blank" : undefined}
                        rel={isSocial ? "noopener noreferrer" : undefined}
                        className="text-sm"
                        style={{ color: "#8C8577" }}
                      >
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(243,236,217,0.08)" }}
        >
          <p className="lumen-mono text-xs" style={{ color: "#6B655A" }}>
            © 2026 THE COCOON
          </p>
          <div className="flex gap-4">
            {["App Store", "Google Play", "Roku"].map((platform) => (
              <span key={platform} className="lumen-mono text-xs" style={{ color: "#6B655A" }}>
                {platform}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2"
        style={{
          background: "rgba(11,10,8,0.92)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(243,236,217,0.1)",
        }}
      >
        {[
          { label: "Gifts", icon: Gift },
          { label: "Menu", icon: Menu },
          { label: "Home", icon: Home },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className="flex flex-col items-center gap-1 px-4 py-1"
            style={{ color: activeTab === label ? "#C9A135" : "#8C8577" }}
          >
            <Icon size={20} />
            <span className="lumen-mono text-[10px]">{label.toUpperCase()}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
