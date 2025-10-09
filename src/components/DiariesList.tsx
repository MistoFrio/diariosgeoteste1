import React, { useEffect, useRef, useState } from 'react';
import { Search, Calendar, Clock, User, MapPin, FileText, Eye, Edit, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { WorkDiary } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { exportElementToPDF } from '../utils/pdf';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { downloadCsv, mapDiaryToCsvRow } from '../utils/csv';
import { downloadExcel, mapDiaryToExcelRow } from '../utils/excel';

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
  const [clientFilter, setClientFilter] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<DiaryRow | null>(null);
  const [rows, setRows] = useState<DiaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pceDetail, setPceDetail] = useState<any | null>(null);
  const [pcePiles, setPcePiles] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pitDetail, setPitDetail] = useState<any | null>(null);
  const [pitPiles, setPitPiles] = useState<any[]>([]);
  const [placaDetail, setPlacaDetail] = useState<any | null>(null);
  const [placaPiles, setPlacaPiles] = useState<any[]>([]);

  const filteredDiaries = rows.filter((diary) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesQuery =
      term.length === 0 ||
      diary.clientName.toLowerCase().includes(term) ||
      diary.address.toLowerCase().includes(term) ||
      diary.servicesExecuted.toLowerCase().includes(term);

    // Filtro de cliente
    const matchesClient = clientFilter === '' || diary.clientName === clientFilter;

    // Datas no formato YYYY-MM-DD permitem comparação lexicográfica simples
    const d = diary.date;
    const afterStart = startDate ? d >= startDate : true;
    const beforeEnd = endDate ? d <= endDate : true;
    const withinRange = afterStart && beforeEnd;

    return matchesQuery && matchesClient && withinRange;
  });

  // Lista única de clientes para o filtro
  const uniqueClients = Array.from(new Set(rows.map(d => d.clientName))).sort();

  // Função para exportar para Excel
  const handleExportExcel = () => {
    if (filteredDiaries.length === 0) {
      alert('Não há diários para exportar com os filtros aplicados');
      return;
    }

    const excelRows = filteredDiaries.map(mapDiaryToExcelRow);
    const fileName = `Diarios_${new Date().toISOString().split('T')[0]}`;
    downloadExcel(fileName, excelRows);
  };

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

        // Detectar tipo pelo relacionamento (fallback caso diary_type esteja vazio)
        const diaryIds = (data || []).map((r: any) => r.id);
        let pceByDiary = new Set<string>();
        let pitByDiary = new Set<string>();
        let placaByDiary = new Set<string>();
        try {
          if (diaryIds.length > 0) {
            const [{ data: pceList }, { data: pitList }, { data: placaList }] = await Promise.all([
              supabase.from('work_diaries_pce').select('diary_id').in('diary_id', diaryIds),
              supabase.from('work_diaries_pit').select('diary_id').in('diary_id', diaryIds),
              supabase.from('work_diaries_placa').select('diary_id').in('diary_id', diaryIds),
            ]);
            pceByDiary = new Set((pceList || []).map((x: any) => x.diary_id));
            pitByDiary = new Set((pitList || []).map((x: any) => x.diary_id));
            placaByDiary = new Set((placaList || []).map((x: any) => x.diary_id));
          }
        } catch (relErr) {
          console.warn('Não foi possível detectar tipos pelos relacionamentos:', relErr);
        }

        const mapped: DiaryRow[] = (data || []).map((r: any) => {
          const profile = profilesMap.get(r.user_id);
          let inferredType: string | undefined = r.diary_type || undefined;
          if (!inferredType) {
            if (placaByDiary.has(r.id)) inferredType = 'PLACA';
            else if (pitByDiary.has(r.id)) inferredType = 'PIT';
            else if (pceByDiary.has(r.id)) inferredType = 'PCE';
          }
          return {
            id: r.id,
            clientId: r.user_id,
            clientName: r.client_name,
            address: r.address,
            enderecoDetalhado: r.endereco_detalhado || undefined,
            team: r.team,
            type: inferredType as any,
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

        // Garantir ordenação: mais recente no topo (createdAt desc, fallback date desc)
        mapped.sort((a: any, b: any) => {
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (aCreated !== bCreated) return bCreated - aCreated;
          const aDate = a.date ? new Date(a.date).getTime() : 0;
          const bDate = b.date ? new Date(b.date).getTime() : 0;
          return bDate - aDate;
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

  // Carregar dados específicos (PCE, PIT, PLACA) quando abrir um diário
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedDiary || !isSupabaseConfigured) {
        setPceDetail(null);
        setPcePiles([]);
        setPitDetail(null);
        setPitPiles([]);
        setPlacaDetail(null);
        setPlacaPiles([]);
        return;
      }
      setLoadingDetail(true);
      try {
        // Buscar PCE por diary_id
        const { data: pce, error: pceErr } = await supabase
          .from('work_diaries_pce')
          .select('id, ensaio_tipo, carregamento_tipos, equipamentos_macaco, equipamentos_celula, equipamentos_manometro, equipamentos_relogios, equipamentos_conjunto_vigas, ocorrencias, cravacao_equipamento, cravacao_horimetro, abastecimento_mobilizacao_litros_tanque, abastecimento_mobilizacao_litros_galao, abastecimento_finaldia_litros_tanque, abastecimento_finaldia_litros_galao, abastecimento_chegou_diesel, abastecimento_fornecido_por, abastecimento_quantidade_litros, abastecimento_horario_chegada')
          .eq('diary_id', selectedDiary.id)
          .maybeSingle();
        if (pceErr) throw pceErr;
        setPceDetail(pce || null);

        if (pce?.id) {
          const { data: piles, error: pilesErr } = await supabase
            .from('work_diaries_pce_piles')
            .select('id, ordem, estaca_nome, estaca_profundidade_m, estaca_tipo, estaca_carga_trabalho_tf, estaca_diametro_cm')
            .eq('pce_id', pce.id)
            .order('ordem', { ascending: true });
          if (pilesErr) throw pilesErr;
          setPcePiles(piles || []);
        } else {
          setPcePiles([]);
        }

        // Buscar PIT por diary_id
        const { data: pit, error: pitErr } = await supabase
          .from('work_diaries_pit')
          .select('id, equipamento, ocorrencias, total_estacas')
          .eq('diary_id', selectedDiary.id)
          .maybeSingle();
        if (pitErr) throw pitErr;
        setPitDetail(pit || null);
        if (pit?.id) {
          const { data: pPiles, error: pPilesErr } = await supabase
            .from('work_diaries_pit_piles')
            .select('id, ordem, estaca_nome, estaca_tipo, diametro_cm, profundidade_cm, arrasamento_m, comprimento_util_m')
            .eq('pit_id', pit.id)
            .order('ordem', { ascending: true });
          if (pPilesErr) throw pPilesErr;
          setPitPiles(pPiles || []);
        } else {
          setPitPiles([]);
        }

        // Buscar PLACA por diary_id (apenas se for tipo PLACA)
        if (selectedDiary.type === 'PLACA') {
          const { data: placa, error: placaErr } = await supabase
            .from('work_diaries_placa')
            .select('id, equipamentos_macaco, equipamentos_celula_carga, equipamentos_manometro, equipamentos_placa_dimensoes, equipamentos_equipamento_reacao, equipamentos_relogios, ocorrencias')
            .eq('diary_id', selectedDiary.id)
            .maybeSingle();
          if (placaErr) throw placaErr;
          setPlacaDetail(placa || null);
          if (placa?.id) {
            const { data: placaTestPoints, error: placaTestPointsErr } = await supabase
              .from('work_diaries_placa_piles')
              .select('id, ordem, nome, carga_trabalho_1_kgf_cm2, carga_trabalho_2_kgf_cm2')
              .eq('placa_id', placa.id)
              .order('ordem', { ascending: true });
            if (placaTestPointsErr) throw placaTestPointsErr;
            setPlacaPiles(placaTestPoints || []);
          } else {
            setPlacaPiles([]);
          }
        } else {
          setPlacaDetail(null);
          setPlacaPiles([]);
        }
      } catch (e: any) {
        console.error('Erro ao carregar detalhes do diário:', e);
        setPceDetail(null);
        setPcePiles([]);
        setPitDetail(null);
        setPitPiles([]);
        setPlacaDetail(null);
        setPlacaPiles([]);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedDiary]);

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

  const handleDeleteDiary = async (diary: DiaryRow) => {
    if (!isSupabaseConfigured) {
      alert('Supabase não está configurado.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o diário de "${diary.clientName}" do dia ${formatDate(diary.date)}?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Excluindo diário:', diary.id);

      // Deletar registros relacionados primeiro (devido às foreign keys)
      if (diary.type === 'PCE') {
        // Buscar o ID do registro PCE
        const { data: pceData } = await supabase
          .from('work_diaries_pce')
          .select('id')
          .eq('diary_id', diary.id)
          .maybeSingle();
        
        if (pceData?.id) {
          // Deletar as estacas do PCE primeiro
          await supabase.from('work_diaries_pce_piles').delete().eq('pce_id', pceData.id);
          // Deletar o registro PCE
          await supabase.from('work_diaries_pce').delete().eq('diary_id', diary.id);
        }
      } else if (diary.type === 'PIT') {
        // Buscar o ID do registro PIT
        const { data: pitData } = await supabase
          .from('work_diaries_pit')
          .select('id')
          .eq('diary_id', diary.id)
          .maybeSingle();
        
        if (pitData?.id) {
          // Deletar as estacas do PIT primeiro
          await supabase.from('work_diaries_pit_piles').delete().eq('pit_id', pitData.id);
          // Deletar o registro PIT
          await supabase.from('work_diaries_pit').delete().eq('diary_id', diary.id);
        }
      } else if (diary.type === 'PLACA') {
        // Buscar o ID do registro PLACA
        const { data: placaData } = await supabase
          .from('work_diaries_placa')
          .select('id')
          .eq('diary_id', diary.id)
          .maybeSingle();
        
        if (placaData?.id) {
          // Deletar os pontos de ensaio da PLACA primeiro
          await supabase.from('work_diaries_placa_piles').delete().eq('placa_id', placaData.id);
          // Deletar o registro PLACA
          await supabase.from('work_diaries_placa').delete().eq('diary_id', diary.id);
        }
      }

      // Finalmente, deletar o diário principal
      const { error } = await supabase
        .from('work_diaries')
        .delete()
        .eq('id', diary.id);

      if (error) {
        console.error('❌ Erro ao excluir diário:', error);
        throw error;
      }

      console.log('✅ Diário excluído com sucesso');
      
      // Atualizar a lista removendo o diário excluído
      setRows((prevRows) => prevRows.filter((r) => r.id !== diary.id));
      
      alert('Diário excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir diário:', err);
      alert('Erro ao excluir o diário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiary = (diary: DiaryRow) => {
    alert('Funcionalidade de edição em desenvolvimento. Em breve você poderá editar os diários existentes.');
    // TODO: Implementar navegação para página de edição
    // ou abrir modal de edição
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
          {/* Cabeçalho estilizado */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logogeoteste.png" alt="Geoteste" className="h-8 sm:h-10" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Diário de Obra {selectedDiary.type ? `• ${selectedDiary.type}` : ''}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{selectedDiary.clientName}</p>
                </div>
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center justify-end gap-2"><Calendar className="w-4 h-4" /> {formatDate(selectedDiary.date)}</div>
                <div className="flex items-center justify-end gap-2"><Clock className="w-4 h-4" /> {formatTime(selectedDiary.startTime)} - {formatTime(selectedDiary.endTime)}</div>
                <div className="flex items-center justify-end gap-2"><User className="w-4 h-4" /> {selectedDiary.createdBy}</div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Bloco: Dados Gerais (estilo tabela) */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">Dados do Ensaio</div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-3 border-r border-gray-200 dark:border-gray-800">
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Cliente</div>
                    <div className="text-gray-900 dark:text-gray-100">{selectedDiary.clientName}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Equipe</div>
                    <div className="text-gray-900 dark:text-gray-100">{selectedDiary.team}</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Localização da obra</div>
                  <div className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.address}</div>
                  {selectedDiary.enderecoDetalhado && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                      <div className="text-blue-800 dark:text-blue-200 font-medium mb-1">Endereço Detalhado:</div>
                      <div className="space-y-1 text-blue-700 dark:text-blue-300">
                        <div><span className="font-medium">Estado:</span> {selectedDiary.enderecoDetalhado.estadoNome}</div>
                        <div><span className="font-medium">Cidade:</span> {selectedDiary.enderecoDetalhado.cidadeNome}</div>
                        <div><span className="font-medium">Rua:</span> {selectedDiary.enderecoDetalhado.rua}</div>
                        <div><span className="font-medium">Número:</span> {selectedDiary.enderecoDetalhado.numero}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-3 border-r border-gray-200 dark:border-gray-800">
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Data</div>
                    <div className="text-gray-900 dark:text-gray-100">{formatDate(selectedDiary.date)}</div>
                  </div>
                  <div className="p-3 border-r border-gray-200 dark:border-gray-800">
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Horário início</div>
                    <div className="text-gray-900 dark:text-gray-100">{formatTime(selectedDiary.startTime)}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Horário término</div>
                    <div className="text-gray-900 dark:text-gray-100">{formatTime(selectedDiary.endTime)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">Serviços Executados</div>
              <div className="p-3 sm:p-4">
                <p className="text-gray-900 dark:text-gray-100 break-words">{selectedDiary.servicesExecuted}</p>
              </div>
            </div>

            {/* Seções específicas PCE */}
            {pceDetail && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Tipo de Ensaio</div>
                  <div className="p-3 text-gray-900 dark:text-gray-100">{pceDetail.ensaio_tipo}</div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Características das Estacas</div>
                  {loadingDetail && <p className="text-sm text-gray-500">Carregando...</p>}
                  {!loadingDetail && pcePiles.length === 0 && (
                    <p className="text-sm text-gray-500">Sem estacas cadastradas.</p>
                  )}
                  <div className="space-y-3">
                    {pcePiles.map((pile) => (
                      <div key={pile.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{pile.estaca_nome || 'Estaca'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Profundidade (m): </span>
                            <span className="text-gray-900 dark:text-gray-100">{pile.estaca_profundidade_m ?? '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Carga de trabalho (tf): </span>
                            <span className="text-gray-900 dark:text-gray-100">{pile.estaca_carga_trabalho_tf ?? '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tipo de estaca: </span>
                            <span className="text-gray-900 dark:text-gray-100">{pile.estaca_tipo ?? '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Diâmetro (cm): </span>
                            <span className="text-gray-900 dark:text-gray-100">{pile.estaca_diametro_cm ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Tipo de Carregamento</div>
                  <div className="p-3 text-gray-900 dark:text-gray-100">{Array.isArray(pceDetail.carregamento_tipos) && pceDetail.carregamento_tipos.length > 0 ? pceDetail.carregamento_tipos.join(', ') : '-'}</div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Equipamentos Utilizados</div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Macaco: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.equipamentos_macaco ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Célula: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.equipamentos_celula ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Manômetro: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.equipamentos_manometro ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Relógios: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.equipamentos_relogios ?? '-'}</span></div>
                    <div className="md:col-span-2"><span className="text-gray-500 dark:text-gray-400">Conjunto de Vigas: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.equipamentos_conjunto_vigas ?? '-'}</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Ocorrências</div>
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/40">
                    <p className="text-gray-900 dark:text-gray-100 break-words">{pceDetail.ocorrencias ?? '-'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Equipamento de cravação</div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Equipamento: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.cravacao_equipamento ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Horímetro: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.cravacao_horimetro ?? '-'}</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PCE • Abastecimento</div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Mobilização - Tanque (L): </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_mobilizacao_litros_tanque ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Mobilização - Galão (L): </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_mobilizacao_litros_galao ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Final do dia - Tanque (L): </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_finaldia_litros_tanque ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Final do dia - Galão (L): </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_finaldia_litros_galao ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Chegou diesel?: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_chegou_diesel == null ? '-' : (pceDetail.abastecimento_chegou_diesel ? 'Sim' : 'Não')}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Fornecido por: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_fornecido_por ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Quantidade (L): </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_quantidade_litros ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Horário da chegada: </span><span className="text-gray-900 dark:text-gray-100">{pceDetail.abastecimento_horario_chegada ?? '-'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Seções específicas PIT */}
            {pitDetail && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PIT • Equipamento</div>
                  <div className="p-3 text-gray-900 dark:text-gray-100">{pitDetail.equipamento || '-'}</div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PIT • Serviços executados (Estacas)</div>
                  {loadingDetail && <p className="text-sm text-gray-500">Carregando...</p>}
                  {!loadingDetail && pitPiles.length === 0 && (
                    <p className="text-sm text-gray-500">Sem estacas cadastradas.</p>
                  )}
                  <div className="space-y-3">
                    {pitPiles.map((pile) => (
                      <div key={pile.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{pile.estaca_nome || 'Estaca'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div><span className="text-gray-500 dark:text-gray-400">Tipo: </span><span className="text-gray-900 dark:text-gray-100">{pile.estaca_tipo ?? '-'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Diâmetro (cm): </span><span className="text-gray-900 dark:text-gray-100">{pile.diametro_cm ?? '-'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Profundidade (cm): </span><span className="text-gray-900 dark:text-gray-100">{pile.profundidade_cm ?? '-'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Arrasamento (m): </span><span className="text-gray-900 dark:text-gray-100">{pile.arrasamento_m ?? '-'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Comprimento útil (m): </span><span className="text-gray-900 dark:text-gray-100">{pile.comprimento_util_m ?? '-'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PIT • Ocorrências</div>
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/40">
                    <p className="text-gray-900 dark:text-gray-100 break-words">{pitDetail.ocorrencias ?? '-'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PIT • Número total de estacas produzidas</div>
                  <div className="p-3 text-gray-900 dark:text-gray-100">{pitDetail.total_estacas ?? '-'}</div>
                </div>
              </div>
            )}

            {/* Seções específicas PLACA */}
            {placaDetail && (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PLACA • Pontos de Ensaio</div>
                  {loadingDetail && <p className="text-sm text-gray-500">Carregando...</p>}
                  {placaPiles && placaPiles.length > 0 ? (
                    <div className="p-3">
                      <div className="space-y-3">
                        {placaPiles.map((point, idx) => (
                          <div key={point.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div><span className="text-gray-500 dark:text-gray-400">Nome: </span><span className="text-gray-900 dark:text-gray-100 font-medium">{point.nome || '-'}</span></div>
                              <div><span className="text-gray-500 dark:text-gray-400">Carga 1 (kgf/cm²): </span><span className="text-gray-900 dark:text-gray-100">{point.carga_trabalho_1_kgf_cm2 || '-'}</span></div>
                              <div><span className="text-gray-500 dark:text-gray-400">Carga 2 (kgf/cm²): </span><span className="text-gray-900 dark:text-gray-100">{point.carga_trabalho_2_kgf_cm2 || '-'}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-gray-500 dark:text-gray-400">Nenhum ponto de ensaio cadastrado</div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PLACA • Equipamentos Utilizados</div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Macaco: </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_macaco ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Célula de carga: </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_celula_carga ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Manômetro: </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_manometro ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Placa (dimensões): </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_placa_dimensoes ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Equipamento de reação: </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_equipamento_reacao ?? '-'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Relógios: </span><span className="text-gray-900 dark:text-gray-100">{placaDetail.equipamentos_relogios ?? '-'}</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-xs font-semibold tracking-wide uppercase">PLACA • Ocorrências</div>
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/40">
                    <p className="text-gray-900 dark:text-gray-100 break-words">{placaDetail.ocorrencias ?? '-'}</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Filtro de Cliente */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="client-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <select
                id="client-filter"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os clientes</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            {/* Ações */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-2">
              <button
                onClick={handleExportExcel}
                disabled={filteredDiaries.length === 0}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5"
                title="Exportar para Excel"
              >
                <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Exportar Excel</span>
              </button>
              <button
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setClientFilter(''); }}
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
                    {diary.type && (
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-full self-start">
                        {diary.type}
                      </span>
                    )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDiary(diary);
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDiary(diary);
                        }}
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