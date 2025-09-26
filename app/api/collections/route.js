// src/app/api/products/route.js
import fsPromises from 'fs/promises';
import path from 'path';

// A função GET responde a requisições GET
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/collections.json');
   
    
    const jsonData = await fsPromises.readFile(filePath, 'utf-8');
    const objectData = JSON.parse(jsonData);

    // Retorna a resposta JSON usando a nova API Response do Next.js
    return new Response(JSON.stringify(objectData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Failed to read products.json', error);
    return new Response(JSON.stringify({ error: 'Failed to load data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}