# 06e — Codex App: complemento Fase 0 após P009=A

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** evidência complementar coletada; sem código; sem Prompt 30  
**Escopo:** empty states P1, Home D1+ após primeira dose, Welcome completo, pendências restantes.

---

## TL;DR

P009 foi decidida por Léo como **A**: remover citações nominais a estudos clínicos do output voltado ao paciente.

Depois disso, Codex App coletou mais evidência real no simulador:

| Área | Resultado |
|---|---|
| Empty states P1 | Doses, Diário e Relatórios capturados na conta `leonardo-fase0@teste.com` |
| Primeira dose | Dose registrada no fluxo real, com prompt de notificações |
| Home D1+ | Home com uma dose aplicada capturada |
| Welcome | Slides 1, 2 e 3 capturados limpos |
| Loading IA real | Continua pendente; exige nova conta, reset controlado ou throttle |
| Console/log persistido | Continua pendente; warnings foram observados, mas ainda faltam logs salvos como artefato |

O principal achado novo é: **a quebra de continuidade da Home não é só D0 vazio. Mesmo depois de registrar a primeira dose, a Home continua mostrando "Insight do dia disponível no Premium" logo após o onboarding ter entregue insight.** Isso reforça ONB-09 como P0 Produto/Continuidade.

---

## Decisões consolidadas desde 06d

| ID | Decisão | Estado |
|---|---|---|
| D014 | Esperar 2 minutos antes de consultar Cowork em tarefas densas | Registrada em `00-protocolo.md` |
| D015 | P009=A: sem `SURMOUNT-1`, `SURMOUNT-3`, `SURPASS` no output do paciente | Registrada em `decisoes.md` |

Observação: D015 é decisão de produto/compliance. **A edge function ainda não deve ser alterada sem prompt/PR específico aprovado por Léo.**

---

## Novas screenshots coletadas

| Arquivo | Tela | Observação objetiva |
|---|---|---|
| `43-doses-empty-fase0-account.png` | Doses vazia | Empty state claro, mas sem CTA primário visível para registrar primeira dose; depende do botão `+` no header |
| `44-diario-empty-fase0-account.png` | Diário vazio | Não é vazio passivo: já oferece chips de registro rápido e check-in |
| `45-relatorios-empty-fase0-account.png` | Relatórios vazio | Mostra peso vazio e doses `0`; valor ainda fraco para primeiro uso |
| `46a-dose-notification-prompt.png` | Prompt de notificações pós-dose | Aparece imediatamente depois da primeira dose registrada |
| `46-doses-after-one-dose-fase0-account.png` | Doses com 1 registro | Histórico e próxima dose aparecem corretamente |
| `47-home-d1-after-one-dose-fase0-account.png` | Home após 1 dose | Próxima dose fica útil, mas o insight Premium continua quebrando continuidade |
| `48-welcome-slide-1-current.png` | Welcome slide 1 | "Sua memória do tratamento." |
| `49-welcome-slide-2-current.png` | Welcome slide 2 | "Pronto pra consulta." |
| `50-welcome-slide-3-current.png` | Welcome slide 3 | "Vamos começar." com CTA `Criar conta` |

Pasta: `assets/screenshots/2026-05-20-fase-0/`

---

## Achados novos ou reforçados

| ID | Severidade | Achado | Evidência |
|---|---|---|---|
| F0-12 | P0 Produto | Home D1+ ainda mostra `Insight do dia disponível no Premium` depois do onboarding e depois da primeira dose. A quebra de promessa permanece mesmo com dado novo. | `47-home-d1-after-one-dose-fase0-account.png` |
| F0-13 | P1 UX | Doses vazia explica o estado, mas não oferece CTA primário evidente para "Registrar primeira dose". O `+` no header é funcional, mas fraco para ativação. | `43-doses-empty-fase0-account.png` |
| F0-14 | P1 Produto | O prompt de notificações aparece logo após a primeira dose. Pode ser correto, mas precisa ser avaliado como timing de ativação: pedir permissão depois de entregar valor, sem parecer interrupção. | `46a-dose-notification-prompt.png` |
| F0-15 | P1 UX | Diário "vazio" já tem ações rápidas. Isso é potencialmente bom, mas precisa decisão explícita: quick-log direto é comportamento intencional ou deveria abrir modal? | `44-diario-empty-fase0-account.png` |
| F0-16 | P1 Craft | Relatórios vazio tem dados corretos, mas baixa sensação de utilidade inicial. Parece painel sem histórico, não convite para criar histórico. | `45-relatorios-empty-fase0-account.png` |
| F0-17 | P1 First Impression | Welcome é sóbrio, mas ainda pouco memorável. Slides 1/2 não têm CTA primário; slide 3 concentra ação. Falta sensação de "preciso desse app" antes do signup. | `48`, `49`, `50` |

---

## Leitura por área

### Doses

O estado vazio é compreensível, mas passivo. A tela explica que a próxima dose aparece depois do primeiro registro, porém não empurra o usuário para esse primeiro registro. Para ativação, o primeiro uso precisa de uma ação óbvia, não só do ícone `+` no topo.

Depois da primeira dose, a tela melhora bastante: aparece próxima dose agendada em 27 de maio e histórico de dose aplicada em 20 de maio. Isso mostra que a mecânica central funciona e que o problema é mais de onboarding/ativação do primeiro registro do que de modelo visual da lista preenchida.

### Home

A Home com uma dose registrada ganha utilidade concreta: `7 dias até sua próxima dose`, Mounjaro 5mg e data da próxima dose. Esse é o tipo de Number-First que deve ser preservado.

O problema é que o card de insight Premium continua na primeira leitura emocional. Isso reforça o diagnóstico: o app entrega um insight no onboarding, mas logo em seguida transforma insight em upsell. Para V5, o primeiro dia precisa parecer continuidade da configuração, não paywall.

### Diário

O Diário não está realmente vazio. Ele oferece chips como `Náusea`, `Dor de cabeça`, `Cansaço` e um check-in. Isso pode ser uma boa decisão de ativação, mas precisa ficar explícito no plano: ou o quick-log direto é intencional e deve ser desenhado como ação rápida, ou é um bug por falta de modal.

### Relatórios

Relatórios em conta nova mostra estrutura, mas pouco valor. Peso vazio e doses `0` estão corretos, porém a tela ainda não explica por que Mariana deveria voltar ali. Em produto de tratamento, relatório precisa prometer utilidade futura: consulta, tendência, histórico ou preparo para médico.

### Welcome

O Welcome atual é limpo e mais sóbrio do que a V4, mas ainda não vende necessidade. Os textos são bons em intenção:

| Slide | Texto | Leitura |
|---|---|---|
| 1 | `Sua memória do tratamento.` | Forte como tese, mas visualmente frio |
| 2 | `Pronto pra consulta.` | Boa promessa prática |
| 3 | `Vamos começar.` | CTA claro, mas só aparece no último slide |

Minha leitura: a direção está correta, mas ainda falta um primeiro impacto visual/produto. O Welcome precisa mostrar mais claramente que DoseDay resolve a ansiedade real do tratamento: lembrar dose, entender semana, levar histórico para consulta.

---

## O que ainda está pendente

| Pendente | Estado | Observação |
|---|---|---|
| Loading IA real | Pendente | A tentativa anterior caiu rápido no resultado. Para capturar de forma confiável, precisa nova conta, reset controlado ou throttle |
| Console/log persistido | Pendente | Warnings `REPLACE (tabs)` e SecureStore foram observados, mas ainda faltam logs salvos como artefato |
| Sensação do Léo por PNG | Pendente | Continua sendo gate de PO: ok / fraco / estranho por tela |

Não recomendo resetar conta, criar nova conta ou mexer em dados remotos sem autorização explícita de Léo, porque isso altera estado real de auth/onboarding.

---

## Recomendação Codex App

1. Cowork pode começar a consolidar `07-auditoria-v2.md` usando `06b`, `06c`, `06d` e `06e`, desde que marque Loading IA e console/log como **evidência pendente**, não como fato fechado.
2. Não escrever Prompt 30 ainda.
3. Próxima conversa estratégica deve ser **First 3 Minutes**:
   - Welcome precisa gerar necessidade antes do signup.
   - Result IA precisa virar ativação curta, não mini-paper.
   - Home D0/D1 precisa continuar a promessa do onboarding, não vender Premium.
   - Doses vazia precisa guiar o primeiro registro.
4. Implementação só depois de auditoria v2 + direção visual aprovada por Léo.

---

## Mensagem curta para chat Cowork

> Codex App criou `docs/interacao-claude-codex/06e-codex-app-complemento-fase0-pos-p009.md`. P009 foi decidida por Léo como A e registrada em D015. Coleta complementar feita: empty states Doses/Diário/Relatórios, prompt de notificações pós-dose, Doses com 1 registro, Home D1+ e Welcome slides 1/2/3. Achado principal novo: Home D1+ ainda mostra insight Premium depois do onboarding e depois da primeira dose, reforçando ONB-09/F0-12 como P0 Produto. Loading IA real e console/log persistido seguem pendentes; se escrever `07-auditoria-v2.md`, marcar esses pontos como evidência pendente.

---

**Fim do 06e.**
