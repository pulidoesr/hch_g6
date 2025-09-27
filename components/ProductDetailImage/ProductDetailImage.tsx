import React, { useState } from 'react';
import Image from 'next/image';

// 1. Crie uma interface para tipar cada objeto de imagem.
//    Isso garante que cada item no array terá 'url' e 'alt'
interface ProductImage {
  url: string;
  alt: string;
}

// 2. Crie uma interface para as propriedades do componente.
//    Isso garante que a prop 'images' é um array de objetos 'ProductImage'.
interface ProductDetailImageProps {
  images: ProductImage[];
}

// 3. Aplique a interface ao componente.
//    Agora, o TypeScript sabe o tipo de 'images', resolvendo o aviso.
const ProductDetailImage = ({ images }: ProductDetailImageProps) => {
  // O estado inicial agora armazena um objeto do tipo ProductImage
  const [mainImage, setMainImage] = useState<ProductImage>(images[0]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Imagem principal */}
      <div style={{ position: 'relative', width: '600px', height: '600px' }}>
        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          layout="fill"
          objectFit="contain"
          priority={true}
        />

        {/* Thumbnails na parte inferior */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}>
          {/* O TypeScript agora infere os tipos de 'image' e 'index' */}
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(image)}
              style={{
                width: '100px',
                height: '100px',
                cursor: 'pointer',
                border: mainImage.url === image.url ? '2px solid blue' : '2px solid transparent',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={100}
                height={100}
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailImage;