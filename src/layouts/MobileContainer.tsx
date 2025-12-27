import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string; // Allow custom styles if needed
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children, className = '' }) => {
  return (
    // Outer: Handles the desktop centering and gray background
    <div className="min-h-screen bg-white md:bg-gray-50 md:flex md:items-center md:justify-center md:p-4 font-sans">
      
      {/* Inner: The Mobile "Screen" */}
      <div className={`w-full max-w-md bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-100 overflow-hidden flex flex-col min-h-screen md:min-h-0 ${className}`}>
        {children}
      </div>
    </div>
  );
};