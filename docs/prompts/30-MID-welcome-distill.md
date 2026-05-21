# DoseDay V5 — Prompt 30-MID-welcome-distill

**Instância de destino:** Codex App ou Claude Code (independente)
**Branch a criar:** `feature/30-welcome-distill`
**Modelo recomendado:** Sonnet (MID com decisão visual)
**Esforço estimado:** 4-6h
**Origem estratégica:** Fase 2 do redesign (`docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §2).

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça (em especial 1, 3, 22, 28)
- `docs/karpathy.md` — Karpathy Guidelines
- `docs/PRODUCT.md` — Voice & Tone, Brand Personality, Clinical Memory
- `docs/DESIGN.md` — tokens, 30% Glass Rule, Vital Mint Rarity
- `docs/interacao-claude-codex/01-frontend-north-star.md` — Welcome §1, §2, §5.2
- `docs/interacao-claude-codex/07-auditoria-v2.md` §1 (achados Welcome) + §12.1 (ONB-UX-welcome-carrossel-sem-cta)
- `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §2 (direção Welcome) + §6 (Voice & Tone consolidado) + §7 (componentes a apagar e criar)
- `docs/interacao-claude-codex/08c-codex-app-debate-direcao.md` ajuste 1 (WelcomeActionDock vs WelcomeGlassFooter)
- `app/(welcome)/index.tsx` (estado atual, 295 LOC)
- `components/welcome/WelcomeSlide.tsx` + `components/welcome/WelcomePageIndicator.tsx` (a apagar)
- `assets/screenshots/2026-05-20-fase-0/48-welcome-slide-1-current.png`, `49-welcome-slide-2-current.png`, `50-welcome-slide-3-current.png` (estado atual visual)

---

## Objetivo desta tarefa

Refatorar o Welcome pré-auth de **carrossel de 3 slides** (estado atual: CTA primário só aparece no slide 3 após 2 swipes) para **tela única** com:

- 1 headline clínica forte (escolhida do North Star)
- 1 subtítulo curto que combine "pronto pra consulta" + "anote como foi"
- 2 CTAs visíveis desde a entrada (primário Vital Mint + ghost secundário) dentro de um **WelcomeActionDock**
- Glass aplicado **apenas** ao WelcomeActionDock como chrome de interação (com fallback flat tonal se a refração não funcionar bem sobre fundo Clinical Midnight)

**Critério crítico:** zero swipe, zero step indicator, zero ilustração. Sobriedade clínica do North Star §1 + §2.

---

## Decisões canônicas aplicadas (não revisar)

| Decisão | Origem |
|---|---|
| Aposentar carrossel + slides | `08` §2.1 |
| Headline: "Sua memória do tratamento." | `08` §2.3, mantida do slide 1 atual |
| Sub: "Anote como cada semana foi indo. Leve pra consulta." | `08` §2.3, combinada de slides 1 + 2 |
| CTA primário: "Criar conta" Vital Mint, 56pt altura | `08` §2.3 + §6 |
| CTA secundário: "Já tenho conta" ghost sublinhado | `08` §2.3 + §6 |
| WelcomeActionDock (não WelcomeGlassFooter) — glass só como chrome de ações, fallback flat tonal se refração fraca | `08c` ajuste 1 |
| Glass nunca em texto, card, lista, conteúdo | `00-protocolo.md` §7 + ADR/DESIGN.md anti-padrão #1 |
| Liquid Glass restrito à camada de navegação/chrome | `01-frontend-north-star.md` §1.5 |

---

## Critérios de aceitação

- [ ] `app/(welcome)/index.tsx` tem **<150 LOC** (era 295) — `wc -l` confirma
- [ ] Tela única — zero `useState` de slide ativo, zero swipe handler, zero PageIndicator
- [ ] Headline única "Sua memória do tratamento." renderizada com peso semibold ~32pt
- [ ] Subtítulo único "Anote como cada semana foi indo. Leve pra consulta." em text-secondary ~16pt
- [ ] CTA primário "Criar conta" Vital Mint visível desde abertura (zero swipe pra encontrar)
- [ ] CTA secundário "Já tenho conta" ghost subtle abaixo do primário
- [ ] WelcomeActionDock envolve os 2 CTAs com glass (ou flat tonal se fallback) — não é faixa decorativa solta
- [ ] `components/welcome/WelcomeSlide.tsx` deletado
- [ ] `components/welcome/WelcomePageIndicator.tsx` deletado
- [ ] Locale `locales/pt-BR/welcome.json` tem as 2 strings novas (headline + sub) e zero copy de slides 2/3 órfão
- [ ] `tsc --noEmit` PASS
- [ ] `npm run lint` PASS sem erros novos
- [ ] `/impeccable critique` rodado e score ≥ 32/40
- [ ] Screenshot real PNG em `assets/screenshots/2026-05-20-fase-2-pr30/welcome-distill.png` anexado ao PR
- [ ] AuthGuard segue redirecionando corretamente (4-way welcome / signin / onboarding / tabs)

---

## Restrições explícitas

- **Karpathy:** mudança cirúrgica em Welcome. Zero refator em `(auth)/`, `(onboarding)/`, `(tabs)/`, AuthGuard ou layout root
- **NÃO** criar nova ilustração, mascote, animação ou Lottie
- **NÃO** usar Vital Mint em mais de 1 elemento por tela (apenas no CTA primário)
- **NÃO** aplicar glass em texto ou no background da tela inteira — só no dock
- **NÃO** usar Tailwind/NativeWind — StyleSheet nativo
- **NÃO** criar `useState` pra slide, swipe, paginação
- **NÃO** adicionar tradução en/es nas strings novas se já não existem — entra em prompt futuro de i18n polish
- **NÃO** mexer em `lib/i18n/index.ts` (namespace welcome já está registrado)
- Se WelcomeActionDock com glass ficar visualmente fraco no Clinical Midnight puro: usar **superfície tonal flat** ao invés de forçar glass

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-21-welcome-distill.md` |
| Arquitetura | `grill-with-docs` | Validar decisão de aposentar carrossel contra CONTEXT.md/PRODUCT.md |
| Implementação | `liquid-glass:liquid-glass` | Dock com `GlassView`/`expo-glass-effect` + fallback `BlurView` ou tonal |
| Implementação | `/impeccable craft` | Execução visual seguindo Number-First/Sobriedade |
| Validação | `react-native-devtools-mcp` | Screenshot real no simulador iPhone 17 |
| Validação | `/impeccable critique` | Score ≥ 32/40 antes do PR |

### B) Plano de execução

1. Persistir plano em `docs/superpowers/plans/2026-05-21-welcome-distill.md`
2. Conferir estado atual: `wc -l app/(welcome)/index.tsx`, ler 3 arquivos (`index.tsx`, `WelcomeSlide.tsx`, `WelcomePageIndicator.tsx`)
3. Atualizar `locales/pt-BR/welcome.json` com 2 strings novas. Remover copy de slides órfãos
4. Reescrever `app/(welcome)/index.tsx` como tela única. Manter export default + `useEffect` de AuthGuard se houver
5. Criar `components/welcome/WelcomeActionDock.tsx` que envolve 2 CTAs com glass (ou flat tonal fallback). Usar `expo-glass-effect` com fallback via Platform/ReduceTransparency
6. Apagar `WelcomeSlide.tsx` e `WelcomePageIndicator.tsx`
7. `tsc --noEmit` + `npm run lint` PASS
8. `/impeccable critique` no `app/(welcome)/index.tsx` + `components/welcome/WelcomeActionDock.tsx`
9. Validar visual no simulador via `react-native-devtools-mcp`: login deslogado → cai em Welcome → vê headline + 2 CTAs + dock. Tap em "Já tenho conta" → vai pra `(auth)/signin`. Tap em "Criar conta" → vai pra `(auth)/signup`
10. Capturar screenshot PNG real em `assets/screenshots/2026-05-20-fase-2-pr30/welcome-distill.png`
11. Abrir PR `feature/30-welcome-distill` com título `feat(welcome): tela única distill com WelcomeActionDock` + body referenciando `08` §2 + screenshot + score impeccable + LOC antes/depois

### C) Riscos identificados

- **R1: `expo-glass-effect` com refração fraca sobre Clinical Midnight puro** → fallback: superfície tonal flat com border sutil
- **R2: AuthGuard quebra se mudar export default ou estrutura de hooks** → manter mesma assinatura, apenas mudar conteúdo do JSX
- **R3: Copy "Criar conta" / "Já tenho conta" pode ser inconsistente com `(auth)/signup` e `(auth)/signin`** → verificar copy nas telas alvo e padronizar se necessário (mas sem mexer nas telas alvo)
- **R4: deletar slides quebra algum import órfão** → `grep -r "WelcomeSlide\|WelcomePageIndicator" app components` antes de deletar; se houver consumer não detectado, mover responsabilidade
- **R5: Reduce Transparency do iOS faz glass virar opaco** → testar com setting ativo, garantir que fallback é visualmente aceitável

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `app/(welcome)/index.tsx` | editar | Reescrita pra tela única, <150 LOC |
| `components/welcome/WelcomeActionDock.tsx` | criar | Dock com 2 CTAs + glass/fallback |
| `components/welcome/WelcomeSlide.tsx` | **deletar** | Carrossel aposentado |
| `components/welcome/WelcomePageIndicator.tsx` | **deletar** | Idem |
| `locales/pt-BR/welcome.json` | editar | 2 strings novas + remoção das antigas dos slides |
| `docs/superpowers/plans/2026-05-21-welcome-distill.md` | criar | Plano persistido |
| `assets/screenshots/2026-05-20-fase-2-pr30/welcome-distill.png` | criar | Screenshot validação |
| `docs/history.md` | editar (1 linha) | Registrar Prompt 30 executado |

**Não tocar em:** `(auth)/`, `(onboarding)/`, `(tabs)/`, `lib/i18n/index.ts`, `app/_layout.tsx` (AuthGuard root), `DESIGN.md`, `PRODUCT.md`

### E) Como vai validar

- [ ] `tsc --noEmit` PASS (via Bash com RTK)
- [ ] `npm run lint` PASS sem erros novos
- [ ] `wc -l app/(welcome)/index.tsx` retorna < 150
- [ ] `find components/welcome/ -name "*.tsx"` retorna **apenas** `WelcomeActionDock.tsx`
- [ ] Screenshot real mostra headline + sub + 2 CTAs + dock visualmente íntegro
- [ ] Tap em CTA primário navega pra `(auth)/signup`
- [ ] Tap em CTA secundário navega pra `(auth)/signin`
- [ ] AuthGuard ainda redireciona usuário com sessão pra `(tabs)` sem cair no Welcome
- [ ] `/impeccable critique` score ≥ 32/40
- [ ] Reduce Transparency ativo no simulador: dock continua legível (fallback funciona)

### F) Otimização de tokens

Welcome (`index.tsx`) tem 295 linhas — `Read` direto OK. Slides têm <100 linhas cada. Não há leitura grande nesse prompt.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.
