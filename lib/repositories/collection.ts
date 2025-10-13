// lib/repositories/products.ts
import { q } from "@/lib/db";
import { Collection } from "../types/product-data";


export async function getCollections(): Promise<Collection[]> {
  const rows = await q<{
    id: number;
    name: string | null;
    isFeatured: boolean; 
    story: string | null;
    imagePath: string | null;
    
    // Tipagem para string[]
    productIds: string[] | null; 
    recommendedProductIds: string[] | null; 
  }>`
    SELECT
        c.id,
        c.name,
        c.is_featured AS "isFeatured",
        c.story,
        c.image_path AS "imagePath",
        
        -- 1. AGREGAÇÃO para productIds (TODOS os produtos da coleção)
        COALESCE(
            ARRAY_AGG(cp.product_id::TEXT) FILTER (WHERE cp.product_id IS NOT NULL), 
            '{}'::TEXT[]
        ) AS "productIds", 

        -- 2. AGREGAÇÃO para recommendedProductIds
        COALESCE(
            -- Filtra APENAS os produtos que pertencem à coleção (pela cp) E 
            -- que tenham o campo 'recommended_product' TRUE na tabela 'products'
            ARRAY_AGG(p.id::TEXT) FILTER (
                WHERE 
                    p.recommended_product = TRUE AND p.id IS NOT NULL 
            ), 
            '{}'::TEXT[]
        ) AS "recommendedProductIds"
        
    FROM
        collections c
    LEFT JOIN
        collection_products cp ON c.id = cp.collection_id
    -- NOVO JOIN: Junta com a tabela de produtos para acessar o campo 'recommended_product'
    LEFT JOIN 
        products p ON cp.product_id = p.id
        
    GROUP BY
        -- Manter no GROUP BY todas as colunas não-agregadas
        c.id, c.name, c.is_featured, c.story, c.image_path
    ORDER BY
        c.id;
  `;

  return rows.map((row) => {
    return {
      id: row.id,
      name: row.name ?? "",
      isFeatured: row.isFeatured ?? false, 
      story: row.story ?? "",
      imagePath: row.imagePath ?? "",
      
      productIds: row.productIds ?? [], 
      recommendedProductIds: row.recommendedProductIds ??[] 
    };
  });
}