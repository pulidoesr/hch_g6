// lib/server/data-loader-for-actions.ts
'use server'; 
import { createProduct } from "@/lib/db";
// Simulação do tipo de produto que você espera
type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrls: string[];
};

type ProductData = {
    sellerId: string; // Adicionado para atender ao requisito do createProduct
    title: string;
    price: number;
    description: string;
};

export async function handleProductCreation(data: ProductData): Promise<{ success: boolean, message: string }> {
    console.log(`[SERVER ACTION] Recebida requisição para criar produto: ${data.title}`);

    // 1. **VALIDAÇÃO BÁSICA**:
    if (!data.sellerId || !data.title || data.price <= 0) {
        return { success: false, message: "Dados do produto (Seller ID, Título, Preço) são obrigatórios." };
    }

    // 2. **CONVERSÃO PARA FormData**:
    // A função createProduct espera FormData, então precisamos criá-lo e preenchê-lo.
    const formData = new FormData();
    
    // O price_dollars deve ser uma string decimal no FormData.
    const priceDollarsString = data.price.toFixed(2); 

    // Anexando todos os campos requeridos por createProduct
    formData.append('seller_id', data.sellerId);
    formData.append('title', data.title);
    formData.append('description', data.description || ''); // Garante que description não seja null/undefined
    formData.append('price_dollars', priceDollarsString);

    // 3. **CHAMADA À FUNÇÃO DE PERSISTÊNCIA**:
    try {
        const result = await createProduct(formData);
        
        if (result.success) {
            console.log(`[SERVER ACTION] Produto ${result.productId} criado com sucesso.`);
            return { success: true, message: `Produto criado com sucesso! ID: ${result.productId}` };
        } else {
            // Repassa o erro gerado por createProduct
            return { success: false, message: result.error || "Falha desconhecida ao criar produto." };
        }
    } catch (error) {
        console.error("Erro na criação do produto:", error);
        return { success: false, message: "Erro interno no servidor durante a criação do produto." };
    }
}


export async function updateProduct(updatedProduct: Product): Promise<{ success: boolean, message: string }> {
    // 1. **AUTENTICAÇÃO**: Verificar se o usuário está logado e tem permissão (ex: usar auth()).
    
    console.log(`[SERVER ACTION] Recebida requisição para salvar o produto: ${updatedProduct.id}`);
    
    // 2. **VALIDAÇÃO**: Garantir que os dados são válidos.
    if (!updatedProduct.name || updatedProduct.price <= 0) {
        return { success: false, message: "Dados do produto inválidos." };
    }
    
    // 3. **LÓGICA DE PERSISTÊNCIA (Simulada)**
    // Aqui você faria a chamada real ao banco de dados (e.g., Prisma, Supabase, etc.)
    
    // Simulação de sucesso após 500ms
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    console.log(`[SERVER ACTION] Produto ${updatedProduct.id} atualizado com sucesso no DB (Simulação).`);

    // 4. Retorno
    return { success: true, message: `Produto ${updatedProduct.id} salvo com sucesso.` };
}