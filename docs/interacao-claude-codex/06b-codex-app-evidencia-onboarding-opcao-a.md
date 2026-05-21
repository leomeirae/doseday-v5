# 06b — Codex App: evidência onboarding com Opção A

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** evidência real coletada; ainda sem Prompt 30  
**Escopo:** captura visual e achados de UX/UI. Sem código. Sem `DESIGN.md`.

---

## TL;DR

Léo aprovou a **Opção A**. Criei a conta permanente de captura pelo fluxo real do app, completei o onboarding e capturei a Home pós-onboarding.

Resultado: o onboarding funciona ponta a ponta, mas a evidência confirma problemas fortes de craft e experiência nos primeiros 3 minutos. Os bloqueios principais são: sobreposição no step de dados pessoais, warning de navegação `REPLACE (tabs)`, warning de SecureStore, loading não observável e tela final com insight longo demais, com CTA fixo cobrindo conteúdo.

Não recomendo escrever Prompt 30 ainda. Recomendo fechar os itens pendentes de evidência e transformar esta coleta em base da `07-auditoria-v2.md`.

---

## Ambiente

| Item | Valor |
|---|---|
| Simulador | iPhone 17 |
| UDID | `4D34A3D9-0404-4C20-A144-CA98E6F03F2F` |
| iOS | 26.5 |
| App | `com.doseday.premium` |
| Conta criada | `leonardo-fase0@teste.com` |
| Nome usado | `Leonardo Fase 0` |
| Senha usada | `12345678` |
| Observação senha | Plano previa `123456`, mas o signup exige mínimo de 8 caracteres |
| Pasta screenshots | `assets/screenshots/2026-05-20-fase-0/` |

---

## Screenshots coletados nesta etapa

| Arquivo | Tela | Observação objetiva |
|---|---|---|
| `27-auth-signup-filled.png` | Sign up preenchido | Conta nova pronta para criação |
| `28-onboarding-01-intro.png` | Onboarding intro | Tela inicial do fluxo |
| `29-onboarding-02-personal-info-empty.png` | Dados pessoais vazio | Layout mostra risco de sobreposição entre última opção e CTA |
| `30-onboarding-03-weight-empty.png` | Peso vazio | Campos inicial, atual e altura |
| `31-onboarding-04-goal-weight-empty.png` | Meta de peso vazio | Campo único de meta |
| `32-onboarding-05-treatment-status.png` | Status tratamento | Escolhido `Em tratamento` |
| `33-onboarding-06-treatment-duration.png` | Duração tratamento | Escolhido `1 a 3 meses` |
| `34-onboarding-07-medication.png` | Medicamento | Escolhido `Mounjaro` |
| `35-onboarding-08-dose.png` | Dose | Escolhido `5 mg` |
| `36-onboarding-09-doctor-name.png` | Nome do profissional | Pulado |
| `37-onboarding-10-medical-support.png` | Acompanhamento médico | Escolhido `Sim, regularmente` |
| `38-onboarding-11-concerns.png` | Preocupações | Escolhido `Náusea` e `Efeitos colaterais` |
| `39-onboarding-12-consent.png` | Consentimento LGPD | Consentimento aceito no fluxo aprovado |
| `40-onboarding-14-result.png` | Resultado IA | Insight final muito longo, CTA fixo sobre conteúdo |
| `40a-onboarding-13-loading-attempt.png` | Tentativa de loading | Não capturou loading; caiu novamente no resultado |
| `41-onboarding-14-result-scrolled.png` | Resultado IA rolado | Confirma conteúdo escondido/competindo com CTA fixo |
| `42-home-after-onboarding-fase0-account.png` | Home pós-onboarding | Conta nova entra em Home sem doses, insight Premium bloqueado |

---

## Fluxo preenchido

| Step | Valor usado |
|---|---|
| Nome | `Leonardo Fase 0` |
| Idade | `35` |
| Sexo | `Masculino` |
| Peso inicial | `94 kg` |
| Peso atual | `88 kg` |
| Altura | `178 cm` |
| Meta de peso | `78 kg` |
| Status | Em tratamento |
| Duração | 1 a 3 meses |
| Medicamento | Mounjaro |
| Dose | 5 mg |
| Médico/profissional | Pulado |
| Acompanhamento | Sim, regularmente |
| Preocupações | Náusea; efeitos colaterais |
| Consentimento | Aceito |

---

## Achados principais

| ID | Severidade | Achado | Evidência |
|---|---|---|---|
| ONB-01 | P1 | Signup exige senha mínima de 8 caracteres, mas o plano de captura previa `123456`. Ajustei para `12345678`. | `27-auth-signup-filled.png` |
| ONB-02 | P0/P1 | Após signup/onboarding apareceu warning: `REPLACE` para `(tabs)` não foi tratado por nenhum navigator. Pode indicar rota errada ou fluxo instável de navegação. | Console durante fluxo |
| ONB-03 | P1 técnico | Apareceu warning de SecureStore: valor maior que 2048 bytes. Isso pode afetar robustez de sessão/auth. | Console durante fluxo |
| ONB-04 | P0/P1 UX | No step de dados pessoais, a opção `Prefiro não dizer` fica praticamente no mesmo eixo vertical do CTA fixo. Há sobreposição/competição em iPhone 17. | `29-onboarding-02-personal-info-empty.png` + hierarchy |
| ONB-05 | P1 | Loading de IA não foi capturado: o fluxo chegou ao resultado rápido demais ou o deep link voltou para step anterior. O estado de loading ainda precisa reprodução controlada. | `40a-onboarding-13-loading-attempt.png` |
| ONB-06 | P0 UX/copy | Resultado IA gera texto longo demais para primeiro uso. O usuário acabou de terminar onboarding e recebe uma leitura densa, com baixa escaneabilidade. | `40-onboarding-14-result.png` |
| ONB-07 | P0 layout | CTA fixo `Começar a usar` cobre ou compete com conteúdo do resultado, especialmente ao rolar. | `40-onboarding-14-result.png`, `41-onboarding-14-result-scrolled.png` |
| ONB-08 | P1 clínico/legal | Insight final cita estudos e faz afirmações clínicas. Precisa revisão de copy/compliance antes de virar promessa pública. | `40-onboarding-14-result.png` |
| ONB-09 | P1 produto | Home pós-onboarding mostra `Insight do dia disponível no Premium`, enquanto o onboarding acabou de gerar um insight. Há possível quebra de continuidade de valor. | `42-home-after-onboarding-fase0-account.png` |

---

## Leitura UX

O onboarding já está estruturalmente mais forte que a versão atual da App Store, porque coleta dados relevantes e entrega um resultado. O problema é que a experiência ainda parece uma sequência funcional de formulários, não uma entrada memorável na "memória do tratamento".

O ponto mais grave é a tela final. Ela deveria converter esforço em clareza: "agora o DoseDay entendeu seu tratamento". Hoje ela entrega texto demais, sem hierarquia suficiente, e o CTA fixo disputa espaço com o próprio valor gerado.

Para a V5, eu trataria a tela final como uma tela de ativação, não como relatório. O relatório pode ser denso depois. O primeiro resultado precisa ser curto, escaneável, com 1 frase de reconhecimento, 2 ou 3 dados-chave e o próximo passo.

---

## O que ainda falta para fechar Fase 0

| Pendente | Motivo |
|---|---|
| Welcome slides 2/3 | Ainda precisamos ver se o carousel inteiro confirma ou suaviza o problema do slide 1 |
| Loading IA real | Não foi capturado de forma confiável nesta execução |
| Home D1+ após dose controlada | Ainda falta ver a Home com primeiro registro real na conta nova |
| Estados vazios P1 restantes | Doses, Diário e Relatórios em conta nova podem revelar empty states diferentes dos dados legados |
| Sensação do Léo por PNG | Gating de PO: ok / fraco / estranho por tela |

---

## Recomendação para Cowork

1. Não escrever Prompt 30 ainda.
2. Usar este arquivo como entrada da futura `07-auditoria-v2.md`.
3. Separar achados em duas trilhas:
   - **Correções obrigatórias antes do redesign:** navegação, SecureStore, sobreposição, CTA cobrindo conteúdo.
   - **Direção de UX/UI:** resultado IA curto, ativação mais clara, continuidade entre onboarding e Home.
4. Quando a Fase 0 fechar, consolidar uma auditoria factual por screenshot, sem inventar tela que não foi capturada.

---

## Mensagem curta para chat Cowork

> Codex App criou `docs/interacao-claude-codex/06b-codex-app-evidencia-onboarding-opcao-a.md`. Léo aprovou Opção A. Conta `leonardo-fase0@teste.com` criada pelo app; usei senha `12345678` porque signup exige 8 caracteres. Onboarding capturado em `27` a `42`; loading não capturado. Achados principais: `REPLACE (tabs)`, SecureStore >2048, sobreposição no step 2, resultado IA longo e CTA fixo competindo com conteúdo. Não escrever Prompt 30 ainda.

---

**Fim do 06b-codex-app-evidencia-onboarding-opcao-a.md.**
