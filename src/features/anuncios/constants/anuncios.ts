export type CanalAnuncio = 'olx' | 'webmotors' | 'mercadoLivre' | 'instagram' | 'facebook';

export type Anuncio = {
  id: string;
  veiculo: string;
  preco: number;
  canais: Record<CanalAnuncio, boolean>;
  visualizacoes: number;
  leads: number;
};

export const CANAL_ANUNCIO_LABELS: Record<CanalAnuncio, string> = {
  olx: 'OLX',
  webmotors: 'Webmotors',
  mercadoLivre: 'Mercado Livre',
  instagram: 'Instagram',
  facebook: 'Facebook'
};

export const anunciosMock: Anuncio[] = [
  {
    id: 'an-01',
    veiculo: 'Toyota Corolla XEi 2023',
    preco: 152900,
    canais: { olx: true, webmotors: true, mercadoLivre: true, instagram: true, facebook: true },
    visualizacoes: 312,
    leads: 4
  },
  {
    id: 'an-02',
    veiculo: 'Honda Civic Touring 2022',
    preco: 168500,
    canais: { olx: true, webmotors: true, mercadoLivre: false, instagram: true, facebook: false },
    visualizacoes: 245,
    leads: 3
  },
  {
    id: 'an-03',
    veiculo: 'Jeep Compass Longitude 2023',
    preco: 189900,
    canais: { olx: true, webmotors: true, mercadoLivre: true, instagram: false, facebook: true },
    visualizacoes: 198,
    leads: 2
  },
  {
    id: 'an-04',
    veiculo: 'Volkswagen T-Cross Sense 2021',
    preco: 112900,
    canais: { olx: true, webmotors: false, mercadoLivre: true, instagram: true, facebook: true },
    visualizacoes: 176,
    leads: 2
  },
  {
    id: 'an-05',
    veiculo: 'Chevrolet Onix Plus Premier 2024',
    preco: 98900,
    canais: { olx: true, webmotors: true, mercadoLivre: true, instagram: true, facebook: true },
    visualizacoes: 289,
    leads: 5
  },
  {
    id: 'an-06',
    veiculo: 'Hyundai HB20 Platinum 2023',
    preco: 104500,
    canais: { olx: false, webmotors: true, mercadoLivre: false, instagram: true, facebook: false },
    visualizacoes: 121,
    leads: 1
  },
  {
    id: 'an-07',
    veiculo: 'Fiat Toro Volcano 2022',
    preco: 176900,
    canais: { olx: true, webmotors: true, mercadoLivre: true, instagram: false, facebook: false },
    visualizacoes: 154,
    leads: 1
  },
  {
    id: 'an-08',
    veiculo: 'Toyota Hilux SRV 2023',
    preco: 289900,
    canais: { olx: true, webmotors: true, mercadoLivre: true, instagram: true, facebook: true },
    visualizacoes: 352,
    leads: 6
  },
  {
    id: 'an-09',
    veiculo: 'Honda HR-V EXL 2023',
    preco: 172900,
    canais: { olx: true, webmotors: false, mercadoLivre: false, instagram: true, facebook: true },
    visualizacoes: 98,
    leads: 1
  },
  {
    id: 'an-10',
    veiculo: 'Nissan Kicks Advance 2021',
    preco: 96900,
    canais: { olx: false, webmotors: false, mercadoLivre: true, instagram: false, facebook: false },
    visualizacoes: 64,
    leads: 0
  }
];

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
