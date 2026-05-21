# 01 — Frontend North Star do DoseDay V5

**Criado:** 20 de maio de 2026
**Autor v1:** Cowork
**Status:** v1 — aguarda debate de Codex App + aprovação Léo

---

## 0. TL;DR (pra Léo ler primeiro)

DoseDay V5 não está competindo por "mais um tracker de medicação". Está competindo por **memória clínica confiável da paciente em tratamento com GLP-1**. North Star: nos primeiros 3 minutos a Mariana precisa sentir que (1) o app **entende a jornada dela**, (2) é **diferente dos outros apps de saúde** que ela já abandonou, (3) **vale a pena confiar dados sensíveis** ali. Não é polish — é a diferença entre D7 6% (V4) e D7 30% (meta V5).

A direção visual já está certa: Clinical Midnight + Vital Mint + Liquid Glass restrito + sobriedade clínica. O problema da V4 não era a paleta. Era **falta de craft em cada momento de decisão** — onboarding genérico, home sem hierarquia, settings que parece checklist, ausência de momentos de delight contidos.

A North Star em uma frase:

> **"O app que a Mariana abre porque quer, não porque o push tocou. O app que ela mostra pra médica e diz: olha o que eu trouxe."**

---

## 1. Princípios estruturais (não-negociáveis)

### 1.1 Clinical Memory ≠ Wellness App

| O que somos | O que NÃO somos |
|---|---|
| Memória clínica privada da paciente | Coach de wellness com gamificação |
| Parceiro silencioso entre consultas | Notificador agressivo de hábito |
| Documentador de evolução | Julgador de progresso |
| Tradutor entre paciente e médica | Substituto de orientação médica |

**Implicação visual:** sem mascotes, sem confetes, sem "Você está incrível!", sem streaks competitivos. Tipografia clínica, números grandes, generosidade de espaço em branco, tom de voz adulto.

### 1.2 Sobriedade > Animação

Liquid Glass é a única licença de "wow visual" — e está restrito à navegação (tab bar, headers). Conteúdo é **flat por padrão**, com hierarquia construída por:

- Tipografia (peso + tamanho, não cor estridente)
- Espaço em branco (deixa o número respirar)
- Vital Mint **raro** (≤10% da superfície — apenas pra ação primária ou estado positivo singular)

Animação só quando carrega informação: transição que mostra continuidade (peso de hoje → peso de ontem), feedback de input (validação inline), entrada de dado novo (slide up suave).

### 1.3 Number-First Rule

Em qualquer tela com dado clínico, **o número é o herói**. Label e contexto são secundários, em tamanho menor, peso normal.

| Errado | Certo |
|---|---|
| Pequeno: "82.4 kg" + label gigante "PESO ATUAL" + ícone | Gigante: "82.4" + sub: "kg • hoje" + delta sutil "−0.3 kg em 7d" |
| Card colorido cheio de elementos | Card flat, número 64pt, label 13pt regular |

### 1.4 Confiabilidade clínica em cada microcopy

PRODUCT.md já estabeleceu o Voice & Tone: calmo, direto, 2ª pessoa, sem hype, sem dark patterns. North Star **expande** isso:

- Nunca prometer o que app não pode entregar ("você vai perder peso" → "você vai documentar sua jornada")
- Nunca inventar prova social ("87% dos usuários..." → cortar inteiro até termos dados reais)
- Nunca culpar a usuária ("Você esqueceu sua dose!" → "Sua dose de quarta ainda não foi marcada — quer registrar agora?")
- Sempre dar saída ("Pular esta etapa" disponível em onboarding step opcional, sem culpa)

### 1.5 30% Glass Rule (DESIGN.md, reforçado)

Glass aparece **só** em:
- Tab bar inferior (sempre)
- Header de tela quando há scroll content por trás (parcialmente translúcido)
- Modal de medicação ativa (Welcome pré-auth — caso excepcional aprovado)

Glass **nunca** aparece em:
- Cards de conteúdo
- Inputs de formulário
- Botões primários
- Listas de settings
- Tela inteira (telas opacas, fundo Clinical Midnight sólido)

---

## 2. Os primeiros 3 minutos (experiência emocional alvo)

Esse é o investimento mais importante de UI/UX da V5. Mariana decide aqui se vai voltar amanhã.

### Segundo 0-15 — Welcome pré-auth
**Sensação alvo:** *"Esse app respeita o que estou passando."*

- Liquid Glass leve, fundo Clinical Midnight, **uma única frase** que reconhece o contexto: "Sua jornada com [GLP-1] merece memória."
- CTA secundário "Já tenho conta" + primário "Começar"
- Zero cookie banner, zero spinner desnecessário, zero modal de "vamos te conhecer"

**Anti-padrão:** carrossel de 5 slides de marketing antes de entrar.

### Segundo 15-90 — Onboarding step 1-3
**Sensação alvo:** *"Cada pergunta tem razão. Não estou preenchendo formulário burocrático."*

- Subtítulos clínicos explicam por que aquele dado importa ("Sexo biológico nos ajuda a interpretar referências de dose")
- Inputs grandes, sem amontoamento, animação de entrada que faz a tela parecer "carregada com cuidado, não com pressa"
- Bottom CTA "Continuar" em Vital Mint só fica ativo quando válido — feedback visual claro

**Anti-padrão:** 12 campos por tela, validação só depois de submit, "Próximo" cinza sem explicar por que.

### Segundo 90-180 — Loading IA + Result
**Sensação alvo:** *"O app realmente entendeu meu caso. Já vejo valor."*

- Loading IA com 5 micro-steps narrados ("Identificando estágio do tratamento... Mapeando padrões esperados... Personalizando lembretes...") — não é fake, são chamadas reais
- Result final mostra **o primeiro insight personalizado**: "Você está na semana 3 de Mounjaro 5mg. Pacientes neste estágio costumam sentir [X]. Vou ficar de olho em [Y] pra você."
- Disclaimer humilde no rodapé ("Isso é uma anotação inteligente, não orientação médica.")
- CTA "Começar a usar" entra na home com **a memória já populada** — não com tela vazia

**Anti-padrão:** "Bem-vindo! Aqui está sua tela." com card vazio convidando a "adicionar primeira dose".

### Pós 3 minutos — Home + primeiro retorno
**Sensação alvo:** *"Volto amanhã porque já tem algo me esperando."*

- Home **nunca está vazia** — mesmo no D0, mostra "Próxima dose: quinta, daqui 2 dias" + insight do onboarding + atalho pra registrar peso
- Quando a Mariana volta no D1, há algo novo: "Você marcou Mounjaro 5mg ontem. Algumas pessoas notam náusea leve nas primeiras 48h — quer registrar como está se sentindo?"

**Anti-padrão:** home D0 idêntica a home D30 — sem reconhecimento de momento.

---

## 3. Mapa de momentos de delight contido

Delight contido = momento em que o app surpreende positivamente **sem gritar**. Lista de oportunidades, da maior pra menor:

| Momento | O que entrega | Custo de implementação |
|---|---|---|
| Result do onboarding com insight real | Primeiro "uau, isso é diferente" | Alto (Edge Function já existe, copy precisa craft) |
| Home reconhece dia da dose | "Hoje é seu dia" sem precisar tocar | Médio (lógica de scheduling + copy) |
| Registro de peso mostra delta animado | "−0.3 kg" entra suavemente abaixo do novo número | Baixo (Reanimated) |
| Notificação push é frase humana | "Sua dose de quinta. Sem pressa, quando puder." | Baixo (copy) |
| Settings tem ordem clara | Encontra "deletar conta" em 2 toques | Baixo (IA) |
| Welcome respira | Uma frase, não 5 | Baixo (copy + layout) |
| Loading IA narra steps | Sensação de "está pensando em mim" | Baixo (já implementado) |
| Empty state de histórico | "Ainda não há registros — comece pelo peso de hoje" com CTA inline | Baixo |
| Confirmação de dose tem haptic | Toque sutil físico ao registrar | Baixo (Haptics.impactAsync light) |
| Transição entre tabs | Glass que muda com swipe, não corta | Médio (já é nativo do Liquid Glass) |

**Anti-delight (evitar a todo custo):**
- Modal "Avalie nosso app" antes de 7 dias de uso
- Notification asking for permission no D0 sem contexto
- "🎉 Parabéns!" em qualquer lugar
- Som ao completar ação
- Vibração forte
- Confetes
- Progress bar com "10% completo!"

---

## 4. Comparação direta com referências (o que copiamos e o que rejeitamos)

| Produto | O que copiar | O que rejeitar |
|---|---|---|
| **Apple Health** | Generosidade tipográfica, gráficos limpos, hierarquia de "destaques" | Densidade de dados excessiva, jargão clínico cru |
| **Oura** | Loading screens narrados, sobriedade visual, copy maduro | Score gamificado (Readiness 78), comparação com "comunidade" |
| **Headspace** (lojinha velha) | Calma visual, espaço em branco, paleta restrita | Mascote, sons forçados |
| **Streaks app** | Microinteração de haptic ao completar | Streak counter que culpa quando quebra |
| **Mint / Copilot (finanças)** | Number-first em transações | Densidade de cards |
| **Cron / Linear** | Tipografia clínica, dark mode bem feito | Densidade enterprise |
| **Noom** | Nada | Tudo (paywall agressivo, gamificação, chat com "coach" fake) |
| **Duolingo** | Nada | Streaks, push aggressive, mascote |

---

## 5. Direção tática por área do app

### 5.1 Onboarding (14 telas)
**Estado atual:** funcional ponta-a-ponta, copy clínico já está bom (locales/onboarding.json).
**Gap de craft:** transição entre steps, hierarquia tipográfica em headlines, microinteração nos selects (atualmente toque seco).
**North Star:** sentir que cada step é uma conversa, não um questionário. Step indicator sutil (não barra de progresso agressiva). Botão Continuar respira no bottom safe area.

### 5.2 Welcome pré-auth
**Estado atual:** existe (PR #34, Liquid Glass aplicado).
**Gap de craft:** validar uma frase só, hierarquia de CTA, tempo de respiro antes do tap.
**North Star:** primeira impressão de "isso aqui é sério, mas calmo".

### 5.3 Home (tab 1)
**Estado atual:** crítico — provavelmente o gap maior da V5 hoje.
**Gap de craft:** sem "momento principal" claro, sem reconhecimento de fase do tratamento, sem CTA contextual.
**North Star:** card único hero "Próxima dose: quinta-feira • Mounjaro 5mg" + insight do dia + atalhos discretos (peso, sintoma, agendar consulta).

### 5.4 Histórico (tab 2)
**Estado atual:** não auditado em detalhe — preencher na auditoria.
**Gap previsto:** lista cronológica sem hierarquia visual.
**North Star:** linha do tempo com mês como header, eventos clínicos (dose, peso, consulta) em cards sóbrios.

### 5.5 Peso (tab dedicada, PR #32)
**Estado atual:** CRUD funcional.
**Gap de craft:** delta entre pesos não está visualmente forte, gráfico ausente ou genérico, empty state pode estar fraco.
**North Star:** número herói + delta + sparkline simples (não chart cheio de eixos).

### 5.6 Perfil + Settings (PR #33)
**Estado atual:** refactorado em menu de rows.
**Gap de craft:** sub-telas (Health Data, Medical References, Idioma, Tema) ainda placeholders, hierarquia de seções vaga.
**North Star:** settings parece **Apple-grade** — grupos visuais claros, sem badges "Novo", sem ícones coloridos competindo.

### 5.7 Notificações
**Estado atual:** V1 funciona (settings + permissão + token), backend trigger pendente.
**Gap de craft:** copy do push, hora padrão, modal de permissão com contexto humano.
**North Star:** zero notificação agressiva. Push é exceção, não regra.

---

## 6. Critérios de "pronto visualmente" (definição de craft)

Pra Léo aprovar uma tela:

1. **Hierarquia clara em 1 segundo** — o olho sabe pra onde ir
2. **Number-First respeitado** quando há dado clínico
3. **Vital Mint usado ≤1 vez** por tela
4. **Glass apenas em navegação**
5. **Microcopy revisada contra anti-Noom / anti-Duolingo** (regras do PRODUCT.md)
6. **Empty state existe e tem CTA** se aplicável
7. **Transição de entrada respira** (não corta, não pisca)
8. **Touch targets ≥ 44pt**
9. **Dark mode é o default** (Clinical Midnight) — light mode pode ficar pra depois
10. **Acessibilidade básica:** labels em VoiceOver, contraste ≥ 4.5:1 em texto corpo
11. **Validação visual no iPhone real**, não só simulador

---

## 7. O que NÃO entra em redesign (ainda)

Pra disciplinar escopo:

- Paywall + RevenueCat UI → fica pro pós-redesign (existe trial 14d configurado, podemos viver com paywall provisório)
- Onboarding A/B testing → fica pro pós-launch
- Light mode → pós-launch
- iPad layout → pós-launch
- Animações de Lottie complexas → não entra (sobriedade)
- Modo paciente vs modo cuidador → V6+
- Tela de export pra médica (PDF) → entra depois do core estar polido

---

## 8. Risco principal de não fazer essa rodada

Se pulamos auditoria + redesign e vamos direto pra features novas (export PDF, mais sub-telas, paywall), entregamos a V5 com **o mesmo problema de craft que matou a V4**: funcional, mas sem desejo de uso. D7 continua em 6%.

A oportunidade dessa rodada é exatamente inverter isso — usar as próximas 1-2 semanas pra elevar o que já existe ao padrão "Mariana mostra pra amiga".

---

## 9. Pontos abertos pra debate com Codex App

1. **Onboarding tem 14 steps. É demais?** Pesquisar referência de apps de saúde sérios — Oura tem 8, Calm tem 6. Talvez consolidemos.
2. **Home herói precisa de imagem/ilustração?** Posição atual: não. Apenas tipografia + número. Discutir.
3. **Glass em modal vs sem modal pro Welcome pré-auth?** Hoje é com modal flutuante. Avaliar alternativa de tela inteira opaca + glass só no botão.
4. **Sparkline no card de peso vs gráfico dedicado.** Sparkline mais sóbrio. Gráfico permite mais análise. Qual prevalece na home?
5. **Voice & Tone aplicado em push notifications.** Precisamos de skill de copy específica ou Cowork resolve com PRODUCT.md aberto?

---

**Fim do 01-frontend-north-star.md.**

**Próximo passo:** Codex App lê e debate. Cowork populates `02-auditoria-frontend-atual.md` em paralelo.
