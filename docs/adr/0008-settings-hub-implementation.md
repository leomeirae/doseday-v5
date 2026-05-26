# ADR 0007 — Settings Hub: configuracoes como manutencao, tab Perfil como ponte, URLs placeholder

**Data:** 2026-05-26
**Status:** Aceita
**Contexto do trabalho:** PR Settings Hub — `feature/38-settings-hub-screens`
**Decisores:** Léo (PO), Codex

---

## Contexto

O DoseDay precisava tirar ajustes críticos de telas soltas de Perfil e criar um lugar único para manutenção do tratamento entre consultas. A direção de produto já separava duas fases:

1. **Onboarding** captura a entrada inicial.
2. **Configurações** mantém o que muda depois: conta, tratamento, lembretes, dados, privacidade e suporte.

Ao mesmo tempo, havia uma decisão estratégica maior de remover a tab bar no futuro e expor configurações por engrenagem na Home. Fazer isso no mesmo PR aumentaria o risco visual e de navegação.

---

## Decisão

Criar `/configuracoes` como hub principal com 6 grupos:

| Grupo | Conteúdo |
|---|---|
| Conta | E-mail read-only, assinatura placeholder e encerramento de sessão confirmado |
| Tratamento | Medicamento e preocupações read-only no MVP; protocolo, peso meta, acompanhamento médico e próxima consulta editáveis |
| Lembretes | Permissão, ativação e horário do lembrete |
| Dados | Exportação LGPD, histórico de consentimento e exclusão de conta |
| Privacidade | Termos e política de privacidade |
| Suporte | FAQ, e-mail, avaliação, compartilhamento e Sobre |

Manter a tab bar neste PR. A tab **Perfil** passa a ser ponte para `/configuracoes` por meio de "Abrir Configurações". A remoção da tab bar e o acesso por engrenagem ficam para um PR futuro **Gear Icon**.

Enquanto Perfil for a ponte, `/configuracoes` oferece retorno explícito para
Perfil. `Dados` é o único destino de exportação, histórico de consentimento e
exclusão; `Privacidade` não repete esse acesso.

O footer legal é exibido nas demais telas do hub, mas é omitido na própria
tela `Privacidade`, onde repetiria imediatamente os mesmos dois links.

---

## Decisões cravadas

### D1 — Próxima consulta

`Próxima consulta` lê e grava o valor canônico do perfil do usuário. A intenção de produto é que esse dado represente a próxima conversa médica planejada, não um evento de calendário genérico.

### D2 — Acompanhamento médico

`Acompanhamento médico` é um estado 3-way: regular, ocasional ou ausente. A UI usa controle segmentado com o mesmo vocabulário do onboarding para evitar divergência de linguagem.

### D3 — URLs legais e FAQ

`https://dose-day.com/termos`, `https://dose-day.com/privacidade` e `https://dose-day.com/faq` permanecem como placeholders de MVP neste PR.

**TODO:** Léo confirma URLs finais antes do submit App Store.

### D4 — Ações destrutivas

Exclusão de conta usa confirmação dupla: alerta inicial + digitar `EXCLUIR` para habilitar o botão final. A cor `colors.destructive` é reservada para ações irreversíveis.

### D5 — Correções após validação visual

Todas as sub-telas de configurações usam header compacto compartilhado para
preservar títulos em uma linha no iPhone. Medicamento atual, preocupações e
assinatura não exibem chevron ou toast enquanto não houver edição real.
Enquanto a assinatura não tiver gestão própria, ela aparece somente como
estado dentro de Conta e não como atalho navegável duplicado no hub.
Botões de salvar somente ficam ativos quando o rascunho difere do valor salvo.
Vital Mint é permitido apenas no CTA primário ativo, conforme `DESIGN.md`.
Como a tab Perfil deixa de conter o menu legado, o logout existente é
reposicionado em `Configurações > Conta`; retirar o único acesso à saída seria
uma regressão de autenticação.

### D6 — Escopo da exportação LGPD

`Exportar meus dados` entrega todas as linhas armazenadas para o usuário
autenticado. O cliente pagina coleções por `id` para não depender do limite de
linhas da API; não corta histórico por janela de 12 meses, pois isso excluiria
dados ainda mantidos pelo produto do pacote de portabilidade.

---

## Alternativas rejeitadas

### Reabrir onboarding para editar tratamento

Rejeitada porque onboarding é entrada, não manutenção. Reabrir fluxo progressivo para editar peso meta, médico ou próxima consulta cria linguagem errada e risco de sobrescrever contexto.

### Remover tab bar neste PR

Rejeitada por escopo. O hub precisa existir, ser validado e receber screenshots antes de mudar a navegação primária. A remoção fica para PR futuro com engrenagem na Home.

### Criar migrations para o hub

Rejeitada. As telas usam campos e tabelas existentes. Exportação LGPD e histórico de consentimento operam sobre dados já modelados e protegidos por RLS.

---

## Consequências

- O usuário passa a ter um hub único para manutenção do tratamento.
- A tab Perfil continua visível temporariamente, mas já direciona para o novo modelo.
- A navegação temporária preserva retorno visível do hub para Perfil.
- O logout permanece acessível dentro de Conta, mesmo com Perfil reduzido a ponte.
- Dados LGPD não é duplicado dentro de Privacidade.
- Links legais e FAQ ainda dependem de confirmação final de URL.
- `colors.destructive` ganha regra de design própria para evitar confusão com erro comum ou alerta clínico.
- A exportação pode gerar arquivos maiores, mas não omite histórico retido.

---

## Próximos passos

1. PR Gear Icon: adicionar engrenagem na Home.
2. PR Gear Icon: remover a tab Perfil da tab bar.
3. Confirmar URLs finais de termos, privacidade e FAQ antes do submit.
4. Evoluir edição de preocupações quando houver padrão de seleção definido para `main_concerns`.
5. Evoluir edição de medicamento sem confundir o fluxo de protocolo.
