'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                CiviWise
              </Link>
            </div>
            <div className="md:hidden">
              {/* Mobile menu button - would be implemented with state */}
              <button className="text-white hover:text-gray-200 focus:outline-none">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="md:flex flex-col md:flex-row mt-3 md:mt-0 hidden">
            <Link
              href="/site-analyzer"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 ${isActive('/site-analyzer')}`}
            >
              Site Analyzer
            </Link>
            <Link
              href="/design-assistant"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 ${isActive('/design-assistant')}`}
            >
              Design Assistant
            </Link>
            <Link
              href="/climate-explorer"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 ${isActive('/climate-explorer')}`}
            >
              Climate Explorer
            </Link>
            <Link
              href="/code-helper"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 ${isActive('/code-helper')}`}
            >
              Code Helper
            </Link>
            <Link
              href="/map-dashboard"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 ${isActive('/map-dashboard')}`}
            >
              Map Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
