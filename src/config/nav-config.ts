import { NavGroup } from '@/types';

/**
 * Configuração de navegação com suporte a RBAC
 *
 * Esta configuração é usada tanto na navegação da sidebar quanto na barra Cmd+K.
 * Os itens são organizados em grupos, cada um renderizado com um SidebarGroupLabel.
 *
 * Controle de acesso RBAC:
 * Cada item de navegação pode ter uma propriedade `access` que controla a
 * visibilidade com base em permissões, planos, recursos, papéis e contexto
 * da organização.
 *
 * Exemplos:
 *
 * 1. Exigir organização:
 *    access: { requireOrg: true }
 *
 * 2. Exigir permissão específica:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Exigir plano específico:
 *    access: { plan: 'pro' }
 *
 * 4. Exigir recurso específico:
 *    access: { feature: 'premium_access' }
 *
 * 5. Exigir papel específico:
 *    access: { role: 'admin' }
 *
 * 6. Múltiplas condições (todas devem ser verdadeiras):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Nota: a função `visible` está depreciada, mas ainda é suportada para
 * compatibilidade. Use a propriedade `access` para novos itens.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      {
        title: 'Visão Geral',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Operação da Loja',
    items: [
      {
        title: 'Fiscal e Notas',
        url: '#',
        icon: 'receipt',
        isActive: true,
        items: [
          {
            title: 'Notas Fiscais',
            url: '/dashboard/fiscal',
            icon: 'receipt'
          },
          {
            title: 'Emitir Nota',
            url: '/dashboard/fiscal/nova',
            icon: 'add'
          },
          {
            title: 'Impostos e Contabilidade',
            url: '/dashboard/contabilidade',
            icon: 'calculator'
          },
          {
            title: 'Contratos e Documentos',
            url: '/dashboard/contratos',
            icon: 'fileContract'
          }
        ]
      },
      {
        title: 'Estoque',
        url: '/dashboard/estoque',
        icon: 'car',
        isActive: false,
        shortcut: ['e', 'e'],
        items: []
      },
      {
        title: 'Financeiro',
        url: '#',
        icon: 'cash',
        isActive: true,
        items: [
          {
            title: 'Visão Financeira',
            url: '/dashboard/financeiro',
            icon: 'chartBar'
          },
          {
            title: 'Fluxo de Caixa',
            url: '/dashboard/financeiro/fluxo-caixa',
            icon: 'cash'
          },
          {
            title: 'DRE',
            url: '/dashboard/financeiro/dre',
            icon: 'page'
          }
        ]
      },
      {
        title: 'Agenda e Horários',
        url: '/dashboard/agenda',
        icon: 'calendar',
        isActive: false,
        shortcut: ['a', 'a'],
        items: []
      }
    ]
  },
  {
    label: 'Crescimento',
    items: [
      {
        title: 'Anúncios',
        url: '/dashboard/anuncios',
        icon: 'megaphone',
        isActive: false,
        items: []
      },
      {
        title: 'IA Kalman',
        url: '/dashboard/ia-kalman',
        icon: 'brain',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Automação (Operação IA)',
    items: [
      {
        title: 'Leads',
        url: '/dashboard/leads',
        icon: 'users',
        isActive: false,
        items: []
      },
      {
        title: 'Robô WhatsApp',
        url: '/dashboard/robo',
        icon: 'robot',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Conta',
    items: [
      {
        title: 'Workspaces',
        url: '/dashboard/workspaces',
        icon: 'workspace',
        isActive: false,
        items: []
      },
      {
        title: 'Equipe',
        url: '/dashboard/workspaces/team',
        icon: 'teams',
        isActive: false,
        items: [],
        access: { requireOrg: true }
      },
      {
        title: 'Perfil',
        url: '/dashboard/profile',
        icon: 'profile',
        isActive: false,
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'Notificações',
        url: '/dashboard/notifications',
        icon: 'notification',
        isActive: false,
        shortcut: ['n', 'n'],
        items: []
      },
      {
        title: 'Planos e Cobrança',
        url: '/dashboard/billing',
        icon: 'billing',
        isActive: false,
        shortcut: ['b', 'b'],
        items: [],
        access: { requireOrg: true }
      }
    ]
  }
];
