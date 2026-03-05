'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProfileNavbar from '../components/ProfileNavbar';
import { useAuth } from '../../lib/AuthContext';
import { useCart, type CartItemKind } from '../../lib/CartContext';

type ProductOffer = {
  id: string;
  name: string;
  kind: CartItemKind;
  price: number;
  shortDescription: string;
  longDescription: string;
  bullets: string[];
  iconClass: string;
  badge?: string;
};

const OFFERS: ProductOffer[] = [
  {
    id: 'pkg-starter',
    name: 'Starter Pack',
    kind: 'package',
    price: 39,
    shortDescription: 'A guided jumpstart to build your daily Spanish habit.',
    longDescription: 'A structured starter journey with curated lessons, exercises, and a 7-day plan to get momentum quickly.',
    bullets: ['7-day learning roadmap', 'Curated beginner lessons', 'Daily practice checklist', 'Progress milestones'],
    iconClass: 'fas fa-rocket',
    badge: 'Popular',
  },
  {
    id: 'pkg-conversation',
    name: 'Conversation Booster',
    kind: 'package',
    price: 59,
    shortDescription: 'Speak with confidence using practical, real-world prompts.',
    longDescription: 'A focused package designed to improve speaking flow with drills, prompts, and feedback-oriented practice sessions.',
    bullets: ['Conversation prompt library', 'Pronunciation drills', 'Role-play exercises', 'Confidence routines'],
    iconClass: 'fas fa-comments',
  },
  {
    id: 'svc-tutoring',
    name: '1:1 Tutoring Session',
    kind: 'service',
    price: 45,
    shortDescription: 'Personalized coaching tailored to your level and goals.',
    longDescription: 'A private session to work on your pronunciation, speaking fluency, or exam preparation with a clear action plan.',
    bullets: ['Goal-based session plan', 'Live feedback', 'Personalized exercises', 'Actionable next steps'],
    iconClass: 'fas fa-user-graduate',
    badge: 'Best for growth',
  },
  {
    id: 'svc-review',
    name: 'Level & Accent Review',
    kind: 'service',
    price: 29,
    shortDescription: 'A quick audit with recommendations to level up faster.',
    longDescription: 'A short evaluation of your level, strengths, and speaking habits, followed by a personalized improvement plan.',
    bullets: ['Level assessment', 'Accent & clarity tips', 'Targeted recommendations', 'Study plan outline'],
    iconClass: 'fas fa-chart-line',
  },
  {
    id: 'ebook-essentials',
    name: 'E-book: Spanish Essentials',
    kind: 'ebook',
    price: 19,
    shortDescription: 'Core grammar and vocabulary distilled into a practical guide.',
    longDescription: 'A compact reference you can use while learning: patterns, examples, and practice prompts with clear explanations.',
    bullets: ['Quick grammar patterns', 'Everyday vocabulary', 'Practice prompts', 'Printable format'],
    iconClass: 'fas fa-book',
  },
  {
    id: 'ebook-routine',
    name: 'E-book: Daily Routine System',
    kind: 'ebook',
    price: 15,
    shortDescription: 'A simple routine that keeps you consistent for months.',
    longDescription: 'A step-by-step routine system to build daily practice with templates, schedules, and accountability tools.',
    bullets: ['Daily templates', 'Weekly schedule', 'Consistency tracker', 'Motivation prompts'],
    iconClass: 'fas fa-calendar-check',
  },
];

function formatKind(kind: CartItemKind) {
  if (kind === 'package') return 'Package';
  if (kind === 'service') return 'Service';
  return 'E-book';
}

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [showFullOffer, setShowFullOffer] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const heroStats = useMemo(
    () => [
      { label: 'Curated offers', value: `${OFFERS.length}` },
      { label: 'Digital + services', value: 'All-in-one' },
      { label: 'Instant access', value: 'Add to cart' },
    ],
    [],
  );

  const handleAdd = (offer: ProductOffer) => {
    addToCart(
      {
        id: offer.id,
        name: offer.name,
        kind: offer.kind,
        description: offer.shortDescription,
        price: offer.price,
      },
      1,
    );
    setJustAddedId(offer.id);
    window.setTimeout(() => {
      setJustAddedId((prev) => (prev === offer.id ? null : prev));
    }, 1200);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #86C2A8 0%, #F4D0D0 45%, #3b4bb1 100%)',
      }}
    >
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {isAuthenticated ? <ProfileNavbar /> : <Navbar />}

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-6 sm:px-10 py-8 sm:py-10 bg-white/60">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <span className="h-2 w-2 rounded-full bg-[var(--amarillo-ocre)] shadow-[0_0_0_6px_rgba(236,164,0,0.14)]"></span>
                    Products & services
                  </div>
                  <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    Explore the full offer
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-2xl">
                    Browse a horizontal shelf of featured items, then review every package, digital content, and service in one clean list.
                    Add anything to your cart in one click.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowFullOffer((v) => !v)}
                    className="btn-ochre px-5 py-3 rounded-xl font-bold text-sm text-center flex-1"
                  >
                    {showFullOffer ? 'Hide full offer' : 'Review full offer'}
                  </button>
                  <Link
                    href="/cart"
                    className="btn-mint px-5 py-3 rounded-xl font-bold text-sm text-center flex-1"
                  >
                    Go to cart
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {heroStats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="text-[11px] font-semibold text-gray-600">{s.label}</div>
                    <div className="mt-1 text-gray-900 font-extrabold">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 sm:px-10 pb-10">
              <div className="mt-8 flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Shelf</h2>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <i className="fas fa-arrows-left-right text-gray-500"></i>
                  Scroll horizontally
                </div>
              </div>

              <div className="mt-4 -mx-6 sm:-mx-10 px-6 sm:px-10">
                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:thin]">
                  {OFFERS.map((offer) => (
                    <div
                      key={offer.id}
                      className="snap-start min-w-[18rem] sm:min-w-[20rem] max-w-[20rem] rounded-3xl border border-gray-200 bg-white/75 shadow-md p-5 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
                            <i className={`${offer.iconClass} text-[var(--azul-ultramar)]`}></i>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-gray-600">{formatKind(offer.kind)}</div>
                            <div className="text-gray-900 font-extrabold">{offer.name}</div>
                          </div>
                        </div>
                        {offer.badge ? (
                          <div className="text-[11px] font-bold rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-gray-700">
                            {offer.badge}
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-4 text-sm text-gray-700 leading-relaxed">{offer.shortDescription}</p>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] font-semibold text-gray-600">Price</div>
                          <div className="text-2xl font-extrabold text-gray-900">${offer.price}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdd(offer)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                            justAddedId === offer.id
                              ? 'bg-white border border-gray-200 text-gray-900'
                              : 'btn-gradient text-white'
                          }`}
                        >
                          {justAddedId === offer.id ? 'Added' : 'Add to cart'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showFullOffer ? (
                <div className="mt-10">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Full offer</h2>
                      <p className="mt-1 text-sm text-gray-700">
                        Everything available in a vertical display, with details and pricing.
                      </p>
                    </div>
                    <Link
                      href="/cart"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm text-center border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                    >
                      Review cart
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    {OFFERS.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-3xl border border-gray-200 bg-white/75 shadow-md p-5 sm:p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center flex-none">
                              <i className={`${offer.iconClass} text-[var(--azul-ultramar)]`}></i>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-gray-900 text-lg font-extrabold">{offer.name}</div>
                                <div className="text-[11px] font-semibold rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-gray-700">
                                  {formatKind(offer.kind)}
                                </div>
                                {offer.badge ? (
                                  <div className="text-[11px] font-bold rounded-full border border-gray-200 bg-[rgba(236,164,0,0.14)] px-2.5 py-1 text-gray-800">
                                    {offer.badge}
                                  </div>
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{offer.longDescription}</p>
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {offer.bullets.map((b) => (
                                  <div key={b} className="flex items-start gap-2 rounded-2xl border border-gray-200 bg-white/70 px-3 py-2">
                                    <i className="fas fa-check-circle text-[var(--verde-menta)] mt-0.5"></i>
                                    <div className="text-sm text-gray-800 font-semibold leading-snug">{b}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="md:w-60 flex flex-col gap-2.5">
                            <div className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                              <div className="text-[11px] font-semibold text-gray-600">Price</div>
                              <div className="mt-1 text-3xl font-extrabold text-gray-900 leading-none">${offer.price}</div>
                              <div className="mt-1 text-xs font-semibold text-gray-600">USD</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdd(offer)}
                              className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                                justAddedId === offer.id
                                  ? 'bg-white border border-gray-200 text-gray-900'
                                  : 'btn-gradient text-white'
                              }`}
                            >
                              {justAddedId === offer.id ? 'Added' : 'Add to cart'}
                            </button>
                            <Link
                              href="/cart"
                              className="px-4 py-3 rounded-xl font-bold text-sm text-center border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                            >
                              Go to cart
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

