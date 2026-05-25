# DoseDay — Direcao Geral de Design da Tela Unica

**Data:** 2026-05-23  
**Status:** documento de direcao visual e produto. Nao e prompt de execucao.  
**Base visual aprovada:** Figma Make v7, export local em `/Users/leofrancaia/Downloads/High-Fidelity App Design Directions (1)`  
**Referencia tecnica curta:** `docs/handoff/HANDOFF-figma-make-home-v7.md`

Este documento consolida a direcao visual da futura tela unica do DoseDay. Ele deve orientar Codex, Claude Code e Claude Cowork quando retomarmos a implementacao.

---

## 1. Decisao central

A tela principal do DoseDay deve parecer uma **memoria organizada do tratamento**, nao um dashboard, prontuario, diario de sintomas ou app motivacional.

O usuario nao entra para "preencher um sistema". Ele entra para lembrar o que aconteceu, registrar o minimo necessario e sair com a sensacao de que o tratamento esta organizado.

**Frase de norte:**

> Seu tratamento esta organizado ate aqui.

Essa frase nao e so headline. Ela define a promessa da tela.

---

## 2. O que esta direcao resolve

| Problema anterior | Direcao nova |
|---|---|
| Home parecia tracker generico | Home vira memoria do tratamento |
| Muitos cards desconectados | Layout linear com separadores finos |
| Check-in parecia obrigacao diaria | Captura vira acao contextual, sem cobranca |
| Proxima dose podia assumir 7 dias | Estado seguro: `A definir` ate protocolo informado |
| IA parecia protagonista | Memoria e protagonista; IA e veiculo no Pro |
| Relatorio parecia medico-first | Consulta vira memoria do que lembrar, paciente-first |
| Sintomas viravam formulario | Observacoes viram memoria contextual |

---

## 3. Personalidade visual

A tela deve ser:

| Deve parecer | Nao deve parecer |
|---|---|
| iOS premium | dashboard tecnico |
| calma | app motivacional |
| adulta | wellness fofo |
| clinica sem hospital | prontuario medico |
| densa sem poluir | pilha de cards |
| pessoal | sistema operacional de clinica |
| confiavel | chatbot de IA |

O design deve ser sofisticado pela precisao: espacamento, contraste, tipografia, ritmo e ausencia de excesso.

---

## 4. Estrutura da tela unica

A ordem aprovada da tela e:

| Ordem | Bloco | Funcao |
|---|---|---|
| 1 | Topo de memoria | Estado humano da tela: tratamento organizado ate aqui |
| 2 | Acoes rapidas | Registrar dose, peso ou memoria com minimo atrito |
| 3 | Proxima dose | Mostrar proxima dose apenas quando houver protocolo; senao `A definir` |
| 4 | Peso atual | Dado forte, number-first |
| 5 | Memoria recente | Timeline simples dos registros relevantes |
| 6 | Observacoes | Memoria contextual, sem causalidade |
| 7 | Para a consulta | Itens que o usuario quer lembrar |
| 8 | Custos registrados | Memoria financeira pessoal, exibida somente quando houver custo registrado |
| 9 | Disclaimer | Limite claro: memoria, nao orientacao medica |

Essa ordem e importante: primeiro o usuario entende o estado, depois registra, depois revisa memoria.

---

## 5. Linguagem visual

### 5.1 Fundo

A direcao aprovada usa um graphite escuro proximo de `#0B1017`. Ele e um pouco mais claro e menos duro que preto puro.

Decisao pendente antes da implementacao:

| Opcao | Implicacao |
|---|---|
| Adaptar v7 aos tokens atuais (`#050B12`, `#0E1620`, `#1B2433`) | Menor mudanca no design system atual |
| Promover graphite v7 como ajuste de token | Mais fiel ao Figma Make aprovado |

Nao usar preto puro `#000` nem fundo claro.

### 5.2 Separadores

Separadores finos sao parte central da direcao. Eles substituem a necessidade de cards grandes.

Regra: separar blocos com linhas discretas e espacamento generoso, nao com caixas em tudo.

### 5.3 Cards

Cards existem apenas onde ajudam a interacao:

| Pode usar card | Nao usar card |
|---|---|
| Acoes rapidas | Toda secao da tela |
| Observacao pontual | Timeline inteira como card pesado |
| Estado interativo pequeno | Cards brancos ou muito brilhantes |

A tela nao pode virar uma pilha de cartoes.

### 5.4 Cor

Vital Mint continua raro. Na v7, ele aparece apenas como detalhe no icone da acao principal `Anotar dose`.

Regra: o mint nao deve dominar. Ele sinaliza acao, nao decora a tela.

---

## 6. Tipografia e hierarquia

A hierarquia deve ser feita por tamanho, peso e contraste, nao por enfeite.

| Elemento | Direcao |
|---|---|
| Titulo | Grande, leve, calmo, duas linhas no maximo |
| Labels de secao | Uppercase pequeno, tracking moderado, peso semibold |
| Peso | Numero grande, simples, sem grafico obrigatorio |
| Timeline | Texto curto, legivel, sem jargao |
| Disclaimer | Pequeno, centralizado, discreto mas legivel |

Nao usar fonte serifada. Nao usar display font. A implementacao deve usar system/SF Pro.

---

## 7. Acoes rapidas

As tres acoes aprovadas sao:

| Acao | Papel |
|---|---|
| `Anotar dose` | Registro principal do tratamento |
| `Anotar peso` | Registro de progresso |
| `Adicionar memoria` | Nota livre curta ou lembranca para consulta |

Elas devem ficar logo abaixo do topo. Devem parecer ferramentas nativas, nao cards promocionais.

Direcao visual:

- fundo escuro elevated;
- borda fina;
- icones claros;
- texto curto;
- detalhe mint apenas em `Anotar dose`;
- altura compacta.

Nao usar botoes brancos. Nao usar cards grandes tipo launcher.

---

## 8. Proxima dose

Regra absoluta: DoseDay nao inventa protocolo.

Enquanto o usuario nao informou frequencia:

| Elemento | Copy |
|---|---|
| Label | `Proxima dose` |
| Valor | `A definir` |
| Helper | `Defina seu intervalo para calcular a proxima dose.` |

Nao mostrar data, contagem regressiva, atraso ou aderencia baseado em suposicao.

Quando houver protocolo confirmado, a tela pode mostrar a proxima dose calculada de forma transparente.

---

## 9. Memoria recente

A timeline e o eixo mais importante da tela apos o topo.

Ela deve mostrar fatos curtos:

- dose registrada;
- peso atualizado;
- observacao salva;
- memoria adicionada;
- item para consulta.

Ela nao deve interpretar clinicamente o dado.
Ela tambem nao deve usar meta-registros vagos como "Registro adicionado ao historico". Cada item precisa dizer o que aconteceu.

Exemplo bom:

> Dose de 0.5mg administrada.

> Peso registrado (84.2 kg).

> Anotacao adicionada para a consulta.

Exemplo ruim:

> Dose de 0.5mg causou nausea no dia seguinte.

> Registro adicionado ao historico.

---

## 10. Observacoes e sintomas

Observacoes sao memoria, nao diagnostico.

Copy aprovada:

> Nausea matinal foi salva na sua memoria do tratamento.

Isso e seguro porque apenas espelha o que foi salvo. Nao diz que e esperado, nao diz que foi causado pela dose, nao sugere conduta.

Nao usar:

- "acompanhar nos proximos dias";
- "pos-dose";
- "nas ultimas 24h";
- "efeito esperado";
- "vale procurar medico";
- "alerta";
- qualquer causalidade dose-sintoma.

---

## 11. Para a consulta

Esta secao nao e checklist medico. E memoria do usuario.

Copy segura:

- `Anotar duvidas para a consulta`;
- `Comentar desconforto no estomago`;
- `Exames recentes`;
- `Perguntas que quero lembrar`.

Nao usar:

- `Discutir ajuste de dose`;
- `Pedir prescricao`;
- `Avaliar conduta`;
- `Recomendacao`;
- `Orientacao`.

---

## 12. Custos registrados

Custos sao memoria financeira pessoal.

Label aprovado:

> Custos registrados

Evitar `Investimento`, porque pode soar como justificativa comercial do tratamento.

Custos nao devem entrar automaticamente em material para medico. Eles pertencem ao usuario.

Regra de exibicao na Home: o bloco `Custos registrados` aparece apenas quando o usuario ja registrou pelo menos um custo. Em cold start, nao mostrar um bloco vazio de custos. Isso evita transformar uma memoria opcional em cobranca ou tarefa pendente.

---

## 13. Disclaimer

Disclaimer aprovado:

> Nada aqui e orientacao medica. E uma memoria organizada do seu tratamento.

Ele deve ficar no rodape da tela ou proximo de superficies inteligentes. Deve ser discreto, mas legivel.

---

## 14. Relacao com Free e Pro

Esta direcao visual funciona para Free e Pro, mas a profundidade muda.

| Bloco | Free | Pro |
|---|---|---|
| Acoes rapidas | Sim | Sim |
| Proxima dose | Sim, se protocolo informado | Sim, com memoria contextual |
| Peso | Sim | Sim |
| Memoria recente | Historico basico | Memoria inteligente quando houver dados |
| Observacoes | Espelho factual | Agrupamento factual sem causalidade |
| Para consulta | Lista manual | Preparacao inteligente para consulta |
| Custos | Basico ou gated conforme produto | Completo |

Free nao deve parecer alimentado por IA recorrente. Pro pode transformar dados em memoria inteligente, sempre com guardrails.

---

## 15. O que nao fazer

- Nao transformar a Home em dashboard de metricas.
- Nao voltar para tabs dentro da tela unica.
- Nao adicionar tab bar dentro do scroll. Se houver navegacao, ela pertence ao shell do app ou a outra superficie; dentro da tela unica, usar links contextuais como `Ver historico` quando necessario.
- Nao adicionar check-in diario.
- Nao usar emoji mood tracker.
- Nao usar graficos grandes por padrao.
- Nao usar glass em conteudo.
- Nao usar cards brancos ou muito brilhantes.
- Nao usar tom coach, celebratorio ou motivacional.
- Nao usar linguagem de conduta medica.
- Nao usar trial/estudo/SURPASS/SURMOUNT/STEP.
- Nao assumir frequencia, preco, estoque, efeito, janela biologica ou causalidade.

---

## 16. Como implementar depois da pausa

A implementacao deve ser feita em etapas, nao como substituicao cega da Home.

Sequencia recomendada:

1. Criar plano em `docs/superpowers/plans/`.
2. Mapear Home atual e dependencias de dados.
3. Escolher estrategia de token: adaptar v7 aos tokens atuais ou promover graphite v7.
4. Criar rota/flag experimental para a tela unica.
5. Implementar componentes pequenos:
   - `HomeHeaderMemory`
   - `HomeQuickActions`
   - `NextDoseMemorySection`
   - `WeightMemorySection`
   - `RecentMemoryTimeline`
   - `ObservationMemoryCard`
   - `ConsultationMemorySection`
   - `CostMemorySection`
   - `MedicalDisclaimer`
6. Validar com simulador e screenshots reais.
7. Rodar type-check, lint e `/impeccable critique`.
8. So depois decidir substituicao da Home atual.

---

## 17. Fonte visual

Arquivo exportado do Figma Make:

`/Users/leofrancaia/Downloads/High-Fidelity App Design Directions (1)/src/app/DoseDayHome.tsx`

Esse arquivo deve ser tratado como referencia visual e estrutural, nao como codigo reutilizavel diretamente. Ele e React web com Tailwind; o app real e Expo React Native.
