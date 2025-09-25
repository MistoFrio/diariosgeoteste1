import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface NewDiaryProps {
  onBack: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export const NewDiary: React.FC<NewDiaryProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    clientName: '',
    address: '',
    team: '',
    date: '',
    startTime: '',
    endTime: '',
    servicesExecuted: '',
    geotestSignatureImage: '',
    responsibleSignature: '',
    observations: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Carregar assinatura do usuário e buscar membros da equipe
  useEffect(() => {
    const loadUserData = async () => {
      if (!isSupabaseConfigured || !user) {
        setTeamMembers([]);
        return;
      }

      setLoadingTeam(true);
      try {
        // Buscar perfil do usuário com assinatura digital
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('signature_image_url')
          .eq('id', user.id)
          .single();

        if (!userError && userProfile) {
          setFormData(prev => ({
            ...prev,
            geotestSignatureImage: userProfile.signature_image_url || ''
          }));
        }

        // Buscar todos os usuários para formar a equipe
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .order('name');

        if (error) throw error;

        const members: TeamMember[] = (data || []).map((profile: any) => ({
          id: profile.id,
          name: profile.name || 'Usuário sem nome',
          email: profile.email || 'email@exemplo.com'
        }));

        setTeamMembers(members);
      } catch (err: any) {
        console.error('Erro ao carregar dados do usuário:', err);
        setTeamMembers([]);
      } finally {
        setLoadingTeam(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const getSelectedTeamNames = () => {
    return selectedTeamMembers
      .map(id => teamMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (!isSupabaseConfigured) {
        console.log('Diary saved (mock):', formData);
        setSuccess('Diário salvo (modo demonstração).');
        setIsSubmitting(false);
        onBack();
        return;
      }

      if (!user?.id) {
        setError('Usuário não autenticado. Faça login novamente.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        user_id: user.id,
        client_name: formData.clientName.trim(),
        address: formData.address.trim(),
        team: getSelectedTeamNames() || formData.team.trim(), // Usar nomes selecionados ou fallback para input manual
        date: formData.date, // yyyy-mm-dd
        start_time: formData.startTime,
        end_time: formData.endTime,
        services_executed: formData.servicesExecuted.trim(),
        geotest_signature: user?.name || 'Responsável Geoteste', // Usar nome do usuário como assinatura em texto
        geotest_signature_url: formData.geotestSignatureImage || null,
        responsible_signature: formData.responsibleSignature.trim(),
        observations: formData.observations.trim() || null,
      };

      const { error: insertError } = await supabase.from('work_diaries').insert(payload);
      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }

      setSuccess('Diário salvo com sucesso.');
      setIsSubmitting(false);
      onBack();
    } catch (err: any) {
      setError('Não foi possível salvar o diário.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-0">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg font-medium mb-2 sm:mb-3 md:mb-4 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Voltar</span>
        </button>
        
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Novo Diário de Obra</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">Registre os detalhes dos serviços executados</p>
          </div>
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              Informações Básicas
            </h2>
          </div>
          
          <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Equipe *
              </label>
              
              {loadingTeam ? (
                <div className="flex items-center justify-center py-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Carregando membros da equipe...</span>
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {/* Mostrar membros selecionados */}
                  {selectedTeamMembers.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        Membros selecionados ({selectedTeamMembers.length}):
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {getSelectedTeamNames()}
                      </p>
                    </div>
                  )}
                  
                  {/* Lista de membros disponíveis */}
                  <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950">
                    {teamMembers.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeamMembers.includes(member.id)}
                          onChange={() => handleTeamMemberToggle(member.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Removido input manual de membros */}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Nenhum usuário encontrado para montar a equipe.
                  </p>
                </div>
              )}
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Endereço *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Endereço completo da obra"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Data *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Início *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Término *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Serviços e Assinaturas</h2>
          </div>
          
          <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Serviços Executados *
              </label>
              <textarea
                value={formData.servicesExecuted}
                onChange={(e) => handleChange('servicesExecuted', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Descreva detalhadamente os serviços executados no dia..."
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Assinatura Geoteste *
                </label>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Responsável: <span className="font-medium text-gray-900 dark:text-white">{user?.name || 'Usuário'}</span>
                    </p>
                    {formData.geotestSignatureImage ? (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sua assinatura digital será incluída:</p>
                        <div className="w-full h-40 bg-white border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                          <img
                            src={formData.geotestSignatureImage}
                            alt="Assinatura digital"
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ⚠️ Você ainda não possui uma assinatura digital. 
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); window.location.href = '#profile'; }}
                            className="text-yellow-800 dark:text-yellow-200 underline ml-1"
                          >
                            Configure sua assinatura no perfil
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                  {formData.geotestSignatureImage && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Assinatura digital carregada automaticamente do seu perfil
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Assinatura Responsável da Obra *
                </label>
                <input
                  type="text"
                  value={formData.responsibleSignature}
                  onChange={(e) => handleChange('responsibleSignature', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do responsável pela obra"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Observações adicionais, condições do solo, intercorrências, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 md:space-x-4 py-4 sm:py-5 md:py-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:scale-105 transition-all duration-200"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{isSubmitting ? 'Salvando...' : 'Salvar Diário'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};