// lib/server/actions/product-actions.ts
'use server';

import { auth } from "@/auth";
import { handleProductCreation } from './data-loader';

// Tipagem de dados que o cliente envia
type ClientProductData = {
    title: string;
    price: number;
    description: string;
};

// Tipo de retorno consistente
type ActionResponse = { success: boolean, message: string };


/**
 * Server Action que recebe dados do formulário, autentica o usuário
 * e chama a função de persistência (handleProductCreation).
 */
export async function createProductAction(data: ClientProductData): Promise<ActionResponse> {
    
    // 1. AUTENTICAÇÃO E OBTENÇÃO DO SELLER ID (Feito no Servidor)
    const session = await auth();
    const sellerId = (session?.user as any)?.sellerId;
    
    if (!sellerId) {
        return { success: false, message: "Acesso negado. Usuário não logado ou Seller ID não encontrado." };
    }

    // 2. CONSTRUÇÃO DO OBJETO COMPLETO PARA O PRÓXIMO PASSO
    const dataToSend = {
        sellerId: sellerId,
        title: data.title,
        price: data.price,
        description: data.description,
    };
    
    // 3. CHAMADA À LÓGICA DE PERSISTÊNCIA NO BD
    try {
        // handleProductCreation agora recebe os dados já com o sellerId injetado
        const result = await handleProductCreation(dataToSend);
        return result;
    } catch (error) {
        console.error("Erro na Server Action de criação de produto:", error);
        return { success: false, message: "Erro interno no servidor ao processar a requisição." };
    }
}