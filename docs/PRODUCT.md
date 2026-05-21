# PRODUCT.md — DoseDay V5

**Versão:** 1.0 (finalizado via `/impeccable teach` — Prompt 02)
**Data:** 15 de maio de 2026
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md`
**Status:** documento-âncora ativo. Toda decisão de produto, design e copy deriva daqui.

> Este documento segue o formato Impeccable. Toda skill do Claude Code que faz design, copy ou UX **lê este arquivo antes de gerar qualquer coisa**.

> Open Questions iniciais foram fechadas via `/impeccable teach` em 2026-05-15. Ver seções `### Voz da IA` e `### Linguagem do relatório bilíngue` para as decisões finais.

---

## Register

**`product`** — design serve a tarefa. App UI, dashboard, ferramenta.

Não somos:
- **brand** (campanha, landing-page, editorial) — em DoseDay, marketing/landing é trabalho separado, não acontece dentro do app
- **wellness app** flutuante e motivacional — somos sério, clínico, calmo

---

## Product Purpose

DoseDay é a **memória inteligente do tratamento entre uma consulta e outra**. Captura como o paciente se sente, quando, e em que dose. Devolve isso como insight para o paciente e relatório bilíngue para a equipe de saúde.

**Sucesso =** paciente prepara a consulta sem esforço; profissional vê 30 dias de tratamento em 2 minutos.

**Posicionamento:** não somos diário de saúde genérico. Somos a lacuna entre consultas de tratamentos com canetas GLP-1 (Mounjaro, Ozempic, Wegovy). O acompanhamento clínico acontece a cada 30-60 dias; o tratamento acontece todo dia. DoseDay preenche essa lacuna.

**Proposta de valor por persona:**
- **Mariana (paciente):** "Chego na consulta sabendo o que aconteceu. Minha médica entende meu tratamento como nunca antes."
- **Profissional de saúde:** "Relatório objetivo, cronológico, sem filtro emocional. Em 2 minutos, vejo o que levaria 20 minutos de anamnese."

---

## Target Users

### Persona primária — Mariana

| Atributo | Detalhe |
|---|---|
| Idade | 38 anos |
| Profissão | Profissional liberal ou CLT, classe B |
| Localização | Capital ou região metropolitana (BR) |
| Família | Casada, 2 filhos pequenos |
| Renda | Permite tratamento de R$1.500-2.500/mês com canetinha |
| Educação | Superior completo |
| Smartphone | iPhone 13+ (iOS atualizado) |
| Tempo livre | Pouco. Dorme pouco. Tempo de tela curto |

**Situação atual no tratamento:**

- Está em tratamento ativo com Mounjaro, Ozempic ou Wegovy
- Tem acompanhamento médico (endocrinologista particular, plano de saúde, ou via Voy)
- Consultas mensais ou bimestrais
- Já tentou várias dietas antes
- Quer perder 15-20 kg
- **Investiu emocional + financeiramente.** Quer ver resultado, quer entender o que está acontecendo

**Dores reais (palavras dela):**

1. "Chego na consulta sem lembrar o que aconteceu no mês. Médica pergunta e eu não sei dizer."
2. "Não sei se essa náusea é normal ou se devo avisar."
3. "Gasto muito dinheiro com isso, mas não tenho como medir se está valendo a pena."
4. "Quero entender o que meu corpo está fazendo, não só registrar peso."
5. "Não tenho paciência pra app que cobra streak ou manda mensagem motivacional toda hora."

**Quando ela usa o app:**

- 1x por dia, à noite (5-10 segundos) — registrar como foi o dia
- 1x por semana — olhar progresso do peso
- 1-2 dias antes da consulta — preparar relatório e dúvidas

**O que ela espera:**

- Anotar rápido. Sem 15 telas.
- Algo organizado pra mostrar à profissional que acompanha
- Sentir que o tratamento está sendo pensado por alguém (não está sozinha)
- Tranquilidade: "isso que estou sentindo é esperado?"

**O que ela odeia:**

- App que culpa: "Você faltou X dias"
- Tom motivacional: "Você consegue!"
- Streak / gamificação visível
- Cancelamento difícil
- Pedir muito dado antes de entregar valor

---

### Persona secundária — João (V5.x, não MVP)

| Atributo | Detalhe |
|---|---|
| Idade | 34 anos |
| Estado | Autônomo / freelancer |
| Médico | Não tem acompanhamento formal |
| Como conseguiu canetinha | Comprou por conta própria (farmácia, internet) |
| Motivação | Quer emagrecer, tem medo de erros |

**Dores reais:**

1. "Não sei se essa náusea é grave"
2. "Não quero ir ao médico ainda (custo, vergonha)"
3. "Quero alguém me dizendo o que esperar"

**No MVP da V5.0:** João não é o foco. Persona ativada como feature-stretch ou na V5.1+.

---

## Brand Personality

**5 adjetivos que descrevem o DoseDay:**

1. **Calmo** — não grita. Não usa urgência falsa. Não cria pânico
2. **Direto** — fala o essencial, sem rodeio
3. **Cuidadoso** — trata o usuário como adulto que merece informação clara
4. **Sério (não chato)** — credibilidade clínica, mas não burocrático
5. **Atento** — devolve insight, antecipa dúvida, lembra com inteligência

**5 adjetivos que o DoseDay NUNCA é:**

1. Motivacional ("Você consegue!", "Vamos lá!")
2. Culposo ("Você faltou", "Não esqueça mais!")
3. Hype ("Transforme sua vida!", "Mudança revolucionária!")
4. Genérico (mensagem que serve pra qualquer app)
5. Defensivo ("Sem achismos", "Sem enrolação")

---

## Anti-references

### Apps que DoseDay NÃO quer parecer

| App | Por que evitamos |
|---|---|
| **Noom** | Coaching motivacional scriptado. Billing opaco. Culpa por streak quebrado |
| **Duolingo** | Gamificação agressiva. Pressão por sequência. Mascote falando |
| **MyFitnessPal** | Genérico fitness. Macros como religião |
| **Strava** | Tribo competitiva. Ranking público |
| **Reflexis / wellness genérico** | Visual roxo-gradiente flutuante. Imagem stock de mulher feliz correndo |

### Visuais que DoseDay NÃO usa

- Mockups 3D flutuantes com cards atravessando a tela (era a V4 antiga — banido)
- Gradiente roxo + rosa (era a V4 — substituído por verde-menta + azul-grafite)
- Glass effect em qualquer área de conteúdo (lista, texto, dado clínico)
- Botão amarelo mostarda destoante da paleta
- Fotos stock de modelos felizes
- Ilustrações cartoonescas tipo "wellness illustration"

### Copy que DoseDay NÃO escreve

| ❌ Nunca | Por quê |
|---|---|
| "Ação necessária — Seu médico precisa de você hoje" | Pressão clínica falsa |
| "Você consegue!" / "Continue assim!" | Coaching motivacional |
| "Você faltou X dias" | Culpa |
| "Sua sequência foi quebrada" | Gamificação fake |
| "Sem achismos" | Defensivo |
| "Memória inteligente do tratamento" (sozinho) | Abstrato, não vende |
| "Sua endo vai amar isso" (em copy genérico) | Assume endocrinologista — exclui nutrólogo, clínico, nutri |
| "Diagnóstico", "prescrição", "recomendação médica" | Compliance ANVISA / Apple Medical |
| "Para emagrecer com saúde" | Compliance — não somos serviço de emagrecimento |

---

## Design Principles

### 1. Sobriedade clínica primeiro
Base sólida, alto contraste, tipografia densa. Beleza onde reforça confiança, não onde decora.

### 2. Glass restrito à navegação
Regra dos 30%: máximo 30% da área visível de uma tela com glass. Glass aplica APENAS em tab bar, toolbars, header de navegação, paywall, splash. **Nunca** em conteúdo (lista, card de dado, texto, gráfico, relatório).

### 3. Cor com propósito
Cor sinaliza estado (positivo, alerta, dado clínico). Nunca decoração.

### 4. Tipografia faz o trabalho pesado
Hierarquia clara. Peso significa importância. SF Pro (alias "system"), nunca fonte custom.

### 5. Texto antes de ícone
Ícone acompanha texto, nunca substitui. Acessibilidade + credibilidade clínica.

### 6. Estados de erro tratam o usuário como adulto
Mensagem clara + por quê + como resolver. Nunca culpa, nunca "Algo deu errado".

### 7. Densidade vem do conteúdo
Espaço respira. Compressão visual quebra confiança em app médico.

### 8. Loop curto, valor longo
Usuário gasta 5-10s por dia no app. Cada interação devolve algo útil (insight, próximo passo, sensação de cuidado).

### 9. Dual-sided sempre
Toda feature respeita 2 leitores: paciente (linguagem clara) + profissional de saúde (visão técnica organizada). Especialmente em relatórios.

### 10. IA com guardrails fixos
Toda saída de IA termina com disclaimer fixo: *"Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde."*

---

## Accessibility & Inclusion

| Critério | Padrão |
|---|---|
| Contraste texto/bg | Mínimo 4.5:1 (WCAG AA). Meta 7:1 (WCAG AAA) onde possível |
| VoiceOver | Todo componente interativo tem `accessibilityLabel` + `accessibilityHint` |
| Dynamic Type | Suporta até `accessibility5` (200%) sem quebrar layout |
| Reduce Motion | Animações sensíveis desativam quando `prefersReducedMotion === true` |
| Cor não-comunicativa | Estado nunca depende SÓ de cor (sintoma intenso = cor + ícone + label) |
| Tamanho de toque | Mínimo 44×44pt (Apple HIG) |
| Foco visível | Estado `pressed` / `focused` claramente distinto do default |
| Idioma | `accessibilityLanguage="pt-BR"` por padrão. EN e ES como opt-in (V5.x) |
| Mobilidade reduzida | Ação principal de cada tela acessível com 1 toque, sem gestos complexos |

**WCAG target:** AA mínimo obrigatório. AAA desejável em texto corrido de relatório e disclaimers de IA.

---

## Voice & Tone

### Tom base (default em toda copy)

| Atributo | Aplicação |
|---|---|
| Tom | Calmo, direto |
| Pessoa | 2ª pessoa do singular (você) |
| Tempo verbal | Presente |
| Formalidade | Coloquial brasileiro mas educado. Não usa gírias |
| Idioma padrão | pt-BR. EN e ES são opt-in (V5.x) |

### Tom em diferentes momentos

| Situação | Tom específico | Exemplo |
|---|---|---|
| **Boas-vindas** | Calmo, sem urgência | "Olá, Leonardo. Como você está hoje?" |
| **Ação primária** | Convidativo, não imperativo | "Anote como foi seu dia" (não "REGISTRE AGORA!") |
| **Sucesso** | Afirmativo, breve | "Registrado." / "Pronto." |
| **Erro técnico** | Honesto, não culposo | "Não consegui salvar. Sem internet?" |
| **Alerta clínico real** | Sério, com ação clara | "Esse sintoma está acima do esperado. Vale conversar com seu médico." |
| **Paywall** | Transparente, sem dark pattern | "Premium é onde a IA trabalha pra você." |
| **Empty state** | Convite, não pressão | "Sua primeira dose ainda não foi anotada." |
| **Insight IA** | Informativo, com disclaimer | "Você está na semana 3 do Mounjaro 2.5mg. 70% das pessoas relatam pico de náusea agora. *Isso é uma anotação inteligente, não orientação médica.*" |

### Voice & Tone matrix (resumo)

| Situação | Pode | Não pode |
|---|---|---|
| Erro | Honesto, com solução | Genérico ("algo deu errado"), culposo |
| Alerta | Claro, com causa e ação | Alarmista, dramático |
| Sucesso | Afirmativo, curto | Celebratório exagerado, com emoji em sequência |
| Loading | Informativo, contextual | "Loading...", genérico |
| Confirmação destrutiva | Explicita consequência | "Tem certeza?" sem mais contexto |

### Voz da IA

Decisões finais fechadas via `/impeccable teach` em 2026-05-15:

**Q1 — A IA tem nome próprio?**
Não. A IA não tem nome próprio. Fala como o produto ("DoseDay") ou de forma impessoal, sem sujeito explícito. Evita criar persona-AI que compete com a marca ou soa Noom-like.

| ✅ Correto | ❌ Incorreto |
|---|---|
| "Você está na semana 3 do Mounjaro 2.5mg." | "Assistente: Olá! Vou te ajudar hoje." |
| "DoseDay identificou padrão nos seus registros." | "Dora notou que você teve náusea." |
| "Padrão detectado: náusea nas 24h pós-dose." | "Eu observei seu histórico." |

**Q2 — Como a IA se refere a si mesma?**
Impessoal ou coletivo. Sem primeira pessoa ("Eu observei"). Sem terceira explícita ("A IA detectou"). O insight é do produto, não de uma entidade separada.

| ✅ Correto | ❌ Incorreto |
|---|---|
| "Padrão detectado: náusea apareceu nas 24h após cada dose nas últimas 3 semanas." | "Eu observei que você teve náusea." |
| "70% das pessoas nessa fase do Ozempic relatam isso." | "A IA do DoseDay detectou padrão de náusea pós-dose." |
| "Você está na semana 3. O que esperar agora:" | "Com base na minha análise, você pode esperar:" |

**Q3 — Tom muda no modo autônomo (persona João, V5.x)?**
Tom não muda fundamentalmente (calmo, direto, cuidadoso, sério). Para João, adiciona **camada didática**: mais contexto sobre o que é esperado nessa fase, antecipação de efeitos comuns, convite explícito a procurar profissional se sintoma escale. João é adulto — recebe informação clara, não coaching motivacional.

| Contexto | Tom Mariana | Tom João (V5.x) |
|---|---|---|
| Náusea pós-dose | "70% das pessoas relatam isso nessa fase." | "70% das pessoas relatam isso nessa fase. Se a intensidade for acima de 7/10 ou persistir mais de 48h, vale buscar orientação médica." |
| Alerta de dose | "Sua próxima dose é amanhã." | "Sua próxima dose é amanhã. Dica pra reduzir náusea: aplicar após refeição leve." |

**Q4 — Push notifications: qual voz?**
Segunda pessoa, sem sujeito. Factual, convidativo, nunca cobrança. Push é momento delicado — usuário não pediu pra ouvir uma "voz". Imperativo seco ("Registre!") é cobrança. Primeira pessoa ("Eu lembrei") é invasivo.

| ✅ Correto | ❌ Incorreto |
|---|---|
| "Hora da sua dose semanal." | "Eu lembrei: hora da dose!" |
| "Como você está hoje?" | "Não esqueça de registrar sua dose." |
| "Sua próxima dose é amanhã." | "REGISTRE SUA DOSE AGORA" |
| "Relatório pronto para sua consulta." | "Você ainda não gerou seu relatório." |

---

## Vocabulário-âncora

### Palavras que SEMPRE usamos

| Termo | Onde |
|---|---|
| **memória do tratamento** | Posicionamento interno |
| **registro / anotar** | Ação central do app |
| **relatório** | Output IA |
| **consulta / consultório** | Evento âncora |
| **canetinha / caneta emagrecedora** | Termo coloquial BR |
| **quem te acompanha** | Referência neutra ao profissional |
| **seu médico ou nutricionista** | Quando precisa nomear o papel |
| **profissional de saúde** | Em disclaimer formal |

### Palavras que NUNCA usamos

| Termo | Por quê | Substituir por |
|---|---|---|
| **diagnóstico** | Compliance Apple Medical / CFM | "anotação", "registro" |
| **prescrição** | Idem | "lembrete de dose" |
| **recomendação médica** | Idem | "sugestão da IA" |
| **registro médico / prontuário** | Idem | "diário do tratamento", "relatório" |
| **endo (em copy genérico)** | Exclui nutrólogo, clínico, nutricionista | "quem te acompanha", "seu médico ou nutricionista" |
| **"sua endo"** (sem confirmação prévia do papel) | Idem | "seu médico", "sua equipe", "no consultório" |
| **emagrecer / perder peso** (em marketing oficial) | Compliance — não somos serviço de emagrecimento | "tratamento", "evolução" |
| **streak / sequência** | Anti-padrão (gamificação) | Apenas "registrado X dias" sem pressão |
| **revolucionário / transformador** | Hype | (omitir) |

### Linguagem do relatório bilíngue

Decisão final fechada via `/impeccable teach` em 2026-05-15:

O relatório (Movimento 3) é **híbrido**: duas seções distintas no mesmo documento.

| Seção | Público | Tom | Exemplo de frase |
|---|---|---|---|
| **Seção paciente** | Mariana (e João em V5.x) | Linguagem clara, coloquial | "Você aplicou Mounjaro 2.5mg em 4 domingos seguidos. Náusea apareceu nas 24h depois em 3 desses dias, intensidade média 5/10." |
| **Seção profissional** | Endocrinologista, nutrólogo, clínico geral, nutricionista | Clínica generalista — legível por qualquer profissional habilitado | "Registro de adesão ao tratamento: 4 aplicações de semaglutida 2.5mg no período. Registro de eventos adversos: náusea grau leve-moderado em 3 de 4 ciclos pós-dose." |

**Termos OK na seção profissional:**
- "adesão ao tratamento" / "aderência terapêutica"
- "registro de eventos adversos"
- "cronologia de doses e sintomas"
- "tolerabilidade"
- "titulação de dose"
- "período de observação"

**Termos a evitar (jargão de subespecialidade que exclui generalistas):**
- ❌ "farmacocinética" / "farmacodinâmica"
- ❌ "comorbidades metabólicas"
- ❌ "perfil farmacodinâmico"
- ❌ "iatrogenia"
- ❌ "biomarcadores de resposta"

---

## Decisões de copy fixadas

### Posicionamento âncora (uma frase)

> **"Tudo que você sente entre uma consulta e outra. Anotado."**

### Sub-claims aprovados

- "Vai mudar como você prepara a consulta."
- "Um toque por dia. A IA cuida do resto."
- "Tudo registrado. Tudo no relatório."
- "Para quem investe pesado e quer ver resultado."
- "Seu tratamento, em palavras que vocês entendem no consultório."

### App Store

**Nome:** DoseDay
**Subtitle:** "Tudo entre uma consulta e outra"
**Promotional Text:** "Anote como está sendo o tratamento. A IA organiza tudo num relatório claro pra levar na próxima consulta. Pra você não esquecer mais nada."

---

## Disclaimer fixo da IA

> *Isso é uma anotação inteligente, não orientação médica. Sempre fale com um profissional de saúde.*

Aparece no rodapé de TODO output gerado por IA:
- Insight do Dia (Movimento 1)
- Memória de Perguntas (Movimento 2)
- Relatório Bilíngue (Movimento 3)
- Antecipação de efeitos (V5.1)
- Tradutor da consulta (V5.1)

---

## Guardrails de compliance

### Apple App Store

| Guideline | Como respeitamos |
|---|---|
| 1.4.1 (Medical) | Posicionar em **Health & Fitness**, não Medical. Usar "diário", "registro", "anotações" — nunca "prontuário" |
| 1.4.2 (drug dosage) | Não sugerir alteração de dose, nunca. Apenas registrar o que o usuário aplicou |
| 5.1.1 (privacy) | Política de Privacidade clara em getdoseday.com/privacy. Consent explícito |
| 3.1.1 (in-app purchase) | Trial 14d transparente. Cancel anytime claro |

### LGPD (Brasil)

| Artigo | Como respeitamos |
|---|---|
| Art. 5 (dado pessoal sensível) | GLP-1 + peso + sintoma = sensível |
| Art. 11 (consent específico) | Tela `consent.tsx` no onboarding com consent explícito Art. 11 |
| Art. 6 (princípios) | Necessidade, transparência, segurança, prevenção, não discriminação |
| Art. 18 (direitos) | Tela "Meus Dados" → export JSON. Edge Function `delete-my-data` |
| Art. 41 (DPO) | E-mail `dpo@getdoseday.com` registrado em Política |
| Art. 46 (log de acesso) | Tabela `audit_logs` registra toda leitura de PHI fora do dono |

### CFM (Conselho Federal de Medicina)

- Não somos serviço médico
- Não substituímos consulta
- Não emitimos parecer médico
- Em toda comunicação, posicionar como **memória / diário do paciente**

---

## Princípios anti-pirraça do produto

1. **Promessa cumprível.** Nunca prometemos o que não entregamos. "1 toque por dia" tem que ser literal
2. **Tempo respeitado.** Cada interação economiza tempo do usuário, não consome
3. **Trust signals em momentos certos.** Paywall transparente, cancelamento fácil, disclaimer IA visível
4. **Antes do paywall, valor.** Primeiro insight de IA acontece ANTES do cadastro
5. **Persona Mariana é o filtro.** Toda decisão de UX, copy ou IA passa pelo teste: "isso faz sentido pra Mariana num dia corrido?"

---

## Onboarding como ativo de captação

O onboarding do DoseDay **não é fluxo administrativo de coleta de dados** — é o primeiro produto que o user experimenta. Estratégia validada por monitoramento de apps do segmento (Noom, Cal AI, Calm) e formalizada nesta seção.

### Lógica do funil

| Etapa | O que acontece | Por que importa |
|---|---|---|
| Telas 1-12 | Captura progressiva (perfil + peso + tratamento + medicamento + dose + consent) | Investimento gradual — cada step preenchido aumenta custo psicológico de abandonar |
| **Tela 13 — loading IA** | IA processa os dados em tempo real e mostra que está organizando o tratamento. 5 etapas visuais com check + animação central. Mínimo 5s, máximo 15s | **Gatilho de valor.** Cria percepção "o app já fez algo por mim" antes de pedir qualquer coisa |
| Tela 14 — result | Mostra 3-4 insights personalizados gerados pela IA com dados reais do user | Prova entrega — não é coaching genérico |
| Paywall (V5.1+) | Aparece depois do result com trial 14d transparente | User chega aquecido, com prova de valor recente |

### Regras dessa estratégia

**O que pode (não é dark pattern):**
- IA processar dados REAIS do user durante loading (não é placebo)
- Mostrar etapas com timing deliberado (5s mínimo) — sinaliza esforço computacional
- Animação visual no centro da tela durante processamento (Vital Mint exclusivo, regra única na tela)
- Result mostrar insights únicos do user (semana atual do tratamento, dose, padrões esperados)

**O que NÃO pode (vira dark pattern):**
- ❌ Loading falso — animação rodando sem nada acontecendo no backend
- ❌ Insights genéricos disfarçados de personalizados ("Você é incrível!")
- ❌ Timing >15s sem fallback — frustra
- ❌ Skip permitido só após assinatura — bloqueio coercitivo
- ❌ Loading antes de captação de dados — sem dados, não há o que processar (pré-paywall sim, pré-onboarding não)
- ❌ Ignorar `prefersReducedMotion` na animação

### Voice & Tone específico do onboarding

Mantém os 5 adjetivos da seção Brand Personality (calmo, direto, cuidadoso, sério, atento) com **camada extra de presença**: cada step reconhece que o user está investindo tempo.

| Situação | Copy correto | Copy errado |
|---|---|---|
| Welcome | "Vamos organizar seu tratamento." | "Bem-vindo ao DoseDay! 🎉" (entusiasmo falso) |
| Pergunta sensível (peso) | "Esse dado fica só com você. Vamos usar pra acompanhar a evolução." | "Não se preocupe, é confidencial." (defensivo) |
| Loading | "Estamos organizando seu tratamento." | "Por favor aguarde..." (genérico) |
| Result | "Bem-vindo, Mariana. Aqui está o que sabemos do seu tratamento até agora." | "Parabéns! Você completou o onboarding! 🎉" (gamificação) |

### Métricas de sucesso do onboarding

| Métrica | Target | Por quê |
|---|---|---|
| Conclusão telas 1-7 | ≥85% | Captura dados básicos. Drop acima de 15% indica fricção excessiva |
| Conclusão telas 8-12 | ≥75% | Doctor-name e concerns são opcionais — drop esperado |
| Conclusão loading IA | ≥95% | Se cair aqui, IA falhou ou animação travou |
| Conclusão result + abertura do app | ≥90% | Result tem que entregar valor convincente |
| D7 retenção (V4: 6%) | ≥25% | North star da V5 |

### Skills aplicáveis ao onboarding

| Skill | Onde aplica |
|---|---|
| `design:ux-copy` | Refinar copy de cada step preservando Voice & Tone |
| `ios-liquid-glass-expo` | Confirmar zero glass em conteúdo (apenas tab bar e header de navegação fora do onboarding) |
| `mobile-product-critic` | Critique multi-perspectiva pré-merge dos PRs 24b/24c |
| `/impeccable craft` | UI das telas |
| `/impeccable harden` | Edge cases (IA timeout, consent rejected, network offline) |
| `go-to-market-architect` | V5.1 — refinar funil pós-result com paywall otimizado |
| `appstore-creative-designer` | V5.1 — usar telas do onboarding como screenshots da App Store

---

## Como esta PRODUCT.md é usada

Cada skill do Claude Code lê este arquivo antes de gerar saída:

| Skill | O que extrai daqui |
|---|---|
| `/impeccable craft` (criar tela) | Tom, anti-references visuais, design principles |
| `/impeccable critique` (review) | Persona Mariana pra fazer "persona test" |
| `/impeccable clarify` (rewrite copy) | Voice & tone, vocabulário-âncora |
| `/impeccable onboard` (onboarding/empty) | Tom convite, anti-pressão |
| `/impeccable harden` (edge cases) | Tom honesto em erro |
| `grill-with-docs` | Vocabulário-âncora, anti-references |
| `claude-api` (Edge Function IA) | Disclaimer fixo, guardrails clínicos, voz da IA |
| `app-store-optimization` | Decisões de copy fixadas, sub-claims |

---

**Fim do PRODUCT.md v1.0.**
