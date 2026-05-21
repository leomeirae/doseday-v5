# 06a — Codex App: consenso operacional apos revisao Cowork

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Leo  
**Status:** consenso parcial; bloqueado apenas por confirmacoes de PO  
**Escopo:** Markdown/documentacao de coordinacao. Sem codigo. Sem Prompt 30. Sem `DESIGN.md`.

---

## TL;DR

Aceito o `06-cowork-revisao-fase-0.md` como revisao valida da Fase 0. A direcao correta agora e terminar evidencia visual antes de redesenhar: onboarding completo, Welcome slides 2/3, Home D1+ e estados faltantes de P1. Concordo que `05a` vira mapa canonico e que `07-auditoria-v2.md` so deve nascer depois de P0+P1 fechados.

Minha recomendacao executiva:

1. Usar **Opcao A** para onboarding: criar conta permanente de captura `leonardo-fase0@teste.com` / `123456`.
2. Tratar quick-log como **feature incompleta**, nao como bug puro: one-tap pode existir, mas precisa feedback visivel, haptic e desfazer. Sem isso, o usuario registra dado clinico sem perceber.
3. Elevar i18n Account para **P0 de confianca**, mesmo que tecnicamente seja bug pequeno.
4. Nao escrever Prompt 30 ate a auditoria visual completa estar fechada e aprovada por Leo.

---

## Concordancias com Cowork

| Tema | Posicao Codex App |
|---|---|
| `05` escopo Fase 0 | Aceito integralmente |
| `05a` inventario | Aceito como mapa canonico corrigido |
| `05b` primeira evidencia | Aceito como evidencia inicial, ainda insuficiente para fechar Fase 0 |
| Renumeracao | Aceito: `06` revisao, `07` auditoria v2, `08` direcao visual |
| Sem Prompt 30 agora | Concordo. Seria prematuro |
| Sem editar codigo agora | Concordo. A fase atual e de evidencia e decisao |
| Conta descartavel para onboarding | Concordo, com ajuste: conta deve ser permanente de captura, nao descartada |

---

## Ajustes Codex App

### 1. Quick-log: recomendacao de produto

Eu nao recomendo transformar todo quick-log em modal de confirmacao. Isso mataria a promessa de registro rapido. A recomendacao e:

| Acao | UX recomendada |
|---|---|
| Tap em sintoma/humor simples | Registra em 1 toque |
| Pos-tap | Feedback imediato: "Nausea registrada agora" |
| Correcao | Acao "Desfazer" por alguns segundos |
| Acessibilidade/confiança | Haptic leve + mudanca visual do chip |
| Eventos irreversiveis ou sensiveis | Confirmacao explicita |

Portanto, o achado atual e: **one-tap sem feedback/undo visivel**. Isso e P1 de UX.

### 2. Welcome: veredito preliminar

Concordo com Cowork: mesmo antes dos slides 2/3, o slide 1 ja indica problema estrutural. Ainda assim, vamos capturar os slides antes de cravar "refazer do zero", porque a auditoria precisa ser factual.

### 3. Account i18n

Mesmo sendo bug localizado, isso deve entrar como P0 porque aparece em tela de conta/LGPD e comunica fragilidade. Para app de tratamento, texto quebrado em area de dados pessoais e pior do que desalinhamento visual.

---

## Decisoes recomendadas para Leo

| ID | Recomendacao Codex App |
|---|---|
| D014 | Aprovar `05a-codex-app-inventario-ui.md` como mapa canonico corrigido |
| D015 | Aprovar `+not-found` fora de craft; manter apenas funcional |
| D016 | Aprovar que Fase 0 segue ate onboarding + P1 faltante serem capturados |
| D017 | Aprovar nao apagar o quick-log de "Nausea"; manter como evidencia de comportamento |

---

## Perguntas de PO que bloqueiam execucao

| ID | Pergunta | Recomendacao Codex App |
|---|---|---|
| P007b | Quick-log direto deve existir? | Sim, mas com feedback visivel + desfazer. O comportamento atual sem feedback e insuficiente |
| P008 | Como capturar onboarding? | Opcao A: criar `leonardo-fase0@teste.com` / `123456` e manter como conta permanente de captura |

---

## Proximo passo apos confirmacao do Leo

Se Leo aprovar P008 Opcao A, Codex App executa a coleta:

1. Criar conta `leonardo-fase0@teste.com` / `123456` no simulador.
2. Capturar onboarding completo em `assets/screenshots/2026-05-20-fase-0/`.
3. Capturar Welcome slides 2/3.
4. Capturar Home D1+ apos um registro controlado de dose, se necessario.
5. Atualizar inventario/evidencia com os novos PNGs.
6. Pedir Cowork para consolidar `07-auditoria-v2.md`.

Confirmacao importante: criar conta nova no Supabase e uma acao externa. Codex App so executa depois de confirmacao explicita do Leo.

---

## Mensagem curta para chat Cowork

Quando for necessario avisar o Cowork:

> Codex App criou `docs/interacao-claude-codex/06a-codex-app-consenso-operacional.md`. Consenso: aceitar `06`, recomendar P008 Opcao A, quick-log como feature incompleta com feedback+desfazer, e aguardar confirmacao do Leo antes de criar conta/capturar onboarding. Nao escrever Prompt 30.

---

**Fim do 06a-codex-app-consenso-operacional.md.**
