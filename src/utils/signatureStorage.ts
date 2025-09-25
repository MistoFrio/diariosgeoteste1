import { supabase } from '../lib/supabaseClient';

// Função para comprimir a imagem da assinatura
export const compressSignatureImage = (dataUrl: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Redimensionar para tamanho otimizado (máximo 400px de largura)
      const maxWidth = 400;
      const maxHeight = 150;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Converter para JPEG com qualidade otimizada
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = dataUrl;
  });
};

// Função para fazer upload da assinatura para o Supabase Storage
export const uploadSignatureToStorage = async (
  signatureDataUrl: string, 
  userId: string
): Promise<string | null> => {
  try {
    // Comprimir a imagem
    const compressedImage = await compressSignatureImage(signatureDataUrl, 0.7);
    
    // Converter data URL para blob
    const response = await fetch(compressedImage);
    const blob = await response.blob();
    
    // Gerar nome único para o arquivo (caminho mais simples)
    const fileName = `${userId}_${Date.now()}_signature.jpg`;
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Permitir sobrescrever
      });
    
    if (error) {
      console.error('Erro ao fazer upload da assinatura:', error);
      return null;
    }
    
    // Retornar URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return null;
  }
};

// Função para deletar assinatura antiga do storage
export const deleteOldSignature = async (oldUrl: string): Promise<void> => {
  try {
    // Extrair o nome do arquivo da URL
    const urlParts = oldUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    await supabase.storage
      .from('signatures')
      .remove([fileName]);
  } catch (error) {
    console.error('Erro ao deletar assinatura antiga:', error);
  }
};

// Função para obter URL da assinatura do usuário
export const getUserSignatureUrl = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('signature_image_url')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.signature_image_url || null;
  } catch (error) {
    console.error('Erro ao buscar URL da assinatura:', error);
    return null;
  }
};
