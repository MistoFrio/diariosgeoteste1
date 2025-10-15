import React from 'react';
import { WorkDiary } from '../types';

interface DiaryPDFLayoutProps {
  diary: WorkDiary;
  pceDetail?: any;
  pcePiles?: any[];
  pitDetail?: any;
  pitPiles?: any[];
  placaDetail?: any;
  placaPiles?: any[];
  fichapdaDetail?: any;
  pdaDiarioDetail?: any;
  pdaDiarioPiles?: any[];
}

export const DiaryPDFLayout: React.FC<DiaryPDFLayoutProps> = ({
  diary,
  pceDetail,
  pcePiles = [],
  pitDetail,
  pitPiles = [],
  placaDetail,
  placaPiles = [],
  fichapdaDetail,
  pdaDiarioDetail,
  pdaDiarioPiles = []
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time;
  };

  // Valor de Equipamento (quando existir em algum tipo)
  const equipmentDisplay: string = (() => {
    if (pitDetail?.equipamento) return pitDetail.equipamento;
    if (Array.isArray(fichapdaDetail?.equipamento) && fichapdaDetail.equipamento.length > 0) return fichapdaDetail.equipamento.join(', ');
    if (Array.isArray(pdaDiarioDetail?.abastec_equipamentos) && pdaDiarioDetail.abastec_equipamentos.length > 0) return pdaDiarioDetail.abastec_equipamentos.join(', ');
    return '-';
  })();

  return (
    <div className="pdf-layout bg-white text-black font-sans" style={{ fontSize: '12px', lineHeight: '1.5', padding: '12px' }}>
      {/* Cabeçalho Principal e Blocos tipo planilha */}
      <div className="border border-gray-300 mb-4">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center gap-3">
            <img src="/logogeoteste.png" alt="Geoteste" className="h-8" />
            <h1 className="text-lg font-bold uppercase tracking-wide">DIÁRIO DE OBRA</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Nº DA OBRA: {diary.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

        {/* Linhas com caixas */}
        <div className="grid grid-cols-12 divide-x divide-gray-300 text-sm">
          {/* Linha 1 */}
          <div className="col-span-8 p-2">
            <div className="font-semibold">Cliente:</div>
            <div>{diary.clientName}</div>
          </div>
          <div className="col-span-4 p-2">
            <div className="font-semibold">Equipamento</div>
            <div className="text-base font-bold">{equipmentDisplay}</div>
          </div>
          {/* Linha 2 */}
          <div className="col-span-8 p-2 border-t border-gray-300">
            <div className="font-semibold">Endereço:</div>
            <div>{diary.address}</div>
          </div>
          <div className="col-span-2 p-2 border-t border-gray-300">
            <div className="font-semibold">Data:</div>
            <div>{formatDate(diary.date)}</div>
          </div>
          <div className="col-span-2 p-2 border-t border-gray-300">
            <div className="font-semibold">Início:</div>
            <div>{formatTime(diary.startTime)}</div>
          </div>
          {/* Linha 3 */}
          <div className="col-span-8 p-2 border-t border-gray-300">
            <div className="font-semibold">Equipe:</div>
            <div>{diary.team}</div>
              </div>
          <div className="col-span-4 p-2 border-t border-gray-300">
            <div className="font-semibold">Término:</div>
            <div>{formatTime(diary.endTime)}</div>
          </div>
        </div>
        
        {/* Linha clima/observação rápida */}
        <div className="px-3 py-2 text-xs text-gray-700 grid grid-cols-3 gap-3 border-t border-gray-300">
          <div>Ensolarado: ___</div>
          <div>Chuva fraca: ___</div>
          <div>Chuva forte: ___</div>
        </div>
      </div>

      {/* Serviços Executados */}
      <div className="border border-gray-300 mb-4">
        <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
          <h3 className="font-bold text-sm uppercase">SERVIÇOS EXECUTADOS</h3>
        </div>
        <div className="p-2 text-sm">
          {diary.servicesExecuted}
        </div>
      </div>

      {/* Seções Específicas PCE */}
      {pceDetail && (
        <div className="space-y-2 mb-3">
          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">PCE • DADOS DO ENSAIO</h3>
            </div>
            <div className="p-2">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-semibold">Tipo de ensaio:</span> {pceDetail.ensaio_tipo}
                </div>
                <div>
                  <span className="font-semibold">Carregamento:</span> {Array.isArray(pceDetail.carregamento_tipos) ? pceDetail.carregamento_tipos.join(', ') : '-'}
                </div>
              </div>
            </div>
          </div>

          {pcePiles.length > 0 && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PCE • CARACTERÍSTICAS DAS ESTACAS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Estaca</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Prof. (m)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Carga (tf)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Tipo</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Diâm. (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pcePiles.map((pile, index) => (
                      <tr key={pile.id || index}>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_nome || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_profundidade_m || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_carga_trabalho_tf || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_tipo || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_diametro_cm || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">PCE • EQUIPAMENTOS</h3>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">Macaco:</span> {pceDetail.equipamentos_macaco || '-'}</div>
                <div><span className="font-semibold">Célula:</span> {pceDetail.equipamentos_celula || '-'}</div>
                <div><span className="font-semibold">Manômetro:</span> {pceDetail.equipamentos_manometro || '-'}</div>
                <div><span className="font-semibold">Relógios:</span> {pceDetail.equipamentos_relogios || '-'}</div>
                <div className="col-span-2"><span className="font-semibold">Conjunto de Vigas:</span> {pceDetail.equipamentos_conjunto_vigas || '-'}</div>
              </div>
            </div>
          </div>

          {pceDetail.ocorrencias && (
            <div className="border border-gray-300">
                <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PCE • OCORRÊNCIAS</h3>
              </div>
              <div className="p-2 text-sm">
                {pceDetail.ocorrencias}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seções Específicas PIT */}
      {pitDetail && (
        <div className="space-y-2 mb-3">
          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">PIT • DADOS DO ENSAIO</h3>
            </div>
            <div className="p-2">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-semibold">Equipamento:</span> {pitDetail.equipamento || '-'}
                </div>
                <div>
                  <span className="font-semibold">Total de estacas:</span> {pitDetail.total_estacas || '-'}
                </div>
              </div>
            </div>
          </div>

          {pitPiles.length > 0 && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PIT • SERVIÇOS EXECUTADOS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Estaca</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Tipo</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Diâm. (cm)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Prof. (cm)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Arrasa. (m)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Compr. útil (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitPiles.map((pile, index) => (
                      <tr key={pile.id || index}>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_nome || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.estaca_tipo || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.diametro_cm || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.profundidade_cm || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.arrasamento_m || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{pile.comprimento_util_m || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pitDetail.ocorrencias && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PIT • OCORRÊNCIAS</h3>
              </div>
              <div className="p-2 text-sm">
                {pitDetail.ocorrencias}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seções Específicas PLACA */}
      {placaDetail && (
        <div className="space-y-2 mb-3">
          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">PLACA • EQUIPAMENTOS</h3>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">Macaco:</span> {placaDetail.equipamentos_macaco || '-'}</div>
                <div><span className="font-semibold">Célula:</span> {placaDetail.equipamentos_celula_carga || '-'}</div>
                <div><span className="font-semibold">Manômetro:</span> {placaDetail.equipamentos_manometro || '-'}</div>
                <div><span className="font-semibold">Placa:</span> {placaDetail.equipamentos_placa_dimensoes || '-'}</div>
                <div><span className="font-semibold">Equip. reação:</span> {placaDetail.equipamentos_equipamento_reacao || '-'}</div>
                <div><span className="font-semibold">Relógios:</span> {placaDetail.equipamentos_relogios || '-'}</div>
              </div>
            </div>
          </div>

          {placaPiles.length > 0 && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PLACA • PONTOS DE ENSAIO</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Ponto</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Carga 1 (kgf/cm²)</th>
                      <th className="border border-gray-300 px-1.5 py-1 text-left font-bold">Carga 2 (kgf/cm²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placaPiles.map((point, index) => (
                      <tr key={point.id || index}>
                        <td className="border border-gray-300 px-1.5 py-1">{point.nome || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{point.carga_trabalho_1_kgf_cm2 || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{point.carga_trabalho_2_kgf_cm2 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {placaDetail.ocorrencias && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">PLACA • OCORRÊNCIAS</h3>
              </div>
              <div className="p-2 text-sm">
                {placaDetail.ocorrencias}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ficha técnica de PDA */}
      {fichapdaDetail && (
        <div className="space-y-2 mb-3">
          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">FICHA TÉCNICA • PDA</h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-semibold">PDA:</span> {(fichapdaDetail.computador || []).join(', ') || '-'}</div>
              <div><span className="font-semibold">Equipamento:</span> {(fichapdaDetail.equipamento || []).join(', ') || '-'}</div>
              <div><span className="font-semibold">Bloco:</span> {fichapdaDetail.bloco_nome || '-'}</div>
              <div><span className="font-semibold">Estaca:</span> {fichapdaDetail.estaca_nome || '-'}</div>
              <div><span className="font-semibold">Tipo:</span> {fichapdaDetail.estaca_tipo || '-'}</div>
              <div><span className="font-semibold">Ø (cm):</span> {fichapdaDetail.diametro_cm ?? '-'}</div>
              <div><span className="font-semibold">Carga Trab. (tf):</span> {fichapdaDetail.carga_trabalho_tf ?? '-'}</div>
              <div><span className="font-semibold">Carga Ensaio (tf):</span> {fichapdaDetail.carga_ensaio_tf ?? '-'}</div>
              <div className="col-span-2"><span className="font-semibold">Peso martelo (kg):</span> {fichapdaDetail.peso_martelo_kg ?? '-'}</div>
              <div className="col-span-2"><span className="font-semibold">Hq (m):</span> {(fichapdaDetail.hq || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">Nega (mm):</span> {(fichapdaDetail.nega || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">EMX:</span> {(fichapdaDetail.emx || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">RMX:</span> {(fichapdaDetail.rmx || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">DMX:</span> {(fichapdaDetail.dmx || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">Seção cravada (m):</span> {(fichapdaDetail.secao_cravada || []).join(', ') || '-'}</div>
              <div><span className="font-semibold">Altura bloco (m):</span> {fichapdaDetail.altura_bloco_m ?? '-'}</div>
              <div><span className="font-semibold">Altura sensores (m):</span> {fichapdaDetail.altura_sensores_m ?? '-'}</div>
              <div><span className="font-semibold">LP (m):</span> {fichapdaDetail.lp_m ?? '-'}</div>
              <div><span className="font-semibold">LE (m):</span> {fichapdaDetail.le_m ?? '-'}</div>
              <div><span className="font-semibold">LT (m):</span> {fichapdaDetail.lt_m ?? '-'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Diário PDA */}
      {pdaDiarioDetail && (
        <div className="space-y-2 mb-3">
          <div className="border border-gray-300">
            <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
              <h3 className="font-bold text-sm uppercase">DIÁRIO • PDA</h3>
            </div>
            <div className="p-2 text-sm grid grid-cols-2 gap-2">
              <div className="col-span-2"><span className="font-semibold">PDA:</span> {(pdaDiarioDetail.pda_computadores || []).join(', ') || '-'}</div>
              <div className="col-span-2"><span className="font-semibold">Ocorrências:</span> {pdaDiarioDetail.ocorrencias || '-'}</div>
              <div><span className="font-semibold">Equipamentos:</span> {(pdaDiarioDetail.abastec_equipamentos || []).join(', ') || '-'}</div>
              <div><span className="font-semibold">Horímetro (h):</span> {pdaDiarioDetail.horimetro_horas ?? '-'}</div>
              <div><span className="font-semibold">Mobilização tanque (L):</span> {pdaDiarioDetail.mobilizacao_litros_tanque ?? '-'}</div>
              <div><span className="font-semibold">Mobilização galão (L):</span> {pdaDiarioDetail.mobilizacao_litros_galao ?? '-'}</div>
              <div><span className="font-semibold">Final do dia tanque (L):</span> {pdaDiarioDetail.finaldia_litros_tanque ?? '-'}</div>
              <div><span className="font-semibold">Final do dia galão (L):</span> {pdaDiarioDetail.finaldia_litros_galao ?? '-'}</div>
              <div><span className="font-semibold">Chegou diesel?</span> {pdaDiarioDetail.entrega_chegou_diesel === null ? '-' : (pdaDiarioDetail.entrega_chegou_diesel ? 'Sim' : 'Não')}</div>
              <div><span className="font-semibold">Fornecido por:</span> {pdaDiarioDetail.entrega_fornecido_por || '-'}</div>
              <div><span className="font-semibold">Qtd diesel (L):</span> {pdaDiarioDetail.entrega_quantidade_litros ?? '-'}</div>
              <div><span className="font-semibold">Horário chegada:</span> {pdaDiarioDetail.entrega_horario_chegada || '-'}</div>
            </div>
          </div>

          {pdaDiarioPiles && pdaDiarioPiles.length > 0 && (
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-300">
                <h3 className="font-bold text-sm uppercase">DIÁRIO • PDA • ESTACAS DO DIA</h3>
              </div>
              <div className="p-2 text-xs">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-1 pr-2">Nome</th>
                      <th className="py-1 px-2">Tipo</th>
                      <th className="py-1 px-2">Ø (cm)</th>
                      <th className="py-1 px-2">Prof. (m)</th>
                      <th className="py-1 px-2">Carga Trab. (tf)</th>
                      <th className="py-1 px-2">Carga Ensaio (tf)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdaDiarioPiles.map((row: any, i: number) => (
                      <tr key={row.id || i} className="border-t border-gray-200">
                        <td className="py-1 pr-2">{row.nome || '-'}</td>
                        <td className="py-1 px-2">{row.tipo || '-'}</td>
                        <td className="py-1 px-2">{row.diametro_cm ?? '-'}</td>
                        <td className="py-1 px-2">{row.profundidade_m ?? '-'}</td>
                        <td className="py-1 px-2">{row.carga_trabalho_tf ?? '-'}</td>
                        <td className="py-1 px-2">{row.carga_ensaio_tf ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="border border-gray-300 p-2">
          <h3 className="font-bold text-xs mb-1.5 uppercase">ASSINATURA GEOTESTE</h3>
          <div className="text-xs mb-1.5">
            <span className="font-semibold">Responsável:</span> {diary.geotestSignature}
          </div>
          {diary.geotestSignatureImage && (
            <div className="border border-gray-300 p-1 bg-white">
              <img
                src={diary.geotestSignatureImage}
                alt="Assinatura digital"
                className="w-full h-12 object-contain"
              />
            </div>
          )}
        </div>
        
        <div className="border border-gray-300 p-2">
          <h3 className="font-bold text-xs mb-1.5 uppercase">ASSINATURA RESPONSÁVEL DA OBRA</h3>
          <div className="text-xs">
            {diary.responsibleSignature}
          </div>
        </div>
      </div>

      {/* Observações */}
      {diary.observations && (
        <div className="border border-gray-300">
          <div className="bg-gray-100 px-2 py-1 border-b border-gray-300">
            <h3 className="font-bold text-xs uppercase">OBSERVAÇÕES</h3>
          </div>
          <div className="p-2 text-xs">
            {diary.observations}
          </div>
        </div>
      )}
    </div>
  );
};
