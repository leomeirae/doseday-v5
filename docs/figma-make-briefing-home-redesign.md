# Briefing Figma Make — Redesign da Home/Dashboard (DoseDay V5)

> **Como usar:** cole este briefing inteiro no Figma Make. Peça as 3 variações descritas na seção 6. O objetivo é travar a direção visual ANTES de codar no app. Os mockups devem ser implementáveis com os dados/blocos que já existem — nada de feature inventada.

---

## 1. Produto e persona

DoseDay é a **memória inteligente do tratamento**, começando por canetas GLP-1 (Mounjaro, Ozempic, Wegovy, Zepbound). Não é app de dieta nem wellness — é uma ferramenta clínica séria que ajuda o paciente a registrar o que acontece no tratamento e conversar melhor com o médico.

**Persona:** Mariana, usa iPhone 13+, valoriza o iOS nativo, reconhece cuidado nos detalhes. O app precisa parecer **sério, premium, moderno e clínico** — não fofo, não genérico.

**Tela alvo:** Home/Dashboard, iPhone (frame ~390 × 844, dark mode). Tela única rolável, **sem Tab Bar**. Acesso a configurações via ícone de engrenagem no header.

---

## 2. Paleta exata (Clinical Midnight — dark mode obrigatório)

Use estes hex exatos. Fundo escuro profundo, profundidade por **camadas tonais**, não por sombra.

| Papel | Hex |
|---|---|
| Fundo base | `#050B12` |
| Superfície elevada | `#0E1620` |
| Superfície de dado (cards) | `#1B2433` |
| Painel da dose (hero) | `#172637` |
| **Vital Mint (marca/CTA)** | `#00D4AA` |
| Mint Soft (só ponto final do sparkline de peso) | `#A3E6D2` |
| Texto primário (branco quente) | `#F2F4F7` |
| Texto secundário | `#9CA8B8` |
| Texto terciário | `#6B7280` |
| Warning (sintoma) | `#FFB347` |
| Info / dose (accent) | `#5BA8D9` |
| Crítico | `#E64545` |

**Accent por domínio** (cor da bolinha/ícone de cada tipo, use com parcimônia):
- Dose → `#5BA8D9` (azul) · Peso → `#00D4AA` (mint) · Nota → `#B8AECF` (lilás) · Sintoma → `#FFB347` (laranja) · Custo → `#D7B56D` (dourado)

---

## 3. Regras visuais inegociáveis (é isso que torna premium e não genérico)

1. **Vital Mint ≤ 10% da tela.** O mint `#00D4AA` aparece em pouquíssimos pontos (CTA primário, linha de peso, 1 accent positivo). Um app todo verde = poluição. A raridade do mint é o que dá poder a ele.
2. **Number-First.** Em todo card de dado, **o número domina e vem antes do label**, com no mínimo 2× o tamanho do label. "87,0 kg" grande, "peso atual" pequeno embaixo. Nunca "Peso atual: 87 kg".
3. **Peso usa número Ultralight 48pt** (dado pessoal, suaviza). Dose e valores clínicos usam **Bold**.
4. **Flat por padrão.** Profundidade vem de camada tonal (`#050B12` → `#0E1620` → `#1B2433`), **não de sombra decorativa**. Sombra só em coisa que flutua (o hero pode ter leve elevação; cards de lista não).
5. **One Action por card.** Cada card tem **uma** ação principal: abrir a área completa daquele domínio (chevron à direita, corpo clicável). Não empilhar "adicionar" + "ver histórico" no mesmo card.
6. **Memória recente é compacta** na Home (3-4 eventos como resumo). Timeline completa fica na tela de Memória.
7. **Tipografia SF Pro (System).** Hierarquia por peso e tamanho, uma família só. Bold = dado crítico; Semibold = label de seção; Regular = texto explicativo.
8. **Sem glass em conteúdo.** Nada de glassmorphism em card de dado. (Glass só existiria em navegação — e aqui nem tem Tab Bar.)
9. Cantos arredondados raio **14px** (cards), nem quadrado de banco nem redondo de wellness.

---

## 4. Tipografia (escala)

- Número herói dose: Bold 48pt · Número peso: **Ultralight 48pt** · Número médio: Bold 28pt
- Headline: Semibold 28pt · Título: Semibold 22pt · Subtítulo: Semibold 18pt
- Corpo: Regular 16pt · Caption/label: 13pt · Eyebrow de seção: 13pt semibold, uppercase, tracking leve, cor secundária

---

## 5. Os blocos e o conteúdo (use estes dados de exemplo — são reais do app)

Ordem de cima pra baixo. **Todos já existem no app** — o trabalho é hierarquia e diferenciação, não criar bloco novo.

1. **Header** — "Hoje no seu tratamento" + data "Quinta-feira, 11 de junho" + ícone de engrenagem (configurações) à direita.
2. **HERO — Próxima dose** (o ponto visual mais forte da tela). Painel `#172637`, leve destaque. Conteúdo: `Mounjaro · 5,0 mg`, data programada "domingo, 14 de junho", e o status grande em destaque: **"Em 3 dias"** (variações de estado: "Hoje", "Amanhã", "2 dias de atraso" em laranja/vermelho). CTA "Registrar dose". Mostre também uma versão do estado atrasado numa das variações.
3. **Peso** — Número Ultralight grande **"87,0 kg"**, label "peso atual", delta "−13,0 kg desde o início", **sparkline** com ponto final em Mint Soft `#A3E6D2`, "atualizado há 3 dias". Chevron pra abrir histórico.
4. **Memória recente** (compacta, 3-4 itens) — timeline curta com **bolinhas coloridas por tipo**: 🔵 Dose · Hoje "Dose de 5,0 mg administrada" / 🟣 Nota · há 3 dias "Levar histórico de peso para a consulta" / 🟢 Peso · há 3 dias "87,0 kg" / 🟠 Sintoma · há 6 dias "Náusea". CTA "Ver memória completa".
5. **Ações rápidas** — máx 4 atalhos em linha/grid: **Sintoma · Dúvida/Nota · Peso · Dose**. Ícone + label curto. Devem parecer atalhos de entrada rápida, sem poluir.
6. **Consulta** — bloco leve: "Próxima consulta" (data se houver) + "2 dúvidas para levar". CTA discreto "Preparar consulta". Sem virar feature completa — é resumo + entrada.
7. **Sintomas** — último sintoma: "Náusea · leve · há 6 dias". Chevron pra área de sintomas.
8. **Custos** — "R$ 1.240 registrados" (Number-First), "último registro há 6 dias". Chevron.
9. **Disclaimer** — texto pequeno, terciário: "DoseDay organiza a memória do seu tratamento. Não substitui orientação médica."

---

## 6. As 3 variações que quero ver

Gere **3 telas Home completas**, mesmos dados e blocos, mesma paleta, diferindo só na composição/hierarquia:

**Variação A — Conservadora.** Estrutura próxima da atual (lista de cards empilhados), mas com hierarquia clara: hero da dose mais forte, peso destacado, memória compacta. Risco baixo, evolução do que já existe.

**Variação B — Clinical Command Center.** Hero da dose dominante no topo (ocupa mais área, número/status grande), cards com **papéis visuais diferenciados** (peso = card de dado pessoal; sintomas/custos = cards menores secundários, talvez lado a lado; memória = feed compacto), ações rápidas como faixa de atalhos destacada. Sensação de "painel de comando", não lista.

**Variação C — Mais arrojada.** Home como painel premium proprietário: hero com tratamento visual mais forte (sem inventar roda de fase — usar só countdown/status), agrupamento de cards secundários em grid 2 colunas (sintomas + custos lado a lado, consulta + memória), composição mais densa e editorial. Ainda implementável com os dados atuais.

---

## 7. Critérios de aprovação (a variação vencedora precisa passar)

- A Home **não parece mais uma lista de seções** — parece um painel de comando.
- **Próxima dose é claramente o hero.**
- Peso continua forte, com número grande + sparkline + contexto.
- Memória recente está **compacta**.
- Ações rápidas aparecem **sem poluir** (máx 4).
- Configurações acessíveis (engrenagem no header).
- Navegação **sem Tab Bar** parece óbvia (cards levam às áreas).
- Visual **sério/premium/clínico**, não wellness genérico.
- Vital Mint usado com raridade (≤10%).
- **Nada de dado inexistente** (sem roda de fase/Peak Effect) e **nenhuma feature nova**.

---

## 8. Nota de fidelidade (importante)

Figma Make gera protótipo web — ele serve pra travar **composição, hierarquia, proporção e sensação premium**, não pixel-perfect do iOS nativo. Coisas como ícones SF Symbols, sheets nativos e fontes do sistema vão ser aproximados. Quando você aprovar uma direção, eu traduzo pra um prompt técnico que o Claude Code implementa com os componentes reais (NativeWind + tokens do app). O mockup é o norte visual, não o código final.
