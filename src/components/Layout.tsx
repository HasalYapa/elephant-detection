import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Static Footer */}
      <footer className="bg-gray-800 text-white py-4 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} CiviWise - Smart Civil Engineering Platform for Sri Lanka</p>
        </div>
      </footer>
    </div>
  );
}
