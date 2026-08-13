import type { Conversation } from './types';

export const initialConversations: Conversation[] = [
  {
    id: 'corolla-interesse',
    name: 'Marcos Vinícius',
    title: 'Interesse no Corolla XEi 2023',
    status: 'online',
    unread: 2,
    initials: 'MV',
    respondidaPor: 'robo',
    messages: [
      {
        id: 'corolla-1',
        sender: 'contact',
        author: 'Marcos Vinícius',
        text: 'Bom dia! Vi o anúncio do Corolla XEi 2023 na OLX. Ele ainda está disponível?',
        timestamp: '09:12'
      },
      {
        id: 'corolla-2',
        sender: 'user',
        author: 'Robô Kalman',
        text: 'Bom dia, Marcos! Sim, o Corolla XEi 2023 está disponível por R$ 152.900,00. Ele tem 28.000 km, único dono e revisões na concessionária. Quer agendar um test-drive?',
        timestamp: '09:12'
      },
      {
        id: 'corolla-3',
        sender: 'contact',
        author: 'Marcos Vinícius',
        text: 'Quero sim! Tem horário amanhã de manhã?',
        timestamp: '09:15'
      }
    ],
    quickReplies: [
      'Temos horário amanhã às 9h, pode ser?',
      'Posso te mandar mais fotos do veículo.',
      'Aceitamos seu usado na troca, quer uma avaliação?'
    ],
    autoReplies: [
      'Perfeito! Deixei pré-agendado para amanhã às 9h com o vendedor Carlos. Você receberá a confirmação aqui mesmo no WhatsApp.',
      'Claro! Vou te enviar as fotos internas e o laudo da vistoria cautelar.',
      'Ótimo! Me passa a placa e o ano do seu carro que já faço uma pré-avaliação.'
    ]
  },
  {
    id: 'hb20-test-drive',
    name: 'Luciana Pereira',
    title: 'Agendamento de test-drive — HB20',
    status: 'online',
    unread: 0,
    initials: 'LP',
    respondidaPor: 'robo',
    messages: [
      {
        id: 'hb20-1',
        sender: 'contact',
        author: 'Luciana Pereira',
        text: 'Oi! Queria agendar um test-drive no HB20 Platinum 2023.',
        timestamp: '08:47'
      },
      {
        id: 'hb20-2',
        sender: 'user',
        author: 'Robô Kalman',
        text: 'Olá, Luciana! Temos horários livres hoje às 15h30 e amanhã às 10h. Qual prefere?',
        timestamp: '08:47'
      },
      {
        id: 'hb20-3',
        sender: 'contact',
        author: 'Luciana Pereira',
        text: 'Hoje às 15h30 está ótimo!',
        timestamp: '08:49'
      },
      {
        id: 'hb20-4',
        sender: 'user',
        author: 'Robô Kalman',
        text: 'Agendado! Test-drive do HB20 Platinum hoje às 15h30 com a vendedora Fernanda. Traga sua CNH. O endereço é Av. das Nações, 1250 — São Paulo/SP.',
        timestamp: '08:49'
      }
    ],
    quickReplies: [
      'Posso remarcar se precisar.',
      'Quer simular o financiamento antes da visita?',
      'O HB20 tem garantia de 1 ano da loja.'
    ],
    autoReplies: [
      'Sem problema! Me diz qual dia e horário fica melhor para você.',
      'Consigo simular agora: entrada a partir de R$ 20.000 e parcelas de R$ 1.890 em 48x.',
      'Isso mesmo! E ele passou pela vistoria cautelar aprovada.'
    ]
  },
  {
    id: 'hilux-negociacao',
    name: 'Thiago Barros',
    title: 'Negociação — Hilux SRV 2023',
    status: 'offline',
    unread: 1,
    initials: 'TB',
    respondidaPor: 'humano',
    messages: [
      {
        id: 'hilux-1',
        sender: 'contact',
        author: 'Thiago Barros',
        text: 'Boa tarde. A Hilux SRV 2023 está por R$ 289.900, certo? Faz por R$ 275.000 à vista?',
        timestamp: 'Ontem'
      },
      {
        id: 'hilux-2',
        sender: 'user',
        author: 'Robô Kalman',
        text: 'Boa tarde, Thiago! A Hilux está impecável, com 41.000 km. Vou te passar para o vendedor Carlos para conversarmos sobre a proposta, tudo bem?',
        timestamp: 'Ontem'
      },
      {
        id: 'hilux-3',
        sender: 'user',
        author: 'Carlos Menezes',
        text: 'Oi Thiago, aqui é o Carlos. À vista consigo chegar a R$ 281.900 e ainda faço a transferência de graça. O que acha?',
        timestamp: 'Ontem'
      }
    ],
    quickReplies: [
      'Posso incluir IPVA 2025 pago.',
      'Fecho a R$ 279.900 se fechar hoje.',
      'Quer vir ver a caminhonete amanhã?'
    ],
    autoReplies: [
      'Fechado! Vou separar a documentação e te mando o contrato aqui.',
      'Entendo. A proposta fica válida até sexta-feira, tá bom?',
      'Perfeito, te espero amanhã às 10h. Vou deixar ela lavada e pronta para você ver.'
    ]
  },
  {
    id: 'onix-financiamento',
    name: 'Renata Souza',
    title: 'Dúvidas sobre financiamento — Onix',
    status: 'offline',
    unread: 0,
    initials: 'RS',
    respondidaPor: 'robo',
    messages: [
      {
        id: 'onix-1',
        sender: 'contact',
        author: 'Renata Souza',
        text: 'Olá! Vocês financiam o Onix Plus Premier 2024 sem entrada?',
        timestamp: 'Segunda-feira'
      },
      {
        id: 'onix-2',
        sender: 'user',
        author: 'Robô Kalman',
        text: 'Olá, Renata! Trabalhamos com financiamento em até 60x e, sujeito a análise de crédito, dá sim para financiar sem entrada. O Onix Plus Premier 2024 sai por R$ 98.900,00. Quer que eu faça uma simulação?',
        timestamp: 'Segunda-feira'
      },
      {
        id: 'onix-3',
        sender: 'contact',
        author: 'Renata Souza',
        text: 'Quero sim. Meu score é bom.',
        timestamp: 'Segunda-feira'
      }
    ],
    quickReplies: [
      'Simulação: 60x de R$ 2.340 sem entrada.',
      'Com R$ 15.000 de entrada, fica 48x de R$ 1.790.',
      'Posso agendar uma visita para você ver o carro.'
    ],
    autoReplies: [
      'Pronto! Com o seu perfil, a simulação ficou em 60x de R$ 2.340 sem entrada. Posso dar entrada na análise de crédito agora mesmo.',
      'A análise foi aprovada! Quando quiser, agendo a assinatura do contrato.',
      'Combinado! Te espero aqui na loja para conhecer o Onix de perto.'
    ]
  }
];
