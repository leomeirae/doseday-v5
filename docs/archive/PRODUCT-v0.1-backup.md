# PRODUCT.md — DoseDay V5

**Versão:** 0.1 (rascunho — será refinado pelo `/impeccable teach` no Prompt 02)
**Data:** 14 de maio de 2026
**Local canônico:** `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md`
**Status:** documento-âncora. Toda decisão de produto, design e copy deriva daqui.

> Este documento segue o formato Impeccable. Toda skill do Claude Code que faz design, copy ou UX **lê este arquivo antes de gerar qualquer coisa**.

---

## Register

**`product`** — design serve a tarefa. App UI, dashboard, ferramenta.

Não somos:
- **brand** (campanha, landing-page, editorial) — em DoseDay, marketing/landing é trabalho separado, não acontece dentro do app
- **wellness app** flutuante e motivacional — somos sério, clínico, calmo

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

## Como esta `PRODUCT.md` é usada

Cada skill do Claude Code lê este arquivo antes de gerar saída:

| Skill | O que extrai daqui |
|---|---|
| `/impeccable craft` (criar tela) | Tom, anti-references visuais, design principles |
| `/impeccable critique` (review) | Persona Mariana pra fazer "persona test" |
| `/impeccable clarify` (rewrite copy) | Voice & tone, vocabulário-âncora |
| `/impeccable onboard` (onboarding/empty) | Tom convite, anti-pressão |
| `/impeccable harden` (edge cases) | Tom honesto em erro |
| `grill-with-docs` | Vocabulário-âncora, anti-references |
| `claude-api` (Edge Function IA) | Disclaimer fixo, guardrails clínicos |
| `app-store-optimization` | Decisões de copy fixadas, sub-claims |

---

## Open Questions (a confirmar no Prompt 02 ou conforme aparecer)

| # | Pergunta | Quando resolver |
|---|---|---|
| 1 | Voz da IA tem nome? ("Assistente"? "DoseDay"? Sem nome?) | Antes de implementar Movimento 1 |
| 2 | Como referenciar a própria IA? ("Eu observei...", "A IA observou...", impessoal?) | Antes de implementar Movimento 1 |
| 3 | Em modo "autônomo" (V5.x persona João), tom muda? | Quando ativarmos João |
| 4 | Comunicação por push: usa primeira pessoa? | Ao implementar push notification |
| 5 | Linguagem clínica do relatório (versão médica): qual nível técnico? | Ao implementar Movimento 3 |

---

**Fim do PRODUCT.md (rascunho v0.1).**
