# Consignações e geração de contratos

## O que foi implementado

O módulo permite cadastrar uma negociação uma única vez e reaproveitar os dados da loja, do proprietário/vendedor, do comprador e do veículo nos documentos. O menu **Consignações** acompanha consignação estimatória, comissão e intermediação. **Contratos e Documentos** reúne também compra e venda e repasse para revenda.

Rotas:

- `/dashboard/consignacoes`: lista, busca, situação, prazo e saldo do proprietário.
- `/dashboard/consignacoes/nova`: cadastro da negociação, inclusive preenchimento pelo estoque.
- `/dashboard/consignacoes/[id]`: dados, documentos, acerto financeiro e histórico.
- `/dashboard/contratos`: negociações e biblioteca dos 12 modelos.

O cadastro do veículo no estoque com origem **Consignação** encaminha ao cadastro do acordo. A ação **Formalizar operação** na tabela reutiliza o veículo escolhido. Os dados usados no contrato são copiados para o dossiê; atualizações posteriores no estoque não alteram os documentos.

O catálogo completo e as fontes oficiais estão em [contratos-base-juridica.md](contratos-base-juridica.md). Ele inclui compra e venda, consignação estimatória, comissão, intermediação, repasse para revenda, vistoria de entrada, autorização de despesas/desconto, aditivo, prestação de contas, recibo de repasse, devolução e distrato.

## Configuração do servidor

Esta branch tinha estoque em memória e geração de contratos simulada. O novo módulo tem armazenamento PostgreSQL e não usa dados de demonstração como se fossem registros de produção.

1. Instale as dependências com `bun install --frozen-lockfile`.
2. Mantenha o Clerk configurado, habilite Organizations e selecione a empresa ativa.
3. Configure `DATABASE_URL` como segredo **somente do servidor**. Não use prefixo `NEXT_PUBLIC_`.
4. Aplique `bun run db:migrate:negociacoes` no banco escolhido. O comando usa `MIGRATION_DATABASE_URL`, quando fornecida, ou `DATABASE_URL`. A aplicação não executa migrações automaticamente.
5. Configure a role utilizada pela aplicação sem `SUPERUSER` nem `BYPASSRLS`. Se migração e aplicação usam roles distintas, conceda uso do schema, `SELECT/INSERT/UPDATE` em `kalman_negociacoes` e `SELECT/INSERT` nas tabelas de documentos e eventos. A role da aplicação não precisa de `DELETE`, criação de tabelas ou alteração de triggers.
6. Configure backups e recuperação do banco, conexões TLS conforme seu provedor e a política de retenção dos documentos.

Exemplo de concessões, substituindo `kalman_app` pela role real criada pelo administrador:

```sql
GRANT USAGE ON SCHEMA public TO kalman_app;
GRANT SELECT, INSERT, UPDATE ON kalman_negociacoes TO kalman_app;
GRANT SELECT, INSERT ON kalman_negociacao_documentos, kalman_negociacao_eventos TO kalman_app;
```

Esses exemplos usam o schema `public`. A migração e a aplicação devem resolver as tabelas no mesmo schema: mantenha o mesmo `search_path` para suas conexões ou configure-o explicitamente nas roles quando usar outro schema.

Administradores da organização podem gerir o módulo. Para um papel personalizado, atribua a permissão `org:consignacao:manage` no Clerk. Membros autenticados podem consultar. A autorização é verificada em todas as Server Actions; esconder botões não concede nem revoga acesso.

Sem banco configurado, a interface informa a configuração pendente e não oferece falso sucesso de gravação. Para desenvolvimento, `CONSIGNACAO_DEMO=true` com `NODE_ENV=development` habilita memória temporária por empresa, com aviso visível. Ainda exige autenticação e empresa reais no Clerk. O modo de demonstração é recusado em produção.

## Fluxo de uso

1. Cadastre a negociação e escolha a modalidade que corresponde à atuação real da loja. É possível salvar um rascunho ainda incompleto; dados preenchidos já passam por validação formal.
2. Complete identificação, condições e documentos. CPF/CNPJ, inclusive CNPJ alfanumérico, são conferidos formalmente; não se presume identidade, propriedade ou situação cadastral oficial.
3. Em **Documentos**, escolha o modelo, complete os campos específicos e confira a prévia. **Salvar minuta** conserva pendências. **Emitir documento** só é permitido depois de resolvê-las, com nova validação no servidor.
4. Baixe o HTML independente ou use **Imprimir / salvar PDF**. A impressão utiliza o texto da versão registrada, sem fontes, scripts ou recursos externos. A via assinada e seus anexos devem ser conservados no processo da operação.
5. Ative uma consignação com a referência do instrumento formalizado. Isso registra a declaração do operador e não verifica assinatura.
6. Registre venda, recebimentos, despesas e pagamentos ao proprietário conforme efetivamente ocorram, com datas e referências de comprovantes. O sistema não executa transações bancárias.
7. Para mudar termos de uma operação ativa, gere e formalize o aditivo e use **Registrar aditivo**, informando a referência. Os valores e o prazo anteriores permanecem no histórico.
8. Registre devolução com vistoria ou conclua o acerto conforme o caso. Encerramento operacional e quitação são fatos distintos.

**Repasse para revenda** é uma compra e venda com finalidade profissional declarada, comprador PJ e condições próprias; não se confunde com **repasse financeiro ao proprietário**. O nome da operação não afasta direitos legais do comprador.

## Regras financeiras

- Dinheiro é armazenado em centavos inteiros; percentuais usam pontos base (100 pontos = 1%). Comissão percentual tem arredondamento half-up com aritmética inteira.
- No estimatório, o preço do proprietário não é reduzido automaticamente por descontos, remuneração ou despesas. Pode ser pago com recursos da loja antes de uma venda a terceiro, sem inventar recebimento de comprador.
- Na comissão, o fluxo atual permite repasse depois do recebimento integral do comprador. Repasses proporcionais a parcelas exigem expansão específica do fluxo e ajuste contratual.
- Na intermediação, o recebimento pelo vendedor pode ser registrado, mas não se presume mandato para a loja receber e repassar o preço. A remuneração da loja é acertada separadamente.
- O teto de despesas autorizadas não vira gasto. Só despesas efetivas registradas com comprovante entram no acerto.
- Piso de venda, soma das parcelas, limites de despesa, pagamento acima do saldo e duplicidade de movimentos são validados.
- Aditivos não reduzem o preço estimado abaixo do já pago nem o teto de despesas abaixo do já incorrido.

## Persistência e integridade

`src/features/consignacao/api/service.ts` é o contrato da interface. Server Actions validam sessão e empresa antes de acessar o armazenamento. `domain/negociacao.ts` contém transições e cálculos puros.

A migração cria três tabelas isoladas por organização. As consultas usam parâmetros, a empresa vem exclusivamente do Clerk, e RLS com `FORCE ROW LEVEL SECURITY` atua como segunda barreira. Atualizações verificam versão e usam transação com bloqueio da linha. A placa e o chassi não podem ter mais de uma operação ativa ou vendida na mesma empresa.

Documentos e eventos são inseridos em tabelas próprias. Triggers impedem alteração/exclusão desses registros. Cada documento conserva texto, campos, versão do modelo, cópia dos dados da negociação, autor, data e hash SHA-256 do conteúdo. A impressão consulta essa versão; não reconstrói o documento com os dados atuais.

O hash permite comparar o conteúdo preservado; ele não autentica signatários nem comprovantes. Referências externas são textos declarados pelo operador. Não há upload/guarda de arquivos assinados ou integração de provedor de assinatura nesta entrega. O envio simulado existente foi removido do fluxo de contratos.

As chaves do cache incluem a organização. A interface bloqueia a visualização do contexto anterior ao trocar de empresa e remove seu cache. Erros enviados ao navegador não incluem SQL, URL de conexão ou informações brutas do provedor.

## Verificações

```bash
bun run typecheck
bun run test:consignacao
bun run lint:strict
bun run build
```

O lint global pode apontar problemas preexistentes em outros módulos; a CI também executa lint estrito dos arquivos das funcionalidades alteradas.

Os testes de banco usam um banco isolado, com permissão para criar schema e role temporários:

```bash
# Somente banco de testes; não use o banco de produção.
TEST_DATABASE_URL=postgres://usuario:senha@localhost:5432/kalman_tests bun run test:database
```

Também é possível fornecer `PGLITE_MODULE_PATH` apontando para a instalação local de `@electric-sql/pglite`. A suíte aplica a migração real e usa role sem privilégios para verificar RLS, unicidade, imutabilidade e rollback. Sem uma dessas configurações, o teste registra skip explícito. O workflow de CI provisiona PostgreSQL 17 efêmero, sem acesso a dados de clientes.

## Limites de integração

O estoque e os demais módulos de ERP preexistentes continuam usando seus adaptadores atuais. A nova negociação preserva o veículo selecionado, mas não afirma sincronizar vendas, notas fiscais, estoque, DRE ou caixa com um backend que ainda não existe nesses módulos. O acerto financeiro da negociação está disponível no próprio dossiê. Substituir os adaptadores de estoque/fiscal/financeiro por dados reais é uma etapa distinta.

Não são gerados CRLV-e, ATPV oficial, laudos periciais, comunicações de venda, transferências no Detran ou assinaturas eletrônicas. Modelos e campos precisam ser revisados juridicamente para a atuação real da empresa. Financiamento, permuta, veículos especiais, litígio ou garantias adicionais fora do catálogo exigem instrumento e fluxo específicos.

## Atualização dos modelos

Altere `VERSAO_MODELOS` ao mudar a redação e mantenha os testes dos modelos. Novas emissões usam a nova versão; os documentos já salvos permanecem iguais. Não se deve editar o texto histórico para representar um aditivo.
