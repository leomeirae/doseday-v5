# DoseDay V5 — Plano Estratégico Consolidado

**Data:** 14 de maio de 2026
**Autor:** Leo (PO) + Claude (consultor técnico / estratégico)
**Status:** documento-mãe da V5. Toda decisão de produto, design e técnica deriva daqui.
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/plano-estrategico-v5.md`
**Repo:** [github.com/leomeirae/doseday-v5](https://github.com/leomeirae/doseday-v5)

---

## 1. Sumário Executivo

DoseDay V5 deixa de ser "tracker de GLP-1 com relatório" para se tornar **a memória do tratamento que paciente e médico entendem**. O app vira o cérebro auxiliar de quem está em tratamento com canetas emagrecedoras — registra o mínimo todo dia, devolve insight pago via IA, e gera o relatório que o paciente leva pra consulta.

A V4 não fracassou por design. Fracassou porque pedia dados no onboarding e não devolvia valor depois. A V5 corrige isso entregando o **primeiro insight de IA antes de pedir o pagamento** e amarrando todo o ciclo diário ao momento de maior dor: a consulta com o endocrino.

Estratégia em 1 frase: **freemium com IA destravada no premium, justificando o pagamento pelo tempo poupado e pela qualidade da consulta médica.**

**Workflow de execução:** projeto Expo do zero no repo `doseday-v5`, design language **Impeccable** rodando local no Claude Code (PRODUCT.md + DESIGN.md como fonte única), Stitch descartado. V5.0 lançada com o máximo de killer features possível — sem fasear MVP.

---

## 2. Contexto: o que aconteceu até aqui

| Fase | Resumo | Resultado |
|---|---|---|
| V1-V3 (2024-2025) | Tracker GLP-1 puro, sem IA | Lançado, baixa retenção |
| V4 (mar/2026) | Refactor visual + Liquid Glass + relatório IA básico | 96 cadastros, 36 onboarded, 6 ativos, 1 pagante. MRR US$6 |
| V4.5 refactor (abr/2026) | Check-in 1-tap + tabela `pending_ai_questions` + componentes novos. Commits `0907316`, `b922a3a` | Validado no simulador. Parte do trabalho perdido após pane do computador |
| V5 (maio/2026 - presente) | Projeto Expo do zero em `doseday-v5`. Backend Supabase + RevenueCat reaproveitados. Bundle `com.doseday.premium` mantido | Em construção |

**O que sobreviveu da V4:**
- Bundle ID, App Store listing, Supabase, RevenueCat (com trial 14d configurado), GoogleService-Info.plist, schema das tabelas core, conhecimento dos concorrentes, posicionamento "Companheiro que entende seu tratamento GLP-1 — para você e seu médico".

**O que foi descartado:**
- Codebase React Native antigo (legacy v3/v4 misturado, glass bug arquitetural não-resolvido).
- Screenshots da App Store antigos (desatualizados, mostram check-in multi-passo).

---

## 3. Tese estratégica V5

**Hipótese central:** quem está em tratamento com GLP-1 (Ozempic, Mounjaro, Wegovy, Zepbound) no Brasil tem três dores não resolvidas por nenhum app:

1. Esquece o que sentiu na semana quando chega na consulta
2. Não sabe se o que sente é normal ou se deve avisar o médico
3. Gasta caro no tratamento e não consegue ver claramente se está valendo a pena

DoseDay V5 ataca as três simultaneamente com **registro mínimo + IA que devolve sentido + relatório bilíngue paciente/médico**.

**Por que isso é defensável agora:**
- Mercado BR amador, sem player dominante em "memória do tratamento" (confirmado por pesquisa de mercado + sócio em campo)
- Voy Saúde domina "serviço completo" (telemedicina + entrega) mas não tem app forte de tracking — espaço livre
- Concorrentes globais (Shotsy, Glapp, Pep, GLP AI) usam IA como chat genérico ou food scanner — ninguém amarra IA ao ciclo paciente-médico

---

## 4. Persona-alvo e job-to-be-done

### Persona primária: "Mariana, 38, acompanhada por endocrino"

- Classe B, mora em capital
- Comprou Mounjaro 2.5mg, acompanhamento mensal com endocrino particular ou via plano
- Atarefada, tem 2 filhos, dorme pouco
- Quer perder 15-20kg, já tentou várias dietas
- Investe ~R$1.500-2.500/mês no tratamento
- **Dor real:** "chego na consulta sem lembrar o que aconteceu no mês. Médico pergunta e eu não sei dizer."
- **Critério de pagamento:** se o app me poupar tempo na consulta e me deixar mais segura, pago.

### Persona secundária: "João, 34, autônomo sem médico"

- Comprou caneta por conta própria
- Tem medo de errar mas não quer ir ao médico ainda (custo, vergonha)
- Quer entender se sintoma é normal antes de procurar emergência
- **Dor real:** "não sei se essa náusea é grave."
- **Critério de pagamento:** quando começar a sentir efeito colateral forte e quiser segurança/orientação.

**Foco do MVP:** persona primária (Mariana). João vira persona ativa no roadmap 1.1+.

### Job-to-be-done (formato Christensen)

> "Quando eu estou em tratamento com canetinha emagrecedora, eu quero **registrar o mínimo possível e ter alguém me dizendo o que está acontecendo comigo**, para eu poder **chegar na consulta segura e ver o meu dinheiro fazendo sentido**."

---

## 5. Posicionamento e tom

### Posicionamento (uma frase)

**"A memória inteligente do seu tratamento com caneta emagrecedora — pra você não esquecer nada na consulta."**

### Sub-claims (usar em ASO, landing, ads)

- "Sua endo vai amar isso"
- "Um toque por dia. A IA faz o resto"
- "Tudo registrado. Tudo no relatório"
- "Para quem investe pesado e quer ver resultado"

### Tom de voz

| Sim | Não |
|---|---|
| Calmo, de cuidado | Motivacional Duolingo |
| Direto, sem rodeio | Defensivo ("sem achismos") |
| Tratando o usuário como adulto | Culposo ("seu médico precisa de você") |
| Português brasileiro coloquial | Português acadêmico/médico |
| Reconhece custo emocional | Performático |

### Palavras-âncora

- **Sempre:** memória, registro, relatório, tratamento, consulta, entender, sua endo, sua nutri
- **Nunca:** diagnóstico, prescrição, recomendação médica, "para curar", "elimine"
- **Cuidado:** "ação necessária" (cria urgência clínica falsa), "regrida" (negativo), "ganhe" (sugere prêmio)

### Limites éticos e legais

- **Nunca diagnostica.** IA sempre encerra com "isto não substitui consulta médica"
- **Nunca prescreve.** Não sugere alterar dose, parar medicação, trocar caneta
- **LGPD Art. 11.** Dado de saúde = sensível. Consentimento explícito + base legal documentada antes de qualquer registro
- **App Store Guideline 1.4.** Posicionar em Health & Fitness, não Medical — usar "diário" / "registro" / "anotações", nunca "prontuário" / "registro médico"
- **ANVISA / CFM.** Não somos serviço médico. Somos software de organização pessoal

---

## 6. Killer Features de IA — 3 movimentos pro MVP

A IA é o motivo do premium. Mas precisa ser entregue de forma específica, não como "chatbot genérico" que todo concorrente tem. Três movimentos foram priorizados:

### Movimento 1 — Insight do Dia (aha-moment dia 1)

**O que é:** após o primeiro check-in (humor 1-tap), a IA gera um insight curto contextualizado pela semana de tratamento + dose + medicamento + dado já coletado no onboarding.

**Exemplo:**
> "Você está na semana 3 do Mounjaro 2.5mg. 70% das pessoas relatam pico de náusea agora — é esperado e tende a melhorar a partir da semana 5. Avise sua endo se a náusea passar de 'moderada' por mais de 3 dias seguidos."

**Por que funciona:**
- Resolve o problema #1 da V4 (onboarding pede dado, app não devolve nada)
- Entrega valor ANTES do paywall
- Mostra que a IA "te conhece" desde o início
- Cria expectativa de mais insights → conversão pra premium

**Free vs Premium:** o 1º insight é grátis. Os próximos (semanal, mensal, "tendência de sintoma", "comparação com trial clínico") são premium.

### Movimento 2 — Memória de Perguntas pra Consulta

**O que é:** ao longo da semana/mês, o usuário registra dúvidas em 1 tap a partir de qualquer tela (botão "Quero perguntar pra minha endo"). Pode ser texto curto ou voz. A IA agrupa, prioriza, deduplica e gera um **checklist pronto pra próxima consulta**, exportável como PDF ou enviável por WhatsApp.

**Exemplo de output:**
```
Consulta com Dra. Camila — 18 de junho
Prioridade alta:
  1. A náusea piorou após a dose de 5mg. Posso voltar pra 2.5mg?
  2. Senti tontura no 3º dia consecutivo. É normal?
Prioridade média:
  3. Estou perdendo cabelo. Tem relação?
  4. Posso tomar pílula anticoncepcional com Mounjaro?
```

**Por que funciona:**
- Resolve a dor central da persona Mariana ("chego na consulta sem lembrar")
- Atrela ciclo diário ao evento de maior valor (consulta)
- Diferenciação real — nenhum concorrente faz
- Conversão pra premium se houver mais de 3 perguntas no checklist (paywall contextual)

**Free vs Premium:** registrar perguntas é grátis (até 5 ativas). Gerar checklist organizado pela IA + exportar é premium.

### Movimento 3 — Relatório Clínico Bilíngue

**O que é:** a partir de 7 dias de registro, a IA gera um relatório com duas versões integradas no mesmo PDF:

- **Versão paciente** (linguagem clara): adesão, evolução do peso, principais sintomas, insights educativos, alertas a observar
- **Versão médica** (técnica): tabela de adesão por semana, variação ponderal, sintomas com intensidade/frequência, padrões detectados, observações da IA com disclaimer

Exportável como PDF ou imagem, com header DoseDay + dados do paciente + período + assinatura "Este relatório não substitui avaliação médica."

**Por que funciona:**
- É o feature já reconhecido nas screenshots como "Relatório Clínico Semana X" — vamos amplificar
- Médico (canal de distribuição) vê algo organizado = recomenda
- Paciente sente que está "levando algo sério" pra consulta = paga
- Único concorrente que tem feature parecida (Glapp) entrega apenas versão paciente

**Free vs Premium:** o 1º relatório é grátis (gerado após 7 dias). Os próximos são premium.

### O que NÃO entra no MVP (importante)

- Tradutor da consulta (gravar áudio do médico → IA explica) — V5.1
- Antecipação de efeitos colaterais por padrão detectado — V5.1
- Comparação com trials clínicos (SURPASS-2, STEP) — V5.1
- Food scanner / contagem de macros — V5.2+
- Coach proativo de adesão — V5.2+
- Apple Health sync completo — V5.1

Princípio: **fazer 3 coisas excelentes vence fazer 10 medianas.**

---

## 7. Diagnóstico de retenção e como atacar

### Onde a V4 morreu

| Etapa | V4 real | Benchmark Health & Fitness 2026 | Meta V5 |
|---|---|---|---|
| Cadastro → Onboarded | 39% | 30-50% | Manter ≥ 45% |
| Onboarded → 1º check-in | 17% | 25-40% | **Subir para ≥ 60%** |
| Check-ins/usuário/semana | 0.07 | 2-4 | **Subir para ≥ 2.0** |
| D7 retention | ~6% | 7% | **Subir para ≥ 15%** |
| D30 retention | ~3% | 3% | **Subir para ≥ 8%** |
| Conversão trial → pago | ~1% | 4-8% | **Subir para ≥ 5%** |

### Mecanismos novos pra retenção

1. **Aha-moment no dia 1** (Movimento 1 da IA) — quebra o "pedi dado, não devolveu"
2. **Loop semanal explícito** — toda segunda, push "Sua semana começou. Como foi a última?" + insight de 30s
3. **Eventos âncora** — push 3 dias antes da próxima consulta com "Quer ver o que você tem pra perguntar?"
4. **Streak invisível** — não mostrar "X dias seguidos" tipo Duolingo, mas usar internamente pra modular IA ("você registrou 5 dias dessa semana, mais que 80% dos usuários — sua endo vai ver isso")
5. **Lembrete inteligente de dose** — não notificar no horário fixo, ajustar com base no padrão real ("você costuma aplicar 3h depois — quer que eu lembre nessa janela?")

### Anti-padrões a evitar

- ❌ Não fazer gamificação visual (badges, troféus, streaks visíveis) — quebra credibilidade clínica
- ❌ Não fazer notificação de culpa ("você faltou 2 dias") — fere a persona Mariana
- ❌ Não fazer paywall agressivo no onboarding — esperar o usuário sentir valor primeiro

---

## 8. Estratégia anti-Voy + mapa competitivo

### O risco Voy

Voy Saúde tem 200k+ usuários BR/UK/DE, telemedicina, entrega de medicamento, suporte WhatsApp, nutricionista. Eles podem lançar um app de tracking a qualquer momento e nos esmagar com base instalada.

### Nossa posição: complementar, não competir

| Eixo | Voy Saúde | DoseDay V5 |
|---|---|---|
| Modelo | Serviço completo (consulta + medicamento + nutri) | App standalone |
| Paciente-alvo | Quem busca tratamento *integrado* (compra pacote) | Quem JÁ está em tratamento (Voy, médico particular ou autônomo) |
| Distribuição | Marketing direto + parcerias | Boca-a-boca médico + ASO + indicação |
| Pricing | R$199-499/mês (serviço) | R$29-49/mês (app) |
| Defesabilidade | Operacional (rede de médicos) | Software (memória + IA) |

**Nossa frase pra distribuição:** "Já está em tratamento? Use o DoseDay com sua endo, seja ela qual for."

### Possível movimento: parceria

Voy é cliente potencial, não competidor direto. Eles atendem 200k pessoas que precisam exatamente do que oferecemos. Numa V5.2-V5.3, vale conversar: white-label DoseDay pra clientes Voy.

### Mapa competitivo global

| Player | Forte em | Fraco em | O que copiamos | O que evitamos |
|---|---|---|---|---|
| Shotsy (EUA) | UI polida, dose tracking | Sem IA real, sem relatório | Polimento visual de cards | Ausência total de IA |
| Glapp (EUA) | AI chat, "log once get insight" | Chat genérico, fraca personalização | Frase "log once" | Chat genérico solto |
| Pep (EUA) | AI Food Scanner | Mais fitness que médico | (nada por enquanto) | Vibe fitness |
| GLP AI (EUA, novo) | AI Coach 24/7 + food scan | Foco macros, não médico | (nada) | Foco fitness |
| Pokii (EUA) | Free-for-life | Sem monetização clara | Free generoso | Modelo sem receita |
| Noom (global) | Marketing pesado | Billing opaco, odiado | Marketing | Billing tóxico |
| OzemPro (BR) | (pouco posicionamento) | Genérico | (nada) | (nada relevante) |
| Voy (BR) | Serviço completo | Sem app tracker forte | (nada — modelo diferente) | (não compete) |

---

## 9. Arquitetura visual e princípios de design

### Princípio-mestre

**Sobriedade clínica primeiro. Beleza onde reforça confiança.**

A V4 errou pra um lado (glass demais = parece anúncio). A reação errada seria ir pro outro extremo (visual chato = parece formulário do INSS). O caminho é equilibrar:

- Base sólida, alto contraste, tipografia densa
- Glass como accent (paywall, conquista, splash, gráficos)
- Cor com propósito (não decorativa)

### Regra dos 30%

No máximo **30% da área visível de uma tela com glass**. O resto: superfície sólida ou cards de cor sólida com border sutil.

### Paleta — revisão

Manter a identidade verde-menta + violeta, mas dessaturar pra ganhar peso clínico:

| Token | Antes (V4) | Depois (V5) | Uso |
|---|---|---|---|
| Background | #030E11 | #050B12 (mais profundo) | Base de todas as telas |
| Primary action | #00D4AA (verde-menta) | #00D4AA mantido | Botão primário, accent |
| Secondary surface | Roxo saturado | #1B2433 (azul-grafite) | Cards de conteúdo clínico |
| Glass | Branco @ 5-15% opacidade | Branco @ 3-8% (mais sutil) | Accent em paywall, marcos |
| Alerta | Vermelho saturado | #E64545 (vermelho clínico) | Só pra dado realmente crítico |
| Sucesso | Verde-menta | Verde-menta + variação clínica | Estado positivo |
| Texto principal | Branco puro | #F2F4F7 (branco quente) | Mais confortável em leitura longa |
| Texto secundário | Cinza-azulado | #9CA8B8 | Subtítulos, metadados |

### Tipografia — revisão

- **Família:** SF Pro (iOS nativo) — sem custos, sem licença, integração perfeita
- **Hierarquia:**
  - H1 (telas-marco): 28-32pt, semibold
  - H2 (seções): 22pt, semibold
  - Body: 16pt, regular, line-height 1.4
  - Body-clínico (relatório): 15pt, regular, line-height 1.6 (legibilidade prioritária)
  - Caption: 13pt, regular
  - Label numérico (peso, dose): SF Mono ou Pro Display, 32-40pt, bold

### Componentes-base (vão pro design.md)

- Botão primário (glass-accent + label texto)
- Botão secundário (outline sutil)
- Card de dado clínico (superfície sólida, label + valor + delta)
- Card de ação ("Faça X agora")
- Card de insight IA (badge "IA" + texto + disclaimer)
- Modal de consentimento (LGPD, primeira vez em features sensíveis)
- Estado vazio (sem dado ainda — copy de cuidado, não vergonha)
- Estado de carregamento (skeleton + frase contextual, nunca "Loading...")
- Estado de erro (linguagem humana, ação de recuperação)
- Paywall (glass dominante, claro, sem dark pattern)

### Onboarding visual

- ❌ Mockup 3D flutuante com cards quebrando da tela
- ✅ Screenshot real de uma tela inteira, leve inclinação (5-10°), shadow sutil
- ✅ Texto-claim em destaque, sub-claim curto, CTA único e óbvio
- ✅ Progresso visual discreto (4 pontos no topo)

---

## 10. Estrutura de navegação ~~(tab bar nova)~~ → Dashboard cards

> **Atualização 2026-05-27 (ADR 0007):** Tab bar foi removida. Navegação principal acontece via cards do Dashboard com `router.push()`. O diretório `app/(tabs)/` continua existindo como rota, mas `tabBarStyle: { display: 'none' }` está ativo. O conteúdo abaixo é histórico.

### Tab bar — 5 abas (histórico — removida em 2026-05-27)

| Posição | Aba | Função | Notas |
|---|---|---|---|
| 1 | **Início** | Dashboard com check-in 1-tap, próxima dose, peso, insight do dia | Tela mais aberta |
| 2 | **Doses** | Histórico de doses, próxima dose, configurar dose (com custo dentro) | Sub-tela "Custos deste tratamento" mora aqui |
| 3 | **Diário** | Sintomas registrados, perguntas pra consulta, notas | Onde a IA "escuta" |
| 4 | **Relatórios** | Lista de relatórios gerados, gerar novo, compartilhar | Killer feature visível |
| 5 | **Perfil** | Conta, médico, assinatura, configurações, suporte | Configurações vão pra cá |

### Decisões tomadas

- ❌ **Tab "Custos" removida** — vira sub-seção dentro de "Doses"
- ❌ **Botão de configurações no topo do dashboard removido** — vira aba "Perfil"
- ✅ **Aba "Diário" criada** — onde mora o registro de sintomas e perguntas (Movimento 2 da IA precisa de casa)
- ✅ **Aba "Peso" mesclada em "Início"** — peso é dado central, não merece aba própria

### Profundidade de navegação

Princípio: **nunca mais que 3 níveis de profundidade.** Se estiver indo pro 4º, repensar o fluxo.

---

## 11. Decisões de produto que ficaram tomadas

| # | Decisão | Status |
|---|---|---|
| 1 | Bundle ID mantido (`com.doseday.premium`) | ✅ |
| 2 | Próxima versão: **5.0.0** (refactor completo, posicionamento novo) | ✅ |
| 3 | Supabase mantido (mesmo projeto), schema limpo via migrations novas | ✅ |
| 4 | RevenueCat mantido com trial 14d em produção | ✅ |
| 5 | Stack Expo SDK 54+ com React Native + **NativeWind v4 + react-native-reusables** (pivot ADR 0007, 2026-05-27). Liquid Glass era accent — agora opcional. | ✅ |
| 6 | Posicionamento: a definir via `/design:ux-copy` (rascunho inicial rejeitado) | ⏸️ |
| 7 | Freemium. Premium destrava IA recorrente, relatórios além do 1º, exportação | ✅ |
| 8 | Persona V5.0: Mariana (acompanhada). João (autônomo) entra como feature-stretch | ✅ |
| 9 | 3 movimentos de IA: Insight do Dia + Memória de Perguntas + Relatório Bilíngue (núcleo obrigatório) | ✅ |
| 10 | Tab bar: Início / Doses / Diário / Relatórios / Perfil — **removida em 2026-05-27** (ADR 0007). Navegação via Dashboard cards. | ~~✅~~ histórico |
| 11 | Custos sai de tab, vira sub-seção em Doses | ✅ |
| 12 | Glass effect: regra dos 30%, accent em paywall/marcos | ✅ |
| 13 | Onboarding: 1º insight de IA antes de pedir cadastro | ✅ |
| 14 | Mockup 3D flutuante banido — substituir por screenshots reais inclinados | ✅ |
| 15 | Botão amarelo de Criar Conta banido — 1 cor primária só | ✅ |
| 16 | Workflow: **Impeccable** como design language local (PRODUCT.md + DESIGN.md). Claude Code executa. **Stitch descartado** | ✅ |
| 17 | Repo: `doseday-v5` no GitHub, pasta `dose-day-v5` no Desktop | ✅ |
| 18 | V5.0 lança com TODO o núcleo obrigatório + máximo de features-stretch que couberem | ✅ |

---

## 12. Métricas-alvo da V5

Métricas medidas em janelas rolantes após a primeira semana de tração. Meta inicial é vencer benchmarks Health & Fitness; revisão das metas em cada janela rolante de avaliação.

### Métricas de aquisição

| Métrica | V4 baseline | Meta V5 | Como medir |
|---|---|---|---|
| Downloads/semana | ~25 | 100+ | App Store Connect |
| Custo por instalação (se rodar ads) | n/a | < R$5 | Apple Search Ads + Meta Ads |
| Taxa de cadastro | 39% | ≥ 50% | Supabase users vs downloads |

### Métricas de ativação

| Métrica | V4 | Meta V5 |
|---|---|---|
| Cadastro → onboarded | 39% | ≥ 50% |
| Onboarded → 1º check-in | 17% | ≥ 60% |
| Cadastro → 1º insight IA recebido | n/a | ≥ 70% |

### Métricas de retenção

| Métrica | V4 | Meta V5 |
|---|---|---|
| D1 | n/a | ≥ 40% |
| D7 | ~6% | ≥ 15% |
| D30 | ~3% | ≥ 8% |
| Check-ins/usuário/semana | 0.07 | ≥ 2.0 |

### Métricas de monetização

| Métrica | V4 | Meta V5 |
|---|---|---|
| Trial start rate (% de cadastros) | n/a | ≥ 25% |
| Trial → pago | n/a | ≥ 40% |
| Conversão cadastro → pago | ~1% | ≥ 5% |
| MRR — primeira janela rolante mensal | US$6 | US$300+ |
| Churn mensal | n/a | < 8% |

### Métricas qualitativas

- 5 entrevistas com usuários ativos premium em janela rolante após primeiros 50 pagantes
- Score NPS medido a partir da segunda janela rolante (meta inicial: ≥ 30)
- Pelo menos 1 médico endo no programa-piloto antes do lançamento público

---

## 13. Escopo da V5.0 — lançar com tudo

A V5.0 não é MVP enxuto. É refatoração completa do produto + máximo de killer features que conseguirmos entregar antes de subir pra App Store. Como o executor é Claude Code (não desenvolvedor humano), o limite não é tempo — é qualidade de prompt e validação. A regra é: **se cabe num prompt bem-escrito e passa em revisão, entra na 5.0.**

### Núcleo obrigatório (não sobe sem)

- Onboarding novo (telas conceituais + 1º insight IA antes do cadastro)
- Auth (email/senha + Google + Apple)
- Dashboard (check-in 1-tap, próxima dose, peso, insight do dia, próximo relatório)
- Doses (lista, registrar, próxima, sub-seção custos)
- Diário (sintomas, perguntas pra consulta — registro 1-tap)
- Relatórios (lista, gerar manualmente, compartilhar PDF)
- Perfil (conta, médico, assinatura, config)
- Paywall (modal premium claro, sem dark pattern)
- Movimento 1 (Insight do Dia) + Movimento 2 (Memória de Perguntas) + Movimento 3 (Relatório Bilíngue)
- Design system V5 (sobriedade clínica + Liquid Glass como accent)
- LGPD: consent explícito Art. 11, criptografia em repouso, DPO/contato registrado
- Disclaimers em todo output da IA

### Features-stretch (entram se passarem em revisão de prompt)

Ordenadas por impacto x esforço. Vão entrando conforme avançamos. Nenhuma é "deixa pra depois" — todas são V5.0-ready se a execução comportar:

| Prioridade | Feature | Por que |
|---|---|---|
| 1 | Notificações inteligentes (lembrete adaptativo de dose) | Eleva retenção. Diferencial Voy não tem |
| 2 | Antecipação de efeitos por semana de tratamento | Reforça posicionamento "memória". Movimento 1 expandido |
| 3 | Apple Health sync (peso, passos, FC repouso) | Tablestake — todo concorrente tem |
| 4 | Comparação com trials clínicos (SURPASS-2, STEP) | Diferencial massivo, ninguém faz |
| 5 | Tradutor da consulta (áudio → resumo + glossário) | Killer feature ousada |
| 6 | Persona João (modo autônomo, sem médico) | Amplia mercado em 2x |
| 7 | Apple Watch app (check-in 1-tap) | Diferencial de adesão |
| 8 | Internacionalização (PT-BR core, EN + ES como opt-in) | Reaproveita locales/ já prontos |

### Fica de fora da V5.0 (V5.1+)

- Food scanner com leitura GLP-1 — feature pesada, pouco diferencial vs Pep
- Programa para médicos (dashboard do endo) — modelo de negócio diferente, precisa validação
- Comunidade leve (FAQ por sintoma) — sai do core "memória"
- Versão Android — foco iOS pra capturar diferencial Liquid Glass primeiro

### Critério de "pronto pra App Store"

A V5.0 sobe quando:

1. Todos os itens do núcleo obrigatório implementados e testados
2. Pelo menos 5 features-stretch entregues
3. App rodando estável em iPhone 15+ / iOS 26+ (target principal)
4. LGPD compliant + disclaimers IA validados
5. Build EAS sem warnings críticos
6. Apple Review checklist passado (skill `app-store-compliance`)
7. Screenshots da App Store refeitos (skill `appstore-creative-designer`)
8. RevenueCat trial 14d funcionando em produção

---

## 14. Stack técnica decidida

| Camada | Escolha | Por quê |
|---|---|---|
| App | React Native + Expo SDK 54+ | Continuidade, ecossistema, AI-friendly |
| Routing | Expo Router (file-based) | Padrão Expo, native tabs |
| UI / Styling | **NativeWind v4 + react-native-reusables** | Pivot 2026-05-27 (ADR 0007). DX Tailwind + componentes shadcn/ui para RN. Liquid Glass disponível como opcional. |
| **Design language** | **Impeccable** (skill local) | PRODUCT.md + DESIGN.md como fonte única. 23 comandos especializados. Open source, sem dependência externa |
| Estado | React Query + Context API | Sem Redux. Suficiente, simples |
| Backend | Supabase (mantido) | Auth, DB Postgres, RLS, Edge Functions, Storage |
| IA | OpenAI GPT-4o via Edge Function | Já em uso, qualidade, latência aceitável |
| Pagamento | RevenueCat (mantido) | Trial 14d configurado, multi-store, analytics |
| Push | Expo Notifications | Padrão |
| i18n | i18next (locales pt-BR, en, es já prontas) | Reutilizar trabalho da V4 |
| Analytics | PostHog + Supabase events | Open source, LGPD-friendly |
| Crash reporting | Sentry | Padrão |
| CI/CD | EAS Build (Expo) + GitHub Actions | Padrão Expo |
| Distribuição | App Store (iOS). Android entra depois se features-stretch comportarem | Foco em capturar diferencial Liquid Glass |

---

## 15. Como trabalhamos (workflow definido)

### Papéis

| Quem | O quê |
|---|---|
| Léo (PO) | Visão, UX, estratégia, priorização, validação de mercado, decisões de produto |
| Claude (este chat) | Consultor estratégico, arquiteto de soluções, redator de prompts, validador |
| Claude Code (IDE) | Executor técnico — planeja, escreve código, testa, sobe |
| Impeccable (skill local no Claude Code) | Design language do projeto. 23 comandos (`/impeccable craft`, `/impeccable polish`, `/impeccable critique`, etc.) que leem PRODUCT.md + DESIGN.md e geram código alinhado |

### Pipeline de execução

```
1. Léo + Claude debatem feature/tela na chat
2. Claude escreve PROMPT pra Claude Code (formato LOW / MID / HIGH)
3. Léo cola o prompt no Claude Code
4. Claude Code retorna PLANO
5. Léo aprova ou pede ajuste
6. Claude Code EXECUTA
7. Léo testa no simulador / device
8. Feedback → ciclo recomeça
```

### Estrutura de prompts (formato Prompt Factory)

- **LOW** — tarefa cirúrgica (1 arquivo, 1 mudança específica)
- **MID** — feature pequena (3-5 arquivos, escopo bem delimitado)
- **HIGH** — feature complexa (10+ arquivos, lógica server-side, testes, migrations)

Todos os prompts ficam versionados em `/Users/leofrancaia/Desktop/dose-day-v5/docs/prompts/`.

### Integração com Impeccable

O Claude Code lê PRODUCT.md + DESIGN.md em todo prompt. Comandos Impeccable são chamados explicitamente quando a tarefa cabe:

| Quando | Comando |
|---|---|
| Tela nova do zero | `/impeccable craft` |
| Brief visual antes de codar | `/impeccable shape` |
| Review da tela antes de subir | `/impeccable critique` |
| Última passada antes de produção | `/impeccable polish` |
| Estresse com dados reais (overflow, i18n, erro) | `/impeccable harden` |
| Tela vazia / onboarding | `/impeccable onboard` |
| Copy fraca | `/impeccable clarify` |
| Acessibilidade + performance | `/impeccable audit` |
| Tirar excesso visual | `/impeccable distill` ou `/impeccable quieter` |
| Adicionar peso visual onde está chato | `/impeccable bolder` |

### Princípios pro Claude Code

- **Sempre planejar antes de executar.** Cada prompt retorna plano primeiro
- **Sempre rodar TypeScript check** antes de marcar como feito
- **Sempre apontar warnings de RLS, performance, segurança** no plano
- **Sempre documentar decisão técnica não-óbvia** no commit ou em `/docs/decisions/`
- **Nunca subir código com `as any` ou `// @ts-ignore`** sem justificativa
- **Sempre rodar `/impeccable critique`** antes de marcar uma tela como pronta

---

## 16. Próximos passos imediatos

Ordem de execução, não cronograma. Cada passo destrava o próximo.

| Ordem | Entrega | Quem | Saída |
|---|---|---|---|
| 1 | ✅ Plano Estratégico V5 (este doc) | Claude | `/docs/plano-estrategico-v5.md` |
| 2 | Posicionamento e copy-âncora via `/design:ux-copy` | Claude | seção 5 deste doc atualizada |
| 3 | PRODUCT.md no formato Impeccable | Claude | `/docs/PRODUCT.md` |
| 4 | DESIGN.md no formato Impeccable (6 seções: Overview, Colors, Typography, Elevation, Components, Do's and Don'ts) | Claude | `/docs/DESIGN.md` |
| 5 | architecture.md (estrutura, deps, migrations, bootstrap) | Claude | `/docs/architecture.md` |
| 6 | Prompt-pack 00-kickoff pra Claude Code | Claude | `/docs/prompts/00-kickoff.md` |
| 7 | Instalar Impeccable no Claude Code (`npx impeccable` ou clone do repo) | Léo | `.claude/skills/impeccable/` |
| 8 | Léo cola prompt 00 no Claude Code → recebe plano → aprova → executa | Léo + Code | Repo `doseday-v5` bootstrapped, Expo rodando |
| 9 | Léo testa o repo no simulador | Léo | "Hello World" Expo rodando com auth básica |
| 10 | Próxima sessão Cowork: prompts da Fase 1 (auth real + tab bar + telas vazias com estados) | Léo + Claude | Backlog de prompts MID + HIGH |

---

## Apêndice A — Glossário interno

| Termo | O que é |
|---|---|
| Canetinha emagrecedora | Termo coloquial BR pra GLP-1 (Ozempic, Mounjaro, Wegovy, Zepbound, Saxenda, Victoza) |
| Aha-moment | Primeiro momento em que o usuário entende o valor do app |
| GLP-1 | Agonista do receptor de GLP-1 (classe de medicamento) |
| Tirzepatida | Princípio ativo do Mounjaro/Zepbound (dual GLP-1 + GIP) |
| Semaglutida | Princípio ativo do Ozempic/Wegovy |
| Liraglutida | Princípio ativo do Saxenda/Victoza |
| Endo | Endocrinologista |
| Memória do tratamento | Posicionamento DoseDay: app que registra e devolve sentido |
| Movimento 1/2/3 | As 3 killer features de IA do MVP |
| Persona Mariana | Persona primária — acompanhada por médico |
| Persona João | Persona secundária — autônomo sem médico |

---

## Apêndice B — Riscos identificados e mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Apple rejeitar como Medical App | Média | Alto | Copy cuidadoso (memória/diário, nunca diagnóstico). Posicionar em Health & Fitness. Disclaimer em todo output da IA |
| LGPD incidente com dado sensível | Baixa | Alto | Consent explícito Art. 11. Criptografia em repouso (Supabase). DPO/contato registrado. Revisão jurídica antes do launch |
| Voy lançar app concorrente | Média | Alto | Diferenciação clara (memória vs. serviço). Velocidade. Eventual parceria white-label |
| IA gerar resposta perigosa | Média | Crítico | Guardrails no prompt (não diagnostica, não prescreve). Disclaimer obrigatório. Filtro server-side de palavras-chave de risco (suicídio, automedicação grave) |
| Custo de IA exceder receita | Média | Médio | Limite de tokens por usuário/mês. Cache de prompts comuns. Insights pré-computados onde possível |
| Glass effect bug volta na v5 | Baixa | Médio | Stack iOS 26+ nativa desde o início, evitar workaround do `_layout.tsx` com NativeTabs problemático |
| Pivot estratégico no meio da execução | Alta (histórico) | Médio | Doc-mãe (este) versionado. Toda mudança = atualização aqui antes de executar |

---

**Fim do documento. Versão 1.0 — 14 de maio de 2026.**
