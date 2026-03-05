"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { withAdminAuth } from "../../../lib/AuthContext";
import LessonStatsCards from "./components/LessonStatsCards";
import LessonFilters from "./components/LessonFilters";
import type { LessonFiltersState } from "./components/LessonFilters";
import LessonsTable from "./components/LessonsTable";

function LessonsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<LessonFiltersState>({
    search: "",
    block: "",
    videoType: "",
    pdf: "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        activeItem="lessons"
      />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header
          title="Lesson Management"
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lessons</h2>
                <div className="text-sm text-gray-600">Create, update, and manage lesson media across levels.</div>
              </div>
              <Link
                href="/admin/lessons/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-95"
                style={{ backgroundColor: "var(--azul-ultramar)" }}
              >
                <i className="fas fa-plus"></i>
                Create Lesson
              </Link>
            </div>
            <LessonStatsCards />
            <LessonFilters
              value={filters}
              onChange={setFilters}
              onReset={() => setFilters({ search: "", block: "", videoType: "", pdf: "" })}
            />
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Lesson List</h3>
                  <div className="text-sm text-gray-600">Search and filter to find lessons quickly.</div>
                </div>
                <LessonsTable filters={filters} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(LessonsPage);
