import Link from 'next/link';
import HandcraftedIcon from "@/src/components/Icons/HandcraftedIcon"

// Importe os ícones que você precisar.
// Se você estiver usando @heroicons/react:
// import { } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-[#2D3748] bg-brand-900 text-white py-[12px] px-[16px] md:px-[32px]">
      <div className="mx-auto max-w-[1280px] flex flex-col md:flex-row justify-between items-start md:items-center space-y-[48px] md:space-y-0 pl-[10px] pr-[10px]">
        
        {/* Logo e Endereço */}
        <div className="flex flex-row items-center space-y-[16px] space-x-[10px]">
          {/* Logo - Usando o mesmo SVG do header para consistência */}
          <div className="flex items-center">
            <Link href="/">
              <HandcraftedIcon/>
            </Link>
          </div>
          
          {/* Endereço */}
          <address className="not-italic text-sm text-gray-400">
            <p>123 Craftsman Lane</p>
            <p>Artisan Village, CA 90210</p>
            <p>United States</p>
          </address>
        </div>
        
        {/* Redes Sociais */}
        <div className="flex flex-col items-start md:items-end">
          <span className="font-bold text-lg mb-[16px]">FIND US ON</span>
          <div className="flex flex-col space-y-4">
            {/* Facebook */}
            <Link href="https://www.facebook.com" className="text-white hover:text-gray-300 transition-colors duration-200 no-underline">
              <span className="flex items-center space-x-2">
                {/* Ícone do Facebook - SVG inline */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.583-1.333h2.417v-3.996h-3.251c-3.414 0-4.749 1.455-4.749 4.537v2.962z"/>
                </svg>
                <span className="text-sm">Facebook</span>
              </span>
            </Link>
            {/* X/Twitter */}
            <Link href="https://www.x.com" className="text-white hover:text-gray-300 transition-colors duration-200 no-underline">
              <span className="flex items-center space-x-2">
                {/* Ícone do Twitter - SVG inline */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.064 9.206c-1.637 1.549-3.447 2.766-5.368 3.655 0 .15-.008.315-.008.483 0 4.885-3.693 10.518-10.521 10.518-2.083 0-4.01-.611-5.635-1.662.36.042.723.064 1.096.064 2.155 0 4.137-.732 5.717-1.996-2.012-.04-3.715-1.353-4.321-3.15.281.054.567.081.86.081.42 0 .825-.054 1.21-.161-2.09-.448-3.665-2.25-3.665-4.492v-.058c.616.342 1.32.548 2.062.571-1.229-.821-2.037-2.227-2.037-3.803 0-.84.225-1.624.62-2.302 2.247 2.898 5.61 4.793 9.4 4.992-.068-.335-.118-.68-.118-1.034 0-2.505 2.033-4.538 4.538-4.538 1.309 0 2.488.552 3.317 1.439.996-.196 1.936-.566 2.788-1.066-.328 1.026-1.024 1.884-1.936 2.427.886-.105 1.724-.342 2.504-.685z"/>
                </svg>
                <span className="text-sm">X / Twitter</span>
              </span>
            </Link>
            {/* Instagram */}
            <Link href="https://www.instagram.com" className="text-white hover:text-gray-300 transition-colors duration-200 no-underline">
              <span className="flex items-center space-x-2">
                {/* Ícone do Instagram - SVG inline */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.414 1.554 4.562 4.562.058 1.265.068 1.645.068 4.854 0 3.204-.012 3.584-.07 4.85-.148 3.252-1.554 4.414-4.562 4.562-1.265.058-1.645.068-4.854.068-3.204 0-3.584-.012-4.85-.07c-3.252-.148-4.414-1.554-4.562-4.562-.058-1.265-.068-1.645-.068-4.854 0-3.204.012-3.584.07-4.85.148-3.252 1.554-4.414 4.562-4.562 1.265-.058 1.645-.068 4.854-.068zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.204-6.78 2.686-6.983 6.983-.059 1.281-.073 1.689-.073 4.947 0 3.259.014 3.667.072 4.947.204 4.358 2.686 6.78 6.983 6.983 1.281.059 1.689.073 4.947.073 3.259 0 3.667-.014 4.947-.072 4.358-.204 6.78-2.686 6.983-6.983.059-1.281.073-1.689.073-4.947 0-3.259-.014-3.667-.072-4.947-.204-4.358-2.686-6.78-6.983-6.983-1.281-.059-1.689-.073-4.947-.073zm0 5.838c-3.462 0-6.262 2.8-6.262 6.262s2.8 6.262 6.262 6.262 6.262-2.8 6.262-6.262-2.8-6.262-6.262-6.262zm0 10.32c-2.23 0-4.05-1.82-4.05-4.05s1.82-4.05 4.05-4.05 4.05 1.82 4.05 4.05-1.82 4.05-4.05 4.05zm6.807-9.447c-.743 0-1.343.6-1.343 1.343s.6 1.343 1.343 1.343 1.343-.6 1.343-1.343-.6-1.343-1.343-1.343z"/>
                </svg>
                <span className="text-sm">Instagram</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
