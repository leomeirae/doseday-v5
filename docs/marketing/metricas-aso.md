# Métricas de ASO — Pós-reposicionamento DoseDay V5

> **Prompt 43 — peça estratégica.** Define o que medir após virar a comunicação de V4 → V5 ("memória do tratamento"). Zero código de produto.
>
> **Baseline V4:** valores de `plano-estrategico-v5.md` §12. Onde o doc marca `n/a`, a baseline deve ser puxada do App Store Connect pelo PO antes de cravar a meta.

---

## 1. Conversão na App Store (impressões → downloads)

| Métrica | Baseline (V4) | Meta 90 dias | Frequência |
|---|---|---|---|
| Taxa de conversão (impressão → download) | puxar do ASC | +30% sobre baseline | Semanal |
| Downloads / semana | ~25 | 100+ | Semanal |
| Taxa de download orgânico (sem ads) | puxar do ASC | ≥ 60% dos downloads | Semanal |

> Conversão é o KPI-mãe do reposicionamento: se a nova copy comunica melhor, a mesma impressão vira mais download. Medir **antes** de qualquer ads pra isolar o efeito da copy.

## 2. Keyword ranking (semanal)

Acompanhar posição de cada termo. Baseline = posição atual no ASC (ou "não rankeia").

| Keyword | Baseline | Meta 90 dias |
|---|---|---|
| glp1 | puxar | top 50 |
| mounjaro | puxar | top 30 |
| ozempic | puxar | top 30 |
| wegovy | puxar | top 30 |
| zepbound | puxar | top 50 |
| tratamento | puxar | top 50 |
| sintoma | puxar | top 50 |
| dose | puxar | top 50 |
| relatório médico | puxar | top 50 |
| memória tratamento | puxar | top 20 (termo nicho, baixa concorrência) |

> Marcas de medicamento (Mounjaro/Ozempic/Wegovy) têm alta intenção e concorrência — meta mais conservadora. "memória tratamento" é nosso termo de baixa concorrência: meta agressiva.

## 3. Funil landing → App Store

| Métrica | Baseline | Meta 90 dias | Frequência |
|---|---|---|---|
| Cliques landing → App Store (via UTM) | sem landing hoje (0) | estabelecer baseline na semana 1 | Semanal |
| Conversão da landing (visitante → clique no botão da App Store) | n/a | ≥ 15% | Semanal |

> Exige UTM nos botões da landing (ver `copy-landing-page.md`). Sem instrumentação, não há número — instrumentar é pré-requisito.

## 4. Teste qualitativo (one-shot, antes/depois)

- **O quê:** mostrar a nova listing da App Store (nome + subtítulo + 1º screenshot) pra **5-10 pessoas que fazem GLP-1**.
- **Pergunta:** "Sem ler tudo: o que você acha que esse app faz?"
- **Critério de sucesso:** resposta alinhada à tese ("organiza/lembra o tratamento", "pra consulta") **sem confusão** ("é farmácia?", "vende remédio?", "é dieta?").
- **Frequência:** 1 rodada antes de publicar a nova listing; 1 rodada 30 dias depois.
- **Meta:** ≥ 7 de 10 descrevem corretamente sem prompt adicional.

---

## 5. Como medir (ferramentas)

| Métrica | Fonte |
|---|---|
| Conversão, impressões, downloads | App Store Connect (App Analytics) |
| Keyword ranking | ASC + ferramenta ASO externa (opcional) |
| Funil landing | UTM + PostHog (`plano-estrategico-v5.md` §14) |
| Qualitativo | Entrevista manual (PO) |

## 6. Ritmo de revisão

- **Semanal:** conversão, downloads, keyword ranking, funil landing.
- **30 / 60 / 90 dias:** revisão de meta + 2ª rodada qualitativa aos 30d.
- **Gatilho de ação:** se conversão não subir vs. baseline em 4 semanas, revisar subtítulo/1º screenshot (campos editáveis sem submeter build — texto promocional e screenshots).

---

## Pendência do PO (pré-baseline)

> Vários campos acima estão como "puxar do ASC". Antes de cravar metas, o PO precisa exportar do App Store Connect: conversão atual, downloads/semana, e ranking atual das 10 keywords. Sem isso, as metas ficam sem âncora.
