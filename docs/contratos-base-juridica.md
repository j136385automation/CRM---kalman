# Contratos e consignação de veículos: base jurídica e decisões de produto

Data da pesquisa: 29 de outubro de 2026. Versão dos modelos: `2026.10.29-1`.

Os modelos em `src/features/contratos/lib/templates.ts` são instrumentos parametrizados para o fluxo de veículos usados. A redação busca clareza de obrigações, documentação dos fatos e preservação das normas obrigatórias. Não existe garantia de “blindagem jurídica”: a adequação depende dos fatos, da atuação real das partes, da documentação, das normas estaduais e da análise jurídica da operação. A revisão por advogado da empresa deve considerar as condições comerciais efetivamente praticadas, especialmente financiamento, garantias, permutas, retenções, representação, sinistros e litígios.

## Escopo e uso do catálogo

| Identificador | Modelo | Uso e condição principal |
| --- | --- | --- |
| `compra_venda` | Compra e venda de veículo usado | Vendedor, comprador, veículo, preço, parcelas, entrega e deveres documentais completos. Pode ser emitido a partir do dossiê de consignação quando o comprador e as condições de venda estiverem cadastrados. |
| `consignacao_estimatoria` | Consignação estimatória | Entrega física à loja; pagar o preço estimado ou devolver integralmente no prazo. |
| `comissao` | Comissão de venda | Loja vende em nome próprio por conta do proprietário e presta contas. |
| `intermediacao` | Intermediação de venda | Loja aproxima as partes, sem poderes presumidos para vender, transferir, receber o preço ou dar quitação. |
| `repasse_revenda` | Venda para revenda — repasse | Comprador pessoa jurídica, CNPJ formalmente válido, atividade e destinação para revenda declaradas. Não é exclusão automática do CDC. |
| `vistoria_entrada` | Entrega, recebimento e vistoria comercial | Guarda pela loja, responsável, data/hora, estado, acessórios e evidências. Não é laudo pericial. |
| `autorizacao_despesa_desconto` | Autorização específica | Objeto, valor máximo, impacto financeiro, validade, responsável e referência contratual expressos. Não comprova gasto ou pagamento. |
| `aditivo` | Alteração contratual | Identifica instrumento original, cláusulas alteradas, nova redação, vigência e efeito financeiro. |
| `prestacao_contas` | Demonstrativo e prestação de contas | Usa movimentos reais do dossiê; exige venda efetivada ou obrigação estimatória ativa. |
| `recibo_repasse` | Recibo de pagamento ao proprietário | Seleciona um repasse existente e seu comprovante; sem valor livre que possa fabricar pagamento. |
| `devolucao` | Devolução e encerramento de guarda | Usa evento de devolução com vistoria e evidência, preservando saldos e ressalvas. |
| `distrato` | Encerramento consensual | Discrimina destino do veículo, pagamentos, devoluções, vencimentos e obrigações remanescentes. |

“Repasse” possui dois sentidos distintos no catálogo: venda de veículo para revenda e pagamento de valores ao proprietário. São documentos e fatos diferentes. CNPJ e declaração de revenda ajudam a documentar a finalidade, mas não resolvem isoladamente o enquadramento jurídico.

Quando a venda decorre de consignação estimatória ou comissão, o contrato de venda identifica a loja como vendedora em nome próprio e o proprietário como participante dos atos que lhe competem. O campo de participação da loja e a referência ao instrumento principal devem refletir a operação efetiva. Para intermediação, o vendedor permanece o proprietário/legitimado, com a loja na atuação declarada. Divergências de titularidade ou poderes não são corrigidas pelo gerador.

## Distinção das três modalidades

O Código Civil disciplina separadamente contrato estimatório (arts. 534–537), comissão (arts. 693–709) e corretagem (arts. 722–729). Na modalidade estimatória, a restituição integral ou o pagamento têm papel central; o art. 535 mantém a obrigação de pagar se a restituição integral se tornar impossível, ainda que sem culpa. Comissão é atuação em nome próprio por conta alheia; intermediação busca obter o negócio e tem regras próprias de remuneração, resultado e exclusividade. O nome comercial dado pelas partes não substitui os fatos. [1]

Decisões do produto:

- O preço estimado permanece integral: comissão, despesas e desconto comercial não o reduzem automaticamente.
- A consignação estimatória admite pagamento ao proprietário sem inventar venda a terceiro. A liquidação operacional não substitui eventual documentação de aquisição ou registro necessário.
- Comissão e intermediação usam remuneração própria. O teto de despesa representa autorização, e não débito já ocorrido. Só movimentos efetivos com comprovante entram na apuração.
- Na comissão, o modelo atual prevê repasse depois do recebimento integral; parcelamento ou antecipação com repasses proporcionais exige ajuste e fluxo próprio. Não se promete no contrato uma liquidação que o módulo não realiza.
- A intermediação não presume mandato para a loja receber o preço. O recebimento do vendedor pode ser registrado de forma informativa, e a remuneração da loja é acertada separadamente.
- O prazo estimatório não é prorrogado implicitamente pelo crédito concedido ao comprador. A concessão de parcelamento não libera a loja de suas obrigações.

## Veículo, titularidade, guarda e transferência

Os campos de identificação individualizam placa, chassi, RENAVAM, modelo/ano, cor, combustível e quilometragem observada. A quilometragem informada não certifica a história do hodômetro. O cadastro deve descrever restrições, gravames, histórico conhecido de sinistro/leilão/alagamento, avarias e acessórios. “Não identificado nas consultas X de data Y” é diferente de afirmar garantia de inexistência. O sistema não consulta registros oficiais nem autentica documentos por preencher esses campos.

O contrato exige descrição de débitos e alocação interna: IPVA, licenciamento, multas, gravames, financiamento e custos de regularização. Essa divisão não vincula automaticamente Fisco, autoridade de trânsito, vítimas ou terceiros. O fluxo deve guardar documentos, consultas datadas, poderes de representação e evidências da regularização. O CPF/CNPJ é validado formalmente, inclusive dígitos verificadores; isso não certifica identidade, situação cadastral, representação ou propriedade.

O CTB prevê providências do novo proprietário para registro, em regra em 30 dias, e deveres de comunicação do antigo proprietário; devem ser observados os arts. 123 e 134. O § 4º do art. 123, incluído pela Lei 15.153/2025, estabelece regras específicas para transferência eletrônica. Não basta assinar um documento no CRM para obter os efeitos administrativos. [2][3]

A Resolução CONTRAN 1.027/2026 trata de registro, licenciamento e modalidades de transferência e revogou as Resoluções 809/2020, 817/2021 e 999/2023. Requisitos oficiais, homologação de plataformas e efetiva implantação dos serviços devem ser verificados com a autoridade competente. [4] Assim, o CRM gera instrumentos privados; não gera CRLV-e, ATPV oficial, comunicação de venda, vistoria oficial ou registro Renavam. O termo comercial não deve reproduzir selo, laudo ou certificação oficial inexistente.

Entrada, saída e test-drive devem registrar responsáveis, data/hora, hodômetro, finalidade, habilitação e limites autorizados. Seguro precisa indicar cobertura, franquia, vigência e beneficiário efetivos, ou sua ausência. Descrever uma apólice não confirma cobertura; a seguradora e as condições devem ser consultadas. O modelo estimatório não inclui exclusão genérica de responsabilidade por furto, roubo ou sinistro.

## Garantias, informação e consumidor

Os arts. 18, 24–26 e 51 do CDC são relevantes para responsabilidade por vícios, garantia legal, prazos e nulidade de cláusulas abusivas. A garantia legal não depende de concessão contratual; o prazo de reclamação por vício aparente em produto durável é de 90 dias, e o vício oculto tem início de contagem próprio. A aplicação concreta deve considerar a relação e o defeito. [5]

Os modelos não incluem “sem garantia”, limitação genérica a “motor e câmbio”, renúncia de vícios ocultos, quitação antecipada de dano desconhecido ou cláusula que afaste automaticamente o CDC por CNPJ ou pela expressão “repasse”. Vistoria e ciência de defeitos específicos documentam informação; não substituem os deveres legais. Fora da incidência do CDC, continuam relevantes boa-fé, vícios redibitórios, evicção e obrigações assumidas. A relação interna proprietário/loja não elimina direitos do comprador.

## Assinatura, testemunhas, documentos e prova

A MP 2.200-2/2001 disciplina documentos eletrônicos, ICP-Brasil e a possibilidade de outros meios de comprovar autoria e integridade nas condições de seu art. 10. [6] Validade de um ajuste não é idêntica a prova suficiente de autoria ou a título executivo.

Os arts. 783 e 784 do CPC exigem requisitos próprios para execução. O art. 784, III, trata do documento particular assinado pelo devedor e duas testemunhas; o § 4º contempla títulos eletrônicos e dispensa de testemunhas quando a integridade é conferida por provedor de assinatura. A inclusão de linhas de testemunha ou de hash no CRM não garante atendimento dos requisitos nem torna toda obrigação certa, líquida e exigível. [7]

Por isso, o módulo distingue minuta e documento emitido e não cria status “assinado” a partir de um clique de emissão. Guardam-se versão do modelo, texto, dados de origem e identificadores de emissão. O hash detecta alterações em relação à versão preservada; não autentica sozinho o signatário, a compensação bancária ou a origem do fato declarado. Anexos e instrumentos efetivamente assinados devem ser conservados com evidências adequadas. A integração a provedor de assinatura é uma implementação separada.

O recibo usa movimento existente e declara que a confirmação cabe ao beneficiário ao assinar após conferir o crédito. Não transforma um registro interno em verificação bancária. Devolução física, status operacional e quitação financeira são fatos separados.

## Encargos e foro

Os modelos não prefixam multa ou juros contratuais. Na falta de convenção válida ou lei específica, remetem à disciplina vigente dos arts. 389 e 406 do Código Civil. A Lei 14.905/2024 alterou atualização monetária e taxa legal; não se mantém a antiga referência genérica a juros legais de 1% ao mês. Cálculos concretos precisam observar metodologia aplicável, períodos e proibição de duplicar atualização. [8]

O art. 63 do CPC, alterado pela Lei 14.879/2024, exige pertinência do foro com domicílio/residência das partes ou local da obrigação, ressalvadas regras de proteção do consumidor. [9] O gerador pede foro e, quando diferente dos domicílios informados, explicação de vínculo. Essa conferência textual é auxílio de preenchimento, não decisão jurídica sobre competência. Não há arbitragem compulsória ou renúncia absoluta de acesso à Justiça.

## Dados pessoais

As cláusulas usam finalidades relacionadas à contratação, deveres legais e exercício de direitos, sem consentimento genérico irrevogável. As bases legais são avaliadas pelo responsável conforme a operação; marketing não recebe autorização automática. Os arts. 6º, 7º, 9º, 18 e 46 da LGPD orientam necessidade, transparência, direitos e segurança. [10] O contato de privacidade é obrigatório nos modelos. Retenção, compartilhamentos, papéis de controlador/operador e resposta a direitos devem ser definidos na operação real, com acesso restrito e isolamento entre empresas.

## Validação, revisões e limites do gerador

`renderDocumento(negociacao, modeloId, campos)` é determinística para os dados recebidos e retorna texto simples, título, versão e pendências. O cliente pode exibir prévia incompleta, destacada como minuta; a emissão final no servidor deve falhar enquanto existir pendência. Os campos adicionais do catálogo alimentam a interface e as validações. Não há preenchimento automático de fatos como “vistoriado”, “pago”, “sem restrições” ou “assinado”.

O validador verifica completude, documentos formais, compatibilidade de modalidade, identificação veicular, preços/parcelas, datas e existência dos movimentos exigidos. Não verifica a verdade material, adequação de um texto livre, existência dos anexos indicados ou procedência de um comprovante. Os modelos exigem que os registros e anexos referidos sejam entregues e conferidos pelas partes. Documentos adicionais de garantia, financiamento, procuração, aquisição com troca, inventário, veículo especial ou caso litigioso exigem instrumento específico e não são inventados pelo catálogo.

O contrato de venda respeita o piso autorizado também quando emitido como documento secundário da consignação. A aprovação de um desconto em texto livre não altera automaticamente esse piso: é necessário registrar o ajuste das condições com sua referência documental. Venda secundária exige operação ativada e data dentro da vigência; quando já existe venda efetivada, a validação utiliza a data desse fato, e o texto identifica que uma formalização posterior não cria nova venda. Dossiês devolvidos, cancelados ou liquidados sem venda a terceiro não geram novo contrato de venda. As vias originais continuam disponíveis pelo conteúdo preservado, sem regeneração a partir do estado atual.

Email e telefone das partes são opcionais quando sua identificação e endereço estão completos; o instrumento explicita sua ausência. Isso preserva a coerência com o cadastro e evita bloquear novas vias apenas porque uma operação já ativada não continha contato eletrônico. O canal de privacidade do responsável continua obrigatório como informação própria do documento.

Antes de alterar texto contratual, aumentar `VERSAO_MODELOS`, revisar os testes e preservar documentos já emitidos. Um aditivo gerado não muda automaticamente um contrato assinado nem autoriza reescrever seu histórico. A modalidade operacional precisa coincidir com a contratação efetiva. Políticas fiscais estaduais, emissão de notas e integração contábil precisam de configuração própria; esses instrumentos não prometem cumprimento tributário integral.

## Fontes oficiais

Consultadas em 29/10/2026. O texto consolidado e os atos posteriores devem ser conferidos novamente ao atualizar o catálogo.

1. [Código Civil — Lei 10.406/2002, texto consolidado](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm), especialmente arts. 421–424, 441–457, 534–537, 693–709 e 722–729.
2. [Código de Trânsito Brasileiro — Lei 9.503/1997](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm), especialmente arts. 123, 124, 134 e 233.
3. [Lei 15.153/2025 — texto atualizado na Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/2025/lei-15153-26-junho-2025-797659-normaatualizada-pl.html).
4. [Resolução CONTRAN 1.027/2026 — PDF oficial](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao10272026.pdf/@@display-file/file), publicada no DOU de 18/08/2026, e [informação oficial sobre a implantação da transferência eletrônica](https://www.gov.br/transportes/pt-br/assuntos/noticias-/2026/08/contran-regulamenta-transferencia-eletronica-de-veiculos).
5. [Código de Defesa do Consumidor — Lei 8.078/1990](https://presidencia.gov.br/ccivil_03/leis/l8078compilado.htm), especialmente arts. 6º, 18, 24–26, 30–31, 39, 46–51 e 54.
6. [MP 2.200-2/2001](https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm), art. 10.
7. [Código de Processo Civil — Lei 13.105/2015](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm), arts. 783–784; [Lei 14.620/2023, art. 34](https://normas.leg.br/?urn=urn%3Alex%3Abr%3Afederal%3Alei%3A2023-07-13%3B14620%21art34).
8. [Lei 14.905/2024 — atualização monetária e juros](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14905.htm).
9. [CPC, art. 63, texto atualizado](https://normas.leg.br/?urn=urn%3Alex%3Abr%3Afederal%3Alei%3A2015-03-16%3B13105%21art63), e [Lei 14.879/2024](https://presidencia.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14879.htm).
10. [Lei Geral de Proteção de Dados — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
