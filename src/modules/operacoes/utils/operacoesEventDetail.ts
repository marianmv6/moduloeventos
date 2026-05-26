import type { OperacoesEventRow } from '../types/operacoes.types';
import type { OperacoesOrganizationGroup } from '../types/operacoesOrganization.types';

export interface OperacoesEventVehicleDetail {
  tipo: string;
  placa: string;
  prefixo: string;
  marca: string;
  modelo: string;
  anoModelo: string;
  combustivel: string;
  gruposOrganizacao: OperacoesOrganizationGroup[];
}

export interface OperacoesEventDriverDetail {
  nome: string;
  matricula: string;
  funcao: string;
  cnh: string;
  categoria: string;
  gruposOrganizacao: OperacoesOrganizationGroup[];
}

export interface OperacoesEventDetailView {
  event: OperacoesEventRow;
  vehicle: OperacoesEventVehicleDetail;
  driver: OperacoesEventDriverDetail | null;
  formattedDateTime: string;
  /** Labels formatados para a seção "Dados do evento" da aba Informações. */
  eventDateLabel: string;
  eventTimeLabel: string;
  receivedDateLabel: string;
  receivedTimeLabel: string;
  locationLabel: string;
  coordinatesLabel: string;
  speedLabel: string;
}

const VEHICLE_GROUPS_BY_PLACA: Record<string, OperacoesOrganizationGroup[]> = {
  SLE3P56: [
    { label: 'Creare Sistemas', variant: 'pink' },
    { label: 'Canoas', variant: 'orange' },
  ],
  FAL0M70: [{ label: 'Canoas', variant: 'orange' }],
  IQP2A01: [
    { label: '2 anos', variant: 'blue' },
    { label: 'Canoas', variant: 'orange' },
  ],
  HQH5986: [{ label: 'Creare Sistemas', variant: 'pink' }],
  BKR5I96: [{ label: 'Canoas', variant: 'green' }],
};

const DRIVER_GROUPS_BY_NAME: Record<string, OperacoesOrganizationGroup[]> = {
  'Carlos Fujimoto do Prado': [
    { label: 'Creare Sistemas', variant: 'pink' },
    { label: '2 anos', variant: 'blue' },
    { label: 'Canoas', variant: 'orange' },
    { label: 'Porto Alegre', variant: 'green' },
  ],
  'Douglas Almeida': [
    { label: 'Creare Sistemas', variant: 'pink' },
    { label: 'Canoas', variant: 'orange' },
  ],
  'Juan Valencia': [{ label: '2 anos', variant: 'blue' }],
  'Rogério da Silva': [{ label: 'Canoas', variant: 'green' }],
};

const VEHICLE_BY_PLACA: Record<string, Omit<OperacoesEventVehicleDetail, 'placa' | 'gruposOrganizacao'>> = {
  SLE3P56: {
    tipo: 'Caminhão madeireiro',
    prefixo: '',
    marca: 'Mercedes-Benz',
    modelo: 'AXOR 3344 S 6x4 2P',
    anoModelo: '2023 / 2023',
    combustivel: 'Diesel',
  },
  FAL0M70: {
    tipo: 'Caminhão basculante',
    prefixo: 'FAL-070',
    marca: 'Volvo',
    modelo: 'FH 460 6x4',
    anoModelo: '2022 / 2022',
    combustivel: 'Diesel',
  },
  IQP2A01: {
    tipo: 'Caminhão tanque',
    prefixo: 'IQP-201',
    marca: 'Scania',
    modelo: 'R 450 A6x4',
    anoModelo: '2021 / 2021',
    combustivel: 'Diesel',
  },
  HQH5986: {
    tipo: 'Caminhão graneleiro',
    prefixo: 'HQH-986',
    marca: 'Mercedes-Benz',
    modelo: 'Actros 2651',
    anoModelo: '2020 / 2020',
    combustivel: 'Diesel',
  },
  BKR5I96: {
    tipo: 'Caminhão carreta',
    prefixo: 'BKR-596',
    marca: 'Volkswagen',
    modelo: 'Constellation 24.280',
    anoModelo: '2019 / 2019',
    combustivel: 'Diesel',
  },
};

const DRIVER_BY_NAME: Record<string, Omit<OperacoesEventDriverDetail, 'nome' | 'gruposOrganizacao'>> = {
  'Carlos Fujimoto do Prado': {
    matricula: '150366',
    funcao: 'Motorista carreteiro',
    cnh: '24605048902',
    categoria: 'E',
  },
  'Douglas Almeida': {
    matricula: '148902',
    funcao: 'Motorista carreteiro',
    cnh: '31288451009',
    categoria: 'E',
  },
  'Juan Valencia': {
    matricula: '152441',
    funcao: 'Motorista carreteiro',
    cnh: '19877234056',
    categoria: 'D',
  },
  'Rogério da Silva': {
    matricula: '149775',
    funcao: 'Motorista carreteiro',
    cnh: '27590188321',
    categoria: 'E',
  },
};

const DEFAULT_VEHICLE: Omit<OperacoesEventVehicleDetail, 'placa' | 'gruposOrganizacao'> = {
  tipo: 'Caminhão',
  prefixo: '',
  marca: '—',
  modelo: '—',
  anoModelo: '—',
  combustivel: 'Diesel',
};

const DEFAULT_DRIVER: Omit<OperacoesEventDriverDetail, 'nome' | 'gruposOrganizacao'> = {
  matricula: '—',
  funcao: 'Motorista',
  cnh: '—',
  categoria: '—',
};

export function formatEventDateTime(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function formatEventDateOnly(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatEventTimeOnly(iso: string, deltaSeconds = 0): string {
  const date = new Date(iso);
  date.setSeconds(date.getSeconds() + deltaSeconds);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/** Dados auxiliares mockados para a nova seção "Dados do evento":
 *  localização (reverse geocoding), coordenadas e velocidade. Mantemos
 *  uma chave estável por placa para que o conjunto exibido seja
 *  consistente entre aberturas da modal. */
const EVENT_LOCATION_BY_PLACA: Record<
  string,
  { location: string; coordinates: string; speedKmh: number }
> = {
  SLE3P56: {
    location: 'Av. Pres. João Goulart, 551 — Centro Histórico, Porto Alegre - RS',
    coordinates: '-30.0346, -51.2177',
    speedKmh: 64,
  },
  FAL0M70: {
    location: 'BR-290, km 82 — Eldorado do Sul - RS',
    coordinates: '-30.0815, -51.6182',
    speedKmh: 78,
  },
  IQP2A01: {
    location: 'Rod. dos Tamoios, km 24 — Caçapava - SP',
    coordinates: '-23.0843, -45.7064',
    speedKmh: 56,
  },
  HQH5986: {
    location: 'Av. das Indústrias, 4500 — Canoas - RS',
    coordinates: '-29.9182, -51.1855',
    speedKmh: 47,
  },
  BKR5I96: {
    location: 'BR-116, km 274 — Esteio - RS',
    coordinates: '-29.8607, -51.1762',
    speedKmh: 82,
  },
};

const DEFAULT_EVENT_LOCATION = {
  location: 'Localização aproximada não disponível',
  coordinates: '—',
  speedKmh: 0,
};

export function buildOperacoesEventDetail(event: OperacoesEventRow): OperacoesEventDetailView {
  const vehicleBase = VEHICLE_BY_PLACA[event.placa] ?? DEFAULT_VEHICLE;
  const vehicle: OperacoesEventVehicleDetail = {
    ...vehicleBase,
    placa: event.placa,
    gruposOrganizacao: VEHICLE_GROUPS_BY_PLACA[event.placa] ?? [],
  };

  let driver: OperacoesEventDriverDetail | null = null;
  if (event.driverName) {
    const driverBase = DRIVER_BY_NAME[event.driverName] ?? DEFAULT_DRIVER;
    driver = {
      nome: event.driverName,
      ...driverBase,
      gruposOrganizacao: DRIVER_GROUPS_BY_NAME[event.driverName] ?? [],
    };
  }

  const location = EVENT_LOCATION_BY_PLACA[event.placa] ?? DEFAULT_EVENT_LOCATION;

  return {
    event,
    vehicle,
    driver,
    formattedDateTime: formatEventDateTime(event.occurredAt),
    eventDateLabel: formatEventDateOnly(event.occurredAt),
    eventTimeLabel: formatEventTimeOnly(event.occurredAt),
    // O recebimento é registrado alguns segundos depois do evento, simulando
    // a latência do dispositivo embarcado para a plataforma.
    receivedDateLabel: formatEventDateOnly(event.occurredAt),
    receivedTimeLabel: formatEventTimeOnly(event.occurredAt, 3),
    locationLabel: location.location,
    coordinatesLabel: location.coordinates,
    speedLabel: location.speedKmh > 0 ? `${location.speedKmh} km/h` : '—',
  };
}
