'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import ProfileNavbar from './components/ProfileNavbar';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const primaryHref = isAuthenticated ? (user?.is_staff ? '/admin' : '/profile') : '/register';
  const secondaryHref = isAuthenticated ? '/dashboard' : '/login';

  const primaryLabel = isAuthenticated ? 'Continue' : 'Start now';
  const secondaryLabel = isAuthenticated ? 'Open dashboard' : 'Sign in';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[var(--azul-ultramar)] via-[#0b1b4a] to-[var(--naranja)]">
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {isAuthenticated ? <ProfileNavbar /> : <Navbar />}

      <main className="relative z-10 pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_0_6px_rgba(253,224,71,0.15)]"></span>
                Daily practice. Real progress.
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Welcome to <span className="text-yellow-300">Daily Spanish</span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl leading-relaxed text-white/90 max-w-xl">
                A clean, focused learning experience designed to build momentum — lessons, exercises, and progress tracking
                in one place.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href={primaryHref} className="btn-ochre px-6 py-3.5 rounded-xl font-bold text-center">
                  {primaryLabel}
                </Link>
                <Link
                  href={secondaryHref}
                  className="btn-mint px-6 py-3.5 rounded-xl font-bold text-center"
                >
                  {secondaryLabel}
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-5 py-4">
                  <div className="text-sm text-white/75">Daily streaks</div>
                  <div className="mt-1 text-2xl font-extrabold">Build habits</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-5 py-4">
                  <div className="text-sm text-white/75">Targeted practice</div>
                  <div className="mt-1 text-2xl font-extrabold">Learn faster</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-5 py-4">
                  <div className="text-sm text-white/75">Progress tracking</div>
                  <div className="mt-1 text-2xl font-extrabold">Stay on track</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-2xl"></div>
              <div className="relative rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-xl p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-yellow-300/90 text-neutral-900 flex items-center justify-center font-extrabold">
                      DS
                    </div>
                    <div>
                      <div className="text-white font-bold">Today’s Focus</div>
                      <div className="text-sm text-white/70">Short, satisfying sessions</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-white/80 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                    {isLoading ? 'Loading…' : isAuthenticated ? 'Signed in' : 'Guest'}
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <i className="fas fa-bolt text-yellow-300"></i>
                      </div>
                      <div className="text-white font-semibold">Quick lessons</div>
                    </div>
                    <div className="mt-3 text-sm text-white/75">
                      Bite-sized blocks that fit your day and keep you consistent.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <i className="fas fa-layer-group text-yellow-300"></i>
                      </div>
                      <div className="text-white font-semibold">Structured practice</div>
                    </div>
                    <div className="mt-3 text-sm text-white/75">
                      Grammar, vocabulary, and exercises that reinforce each other.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <i className="fas fa-chart-line text-yellow-300"></i>
                      </div>
                      <div className="text-white font-semibold">Visible progress</div>
                    </div>
                    <div className="mt-3 text-sm text-white/75">
                      Track what you’ve studied and what to review next.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <i className="fas fa-headphones-alt text-yellow-300"></i>
                      </div>
                      <div className="text-white font-semibold">Real usage</div>
                    </div>
                    <div className="mt-3 text-sm text-white/75">
                      Practice sentences and speaking-focused exercises.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
              <div className="text-white font-bold text-lg">Start confidently</div>
              <div className="mt-2 text-white/80 leading-relaxed">
                Clear steps from sign-up to your first lesson, with no clutter.
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
              <div className="text-white font-bold text-lg">Stay consistent</div>
              <div className="mt-2 text-white/80 leading-relaxed">
                Short practice sessions that are easy to maintain every day.
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6">
              <div className="text-white font-bold text-lg">Build fluency</div>
              <div className="mt-2 text-white/80 leading-relaxed">
                Exercises designed to help you think and respond faster.
              </div>
            </div>
          </div>

          <div className="mt-14 text-center text-sm text-white/70">
            By continuing, you agree to a learning experience built for clarity and progress.
          </div>
        </section>
      </main>
    </div>
  );
}
