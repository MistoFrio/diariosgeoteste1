import React, { useEffect, useRef, useState } from 'react';
import { Search, Calendar, Clock, User, MapPin, FileText, Eye, Edit, Trash2, Download } from 'lucide-react';
import { WorkDiary } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { exportElementToPDF } from '../utils/pdf';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { downloadCsv, mapDiaryToCsvRow } from '../utils/csv';

// Tipagem local para exibição
type DiaryRow = WorkDiary;

interface DiariesListProps {
  onNewDiary: () => void;
}

export const DiariesList: React.FC<DiariesListProps> = ({ onNewDiary }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<DiaryRow | null>(null);
  const [rows, setRows] = useState<DiaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredDiaries = rows.filter((diary) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesQuery =
      term.length === 0 ||
      diary.clientName.toLowerCase().includes(term) ||
      diary.address.toLowerCase().includes(term) ||
      diary.servicesExecuted.toLowerCase().includes(term);

    // Datas no formato YYYY-MM-DD permitem comparação lexicográfica simples
    const d = diary.date;
    const afterStart = startDate ? d >= startDate : true;
    const beforeEnd = endDate ? d <= endDate : true;
    const withinRange = afterStart && beforeEnd;

    return matchesQuery && withinRange;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time;
  };

  const detailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchDiaries = async () => {
      if (!user) return;
      setLoading(true);
      setError('');

      // Se não houver Supabase, mantém tudo vazio
      if (!isSupabaseConfigured) {
        setRows([]);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Buscando diários para usuário:', user?.email, 'Role:', user?.role);
        
        let query = supabase
          .from('work_diaries')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        // Todos os usuários podem ver todos os diários
        console.log('📋 Query configurada para buscar todos os diários');

        // Filtros de data no servidor para reduzir payload
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        // Filtro textual básico no servidor (ilike OR)
        const term = searchTerm.trim();
        if (term) {
          const like = `%${term}%`;
          query = query.or(
            `client_name.ilike.${like},address.ilike.${like},services_executed.ilike.${like}`
          );
        }

        const { data, error } = await query;
        console.log('📊 Resultado da query:', { data: data?.length, error });
        if (error) {
          console.error('❌ Erro na query:', error);
          throw error;
        }

        // Buscar assinaturas dos usuários que criaram os diários
        const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, signature_image_url')
          .in('id', userIds);

        const profilesMap = new Map();
        (profilesData || []).forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });

        const mapped: DiaryRow[] = (data || []).map((r: any) => {
          const profile = profilesMap.get(r.user_id);
          return {
            id: r.id,
            clientId: r.user_id,
            clientName: r.client_name,
            address: r.address,
            team: r.team,
            date: r.date,
            startTime: r.start_time,
            endTime: r.end_time,
            servicesExecuted: r.services_executed,
            geotestSignature: r.geotest_signature,
            geotestSignatureImage: profile?.signature_image_url || '',
            responsibleSignature: r.responsible_signature,
            observations: r.observations || '',
            createdBy: profile?.name || user.name || '',
            createdAt: r.created_at,
          };
        });

        setRows(mapped);
      } catch (err: any) {
        setError('Não foi possível carregar os diários.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [user, startDate, endDate, searchTerm]);

  const handleExport = async () => {
    if (!detailsRef.current || !selectedDiary) return;
    const safeClient = selectedDiary.clientName.replace(/[^a-z0-9\-\_\s]/gi, '').replace(/\s+/g, '-');
    const fileName = `diario-${safeClient}-${selectedDiary.date}.pdf`;
    await exportElementToPDF(detailsRef.current, fileName, {
      title: `Diário de Obra • ${selectedDiary.clientName}`,
      logoUrl: '/logogeoteste.png',
      headerBgColor: '#ECFDF5',
      marginMm: 12,
    });
  };

  const handleExportCsvOne = () => {
    if (!selectedDiary) return;
    const safeClient = selectedDiary.clientName.replace(/[^a-z0-9\-\_\s]/gi, '').replace(/\s+/g, '-');
    const fileName = `diario-${safeClient}-${selectedDiary.date}.csv`;
    downloadCsv(fileName, [mapDiaryToCsvRow(selectedDiary)]);
  };

  if (selectedDiary) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-0">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedDiary(null)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Voltar à lista
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 sm:px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleExportCsvOne}
              className="bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Exportar para Excel (CSV)"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Diary Details */}
        <div ref={detailsRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Diário de Obra</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(selectedDiary.date)}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(selectedDiary.startTime)} - {formatTime(selectedDiary.endTime)}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {selectedDiary.createdBy}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cliente</label>
                <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.clientName}</p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Equipe</label>
                <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.team}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Endereço</label>
              <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Data</label>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedDiary.date)}</p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Início</label>
                <p className="text-gray-900 dark:text-gray-100">{formatTime(selectedDiary.startTime)}</p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Término</label>
                <p className="text-gray-900 dark:text-gray-100">{formatTime(selectedDiary.endTime)}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Serviços Executados</label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.servicesExecuted}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Assinatura Geoteste</label>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Responsável: <span className="font-medium text-gray-900 dark:text-white">{selectedDiary.geotestSignature}</span>
                  </p>
                  {selectedDiary.geotestSignatureImage && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Assinatura Digital:</p>
                      <div className="w-full h-40 bg-white rounded flex items-center justify-center">
                        <img
                          src={selectedDiary.geotestSignatureImage}
                          alt="Assinatura digital"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Assinatura Responsável da Obra</label>
                <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.responsibleSignature}</p>
              </div>
            </div>

            {selectedDiary.observations && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Observações</label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.observations}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 md:mb-8 px-1 sm:px-0 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Diários Geoteste
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
            Visualize todos os diários de obra da Geoteste
          </p>
        </div>
        
        <button
          onClick={onNewDiary}
          className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Novo Diário</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
            {/* Busca */}
            <div className="relative sm:col-span-2 lg:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, endereço ou serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Data inicial */}
            <div className="sm:col-span-1">
              <label htmlFor="date-start" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                De
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  id="date-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Data final */}
            <div className="sm:col-span-1">
              <label htmlFor="date-end" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Até
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  id="date-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="sm:col-span-2 lg:col-span-1 flex gap-2">
              <button
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:scale-105 transition-all duration-200"
                title="Limpar filtros"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Carregando diários...</div>
      )}

      {/* Diaries List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredDiaries.map((diary) => (
          <div key={diary.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">{diary.clientName}</h3>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full self-start hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200">
                      Finalizado
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-4 sm:gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      {formatDate(diary.date)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      {formatTime(diary.startTime)} - {formatTime(diary.endTime)}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{diary.createdBy}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2 mb-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">{diary.address}</p>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 line-clamp-2 break-words">{diary.servicesExecuted}</p>
                </div>
                
                <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                  <button
                    onClick={() => setSelectedDiary(diary)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  {user?.role === 'admin' && (
                    <>
                      <button
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredDiaries.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum diário encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece criando um novo diário de obra'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};