'use client';

import { useState } from 'react';
import Link from 'next/link'; // Importante para navegação
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import HandcraftedIcon from "../Icons/HandcraftedIcon"

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
              <span className="text-2xl font-bold text-white">Handcrafted Heaven</span>
            </Link>
          </div>

          {/* Input de busca (Desktop) */}
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
            
            {/* 1. My Cart (Desktop) - AGORA USANDO LINK PARA NAVEGAR */}
            <Link 
              href="/cart" // <-- DESTINO: Página do carrinho
              className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200"
            >
              <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
              My Cart
            </Link>
            
            <Link href="/profile">
              <UserCircleIcon className="h-[2rem] w-[2rem] text-white hover:text-gray-300 transition-colors duration-200" />
            </Link>
          </div>

          {/* 2. Ícone de menu (mobile) - ABRE O MENU LATERAL */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)} // <-- CORRETO: Abre o menu mobile
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
            {/* ... Conteúdo do Menu (Search, NavItems) ... */}
            
            <div className="w-full flex justify-between items-center pt-4">
              
              {/* 3. My Cart (Mobile) - AGORA USA LINK E FECHA O MENU */}
              <Link
                href="/cart" // <-- DESTINO: Página do carrinho
                className="flex items-center bg-[#8B4513] text-white px-[16px] py-[8px] rounded-md hover:bg-[#A0522D] transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)} // <-- Fecha o menu ao clicar
              >
                <ShoppingBagIcon className="h-[1.25rem] w-[1.25rem] mr-2" />
                My Cart
              </Link>
              
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