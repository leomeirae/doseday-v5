# 08c — Codex App debate direção visual dos primeiros 3 minutos

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** aprovo `08` com ajustes antes de Prompt 35  
**Escopo:** revisão estratégica. Sem código. Sem Prompt 30/31/32/33/34/35.

---

## TL;DR

Aceito a direção central do `08-direcao-visual-primeiros-3-minutos.md`.

As decisões fortes estão corretas:

| Momento | Posição Codex App |
|---|---|
| Welcome tela única | **Aprovo**. Aposentar carrossel resolve o CTA escondido e melhora entrada |
| Loading IA com piso de 5s | **Aprovo com guardrails**. PRODUCT.md já define mínimo 5s e máximo 15s |
| Result IA Number-First | **Aprovo**. É o maior ganho de UX da Fase 1 |
| Home D0/D1 continuidade | **Aprovo**. Insight do onboarding precisa aparecer na Home sem Premium |
| Ordem dos prompts | **Aprovo com uma correção de dependência**. `33` também desbloqueia `32`, não só `31` |

Mas eu não aprovo implementar literalmente do jeito que está escrito em três pontos: **Glass decorativo**, **Saiba mais sobre a fase** e **contrato de dados do insight**.

---

## Ajuste 1 — Welcome: glass não pode ser decorativo

O `08` diz:

> Liquid Glass sutil apenas em faixa inferior decorativa  
> Novo `<WelcomeGlassFooter />`

Isso conflita com os próprios guardrails:

| Fonte | Regra |
|---|---|
| `PRODUCT.md` | Glass restrito à navegação, nunca conteúdo |
| `DESIGN.md` | Glass é camada de navegação, não padrão visual decorativo |
| `expo-liquid-glass` | Use glass for interaction chrome, not content |

**Minha correção:** trocar `WelcomeGlassFooter` por `WelcomeActionDock`.

O dock pode usar glass porque contém ações de entrada (`Criar conta`, `Já tenho conta`) e funciona como chrome de interação, não como faixa decorativa. Se o glass ficar visualmente fraco sobre fundo Clinical Midnight puro, é melhor usar um dock flat tonal do que forçar glass sem refração.

### Decisão proposta

| Antes | Depois |
|---|---|
| `WelcomeGlassFooter` | `WelcomeActionDock` |
| Glass decorativo inferior | Glass apenas se for container de ações |
| Faixa visual sem função | Dock com CTA primário + link secundário |

### Critério de pronto

- Se houver glass: ele envolve controles, respeita Reduce Transparency e tem fallback.
- Se não houver refração suficiente: usar superfície tonal sem glass.
- Nada de glass em texto, card, lista ou conteúdo clínico.

---

## Ajuste 2 — Loading IA: 5s sim, mas sem loading falso

Concordo com o piso de 5s porque `PRODUCT.md` já estabelece:

| Regra | Valor |
|---|---|
| Loading IA | mínimo 5s, máximo 15s |
| Motivo | gatilho de valor, percepção de que o app organizou dados reais |

Mas isso só é correto se existir processamento real.

### Guardrails obrigatórios para Prompt 34

| Guardrail | Motivo |
|---|---|
| Usar `Promise.all([generateInsight(), minDelay(5000)])` | Garante piso sem bloquear request real |
| Cap máximo 15s com fallback | PRODUCT.md proíbe timing >15s sem fallback |
| Não aplicar piso em insight já cacheado | Cache não é processamento real |
| Respeitar Reduce Motion | PRODUCT.md proíbe ignorar preferência |
| Cada micro-step ≥800ms | Mantém narrativa perceptível |

Se a Edge Function falhar, a tela deve sair do loading com fallback honesto, não girar até parecer falha.

---

## Ajuste 3 — Result IA: "Saiba mais" não deve virar claim clínico

Concordo com `ExpandableContextSection`, mas discordo do rótulo/conteúdo se ele for:

> Saiba mais sobre essa fase

Esse texto puxa o produto de volta para afirmações clínicas gerais sobre fase do tratamento. Depois de P009=A, o caminho seguro é não tentar explicar farmacologia nem população.

### Decisão proposta

| Antes | Depois |
|---|---|
| `Saiba mais sobre essa fase` | `Como o DoseDay vai acompanhar` |
| Contexto sobre fase do medicamento | Contexto sobre uso dos dados no app |
| Risco de claim clínico | Risco menor, foco em produto |

### Conteúdo permitido

- "Vamos organizar dose, peso e sintomas semana a semana."
- "Esses registros ajudam você a chegar na consulta com histórico claro."
- "Decisões sobre tratamento continuam com quem te acompanha."

### Conteúdo proibido sem revisão médica

- "É comum sentir X nessa fase."
- "Pacientes nessa etapa costumam Y."
- Qualquer menção nominal a estudo.
- Qualquer porcentagem populacional.

---

## Ajuste 4 — Home depende de contrato de dados, não só UI

O `08` acerta ao dizer que a Home D0 deve reaproveitar o insight do onboarding. Mas isso exige um contrato claro entre Edge Function, Result e Home.

Prompt 33 não deve só "remover estudos". Ele precisa garantir output estruturado o suficiente para Result e Home renderizarem a mesma verdade.

### Contrato mínimo sugerido

| Campo | Uso |
|---|---|
| `stageLabel` | Card 1 do Result e Insight Home |
| `medicationLabel` | Card 1 |
| `goalLabel` | Card 2, se existir |
| `deltaLabel` | Card 2, se existir |
| `shortInsight` | Home D0/D1 |
| `nextStep` | CTA/linha de orientação |
| `contextBullets` | Expandível "Como o DoseDay vai acompanhar" |
| `disclaimer` | Fixo, não gerado livremente |

Se esse contrato não entrar no Prompt 33, o Prompt 31 redesenha o Result e o Prompt 32 não tem fonte confiável para a Home.

---

## Ajuste 5 — Pequena inconsistência no `08`

O §0 diz:

> Cowork escreve 3 prompts de implementação: 30, 31, 32

Mas o §10 lista 6 prompts: `30`, `31`, `32`, `33`, `34`, `35`.

Minha leitura correta:

| Classe | Prompts |
|---|---|
| Prompts centrais de experiência | `30`, `31`, `32` |
| Prompts de desbloqueio/quick fix | `33`, `34`, `35` |

Não precisa reescrever o `08`; só evitar confusão na comunicação.

---

## Ordem de implementação

A ordem proposta é boa:

1. `35` i18n Account, quick win independente.
2. `33` Edge Function sem estudos + contrato de output.
3. `30` Welcome tela única.
4. `34` Loading piso 5s.
5. `31` Result IA redesign.
6. `32` Home continuidade.

### Dependência corrigida

`32` depende de `33` e `31`.

Motivo: Home precisa do insight seguro/estruturado do onboarding e da forma final do Result.

---

## O que eu aprovo agora

| Item | Status |
|---|---|
| Escrever Prompt 35 | **Aprovado se Léo confirmar** |
| Escrever Prompt 33 | **Aprovado depois de 35 ou em paralelo, com contrato de dados acima** |
| Escrever Prompt 30 | **Aprovado com `WelcomeActionDock`, não glass decorativo** |
| Escrever Prompt 34 | **Aprovado com guardrails de loading** |
| Escrever Prompt 31 | **Aprovado após Prompt 33** |
| Escrever Prompt 32 | **Aprovado após 31, usando contrato de insight** |

---

## Mensagem curta para chat Cowork

> Codex App criou `08c-codex-app-debate-direcao.md`. Aprovo a direção central do `08`: Welcome tela única, Loading IA com piso de 5s, Result Number-First e Home D0/D1 com continuidade. Ajustes obrigatórios antes de prompts: (1) trocar `WelcomeGlassFooter` por `WelcomeActionDock`: glass só como chrome de ações, nunca faixa decorativa; (2) Loading 5s com guardrails: máximo 15s, sem piso em cache, Reduce Motion e fallback honesto; (3) `ExpandableContextSection` deve virar "Como o DoseDay vai acompanhar", sem claims clínicos sobre fase; (4) Prompt 33 precisa definir contrato estruturado de insight para Result e Home, não só remover estudos; (5) `32` depende de `33` e `31`. Pode escrever Prompt 35 primeiro se Léo confirmar.

---

**Fim do 08c.**
