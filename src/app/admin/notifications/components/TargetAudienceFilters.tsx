'use client';

import { useState } from 'react';

export default function TargetAudienceFilters() {
  const [genderFilters, setGenderFilters] = useState({
    all: true,
    male: false,
    female: false,
    other: false
  });

  const [levelFilters, setLevelFilters] = useState({
    all: true,
    beginner: false,
    elementary: false,
    intermediate: false,
    upperIntermediate: false,
    advanced: false
  });

  const countries = [
    'All Countries',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'Spain',
    'France'
  ];

  const handleGenderChange = (key: string) => {
    if (key === 'all') {
      setGenderFilters({
        all: true,
        male: false,
        female: false,
        other: false
      });
    } else {
      setGenderFilters(prev => ({
        ...prev,
        all: false,
        [key]: !prev[key as keyof typeof prev]
      }));
    }
  };

  const handleLevelChange = (key: string) => {
    if (key === 'all') {
      setLevelFilters({
        all: true,
        beginner: false,
        elementary: false,
        intermediate: false,
        upperIntermediate: false,
        advanced: false
      });
    } else {
      setLevelFilters(prev => ({
        ...prev,
        all: false,
        [key]: !prev[key as keyof typeof prev]
      }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
      
      {/* Age Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="number" 
            placeholder="Min age" 
            className="px-3 py-2 border border-gray-300 rounded-md"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--azul-ultramar)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
              e.target.style.boxShadow = '';
            }}
          />
          <input 
            type="number" 
            placeholder="Max age" 
            className="px-3 py-2 border border-gray-300 rounded-md"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--azul-ultramar)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
              e.target.style.boxShadow = '';
            }}
          />
        </div>
      </div>

      {/* Gender Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={genderFilters.all}
              onChange={() => handleGenderChange('all')}
              className="rounded border-gray-300 focus:ring-2" 
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">All</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={genderFilters.male}
              onChange={() => handleGenderChange('male')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Male</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={genderFilters.female}
              onChange={() => handleGenderChange('female')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Female</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={genderFilters.other}
              onChange={() => handleGenderChange('other')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Other</span>
          </label>
        </div>
      </div>

      {/* Country Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
        <select 
          multiple 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          size={4}
          defaultValue={[countries[0]]}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--azul-ultramar)';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '';
            e.target.style.boxShadow = '';
          }}
        >
          {countries.map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* Registration Date Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
        <div className="grid grid-cols-1 gap-2">
          <input 
            type="date" 
            placeholder="From" 
            className="px-3 py-2 border border-gray-300 rounded-md"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--azul-ultramar)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
              e.target.style.boxShadow = '';
            }}
          />
          <input 
            type="date" 
            placeholder="To" 
            className="px-3 py-2 border border-gray-300 rounded-md"
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--azul-ultramar)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
              e.target.style.boxShadow = '';
            }}
          />
        </div>
      </div>

      {/* User Level Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">User Level</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.all}
              onChange={() => handleLevelChange('all')}
              className="rounded border-gray-300 focus:ring-2" 
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">All Levels</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.beginner}
              onChange={() => handleLevelChange('beginner')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Beginner</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.elementary}
              onChange={() => handleLevelChange('elementary')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Elementary</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.intermediate}
              onChange={() => handleLevelChange('intermediate')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Intermediate</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.upperIntermediate}
              onChange={() => handleLevelChange('upperIntermediate')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Upper-Intermediate</span>
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={levelFilters.advanced}
              onChange={() => handleLevelChange('advanced')}
              className="rounded border-gray-300 focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Advanced</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Estimated Recipients:</div>
        <div className="text-2xl font-bold text-ultramarine">8,432</div>
      </div>
    </div>
  );
}