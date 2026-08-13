import type { InfobarContent } from '@/components/ui/infobar';

export const workspacesInfoContent: InfobarContent = {
  title: 'Gestão de Workspaces',
  sections: [
    {
      title: 'Visão geral',
      description:
        'A página de Workspaces permite gerenciar seus workspaces e alternar entre eles. Este recurso usa Clerk Organizations, que habilita a gestão multi-inquilino. Você pode ver todos os workspaces disponíveis, criar novos e alternar o workspace ativo.',
      links: [
        {
          title: 'Documentação do Clerk Organizations',
          url: 'https://clerk.com/docs/organizations/overview'
        }
      ]
    },
    {
      title: 'Criando workspaces',
      description:
        'Para criar um novo workspace, clique no botão "Criar Organização". Você deverá informar um nome e configurar as opções iniciais. Depois de criado, você pode alternar para o novo workspace e começar a gerenciá-lo.',
      links: [
        {
          title: 'Guia de autenticação multi-inquilino',
          url: 'https://clerk.com/blog/how-to-build-multitenant-authentication-with-clerk'
        }
      ]
    },
    {
      title: 'Alternando workspaces',
      description:
        'Você pode alternar entre workspaces clicando em um workspace da lista. O workspace selecionado passa a ser o contexto ativo da organização, e todos os recursos específicos da organização usarão esse workspace.',
      links: []
    },
    {
      title: 'Recursos do workspace',
      description:
        'Cada workspace opera de forma independente, com seus próprios membros, papéis, permissões e cobrança. Isso permite gerenciar vários projetos ou equipes em uma única conta, mantendo dados e configurações separados.',
      links: []
    },
    {
      title: 'Verificações de permissão no servidor',
      description:
        'Esta aplicação segue os padrões recomendados pelo Clerk para autenticação multi-inquilino. As verificações de permissão no servidor garantem que os usuários só acessem recursos da organização ativa.',
      links: [
        {
          title: 'Documentação do Clerk Organizations',
          url: 'https://clerk.com/docs/organizations/overview'
        }
      ]
    }
  ]
};

export const teamInfoContent: InfobarContent = {
  title: 'Gestão da Equipe',
  sections: [
    {
      title: 'Visão geral',
      description:
        'A página de Gestão da Equipe permite administrar a equipe do seu workspace, incluindo membros, papéis, configurações de segurança e muito mais. A página usa o componente OrganizationProfile do Clerk.',
      links: [
        {
          title: 'Documentação do Clerk Organizations',
          url: 'https://clerk.com/docs/organizations/overview'
        }
      ]
    },
    {
      title: 'Gerenciando membros',
      description:
        'Você pode adicionar, remover e gerenciar membros da equipe nesta página. Convide novos membros por e-mail, atribua papéis e controle os níveis de acesso. Cada membro pode ter permissões diferentes conforme seu papel.',
      links: []
    },
    {
      title: 'Papéis e permissões',
      description:
        'Configure papéis e permissões padrão no painel do Clerk, nas configurações de Organizations. Os papéis definem quais ações os membros podem executar no workspace. Os papéis mais comuns são admin, member e papéis personalizados.',
      links: [
        {
          title: 'Documentação do Clerk Organizations',
          url: 'https://clerk.com/docs/organizations/overview'
        }
      ]
    },
    {
      title: 'Configurações de segurança',
      description:
        'Gerencie as configurações de segurança do workspace, incluindo requisitos de autenticação, gestão de sessões e controles de acesso. Essas configurações ajudam a proteger os dados e recursos da sua organização.',
      links: []
    },
    {
      title: 'Configurações da organização',
      description:
        'Defina configurações gerais da organização, como nome, logotipo e outras preferências do workspace. Essas configurações valem para todo o workspace e afetam todos os membros da equipe.',
      links: []
    },
    {
      title: 'Sistema de RBAC na navegação',
      description:
        'A aplicação inclui um sistema de filtragem de navegação totalmente client-side usando o hook `useNav`. Ele suporta verificações de `requireOrg`, `permission` e `role` para controle de acesso instantâneo. Os itens de navegação são configurados em `src/config/nav-config.ts` com propriedades `access`.',
      links: []
    }
  ]
};

export const billingInfoContent: InfobarContent = {
  title: 'Planos e Cobrança',
  sections: [
    {
      title: 'Visão geral',
      description:
        'A página de Planos e Cobrança permite gerenciar a assinatura e os limites de uso da sua organização. Planos e assinaturas são gerenciados pelo Clerk Billing para B2B, com gestão de assinaturas no nível da organização e processamento de pagamentos integrado ao Stripe.',
      links: [
        {
          title: 'Documentação do Clerk Billing',
          url: 'https://clerk.com/docs/billing/overview'
        }
      ]
    },
    {
      title: 'Planos disponíveis',
      description:
        'Veja e assine os planos disponíveis na tabela de preços. Os planos são criados e gerenciados no painel do Clerk. Ative a opção "Publicly available" nos planos para exibi-los na tabela de preços. Os planos mais comuns são free, pro e team.',
      links: [
        {
          title: 'Painel do Clerk — Planos',
          url: 'https://dashboard.clerk.com/~/billing/plans'
        }
      ]
    },
    {
      title: 'Recursos do plano',
      description:
        'Cada plano pode incluir recursos específicos que desbloqueiam funcionalidades na aplicação. Os recursos são adicionados aos planos no painel do Clerk e podem ser verificados no código usando a função `has()` com checks de `feature`.',
      links: []
    },
    {
      title: 'Controle de acesso',
      description:
        'Planos e recursos são usados para controle de acesso em toda a aplicação. Verificações no servidor usam a função `has()` para validar o acesso a planos ou recursos. No cliente, o componente `<Show>` renderiza conteúdo condicionalmente conforme o status da assinatura.',
      links: []
    },
    {
      title: 'Estrutura de custos do Billing',
      description:
        'O Clerk Billing cobra 0,7% por transação, além das taxas pagas diretamente ao Stripe. O Clerk Billing não é o mesmo que o Stripe Billing — planos e preços são gerenciados no painel do Clerk e não sincronizam com produtos Stripe existentes. O Clerk usa o Stripe apenas para processamento de pagamentos.',
      links: []
    },
    {
      title: 'Requisitos de configuração',
      description:
        'Para habilitar a cobrança, acesse Billing Settings no painel do Clerk e ative o billing para a sua aplicação. Escolha entre o gateway de desenvolvimento do Clerk (para testes) ou sua própria conta Stripe (para produção). Atenção: uma conta Stripe criada para desenvolvimento não pode ser usada em produção.',
      links: [
        {
          title: 'Configurações de Billing',
          url: 'https://dashboard.clerk.com/~/billing/settings'
        }
      ]
    },
    {
      title: 'Status Beta',
      description:
        'O Billing está atualmente em Beta e suas APIs são experimentais, podendo sofrer mudanças incompatíveis. Para reduzir possíveis impactos, recomendamos fixar as versões do SDK e do pacote `clerk-js`.',
      links: []
    }
  ]
};

export const productInfoContent: InfobarContent = {
  title: 'Gestão de Produtos',
  sections: [
    {
      title: 'Visão geral',
      description:
        'A página de Produtos permite gerenciar o catálogo de produtos. Você pode ver todos os produtos em uma tabela com ordenação, filtros, paginação e busca no servidor. Use o botão "Adicionar Novo" para criar novos produtos.',
      links: [
        {
          title: 'Guia de gestão de produtos',
          url: '#'
        }
      ]
    },
    {
      title: 'Adicionando produtos',
      description:
        'Para adicionar um novo produto, clique no botão "Adicionar Novo" no cabeçalho da página. Você verá um formulário para informar os dados do produto, incluindo nome, descrição, preço, categoria e upload de imagens.',
      links: [
        {
          title: 'Documentação de cadastro de produtos',
          url: '#'
        }
      ]
    },
    {
      title: 'Editando produtos',
      description:
        'Você pode editar produtos existentes clicando em uma linha da tabela. Isso abre o formulário de edição, onde é possível alterar qualquer informação do produto. As mudanças são salvas automaticamente ao enviar o formulário.',
      links: [
        {
          title: 'Guia de edição de produtos',
          url: '#'
        }
      ]
    },
    {
      title: 'Excluindo produtos',
      description:
        'Produtos podem ser excluídos na tabela de listagem. Clique na ação de exclusão do produto que deseja remover. Será pedida a confirmação antes de o produto ser removido permanentemente do catálogo.',
      links: [
        {
          title: 'Política de exclusão de produtos',
          url: '#'
        }
      ]
    },
    {
      title: 'Recursos da tabela',
      description:
        'A tabela de produtos inclui vários recursos para gerenciar catálogos grandes com eficiência. Você pode ordenar colunas clicando nos cabeçalhos, filtrar produtos com os controles de filtro, navegar pelas páginas com a paginação e encontrar produtos rapidamente com a busca.',
      links: [
        {
          title: 'Documentação dos recursos da tabela',
          url: '#'
        },
        {
          title: 'Guia de ordenação e filtros',
          url: '#'
        }
      ]
    },
    {
      title: 'Campos do produto',
      description:
        'Cada produto pode ter os seguintes campos: Nome (obrigatório), Descrição (texto opcional), Preço (valor numérico), Categoria (para organizar os produtos) e Upload de Imagem (fotos do produto). Todos os campos podem ser editados ao criar ou atualizar um produto.',
      links: [
        {
          title: 'Especificação dos campos do produto',
          url: '#'
        }
      ]
    }
  ]
};
