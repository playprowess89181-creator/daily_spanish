'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type UserFilters = {
  query: string;
  country: string;
  nativeLanguage: string;
  level: string;
  status: string;
};

type Option = { value: string; label: string };

type SearchFiltersProps = {
  filters: UserFilters;
  onChange: (next: Partial<UserFilters>) => void;
  countryOptions: string[];
  nativeLanguageOptions: string[];
  levelOptions: Option[];
  statusOptions: Option[];
  resultCount?: number;
};

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? '';
  }, [options, value]);

  return (
    <div ref={rootRef} className="relative">
      <div className="text-sm font-semibold text-gray-800 mb-2">{label}</div>
      <button
        type="button"
        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <div className={`min-w-0 truncate whitespace-nowrap ${selectedLabel ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedLabel || placeholder}
          </div>
          <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
          role="listbox"
        >
          <div className="max-h-64 overflow-auto py-1">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value || '__all'}
                  type="button"
                  className={`w-full px-3 py-2 text-sm font-semibold text-left flex items-center justify-between gap-3 ${
                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={active}
                >
                  <span className="min-w-0 truncate whitespace-nowrap">{opt.label}</span>
                  {active ? <i className="fas fa-check text-[var(--azul-ultramar)] text-xs"></i> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchFilters({
  filters,
  onChange,
  countryOptions,
  nativeLanguageOptions,
  levelOptions,
  statusOptions,
  resultCount,
}: SearchFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const derivedCountryOptions = useMemo<Option[]>(() => {
    const opts = countryOptions
      .map((c) => c.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return [{ value: '', label: 'All Countries' }, ...opts.map((c) => ({ value: c, label: c }))];
  }, [countryOptions]);

  const derivedNativeLanguageOptions = useMemo<Option[]>(() => {
    const opts = nativeLanguageOptions
      .map((c) => c.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return [{ value: '', label: 'All Languages' }, ...opts.map((c) => ({ value: c, label: c }))];
  }, [nativeLanguageOptions]);

  const activeFilterCount =
    Number(Boolean(filters.query.trim())) +
    Number(Boolean(filters.country)) +
    Number(Boolean(filters.nativeLanguage)) +
    Number(Boolean(filters.level)) +
    Number(Boolean(filters.status));

  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center flex-none">
                  <i className="fas fa-filter text-[var(--azul-ultramar)]"></i>
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-extrabold text-gray-900 tracking-tight truncate">Search & Filters</div>
                  <div className="text-sm font-semibold text-gray-600 truncate">
                    {typeof resultCount === 'number' ? `${resultCount} results` : 'Refine user list'}
                    {activeFilterCount ? ` · ${activeFilterCount} active` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="sm:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <i className={`fas ${mobileOpen ? 'fa-eye-slash' : 'fa-eye'} text-gray-500`}></i>
                {mobileOpen ? 'Hide' : 'Show'}
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={() =>
                  onChange({
                    query: '',
                    country: '',
                    nativeLanguage: '',
                    level: '',
                    status: '',
                  })
                }
              >
                <i className="fas fa-rotate-left text-gray-500"></i>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className={`${mobileOpen ? 'block' : 'hidden'} sm:block`}>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
              <div className="md:col-span-2 xl:col-span-5">
                <div className="text-sm font-semibold text-gray-800 mb-2">Search</div>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none"
                    placeholder="Name, email, or nickname…"
                    value={filters.query}
                    onChange={(e) => onChange({ query: e.target.value })}
                  />
                </div>
              </div>

              <div className="xl:col-span-2">
                <SelectField
                  label="Country"
                  value={filters.country}
                  options={derivedCountryOptions}
                  placeholder="All Countries"
                  onChange={(v) => onChange({ country: v })}
                />
              </div>

              <div className="xl:col-span-2">
                <SelectField
                  label="Native Language"
                  value={filters.nativeLanguage}
                  options={derivedNativeLanguageOptions}
                  placeholder="All Languages"
                  onChange={(v) => onChange({ nativeLanguage: v })}
                />
              </div>

              <div className="xl:col-span-2">
                <SelectField
                  label="Level"
                  value={filters.level}
                  options={[{ value: '', label: 'All Levels' }, ...levelOptions]}
                  placeholder="All Levels"
                  onChange={(v) => onChange({ level: v })}
                />
              </div>

              <div className="xl:col-span-1">
                <SelectField
                  label="Status"
                  value={filters.status}
                  options={[{ value: '', label: 'All' }, ...statusOptions]}
                  placeholder="All"
                  onChange={(v) => onChange({ status: v })}
                />
              </div>
            </div>

            {activeFilterCount ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.country ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800">
                    <span className="text-gray-500">Country</span>
                    {filters.country}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => onChange({ country: '' })}
                      aria-label="Clear country"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ) : null}
                {filters.nativeLanguage ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800">
                    <span className="text-gray-500">Native</span>
                    {filters.nativeLanguage}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => onChange({ nativeLanguage: '' })}
                      aria-label="Clear native language"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ) : null}
                {filters.level ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800">
                    <span className="text-gray-500">Level</span>
                    {filters.level}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => onChange({ level: '' })}
                      aria-label="Clear level"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ) : null}
                {filters.status ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800">
                    <span className="text-gray-500">Status</span>
                    {statusOptions.find((o) => o.value === filters.status)?.label ?? filters.status}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => onChange({ status: '' })}
                      aria-label="Clear status"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
