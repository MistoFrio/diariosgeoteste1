// Estados e cidades do Brasil
export interface Cidade {
  id: number;
  nome: string;
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  cidades: Cidade[];
}

export const estadosCidades: Estado[] = [
  {
    id: 1,
    sigla: "AC",
    nome: "Acre",
    cidades: [
      { id: 1, nome: "Rio Branco" },
      { id: 2, nome: "Cruzeiro do Sul" },
      { id: 3, nome: "Sena Madureira" },
      { id: 4, nome: "Tarauacá" },
      { id: 5, nome: "Feijó" },
      { id: 6, nome: "Brasiléia" },
      { id: 7, nome: "Senador Guiomard" },
      { id: 8, nome: "Plácido de Castro" },
      { id: 9, nome: "Manoel Urbano" },
      { id: 10, nome: "Xapuri" }
    ]
  },
  {
    id: 2,
    sigla: "AL",
    nome: "Alagoas",
    cidades: [
      { id: 1, nome: "Maceió" },
      { id: 2, nome: "Arapiraca" },
      { id: 3, nome: "Rio Largo" },
      { id: 4, nome: "Palmeira dos Índios" },
      { id: 5, nome: "União dos Palmares" },
      { id: 6, nome: "São Miguel dos Campos" },
      { id: 7, nome: "Penedo" },
      { id: 8, nome: "Coruripe" },
      { id: 9, nome: "Delmiro Gouveia" },
      { id: 10, nome: "Santana do Ipanema" }
    ]
  },
  {
    id: 3,
    sigla: "AP",
    nome: "Amapá",
    cidades: [
      { id: 1, nome: "Macapá" },
      { id: 2, nome: "Santana" },
      { id: 3, nome: "Laranjal do Jari" },
      { id: 4, nome: "Oiapoque" },
      { id: 5, nome: "Porto Grande" },
      { id: 6, nome: "Tartarugalzinho" },
      { id: 7, nome: "Mazagão" },
      { id: 8, nome: "Vitória do Jari" },
      { id: 9, nome: "Pedra Branca do Amapari" },
      { id: 10, nome: "Serra do Navio" }
    ]
  },
  {
    id: 4,
    sigla: "AM",
    nome: "Amazonas",
    cidades: [
      { id: 1, nome: "Manaus" },
      { id: 2, nome: "Parintins" },
      { id: 3, nome: "Itacoatiara" },
      { id: 4, nome: "Manacapuru" },
      { id: 5, nome: "Coari" },
      { id: 6, nome: "Tefé" },
      { id: 7, nome: "Tabatinga" },
      { id: 8, nome: "Maués" },
      { id: 9, nome: "São Gabriel da Cachoeira" },
      { id: 10, nome: "Humaitá" }
    ]
  },
  {
    id: 5,
    sigla: "BA",
    nome: "Bahia",
    cidades: [
      { id: 1, nome: "Salvador" },
      { id: 2, nome: "Feira de Santana" },
      { id: 3, nome: "Vitória da Conquista" },
      { id: 4, nome: "Camaçari" },
      { id: 5, nome: "Juazeiro" },
      { id: 6, nome: "Itabuna" },
      { id: 7, nome: "Lauro de Freitas" },
      { id: 8, nome: "Ilhéus" },
      { id: 9, nome: "Jequié" },
      { id: 10, nome: "Teixeira de Freitas" },
      { id: 11, nome: "Barreiras" },
      { id: 12, nome: "Alagoinhas" },
      { id: 13, nome: "Porto Seguro" },
      { id: 14, nome: "Simões Filho" },
      { id: 15, nome: "Paulo Afonso" }
    ]
  },
  {
    id: 6,
    sigla: "CE",
    nome: "Ceará",
    cidades: [
      { id: 1, nome: "Fortaleza" },
      { id: 2, nome: "Caucaia" },
      { id: 3, nome: "Juazeiro do Norte" },
      { id: 4, nome: "Maracanaú" },
      { id: 5, nome: "Sobral" },
      { id: 6, nome: "Crato" },
      { id: 7, nome: "Itapipoca" },
      { id: 8, nome: "Maranguape" },
      { id: 9, nome: "Iguatu" },
      { id: 10, nome: "Quixadá" }
    ]
  },
  {
    id: 7,
    sigla: "DF",
    nome: "Distrito Federal",
    cidades: [
      { id: 1, nome: "Brasília" },
      { id: 2, nome: "Taguatinga" },
      { id: 3, nome: "Ceilândia" },
      { id: 4, nome: "Sobradinho" },
      { id: 5, nome: "Gama" },
      { id: 6, nome: "Samambaia" },
      { id: 7, nome: "Santa Maria" },
      { id: 8, nome: "Planaltina" },
      { id: 9, nome: "São Sebastião" },
      { id: 10, nome: "Recanto das Emas" }
    ]
  },
  {
    id: 8,
    sigla: "ES",
    nome: "Espírito Santo",
    cidades: [
      { id: 1, nome: "Vitória" },
      { id: 2, nome: "Vila Velha" },
      { id: 3, nome: "Cariacica" },
      { id: 4, nome: "Serra" },
      { id: 5, nome: "Cachoeiro de Itapemirim" },
      { id: 6, nome: "Linhares" },
      { id: 7, nome: "São Mateus" },
      { id: 8, nome: "Colatina" },
      { id: 9, nome: "Guarapari" },
      { id: 10, nome: "Aracruz" }
    ]
  },
  {
    id: 9,
    sigla: "GO",
    nome: "Goiás",
    cidades: [
      { id: 1, nome: "Goiânia" },
      { id: 2, nome: "Aparecida de Goiânia" },
      { id: 3, nome: "Anápolis" },
      { id: 4, nome: "Rio Verde" },
      { id: 5, nome: "Luziânia" },
      { id: 6, nome: "Águas Lindas de Goiás" },
      { id: 7, nome: "Valparaíso de Goiás" },
      { id: 8, nome: "Trindade" },
      { id: 9, nome: "Formosa" },
      { id: 10, nome: "Novo Gama" }
    ]
  },
  {
    id: 10,
    sigla: "MA",
    nome: "Maranhão",
    cidades: [
      { id: 1, nome: "São Luís" },
      { id: 2, nome: "Imperatriz" },
      { id: 3, nome: "São José de Ribamar" },
      { id: 4, nome: "Timon" },
      { id: 5, nome: "Caxias" },
      { id: 6, nome: "Codó" },
      { id: 7, nome: "Paço do Lumiar" },
      { id: 8, nome: "Açailândia" },
      { id: 9, nome: "Bacabal" },
      { id: 10, nome: "Balsas" }
    ]
  },
  {
    id: 11,
    sigla: "MT",
    nome: "Mato Grosso",
    cidades: [
      { id: 1, nome: "Cuiabá" },
      { id: 2, nome: "Várzea Grande" },
      { id: 3, nome: "Rondonópolis" },
      { id: 4, nome: "Sinop" },
      { id: 5, nome: "Tangará da Serra" },
      { id: 6, nome: "Cáceres" },
      { id: 7, nome: "Sorriso" },
      { id: 8, nome: "Lucas do Rio Verde" },
      { id: 9, nome: "Barra do Garças" },
      { id: 10, nome: "Primavera do Leste" }
    ]
  },
  {
    id: 12,
    sigla: "MS",
    nome: "Mato Grosso do Sul",
    cidades: [
      { id: 1, nome: "Campo Grande" },
      { id: 2, nome: "Dourados" },
      { id: 3, nome: "Três Lagoas" },
      { id: 4, nome: "Corumbá" },
      { id: 5, nome: "Ponta Porã" },
      { id: 6, nome: "Naviraí" },
      { id: 7, nome: "Nova Andradina" },
      { id: 8, nome: "Sidrolândia" },
      { id: 9, nome: "Maracaju" },
      { id: 10, nome: "Aquidauana" }
    ]
  },
  {
    id: 13,
    sigla: "MG",
    nome: "Minas Gerais",
    cidades: [
      { id: 1, nome: "Belo Horizonte" },
      { id: 2, nome: "Uberlândia" },
      { id: 3, nome: "Contagem" },
      { id: 4, nome: "Juiz de Fora" },
      { id: 5, nome: "Betim" },
      { id: 6, nome: "Montes Claros" },
      { id: 7, nome: "Ribeirão das Neves" },
      { id: 8, nome: "Uberaba" },
      { id: 9, nome: "Governador Valadares" },
      { id: 10, nome: "Ipatinga" },
      { id: 11, nome: "Sete Lagoas" },
      { id: 12, nome: "Divinópolis" },
      { id: 13, nome: "Santa Luzia" },
      { id: 14, nome: "Ibirité" },
      { id: 15, nome: "Poços de Caldas" }
    ]
  },
  {
    id: 14,
    sigla: "PA",
    nome: "Pará",
    cidades: [
      { id: 1, nome: "Belém" },
      { id: 2, nome: "Ananindeua" },
      { id: 3, nome: "Santarém" },
      { id: 4, nome: "Marabá" },
      { id: 5, nome: "Parauapebas" },
      { id: 6, nome: "Castanhal" },
      { id: 7, nome: "Abaetetuba" },
      { id: 8, nome: "Cametá" },
      { id: 9, nome: "Marituba" },
      { id: 10, nome: "Barcarena" }
    ]
  },
  {
    id: 15,
    sigla: "PB",
    nome: "Paraíba",
    cidades: [
      { id: 1, nome: "João Pessoa" },
      { id: 2, nome: "Campina Grande" },
      { id: 3, nome: "Santa Rita" },
      { id: 4, nome: "Patos" },
      { id: 5, nome: "Bayeux" },
      { id: 6, nome: "Sousa" },
      { id: 7, nome: "Cajazeiras" },
      { id: 8, nome: "Cabedelo" },
      { id: 9, nome: "Guarabira" },
      { id: 10, nome: "Mamanguape" }
    ]
  },
  {
    id: 16,
    sigla: "PR",
    nome: "Paraná",
    cidades: [
      { id: 1, nome: "Curitiba" },
      { id: 2, nome: "Londrina" },
      { id: 3, nome: "Maringá" },
      { id: 4, nome: "Ponta Grossa" },
      { id: 5, nome: "Cascavel" },
      { id: 6, nome: "São José dos Pinhais" },
      { id: 7, nome: "Foz do Iguaçu" },
      { id: 8, nome: "Colombo" },
      { id: 9, nome: "Guarapuava" },
      { id: 10, nome: "Paranaguá" }
    ]
  },
  {
    id: 17,
    sigla: "PE",
    nome: "Pernambuco",
    cidades: [
      { id: 1, nome: "Recife" },
      { id: 2, nome: "Jaboatão dos Guararapes" },
      { id: 3, nome: "Olinda" },
      { id: 4, nome: "Caruaru" },
      { id: 5, nome: "Petrolina" },
      { id: 6, nome: "Paulista" },
      { id: 7, nome: "Cabo de Santo Agostinho" },
      { id: 8, nome: "Camaragibe" },
      { id: 9, nome: "Garanhuns" },
      { id: 10, nome: "Vitória de Santo Antão" }
    ]
  },
  {
    id: 18,
    sigla: "PI",
    nome: "Piauí",
    cidades: [
      { id: 1, nome: "Teresina" },
      { id: 2, nome: "Parnaíba" },
      { id: 3, nome: "Picos" },
      { id: 4, nome: "Piripiri" },
      { id: 5, nome: "Floriano" },
      { id: 6, nome: "Campo Maior" },
      { id: 7, nome: "Barras" },
      { id: 8, nome: "União" },
      { id: 9, nome: "Altos" },
      { id: 10, nome: "Pedro II" }
    ]
  },
  {
    id: 19,
    sigla: "RJ",
    nome: "Rio de Janeiro",
    cidades: [
      { id: 1, nome: "Rio de Janeiro" },
      { id: 2, nome: "São Gonçalo" },
      { id: 3, nome: "Duque de Caxias" },
      { id: 4, nome: "Nova Iguaçu" },
      { id: 5, nome: "Niterói" },
      { id: 6, nome: "Belford Roxo" },
      { id: 7, nome: "São João de Meriti" },
      { id: 8, nome: "Campos dos Goytacazes" },
      { id: 9, nome: "Petrópolis" },
      { id: 10, nome: "Volta Redonda" }
    ]
  },
  {
    id: 20,
    sigla: "RN",
    nome: "Rio Grande do Norte",
    cidades: [
      { id: 1, nome: "Natal" },
      { id: 2, nome: "Mossoró" },
      { id: 3, nome: "Parnamirim" },
      { id: 4, nome: "São Gonçalo do Amarante" },
      { id: 5, nome: "Macaíba" },
      { id: 6, nome: "Ceará-Mirim" },
      { id: 7, nome: "Caicó" },
      { id: 8, nome: "Açu" },
      { id: 9, nome: "Currais Novos" },
      { id: 10, nome: "Nova Cruz" }
    ]
  },
  {
    id: 21,
    sigla: "RS",
    nome: "Rio Grande do Sul",
    cidades: [
      { id: 1, nome: "Porto Alegre" },
      { id: 2, nome: "Caxias do Sul" },
      { id: 3, nome: "Pelotas" },
      { id: 4, nome: "Canoas" },
      { id: 5, nome: "Santa Maria" },
      { id: 6, nome: "Gravataí" },
      { id: 7, nome: "Viamão" },
      { id: 8, nome: "Novo Hamburgo" },
      { id: 9, nome: "São Leopoldo" },
      { id: 10, nome: "Rio Grande" }
    ]
  },
  {
    id: 22,
    sigla: "RO",
    nome: "Rondônia",
    cidades: [
      { id: 1, nome: "Porto Velho" },
      { id: 2, nome: "Ji-Paraná" },
      { id: 3, nome: "Ariquemes" },
      { id: 4, nome: "Vilhena" },
      { id: 5, nome: "Cacoal" },
      { id: 6, nome: "Rolim de Moura" },
      { id: 7, nome: "Guajará-Mirim" },
      { id: 8, nome: "Jaru" },
      { id: 9, nome: "Ouro Preto do Oeste" },
      { id: 10, nome: "Buritis" }
    ]
  },
  {
    id: 23,
    sigla: "RR",
    nome: "Roraima",
    cidades: [
      { id: 1, nome: "Boa Vista" },
      { id: 2, nome: "Rorainópolis" },
      { id: 3, nome: "Caracaraí" },
      { id: 4, nome: "Alto Alegre" },
      { id: 5, nome: "Mucajaí" },
      { id: 6, nome: "Bonfim" },
      { id: 7, nome: "Cantá" },
      { id: 8, nome: "Normandia" },
      { id: 9, nome: "Pacaraima" },
      { id: 10, nome: "Iracema" }
    ]
  },
  {
    id: 24,
    sigla: "SC",
    nome: "Santa Catarina",
    cidades: [
      { id: 1, nome: "Florianópolis" },
      { id: 2, nome: "Joinville" },
      { id: 3, nome: "Blumenau" },
      { id: 4, nome: "São José" },
      { id: 5, nome: "Criciúma" },
      { id: 6, nome: "Chapecó" },
      { id: 7, nome: "Itajaí" },
      { id: 8, nome: "Lages" },
      { id: 9, nome: "Jaraguá do Sul" },
      { id: 10, nome: "Palhoça" }
    ]
  },
  {
    id: 25,
    sigla: "SP",
    nome: "São Paulo",
    cidades: [
      { id: 1, nome: "São Paulo" },
      { id: 2, nome: "Guarulhos" },
      { id: 3, nome: "Campinas" },
      { id: 4, nome: "São Bernardo do Campo" },
      { id: 5, nome: "Santo André" },
      { id: 6, nome: "Osasco" },
      { id: 7, nome: "Ribeirão Preto" },
      { id: 8, nome: "Sorocaba" },
      { id: 9, nome: "Mauá" },
      { id: 10, nome: "São José dos Campos" },
      { id: 11, nome: "Mogi das Cruzes" },
      { id: 12, nome: "Diadema" },
      { id: 13, nome: "Jundiaí" },
      { id: 14, nome: "Carapicuíba" },
      { id: 15, nome: "Piracicaba" }
    ]
  },
  {
    id: 26,
    sigla: "SE",
    nome: "Sergipe",
    cidades: [
      { id: 1, nome: "Aracaju" },
      { id: 2, nome: "Nossa Senhora do Socorro" },
      { id: 3, nome: "Lagarto" },
      { id: 4, nome: "Itabaiana" },
      { id: 5, nome: "São Cristóvão" },
      { id: 6, nome: "Estância" },
      { id: 7, nome: "Tobias Barreto" },
      { id: 8, nome: "Simão Dias" },
      { id: 9, nome: "Propriá" },
      { id: 10, nome: "Barra dos Coqueiros" }
    ]
  },
  {
    id: 27,
    sigla: "TO",
    nome: "Tocantins",
    cidades: [
      { id: 1, nome: "Palmas" },
      { id: 2, nome: "Araguaína" },
      { id: 3, nome: "Gurupi" },
      { id: 4, nome: "Porto Nacional" },
      { id: 5, nome: "Paraíso do Tocantins" },
      { id: 6, nome: "Colinas do Tocantins" },
      { id: 7, nome: "Guaraí" },
      { id: 8, nome: "Formoso do Araguaia" },
      { id: 9, nome: "Tocantinópolis" },
      { id: 10, nome: "Miracema do Tocantins" }
    ]
  }
];

// Função para obter estados
export const getEstados = () => estadosCidades.map(estado => ({
  id: estado.id,
  sigla: estado.sigla,
  nome: estado.nome
}));

// Função para obter cidades por estado
export const getCidadesByEstado = (estadoId: number) => {
  const estado = estadosCidades.find(e => e.id === estadoId);
  return estado ? estado.cidades : [];
};

// Função para obter estado por ID
export const getEstadoById = (estadoId: number) => {
  return estadosCidades.find(e => e.id === estadoId);
};

// Função para obter cidade por ID
export const getCidadeById = (estadoId: number, cidadeId: number) => {
  const estado = estadosCidades.find(e => e.id === estadoId);
  if (estado) {
    return estado.cidades.find(c => c.id === cidadeId);
  }
  return null;
};

