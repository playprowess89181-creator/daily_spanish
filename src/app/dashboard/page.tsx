"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileNavbar from "../components/ProfileNavbar";
import { withAuth } from "../../lib/AuthContext";
import Notifications from "../components/tabs/Notifications";
import Receipts from "../components/tabs/Receipts";
import PasswordEmail from "../components/tabs/PasswordEmail";
import MyCourses from "../components/tabs/MyCourses";
import CourseHistory from "../components/tabs/CourseHistory";
import MyExams from "../components/tabs/MyExams";
import StudyDays from "../components/tabs/StudyDays";
import LevelReview from "../components/tabs/LevelReview";
import MyExercises from "../components/tabs/MyExercises";
import DigitalBooks from "../components/tabs/DigitalBooks";

function UserDashboard() {
  const [activeTab, setActiveTab] = useState("my-courses");
  const searchParams = useSearchParams();

  // Rendering is gated by withAuth; if unauthenticated, HOC will handle redirect.
  const tabs = useMemo(
    () => [
      { id: "my-courses", label: "Lessons", component: MyCourses },
      { id: "notifications", label: "Notifications", component: Notifications },
      { id: "receipts", label: "Receipts", component: Receipts },
      {
        id: "password-email",
        label: "Password & Email",
        component: PasswordEmail,
      },
      { id: "course-history", label: "Course History", component: CourseHistory },
      { id: "my-exams", label: "My Exams", component: MyExams },
      { id: "study-days", label: "Study Days", component: StudyDays },
      { id: "level-review", label: "Level Review", component: LevelReview },
      { id: "my-exercises", label: "My Exercises", component: MyExercises },
      { id: "digital-books", label: "Digital Books", component: DigitalBooks },
    ],
    []
  );

  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    if (!tabFromUrl) return;
    if (tabs.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, tabs]);

  const renderActiveTab = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component />;
    }
    return null;
  };

  return (
    <>
      <style jsx global>{`
        .exam-tab-button {
          background: rgba(255, 255, 255, 0.6);
          color: var(--azul-ultramar);
          border: 1px solid rgba(31, 58, 147, 0.2);
          transition: all 0.3s ease;
        }
        .exam-tab-button:hover {
          background: rgba(31, 58, 147, 0.1);
          border-color: var(--azul-ultramar);
        }
        .exam-tab-button.active {
          background: var(--amarillo-ocre);
          color: white;
          border-color: var(--amarillo-ocre);
        }
        @media (max-width: 1024px) {
          .profile-tabs-container {
            flex-direction: column;
          }
          .profile-tabs-sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
          }
          .profile-tabs-nav {
            flex-direction: row;
            overflow-x: auto;
            gap: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .profile-tabs-nav::-webkit-scrollbar {
            height: 4px;
          }
          .profile-tabs-nav::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 2px;
          }
          .profile-tabs-nav::-webkit-scrollbar-thumb {
            background: var(--amarillo-ocre);
            border-radius: 2px;
          }
          .tab-button {
            white-space: nowrap;
            min-width: fit-content;
          }
        }
        @media (max-width: 640px) {
          .profile-tabs-nav {
            gap: 0.25rem;
          }
          .tab-button {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      `}</style>

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #86C2A8 0%, #F4D0D0 50%, #F25A37 100%)",
        }}
      >
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <ProfileNavbar />

        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Main Dashboard */}
            <div className="glass-effect rounded-3xl shadow-2xl border border-white/20">
              <div className="flex profile-tabs-container">
                {/* Left Sidebar - Tab Navigation */}
                <div className="w-80 border-r border-gray-200 p-6 profile-tabs-sidebar">
                  <nav className="flex flex-col space-y-2 min-w-60 profile-tabs-nav">
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "my-courses" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("my-courses")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Lessons
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "notifications" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("notifications")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5"
                          />
                        </svg>
                        Notifications
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "receipts" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("receipts")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Receipts
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "password-email" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("password-email")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Password & Email
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "course-history" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("course-history")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Course History
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "my-exams" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("my-exams")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        My Exams
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "study-days" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("study-days")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Study Days
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "level-review" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("level-review")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Level Review
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "my-exercises" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("my-exercises")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        My Exercises
                      </span>
                    </button>
                    <button
                      className={`tab-button w-full px-4 py-3 rounded-lg font-medium text-sm text-left ${
                        activeTab === "digital-books" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("digital-books")}
                    >
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Digital Books
                      </span>
                    </button>
                  </nav>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-8">{renderActiveTab()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(UserDashboard);
