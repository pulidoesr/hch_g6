'use client';

import { useState } from 'react';
import HandcraftedIcon from "@/components/Icons/HandcraftedIcon"
// Replacement for 'next/link' to ensure execution in the environment (uses standard <a> tag)
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';



// Simplified Link component to replace next/link. Added optional props (?) to fix TypeScript error.
const Link = ({ href, children, className, onClick }: {
    href: string;
    children: any;
    className?: string; // Made optional
    onClick?: () => void; // Made optional
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);


const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Collections', href: '/collections' },
  { name: 'Shop', href: '/shop' },
  {name: 'Seller', href: '/seller'},
  { name: 'Profile', href: '/profile' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#2D3748] shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-[1280px] px-[5px]">
        <div className="flex justify-between items-center py-4 md:py-6">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <HandcraftedIcon/>
              <span className="text-base lg:text-2xl font-bold text-white">Handcrafted Heaven</span>
            </Link>
          </div>

          {/* Main Menu (Desktop) */}
          <div className="hidden md:flex items-center ml-[2rem] space-x-[2rem]">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-white hover:text-gray-300 transition-colors duration-200">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right-side Buttons (Visible on desktop) */}
          <div className="ml-[2rem] hidden md:flex items-center space-x-[1.5rem]">
            
            {/* 1. My Cart (Desktop) */}
            <Link 
              href="/cart"
              className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200"
            >
              <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
              My Cart
            </Link>
            
            <Link href="/profile">
              <UserCircleIcon className="h-[2rem] w-[2rem] text-white hover:text-gray-300 transition-colors duration-200" />
            </Link>
          </div>

          {/* 2. Menu Icon (Mobile) - OPENS THE SIDE MENU */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B4513] rounded-md p-2"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-[1.5rem] w-[1.5rem]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Responsive Menu for Mobile (Slide-in) */}
      <div
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="absolute inset-0 bg-[#2D3748] shadow-xl">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-[2rem] w-[2rem]" />
            </button>
          </div>
          <div className="flex flex-col items-start px-8 py-4 space-y-4 w-full"> {/* Added w-full */}
        

            {/* NEW: Navigation Links (Mobile) */}
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    // Added to close the menu upon navigation
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-2xl font-semibold text-white hover:text-[#A0522D] transition-colors duration-200 w-full py-2 border-b border-gray-700"
                >
                    {item.name}
                </Link>
            ))}

            {/* Cart and Profile Links (Moved to bottom and adjusted) */}
            <div className="w-full flex justify-between items-center pt-4 border-t border-gray-700">
              
              {/* 3. My Cart (Mobile) */}
              <Link
                href="/cart"
                className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
                My Cart
              </Link>
              
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <UserCircleIcon className="h-[2.5rem] w-[2.5rem] text-white hover:text-gray-300" /> {/* Increased icon size */}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
