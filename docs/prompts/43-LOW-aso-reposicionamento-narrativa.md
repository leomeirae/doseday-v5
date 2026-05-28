# Prompt 43 — LOW — Reposicionamento ASO + Narrativa DoseDay V5

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `appstore-creative-designer`
**Skills úteis:** `marketing:content-creation`, `marketing:campaign-plan`
**Branch:** `docs/43-aso-reposicionamento`
**Pré-requisito:** ciclo 42 fechado (após PR #92 do 42i mergeado)
**Tipo:** **PEÇA ESTRATÉGICA. Zero código de produto alterado.**
**Agente recomendado:** Claude Code (acessar appstore-creative-designer + marketing skills)

---

# Objetivo

Produzir os artefatos de **ASO + posicionamento de marca + copy** que reposicionam DoseDay V5 como **"memória inteligente do tratamento"** (marca ampla) com **GLP-1 como caso de uso principal** (campanha específica) — sem alterar nenhuma linha de código de produto.

Este prompt **NÃO** redesenha telas, **NÃO** muda fluxos, **NÃO** mexe em schema, **NÃO** toca em hooks/queries. Ele produz **conteúdo escrito** (markdown) que vai alimentar App Store Connect, landing page e (se aplicável) welcome screens — em PRs futuros e sob revisão do PO.

# Contexto

- **Estudo comparativo V2** (DoseDay vs Glapp) entregue em 2026-05-28 propôs virar o center of gravity: GLP-1 tracker → memória do tratamento. Verticais futuros: HRT, TRT, peptides, menopausa.
- **Decisão arquitetural já tomada** (com confirmação do PO + segunda opinião de assistente IA):
  - **Marca/ASO mudam AGORA** (barato, prepara terreno)
  - **Produto/schema NÃO mudam agora** (caro, espera evidência de TestFlight)
  - **Memória da Consulta como hero feature futura** (Prompt 44 ou 45, pós-TestFlight, com MVP definido)
- Estado atual:
  - V5 está fechando ciclo 42 (correções visuais, sem mudança de identidade)
  - App Store/website ainda comunicam V4 (versão antiga)
  - Welcome screens internos não foram redesenhados pra nova narrativa

# O que analisar antes de produzir

1. **Ler `docs/plano-estrategico-v5.md`** — entender estado atual da estratégia documentada
2. **Ler `docs/DESIGN.md`** — confirmar tom de voz, vocabulário, paleta
3. **Ler `CLAUDE.md`** — confirmar persona Mariana (público-alvo principal) e linguagem evitada
4. **Ler `CONTEXT.md`** — glossário do domínio (memória do tratamento, dose, sintoma, Movimento 1/2/3)
5. **Conferir nos screenshots do PO** o que está visível hoje no app (Dashboard, Memória, /perfil/protocolo, etc) — pra alinhar copy de App Store com o que o app entrega
6. **Verificar se a skill `appstore-creative-designer`** tem requisitos específicos (formato dos screenshots, dimensões, etc) — consultar antes de produzir

# Artefatos a produzir

**Todos os artefatos vão em `docs/marketing/` (criar a pasta se não existir).**

## 1. `docs/marketing/posicionamento-marca.md`

Conteúdo:
- **Frase-mãe** (1 linha — narrativa de marca ampla)
- **Frase de campanha atual** (1 linha — GLP-1 como caso de uso)
- **Camada funcional** (4-5 bullets explicando o que o app faz)
- **Tom de voz** — adjetivos (ex: claro, calmo, prático, sem hype médico)
- **Vocabulário evitado** — ex: "diagnóstico", "tratamento curativo", "garantia de resultado", "emagrecimento sem esforço"
- **Persona principal** (Mariana, 35-55, urbana, faz GLP-1 com médica particular) — extrair de CLAUDE.md

## 2. `docs/marketing/aso-app-store.md`

Para App Store Connect (PT-BR primeiro; EN/ES ficam pra prompt futuro):

- **Nome do app** — atual + sugerido (manter "DoseDay" + subtítulo curto)
- **Subtítulo** (30 caracteres iOS) — 2-3 propostas
- **Descrição curta** (170 caracteres) — 2-3 propostas
- **Descrição completa** (4000 caracteres) — versão única bem estruturada com:
  - Parágrafo 1: marca + tese ("memória do tratamento")
  - Parágrafo 2: caso de uso GLP-1 (Mounjaro, Ozempic, Wegovy, Zepbound, semaglutida, tirzepatida)
  - Parágrafo 3: features principais (doses, sintomas, peso, custos, consultas)
  - Parágrafo 4: diferenciação (relatório médico, IA organizadora não-prescritora)
  - Parágrafo 5: segurança/privacidade (LGPD, dados locais)
- **Keywords (100 caracteres total)** — lista priorizada por intenção de busca:
  - GLP-1, Mounjaro, Ozempic, Wegovy, Zepbound
  - tratamento, dose, sintoma, peso
  - memória tratamento, relatório médico
- **"What's New" da próxima versão** (V5.0.0)

## 3. `docs/marketing/screenshots-copy.md`

Copy pros 5-6 screenshots da App Store (sequência narrativa):

- **Screenshot 1** — hero: "Sua memória do tratamento, num só lugar"
- **Screenshot 2** — Dashboard com próxima dose, peso, memória
- **Screenshot 3** — Anotar sintoma inline (chips frequentes)
- **Screenshot 4** — Histórico unificado (linha do tempo)
- **Screenshot 5** — Custos do tratamento
- **Screenshot 6** — "Prepare a próxima consulta" (semente da Memória da Consulta)

Para cada screenshot: título (4-7 palavras), subtítulo (1 frase), CTA implícito.

## 4. `docs/marketing/copy-landing-page.md`

Texto pra landing page (doseday.app ou similar):
- **Hero** — headline + sub + CTA
- **3 blocos de "como funciona"** — registrar, organizar, conversar com médico
- **Bloco GLP-1** — caso de uso principal, lista de medicações compatíveis
- **Bloco de segurança/privacidade**
- **Bloco social proof** — placeholder (ex: "[testemunho aqui]" — para preencher depois)
- **Footer com FAQ curto** (3-5 perguntas)

## 5. `docs/marketing/metricas-aso.md`

Métricas de sucesso a acompanhar pós-reposicionamento:

- **Conversão App Store**: impressões → downloads (taxa %)
- **Keyword ranking** semanal: GLP-1, Mounjaro, Ozempic, Wegovy, Zepbound, tratamento, sintoma, dose, relatório médico, memória tratamento
- **Taxa de download orgânico** (sem ads)
- **Cliques landing page → App Store** (UTM)
- **Conversão landing page** (visitante → clique no botão de App Store)
- **Teste qualitativo** (5-10 entrevistas curtas): mostrar ASO pra pessoas que fazem GLP-1 e perguntar "o que você acha que esse app faz?" — esperar resposta alinhada à tese, sem confusão

Incluir baseline atual (V4 metrics — pegar do App Store Connect) e meta de 90 dias.

## 6. `docs/marketing/sementes-de-consulta-no-produto.md`

**Cuidado: este é o único artefato com sugestões de mudança no produto** — mas ainda **NÃO é implementação**. É um briefing pro próximo prompt técnico.

Sementes baratas que reforçam narrativa "memória do tratamento" SEM refatorar:

- **Aproveitar `nextAppointmentDate`** (já existe no Profile): mostrar "Próxima consulta em X dias" no Dashboard ou na tela Memória. **NÃO implementar agora.** Só listar como sugestão pra Prompt 44/45.
- **Aproveitar `anotar-memoria`** (rota já existe): criar tag visual "dúvida pra médico" — não exige migration. **NÃO implementar agora.** Só listar.
- **Botão "Preparar consulta"** na tela Memória (futuro — gera resumo do período): **NÃO implementar agora.** Listar como hero da Fase 2.

Cada semente: descrição curta + por que reforça a tese + custo estimado de implementação.

# O que NÃO produzir / NÃO fazer

- **Zero código de produção.** Nenhum `.tsx`, `.ts`, hook, query, schema. Apenas markdown em `docs/marketing/`.
- **Não mexer em `app.json`** (config nativa iOS).
- **Não mexer em `lib/i18n/`** (traduções existentes).
- **Não tocar em screenshots dentro do app** (welcome screens internas) — fica pra prompt futuro.
- **Não criar landing page** (HTML) — só o copy.
- **Não criar arquivos de imagens** — esses entram em outro prompt com `appstore-creative-designer` rodando geração.

# Critérios de sucesso (verificáveis)

- [ ] 6 arquivos novos em `docs/marketing/` (posicionamento + aso-app-store + screenshots-copy + copy-landing + metricas + sementes)
- [ ] `git diff --stat` mostra apenas arquivos em `docs/marketing/` + `docs/superpowers/plans/` + `docs/history.md` + possivelmente `docs/prompts/`
- [ ] Zero alteração em `app/`, `components/`, `lib/`, `hooks/`, `app.json`, `package.json`, `tailwind.config.js`
- [ ] Cada artefato tem **propostas múltiplas** quando aplicável (subtítulo: 2-3 opções; descrição curta: 2-3 opções) — PO escolhe
- [ ] Linguagem PT-BR clara, sem hype médico, alinhada com tom DoseDay (vocabulário Mariana)
- [ ] Métricas têm baseline + meta + frequência de medição
- [ ] `git status --short` confirma zero `graphify-out/`, `.codegraph/`, artifacts antigos
- [ ] `npm run type-check` passa (não deve mudar, mas validar)
- [ ] `npm run lint` passa (não deve mudar, mas validar)
- [ ] PR description menciona "Prompt 43 — peça estratégica, zero código de produto"

# Restrições

- **REGRA DE OURO: NÃO ALTERAR CÓDIGO FUNCIONAL.** Se o agente sentir vontade de "aproveitar e ajustar copy interna do app" — **PARAR** e adicionar como sugestão em `sementes-de-consulta-no-produto.md`, não implementar.
- **Não inventar features.** Trabalhar com features que JÁ EXISTEM no V5 atual (Dashboard, Memória, Sintomas, Custos, Doses, Peso, Configurações).
- **Não prometer resultados clínicos** ("você vai perder X kg em Y semanas") — sem afirmar eficácia da medicação.
- **Não criar tom alarmista** sobre dose perdida ou sintoma — postura calma, não-clínica.
- **Não copiar visual roxo/branco do Glapp** — DoseDay tem identidade mint própria.
- **PT-BR apenas neste prompt.** EN/ES ficam pra Prompt 43-b se necessário.

---

**Karpathy assumptions explícitos:**
- Reposicionamento de ASO/copy não exige código de produto
- Persona Mariana (35-55, urbana, GLP-1) é o público alvo principal validado
- Features atuais (Dashboard + Memória + Custos + Doses + Peso) cobrem 80% da narrativa proposta
- Tom DoseDay (claro, calmo, sem hype) já está estabelecido em `docs/DESIGN.md` e `CLAUDE.md`
- Métricas de App Store Connect estão acessíveis pelo PO

**Could 50 lines do this?** Não — são 6 artefatos textuais distintos. Mas cada artefato é estratégico (não código). Tempo de execução: 30-60min de geração + revisão do PO.

**Success criteria verificáveis:** ver checklist. Critical: zero código alterado.

**Próximos passos (roadmap, não dependência):**
- Prompt 43-b (futuro, opcional): EN e ES das mesmas peças
- Prompt 44 (após TestFlight): MVP da Memória da Consulta (FEATURE TÉCNICA, esse sim mexe em código)
- Prompt 45+ (pós-validação): refatoração de schema pra suportar presets de tratamento (HRT, TRT, peptides)
