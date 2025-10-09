import * as XLSX from 'xlsx';

export type DiaryExcelRow = {
  Tipo?: string;
  Cliente: string;
  Endereco: string;
  Equipe: string;
  Data: string;
  Inicio: string;
  Termino: string;
  'Serviços Executados': string;
  'Assinatura Geoteste': string;
  'Assinatura Responsável': string;
  Observações: string;
  'Criado em': string;
};

export function downloadExcel(fileName: string, rows: DiaryExcelRow[]): void {
  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar uma nova planilha
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 12 }, // Tipo
    { wch: 30 }, // Cliente
    { wch: 40 }, // Endereco
    { wch: 25 }, // Equipe
    { wch: 12 }, // Data
    { wch: 10 }, // Inicio
    { wch: 10 }, // Termino
    { wch: 50 }, // Serviços Executados
    { wch: 20 }, // Assinatura Geoteste
    { wch: 20 }, // Assinatura Responsável
    { wch: 40 }, // Observações
    { wch: 18 }, // Criado em
  ];
  worksheet['!cols'] = columnWidths;

  // Criar um novo workbook e adicionar a planilha
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Diários');

  // Gerar arquivo e fazer download
  const excelFileName = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
  XLSX.writeFile(workbook, excelFileName);
}

export function mapDiaryToExcelRow(d: {
  type?: string;
  clientName: string;
  address: string;
  team: string;
  date: string;
  startTime: string;
  endTime: string;
  servicesExecuted: string;
  geotestSignature: string;
  responsibleSignature: string;
  observations?: string;
  createdAt: string;
}): DiaryExcelRow {
  return {
    Tipo: d.type ?? '',
    Cliente: d.clientName,
    Endereco: d.address,
    Equipe: d.team,
    Data: new Date(d.date).toLocaleDateString('pt-BR'),
    Inicio: d.startTime,
    Termino: d.endTime,
    'Serviços Executados': d.servicesExecuted,
    'Assinatura Geoteste': d.geotestSignature,
    'Assinatura Responsável': d.responsibleSignature,
    Observações: d.observations ?? '',
    'Criado em': new Date(d.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(d.createdAt).toLocaleTimeString('pt-BR'),
  };
}

