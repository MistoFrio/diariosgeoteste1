import { supabase } from '../lib/supabaseClient';

// Função para comprimir a imagem da assinatura (versão otimizada)
export const compressSignatureImage = (dataUrl: string, quality: number = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Redimensionar para tamanho otimizado (máximo 300px de largura)
      const maxWidth = 300;
      const maxHeight = 120;
      
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

// Função para salvar assinatura diretamente no banco (fallback)
export const saveSignatureToDatabase = async (
  signatureDataUrl: string, 
  userId: string
): Promise<string | null> => {
  try {
    // Comprimir a imagem para reduzir tamanho
    const compressedImage = await compressSignatureImage(signatureDataUrl, 0.5);
    
    // Salvar diretamente no banco como base64 comprimido
    const { error } = await supabase
      .from('profiles')
      .update({ 
        signature_image_url: compressedImage
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Erro ao salvar assinatura no banco:', error);
      return null;
    }
    
    return compressedImage;
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return null;
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
