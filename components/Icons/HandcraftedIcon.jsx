import React from 'react';

/**
 * Componente de ícone  para representar itens artesanais.

 * @param {object} props - Propriedades do componente.
 * @param {string} [props.className="w-16 h-16 text-white"] - Classes do Tailwind para estilização.
 */
const HandcraftedIcon = ({ className = "w-14 h-14 md:w-20 md:h-20 text-white" }) => {
  return (
    <img src="/logo.png" alt="Handcrafted Logo" style={{ padding: "4px" }} className = {className} />

  );
};

export default HandcraftedIcon;