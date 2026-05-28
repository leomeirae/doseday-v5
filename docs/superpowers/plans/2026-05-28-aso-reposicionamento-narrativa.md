# Prompt 43 — ASO + Reposicionamento Narrativa DoseDay V5 (Plano)

> **Tipo:** peça estratégica (documentação). **Regra de ouro:** ZERO código de produto.
> Apenas markdown em `docs/marketing/` (+ este plano).

**Goal:** Produzir 6 artefatos de ASO + posicionamento + copy que reposicionam DoseDay V5 como "memória inteligente do tratamento" (marca ampla) com GLP-1 como caso de uso da campanha atual — sem tocar em código.

**Arquitetura:** Conteúdo escrito derivado de `docs/plano-estrategico-v5.md` (§4 persona, §5 tom/posicionamento), `CONTEXT.md` (glossário) e telas reais confirmadas no `app/`. Cada campo Apple respeita limite de caracteres. Propostas múltiplas onde o PO escolhe.

**Tech Stack:** Markdown apenas. Validação: `npm run type-check` + `npm run lint` (não devem mudar).

---

## Decisões confirmadas (PO, 2026-05-28)

1. Skill ASO: `antigravity-bundle-expo-react-native:app-store-optimization` (substitui `appstore-creative-designer`, inexistente).
2. Mapeamento Apple: "descrição curta (170)" = **Texto Promocional** (170 chars, editável sem submit).

## Limites de caracteres Apple (App Store Connect)

| Campo | Limite | Regras |
|---|---|---|
| Nome | 30 | — |
| Subtítulo | 30 | — |
| Texto Promocional ("descrição curta") | 170 | editável sem submeter app |
| Descrição | 4000 | — |
| Keywords | 100 | vírgulas sem espaço, sem plurais, sem duplicar palavras do nome/subtítulo |
| What's New | 4000 | — |

## Features reais (confirmadas no app/, para alinhar copy)

Doses (`app/dose/registrar`, `app/(tabs)/doses`), Sintomas (`app/diario/anotar-sintoma`, `quick-log`), Peso (`app/peso/registrar`, `historico`), Custos (`app/diario/custos`, `anotar-custo`), Memória/timeline (`app/memoria/index`, `app/diario/notas`, `anotar-memoria`), Relatórios (`app/(tabs)/relatorios`), Médico/consulta (`app/configuracoes/tratamento/medico`, `app/perfil/protocolo`). Check-in (`app/diario/checkin`).

## Artefatos (6) — `docs/marketing/`

1. `posicionamento-marca.md` — frase-mãe (2-3), frase campanha GLP-1, camada funcional, tom de voz, vocabulário evitado, persona Mariana.
2. `aso-app-store.md` — nome (atual vs sugerido), subtítulo (3×), texto promo (3×), descrição (5 parágrafos), keywords (≤100), What's New V5.0.0.
3. `screenshots-copy.md` — copy dos 6 screenshots (título + subtítulo + CTA implícito).
4. `copy-landing-page.md` — hero (3×), 3 blocos "como funciona", bloco GLP-1, privacidade/LGPD, social proof placeholder, FAQ.
5. `metricas-aso.md` — conversão, keyword ranking, baseline V4 + meta 90d + frequência, teste qualitativo.
6. `sementes-de-consulta-no-produto.md` — sugestões pro Prompt 44/45 (NÃO implementar).

## Validação / git

- `npm run type-check` + `npm run lint` passam (sem mudança).
- `git status --short` ANTES do `git add`.
- `git add` explícito: `docs/marketing/`, `docs/superpowers/plans/2026-05-28-aso-reposicionamento-narrativa.md`, `docs/prompts/43-*`.
- Zero `.ts/.tsx/.js/.jsx`, zero `graphify-out/`, `.codegraph/`, zero `*" 2.png"` no staging.
- PR target: `main`.

## Assumptions Karpathy

- Persona Mariana (35-55, urbana, GLP-1 com médica) é o alvo primário validado.
- Features atuais cobrem ~80% da narrativa "memória do tratamento".
- Tom DoseDay (claro, calmo, sem hype) já estabelecido em `plano-estrategico-v5.md` §5.
- Reposicionamento de ASO/copy não exige código de produto.

## Could 50 lines do this?

Não — 6 artefatos textuais estratégicos distintos. Cada um é conteúdo, não código.
