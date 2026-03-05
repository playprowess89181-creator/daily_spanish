'use client';

export type LessonFiltersState = {
  search: string;
  block: '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  videoType: '' | 'upload' | 'link';
  pdf: '' | 'any' | 'lesson' | 'keys' | 'none';
};

export default function LessonFilters(props: {
  value: LessonFiltersState;
  onChange: (next: LessonFiltersState) => void;
  onReset: () => void;
}) {
  const { value, onChange, onReset } = props;
  return (
    <div className="bg-white text-gray-900 shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                value={value.search}
                onChange={(e) => onChange({ ...value, search: e.target.value })}
                placeholder="Search by lesson id..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value.block}
              onChange={(e) => onChange({ ...value, block: e.target.value as LessonFiltersState['block'] })}
            >
              <option value="">All Levels</option>
              <option value="A1">A1 – Beginner</option>
              <option value="A2">A2 – Basic</option>
              <option value="B1">B1 – Intermediate</option>
              <option value="B2">B2 – Upper Intermediate</option>
              <option value="C1">C1 – Advanced</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Video</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value.videoType}
              onChange={(e) => onChange({ ...value, videoType: e.target.value as LessonFiltersState['videoType'] })}
            >
              <option value="">All</option>
              <option value="upload">Uploaded</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">PDFs</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value.pdf}
              onChange={(e) => onChange({ ...value, pdf: e.target.value as LessonFiltersState['pdf'] })}
            >
              <option value="">All</option>
              <option value="any">Any PDF</option>
              <option value="lesson">Lesson PDF</option>
              <option value="keys">Keys PDF</option>
              <option value="none">No PDFs</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
