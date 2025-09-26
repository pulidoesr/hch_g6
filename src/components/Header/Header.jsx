'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import HandcraftedIcon from "../../../src/components/Icons/HandcraftedIcon"

// Importe os ícones que você precisa.
// Ex: para instalar o heroicons: npm install @heroicons/react
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Collections', href: '/collections' },
  { name: 'Shop', href: '/shop' },
  { name: 'Profiles', href: '/profiles' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//<footer className="bg-[#2D3748] bg-brand-900 text-white py-[12px] px-[16px] md:px-[32px]">
  return (
    <header className="bg-[#2D3748] shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-[1280px] px-[5px]">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <HandcraftedIcon/>
              <span className="text-2xl font-bold text-white">Handcrafted Heaven</span>
            </Link>
          </div>

          {/* Input de busca */}
          <div className="flex-1 max-w-[576px] ml-4 hidden md:block relative">
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 px-[16px] py-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513] pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-[1.25rem] w-[1.25rem] text-gray-500" />
            </div>
          </div>

          {/* Menu principal (desktop) */}
          <div className="hidden md:flex items-center ml-[2rem] space-x-[2rem]">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-white hover:text-gray-300 transition-colors duration-200">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Botões do lado direito (visível em desktop) */}
          <div className="ml-[2rem] hidden md:flex items-center space-x-[1.5rem]">
            <button className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200">
              <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
              My Cart
            </button>
            <Link href="/profile">
              <UserCircleIcon className="h-[2rem] w-[2rem] text-white hover:text-gray-300 transition-colors duration-200" />
            </Link>
          </div>

          {/* Ícone de menu (mobile) */}
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

      {/* Menu responsivo para mobile (o slide-in) */}
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
          <div className="flex flex-col items-start px-8 py-4 space-y-4">
            <div className="w-full">
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-md border border-gray-300 px-[16px] py-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="w-full flex justify-between items-center pt-4">
              <button
                className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
                My Cart
              </button>
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <UserCircleIcon className="h-[2rem] w-[2rem] text-white hover:text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
