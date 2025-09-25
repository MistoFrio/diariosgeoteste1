import React, { useState, useEffect } from 'react';
import { User, Save, Edit3, Check, X, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { SignaturePadFixed as SignaturePad } from './SignaturePadFixed';
import { saveSignatureToDatabase } from '../utils/signatureStorageFallback';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [signatureImage, setSignatureImage] = useState('');
  const [signatureImageUrl, setSignatureImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar assinatura do usuário
  useEffect(() => {
    const loadSignature = async () => {
      if (!isSupabaseConfigured || !user?.id) {
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('signature_image_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setSignatureImageUrl(data?.signature_image_url || '');
        // Se houver URL, carregar a imagem para preview
        if (data?.signature_image_url) {
          setSignatureImage(data.signature_image_url);
        }
      } catch (err: any) {
        console.error('Erro ao carregar assinatura:', err);
        setSignatureImageUrl('');
        setSignatureImage('');
      } finally {
        setLoading(false);
      }
    };

    loadSignature();
  }, [user]);

  const handleSave = async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setMessage({ type: 'success', text: 'Assinatura salva (modo demonstração)' });
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let newSignatureUrl = signatureImageUrl;

      // Se há uma nova assinatura digital, salvar no banco
      if (signatureImage && signatureImage !== signatureImageUrl) {
        // Se é uma data URL (nova assinatura), salvar no banco
        if (signatureImage.startsWith('data:')) {
          const savedUrl = await saveSignatureToDatabase(signatureImage, user.id);
          if (savedUrl) {
            newSignatureUrl = savedUrl;
          } else {
            throw new Error('Falha ao salvar assinatura');
          }
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          signature_image_url: newSignatureUrl || null
        })
        .eq('id', user.id);

      if (error) throw error;

      setSignatureImageUrl(newSignatureUrl);
      setMessage({ type: 'success', text: 'Assinatura salva com sucesso!' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erro ao salvar assinatura:', err);
      setMessage({ type: 'error', text: 'Erro ao salvar assinatura. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Recarregar assinatura original
    if (isSupabaseConfigured && user?.id) {
      supabase
        .from('profiles')
        .select('signature_image_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setSignatureImageUrl(data?.signature_image_url || '');
          if (data?.signature_image_url) {
            setSignatureImage(data.signature_image_url);
          } else {
            setSignatureImage('');
          }
        });
    }
    setIsEditing(false);
    setShowSignaturePad(false);
    setMessage(null);
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignatureImage(signatureData);
    setShowSignaturePad(false);
    setMessage({ type: 'success', text: 'Assinatura digital capturada! Agora salve as alterações.' });
  };

  const handleSignatureCancel = () => {
    setShowSignaturePad(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gerencie suas informações pessoais e assinatura digital
        </p>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações Pessoais</h2>
        </div>
        
        <div className="p-5 sm:p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full mt-1">
                {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assinatura Digital */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assinatura Digital</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Desenhe sua assinatura na mesa digital. Ela será usada automaticamente nos diários que você criar.
          </p>
        </div>
        
        <div className="p-5 sm:p-6">
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Exibir assinatura atual */}
            {signatureImage && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Assinatura atual:</p>
                <img 
                  src={signatureImage} 
                  alt="Assinatura digital" 
                  className="max-w-full h-20 object-contain border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                {!showSignaturePad ? (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Desenhar Assinatura</span>
                    </button>
                    {signatureImage && (
                      <button
                        onClick={() => setSignatureImage('')}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <SignaturePad
                    onSave={handleSignatureSave}
                    onCancel={handleSignatureCancel}
                    initialSignature={signatureImage}
                  />
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Assinatura</span>
                </button>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Como funciona
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Quando você criar um novo diário de obra, o campo "Assinatura Geoteste" será preenchido automaticamente com sua assinatura digital. Você ainda pode editá-la se necessário.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
