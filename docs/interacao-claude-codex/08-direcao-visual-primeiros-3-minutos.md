# 08 — Direção visual dos primeiros 3 minutos (Fase 1)

**Criado:** 2026-05-20
**Autor:** Cowork
**Para:** Codex App, Léo
**Status:** v1 — aguarda debate Codex App + aprovação Léo
**Base:** `01-frontend-north-star.md` (princípios) + `07-auditoria-v2.md` (fatos) + `07c-codex-app-ratificacao-auditoria-v2.md` (ressalva: elevar craft, não só corrigir)
**Decisões aplicadas:** D015 (P009=A: sem estudos clínicos no Result) + D016 (P010=A: quick-log direto com feedback + desfazer)
**Bloqueia:** prompts de implementação (Fase 2)
**Não bloqueia:** sensação Léo em `07b` em paralelo, coleta pendente de Loading IA + console

---

## §0 — TL;DR (1 página)

A direção visual elege 4 momentos como **centro do produto**: **Welcome**, **Loading IA**, **Result IA**, **Home D0+D1**. Esses 4 momentos formam a janela onde Mariana decide ficar ou sair. Tudo o resto (Doses, Diário, Relatórios, Perfil, modais) entra em Fase 3+.

### Decisões estruturais propostas

| Momento | Direção decisiva | Bypass do gap atual |
|---|---|---|
| **Welcome** | **Refatorar pra tela única** — uma frase clínica forte + 2 CTAs num `WelcomeActionDock` (glass apenas como chrome de ações, com fallback flat tonal). Aposentar carrossel | Resolve "CTA primário só no slide 3" + dá necessidade emocional em 1 tela |
| **Loading IA** | Manter 5 micro-steps com **piso de 5s, máximo 15s, sem piso em cache, Reduce Motion respeitado, fallback honesto se Edge falhar** + entrada com fade calma | Resolve "loading passou batido" sem inventar loading falso |
| **Result IA** | **Inverter ordem**: cards de números primeiro (3 cards enxutos), contexto opcional como **"Como o DoseDay vai acompanhar"** expandível (sem claims clínicos sobre fase), sem citar estudos, disclaimer visível no meio (não escondido) | Resolve ONB-06/07/08/10 simultaneamente |
| **Home D0** | **Insight do onboarding aparece direto** na Home. Premium fora da primeira leitura. Card "Próxima dose" vazio ganha CTA primário "Registrar primeira dose" | Resolve ONB-09 |
| **Home D1+** | Insight muda baseado em fase do tratamento e último registro. Premium continua fora da primeira leitura | Resolve F0-12 |

### Princípio acima de tudo
**Cada momento entrega continuidade do anterior.** Onboarding → Loading → Result → Home é uma só conversa contínua, não 4 telas isoladas.

### Próximo passo
1. Codex App debate `08`
2. Léo aprova
3. Cowork escreve **3 prompts de implementação** (Fase 2): `30-MID-welcome-distill`, `31-HIGH-result-ia-redesign`, `32-MID-home-continuidade`. Nessa ordem.

---

## §1 — Princípios da direção (relembrando North Star)

Esses princípios são **trilhos** de toda decisão visual nessa Fase 1. Quando há dúvida, volta aqui.

| Princípio | O que significa na prática |
|---|---|
| Clinical Memory ≠ Wellness App | Sem confetes, sem mascote, sem "Você está incrível 🎉" |
| Sobriedade > Animação | Animação só carrega informação. Nunca decorativa |
| Number-First Rule | Quando há dado clínico, o número é o herói. Label é secundário |
| Vital Mint raro | ≤1 vez por tela. Só pra ação primária ou estado positivo singular |
| 30% Glass Rule | Glass só em navegação. Conteúdo é flat |
| Hierarquia em 1 segundo | Olho sabe pra onde ir sem esforço |
| Continuidade | Cada tela é continuação da anterior. Nunca recomeço |
| Honestidade | Sem prova social inventada, sem upsell disfarçado, sem promessa exagerada |

### Ressalva Codex App (incorporada)
A direção visual **eleva craft de Welcome, Result IA e Home**. Não é só correção de bug. É a oportunidade de transformar 4 telas funcionais em 4 telas memoráveis.

---

## §2 — Welcome (refatorar pra tela única)

### §2.1 Decisão estratégica
**Aposentar carrossel de 3 slides.** Substituir por **tela única** com:
- 1 frase clínica forte (uma das 3 atuais, escolhida)
- 2 CTAs visíveis desde a entrada (primário + ghost)
- Liquid Glass sutil apenas em faixa inferior decorativa
- Zero swipe, zero step indicator

**Por que aposentar carrossel:**
- Slide 1 atual (`48`) não tem CTA primário (P1 First Impression)
- Esforço mínimo de 3 toques pra começar
- Carrossel é padrão genérico de marketing — viola "Clinical Memory ≠ Wellness App"
- Tela única dá necessidade emocional em 1 segundo, não em 30s de leitura

### §2.2 Wireframe ASCII proposto

```
┌─────────────────────────────────┐
│                                  │
│                                  │
│       [ícone caneta pequeno]    │  ← 32pt, monocromático Vital Mint
│                                  │
│                                  │
│   Sua memória do tratamento.    │  ← 32pt SemiBold, Clinical White
│                                  │
│   Anote como cada semana foi    │  ← 16pt Regular, text-secondary
│   indo. Leve pra consulta.      │
│                                  │
│                                  │
│                                  │
│                                  │
│   ┌──────────────────────────┐  │
│   │     Criar conta          │  │  ← Primário Vital Mint, 56pt
│   └──────────────────────────┘  │
│                                  │
│       Já tenho conta             │  ← Ghost, sublinhado
│                                  │
│                                  │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← Glass sutil, decorativo
└─────────────────────────────────┘
```

### §2.3 Voice & Tone

**Headline escolhida:** "Sua memória do tratamento."
- Razão: é a tese mais forte do produto, alinhada com Clinical Memory
- Mantida do carrossel atual slide 1, mas isolada e com peso visual maior

**Subtítulo escolhido:** "Anote como cada semana foi indo. Leve pra consulta."
- Razão: combina promessa do slide 1 ("anote como foi") + slide 2 ("pronto pra consulta")
- 2ª pessoa, calmo, sem hype, anti-Noom

**CTA primário:** "Criar conta"
- Razão: ação direta, sem fricção interpretativa

**CTA secundário:** "Já tenho conta"
- Razão: ghost subtle, não compete

### §2.4 Componentes
| Componente atual | Decisão | Novo? |
|---|---|---|
| WelcomePageIndicator | **Apagar** | — |
| WelcomeSlide | **Apagar** | — |
| AuthButton | Reutilizar | Não |
| AuthLink (ghost) | Reutilizar | Não |
| — | Faixa Glass decorativa inferior | Novo `<WelcomeGlassFooter />` (opcional) |

### §2.5 Métricas de sucesso (Léo aprova quando)
- [ ] Tempo até interativo < 500ms
- [ ] Headline lida em 1s sem esforço
- [ ] CTA primário acessível sem swipe
- [ ] Liquid Glass sutil, sem dominar tela
- [ ] LOC do `(welcome)/index.tsx` cai de 295 pra **<150**
- [ ] Sente-se "sério, calmo, profissional" em primeira impressão

### §2.6 O que NÃO entra agora
- A/B test de copy
- Ilustração ou imagem
- Animação de entrada elaborada
- Modo light
- Tradução en/es (mantém pt-BR padrão)

---

## §3 — Loading IA (manter, ajustar timing)

### §3.1 Decisão estratégica
**Manter 5 micro-steps narrados** (stage / patterns / reminders / memory / insight) **com piso de 5 segundos** mesmo se a Edge Function responder antes. Razão: o loading **vende a sensação de "está pensando em mim"**. Se passa batido, perdemos esse momento de delight contido (mapeado no `01-frontend-north-star.md`).

**Não muda:** Edge Function, copy dos micro-steps, lógica de fetch.

**Muda:** comportamento de "responder antes" — aguarda piso mínimo antes de transicionar pro Result.

### §3.2 Wireframe ASCII proposto

```
┌─────────────────────────────────┐
│                                  │
│                                  │
│                                  │
│       [pulse animation]          │  ← `PulseAnimation` existente
│                                  │
│   Estamos organizando seu        │  ← 28pt SemiBold
│   tratamento.                    │
│                                  │
│   Isso leva alguns segundos.     │  ← 16pt text-secondary
│                                  │
│                                  │
│   • Identificando o estágio      │  ← 14pt, dot fade in/out
│     do tratamento                │
│                                  │
│                                  │
│   1s ════════════ 5s             │  ← Progress sutil, opcional
│                                  │
└─────────────────────────────────┘
```

### §3.3 Voice & Tone
**Já existe e está bom** em `locales/pt-BR/onboarding.json`:
- "Identificando o estágio do tratamento"
- "Mapeando padrões esperados pra fase atual"
- "Personalizando lembretes pra sua dose"
- "Preparando a memória clínica inicial"
- "Criando seu primeiro insight"

**Manter.** Calmo, clínico, segunda pessoa.

### §3.4 Componentes
| Componente atual | Decisão |
|---|---|
| LoadingStepIndicator | Manter, ajustar timing |
| PulseAnimation | Manter |

### §3.5 Métricas de sucesso
- [ ] Cada micro-step visível por ≥800ms
- [ ] Loading total ≥5s mesmo se Edge Function for instantânea
- [ ] Transição final pra Result com fade calma (não corte)
- [ ] Sente-se "o app está cuidando do meu caso" em 5s

### §3.6 O que NÃO entra agora
- Mudança na Edge Function
- Skeleton de Result aparecendo embaixo do loading
- Skip button

---

## §4 — Result IA (reformatar)

### §4.1 Decisão estratégica
**Inverter ordem completa.** Sem citar estudos. Disclaimer visível. CTA não cobre conteúdo.

A regra: **Mariana acabou de esforço de 5 minutos preenchendo 14 telas. Ela merece um result que devolva valor em 5 segundos.**

### §4.2 Wireframe ASCII proposto

```
┌─────────────────────────────────┐
│  < Voltar               14/14    │  ← header sutil opcional
│                                  │
│                                  │
│   Bem-vindo, Leonardo.           │  ← 24pt SemiBold
│                                  │
│                                  │
│   ┌────────────────────────┐    │
│   │ Semana 8               │    │  ← Card Number-First
│   │ ──                     │    │
│   │ Mounjaro 5mg           │    │  ← 17pt
│   └────────────────────────┘    │
│                                  │
│   ┌────────────────────────┐    │
│   │ Meta de peso           │    │
│   │ ──                     │    │
│   │ 78 kg                  │    │  ← 32pt Vital Mint, hero
│   │ faltam 10 kg           │    │  ← 14pt text-secondary
│   └────────────────────────┘    │
│                                  │
│   Vamos acompanhar isso          │  ← 17pt, frase calma
│   semana a semana.               │
│                                  │
│                                  │
│   ┌────────────────────────┐    │
│   │ ⓘ  Isso é uma anotação │    │  ← Disclaimer visível
│   │    inteligente, não    │    │  ← Componente
│   │    orientação médica.  │    │  ← `InsightDisclaimer`
│   └────────────────────────┘    │
│                                  │
│   ▼ Saiba mais sobre essa fase   │  ← Expansível opcional
│                                  │
│                                  │
│   ┌──────────────────────────┐  │
│   │   Começar a usar         │  │  ← CTA com paddingBottom no
│   └──────────────────────────┘  │  ← ScrollView = altura CTA + safe
└─────────────────────────────────┘
```

### §4.3 Voice & Tone

**Headline:** "Bem-vindo, Leonardo."
- Manter. Reconhecimento simples.

**Sub:** removido (atual "Aqui está o que sabemos do seu tratamento até agora" é redundante com os cards).

**Card 1 — Stage:**
- "Semana 8" + "Mounjaro 5mg"
- Não diz "Você está na semana 8 do tratamento" — número herói + medicação. Mais limpo.

**Card 2 — Meta:**
- "Meta de peso" + "78 kg" + "faltam 10 kg"
- Number-First absoluto. Vital Mint só no número da meta (uso parcimonioso).

**Frase 3 — Compromisso:**
- "Vamos acompanhar isso semana a semana."
- Calma, segunda pessoa, sem hype.

**Saiba mais (expansível):**
- Conteúdo: descrição GERAL da fase do tratamento (sem citar estudos por nome). Ex: "Nas primeiras semanas, é comum sentir adaptação gastrointestinal. Algumas pessoas notam mudança no apetite."
- Edge Function deve ser ajustada pra **não citar SURMOUNT-1/SURMOUNT-3/SURPASS** (D015 = P009=A)

**Disclaimer:**
- Mantido visível no meio (não escondido). Componente `InsightDisclaimer` reutilizado.

### §4.4 Componentes
| Componente atual | Decisão |
|---|---|
| InsightCard (do onboarding) | Refatorar pra suportar Number-First + cards menores |
| InsightDisclaimer | Reutilizar |
| WeightDeltaDisplay | Reutilizar (no card de meta) |
| — | Novo `<InsightStageCard />` (cards enxutos) |
| — | Novo `<ExpandableContextSection />` (Saiba mais) |

### §4.5 Métricas de sucesso
- [ ] Cards de números visíveis em 1s sem scroll
- [ ] Disclaimer visível sem scroll
- [ ] CTA Vital Mint sem cobrir conteúdo
- [ ] Zero citação nominal a estudos clínicos (verificado em Edge Function output)
- [ ] Mariana lê o result inteiro em 5-7 segundos
- [ ] Sente "o app entendeu meu caso" e quer tocar "Começar a usar"

### §4.6 O que NÃO entra agora
- Edição de Termos de Uso
- Adição de revisor médico contratado
- Onboarding A/B (deixar fixo o novo Result)
- Tradução en/es

### §4.7 Mudança crítica em paralelo: Edge Function
**Dependência fora do escopo de UI.** Antes de implementar Result, a Edge Function `generate-onboarding-insight` precisa ser ajustada pra remover citações de estudos. Isso é um prompt LOW separado (ex: `Prompt 33-LOW-edge-onboarding-insight-sem-estudos`). **Sem essa mudança, Result novo continua P0 Legal.**

---

## §5 — Home D0+D1 (continuidade do onboarding)

### §5.1 Decisão estratégica

**Home D0 e D1+ reaproveitam o insight gerado no onboarding** (sem paywall). Premium fora da primeira leitura emocional. Card "Próxima dose" vazio no D0 ganha CTA primário "Registrar primeira dose".

**Princípio:** Home é **continuação** do Result, não outra tela. Mariana terminou onboarding → Result → Home, e a Home deve parecer "ainda dentro do mesmo momento".

### §5.2 Wireframe ASCII proposto — Home D0 (sem dose)

```
┌─────────────────────────────────┐
│  Boa noite, Leonardo             │  ← 24pt SemiBold
│  Quarta-feira, 20 de maio        │  ← 13pt text-secondary
│                                  │
│                                  │
│   Próxima dose                   │  ← Section header
│   ┌────────────────────────┐    │
│   │ Comece sua jornada      │    │  ← Empty state com CTA
│   │                         │    │
│   │ Registre sua primeira   │    │
│   │ dose pra começar a      │    │
│   │ memória do tratamento.  │    │
│   │                         │    │
│   │ ┌─────────────────────┐ │    │
│   │ │ Registrar dose      │ │    │  ← CTA Vital Mint
│   │ └─────────────────────┘ │    │
│   └────────────────────────┘    │
│                                  │
│   Insight do dia                 │  ← Section header
│   ┌────────────────────────┐    │
│   │ Semana 8 do Mounjaro   │    │  ← Mesmo conteúdo do
│   │ 5 mg                    │    │  ← onboarding result,
│   │                         │    │  ← formato curto
│   │ Vamos acompanhar isso   │    │
│   │ semana a semana.        │    │
│   └────────────────────────┘    │
│                                  │
│   [tab bar com glass]            │
└─────────────────────────────────┘
```

### §5.3 Wireframe ASCII proposto — Home D1+ (com dose)

```
┌─────────────────────────────────┐
│  Boa noite, Leonardo             │
│  Quarta-feira, 20 de maio        │
│                                  │
│   Próxima dose                   │
│   ┌────────────────────────┐    │
│   │ 7                       │    │  ← Number-First, 48pt
│   │                         │    │  ← Vital Mint
│   │ dias até sua próxima   │    │  ← 15pt text-secondary
│   │ dose                    │    │
│   │ ──                      │    │
│   │ Mounjaro · 5 mg         │    │  ← 17pt
│   │ Quarta-feira, 27/05     │    │  ← 13pt text-secondary
│   └────────────────────────┘    │
│                                  │
│   Insight do dia                 │
│   ┌────────────────────────┐    │
│   │ Sua primeira dose foi   │    │  ← Reconhecimento de
│   │ aplicada hoje. Vou      │    │  ← momento (D1+)
│   │ ficar de olho em como   │    │
│   │ você se sente.          │    │
│   └────────────────────────┘    │
│                                  │
│   [tab bar com glass]            │
└─────────────────────────────────┘
```

### §5.4 Voice & Tone

**Greeting** ("Boa noite, Leonardo" + data):
- Manter como está. Calmo. Mas considerar reconhecimento de momento em estado específico (ex: "Boa noite, Leonardo — sua primeira dose foi registrada hoje"). Decisão fina em Fase 2 implementação.

**Card "Próxima dose" vazio (D0):**
- Headline "Comece sua jornada"
- Body: "Registre sua primeira dose pra começar a memória do tratamento."
- CTA: "Registrar dose"

**Card "Próxima dose" com dose (D1+):**
- Already good (visível em `47`). Manter.

**Card "Insight do dia":**
- D0: mesmo insight do onboarding (texto curto, sem badge "Premium")
- D1+: insight contextual baseado em fase + último registro
- Fallback (sem IA disponível): "Vamos acompanhar seu tratamento dia a dia."

### §5.5 Componentes
| Componente atual | Decisão |
|---|---|
| GreetingHeader | Manter, considerar reconhecimento de momento |
| NextDoseCard | Refatorar pra suportar 2 estados: vazio com CTA / preenchido com Number-First |
| InsightCard | **Refatorar urgente**: remover paywall, mostrar insight real do onboarding |
| — | Novo `<EmptyDoseStateCard />` (estado vazio com CTA inline) |

### §5.6 Métricas de sucesso
- [ ] D0 mostra insight do onboarding em vez de "Premium"
- [ ] D0 vazio tem CTA primário visível pra registrar
- [ ] D1+ tem Number-First respeitado no card próxima dose
- [ ] Premium NÃO aparece na primeira leitura emocional
- [ ] Mariana sente continuidade do onboarding (não recomeço)
- [ ] Toque em "Registrar dose" no D0 abre modal direto

### §5.7 O que NÃO entra agora
- Atalhos rápidos (peso, sintoma, consulta) — Fase 2 ou 3
- Sparkline de peso na Home — Fase 3
- Reconhecimento de momento dinâmico complexo (ex: "Faz 3 dias que você não registra peso") — Fase 3
- Pull-to-refresh atualizar insight do dia — Fase 3

---

## §6 — Voice & Tone consolidado dos 3 momentos

| Tela | Headline | Sub | CTA primário | Tom |
|---|---|---|---|---|
| Welcome | "Sua memória do tratamento." | "Anote como cada semana foi indo. Leve pra consulta." | "Criar conta" | Clinical, calmo |
| Loading IA | "Estamos organizando seu tratamento." | "Isso leva alguns segundos." | — | Reflexivo |
| Result IA | "Bem-vindo, Leonardo." | (cards substituem sub) | "Começar a usar" | Reconhecimento + dados |
| Home D0 vazio | "Boa noite, Leonardo" | "Comece sua jornada" (no card) | "Registrar dose" | Convite calmo |
| Home D1+ | "Boa noite, Leonardo" | (Number-First domina) | (tap no card) | Reconhecimento de progresso |

**Padrões consistentes em todos:**
- 2ª pessoa ("você"), nunca 3ª
- Zero emoji
- Zero ponto de exclamação (exceto se for fala da Mariana, que não temos)
- Zero "Parabéns", "Sucesso", "Incrível"
- Vital Mint só em CTA primário ou número herói

---

## §7 — Componentes que mudam vs novos

### §7.1 Componentes a refatorar
| Componente | Refator |
|---|---|
| `InsightCard` (Home) | Remover paywall. Aceitar insight do onboarding como prop. Renderizar texto + fallback estático |
| `NextDoseCard` (Home) | Suportar 2 estados: vazio com CTA / preenchido com Number-First |
| `(welcome)/index.tsx` | Reescrever pra tela única. Apagar WelcomeSlide + WelcomePageIndicator |
| `result.tsx` | Inverter ordem. Number-First. Disclaimer visível. paddingBottom no Scroll |
| `loading.tsx` | Adicionar piso de 5s antes de transicionar |

### §7.2 Componentes novos (mínimos)
| Componente | Função |
|---|---|
| `<InsightStageCard />` | Card enxuto Number-First pro Result |
| `<ExpandableContextSection />` | "Saiba mais ▼" pro Result |
| `<EmptyDoseStateCard />` | Card vazio com CTA pra D0 |
| `<WelcomeGlassFooter />` | Faixa Glass sutil no Welcome (opcional) |

### §7.3 Componentes a apagar
- `WelcomeSlide` (3 arquivos)
- `WelcomePageIndicator`

---

## §8 — Métricas de sucesso da Fase 1

Critério pra Léo aprovar a Fase 1 inteira (após implementação Fase 2):

### §8.1 Métricas objetivas (verificáveis)
- [ ] Welcome: tempo até interativo < 500ms, LOC < 150
- [ ] Loading IA: cada step ≥ 800ms visível, total ≥ 5s
- [ ] Result IA: cards visíveis sem scroll, zero citação a estudos
- [ ] Home D0: insight do onboarding visível, CTA "Registrar dose" visível
- [ ] Home D1+: Number-First respeitado, Premium fora da primeira leitura
- [ ] Glass apenas em navegação (validar com inspector iOS)

### §8.2 Métrica subjetiva (sensação Léo no iPhone real)
- [ ] Welcome → Onboarding → Loading → Result → Home parece **uma conversa contínua**
- [ ] Sente-se "clínico, calmo, profissional" em todos os momentos
- [ ] Não há momento de "ah, era propaganda" ou "isso aqui parece Noom"
- [ ] Mariana hipotética voltaria amanhã sem precisar de push

---

## §9 — O que NÃO entra na Fase 1

| Item | Quando entra |
|---|---|
| Doses tab redesign | Fase 3 |
| Diário tab redesign | Fase 3 |
| Relatórios tab redesign | Fase 3 |
| Perfil tab redesign | Fase 3 |
| Modal Registrar dose simplificação | Fase 3 |
| Modal Registrar peso (já simples, mantém) | — |
| Sub-telas Health Profile / Sobre placeholders | Fase 4 |
| Settings.json keys legadas V4 | Fase 4 |
| Push backend real (cron + trigger) | Paralelo, executor separado |
| Paywall + RevenueCat UI | Fase 5 |
| App Store assets | Pre-ship |
| Sparkline peso | Fase 3 |
| Atalhos rápidos na Home | Fase 3 |
| Reconhecimento dinâmico de momento | Fase 3 |
| Pull-to-refresh | Fase 3 |
| iPad / light mode | V6 |
| Export PDF | V5.1 |
| Analytics dashboard | V5.1 |

---

## §10 — Próximos prompts de implementação (Fase 2)

**Não escrever ainda.** Aguarda Léo aprovar `08`.

| # | Tipo | Tema | Esforço estimado | Depende de |
|---|---|---|---|---|
| 30 | MID | Welcome distill (tela única + 2 CTAs + Glass footer) | 4-6h | Aprovação `08` |
| 31 | HIGH | Result IA redesign (ordem invertida + Number-First + disclaimer visível) | 1-1.5 dia | Aprovação `08` + Prompt 33 |
| 32 | MID | Home continuidade (D0 insight + D1+ Number-First + EmptyDoseStateCard) | 6-8h | Prompts 33 + 31 |
| 33 | LOW-MID | Edge Function `generate-onboarding-insight` sem estudos clínicos **+ contrato estruturado de output** (stageLabel, medicationLabel, goalLabel, deltaLabel, shortInsight, nextStep, contextBullets, disclaimer) | 3-4h | Aprovação `08` |
| 34 | LOW | Loading piso de 5s | 1-2h | Aprovação `08` |
| 35 | LOW | BUG-i18n-Account fix (carregar namespace `account` no bootstrap) | 1h | Independente |

**Ordem de execução sugerida:**
1. Prompt 35 (i18n) — independente, pequeno, **shippa rápido pra restaurar confiança**
2. Prompt 33 (Edge Function) — bloqueia Prompt 31
3. Prompt 30 (Welcome) — independente, pequeno
4. Prompt 34 (Loading) — independente, pequeno
5. Prompt 31 (Result IA) — depende de 33
6. Prompt 32 (Home) — depende de 31 (insight da Home reaproveita do Result)

**Sequência paralelizável:** 35 + 33 + 30 + 34 podem rodar em sessões alternadas de Codex CLI ou Claude Code. 31 depende de 33. **32 depende de 33 e 31** (Home reaproveita contrato do insight + alinhamento visual com o Result final).

---

## §11 — Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Léo não aprovar wireframe da Home na primeira tentativa | Iterar em arquivo `08b-debate-home.md` antes de implementar |
| Edge Function nova ainda devolver claims clínicos | Prompt 33 com sample output validado por Léo antes de PR |
| Liquid Glass quebrar fora iOS 26 | `BlurView` fallback já implementado. Testar em iOS 25 também |
| Apagar carrossel Welcome perder analytics existentes | Nenhuma (não temos analytics) — risco baixo |
| Insight da Home não ter dados se IA falhar | Fallback estático: "Vamos acompanhar seu tratamento dia a dia." |
| Mariana real (não Léo) achar Welcome tela única "vazio demais" | Aceitar risco. Léo é PO. Pode iterar pós-ship com Mariana real |

---

## §12 — Ação esperada

### Léo
1. Lê `08` (este arquivo)
2. Responde no chat ou em `08b-leo-feedback-direcao.md`: **aprovo / pede ajustes / rejeita momento X**
3. Continua marcando `07b` em paralelo

### Codex App
1. Lê `08`
2. Debate inline ou em `08c-codex-app-debate-direcao.md`
3. Foca em: (a) sequência de prompts da Fase 2, (b) wireframes do Result e Home, (c) decisão sobre `<ExpandableContextSection />` (manter? aposentar paredão?), (d) timing real medido pra piso de 5s do Loading

### Cowork
1. Aguarda aprovação Léo + debate Codex App
2. Quando aprovado, escreve **Prompt 35 (i18n)** primeiro — quick win
3. Depois Prompts 33 → 30/34 → 31 → 32

---

**Fim do 08-direcao-visual-primeiros-3-minutos.md.**
