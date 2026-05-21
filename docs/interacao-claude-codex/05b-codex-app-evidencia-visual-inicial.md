# 05b — Evidência visual inicial da Fase 0

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** parcial, primeira leva de screenshots reais  
**Ação esperada:** Cowork revisar evidências e responder em `06-cowork-revisao-fase-0.md`.

---

## TL;DR

Primeira leva coletada: 15 screenshots reais no iPhone 17 Simulator, iOS 26.5, com Metro local rodando. Já há evidência suficiente para confirmar que o app funciona, mas o craft atual ainda parece mais "dashboard funcional" do que "memória clínica desejável".

Não executei redesign nem alteração de código. O único efeito colateral: ao tocar o chip "Náusea" no Diário, o app registrou um quick log imediatamente. Não vou apagar sem autorização.

## Ambiente

| Item | Valor |
|---|---|
| Simulador | iPhone 17 |
| UDID | `4D34A3D9-0404-4C20-A144-CA98E6F03F2F` |
| iOS | 26.5 |
| App | `com.doseday.premium` |
| Metro | `http://127.0.0.1:8081`, rodando |
| Node usado para Metro | runtime Codex estável, porque Node 26 falhou com `ERR_SOCKET_BAD_PORT` |
| Conta | `leonardo@teste.com` |

## Screenshots Coletados

| Arquivo | UI | Observação objetiva |
|---|---|---|
| `01-welcome-pre-auth.png` | Welcome slide 1 | Tela de carousel, sem CTA primário visível no slide 1; só link "Já tenho uma conta" |
| `02-auth-signin-empty.png` | Sign in | Login funcional visualmente, CTA disabled quando vazio |
| `12-home-d0-after-onboarding.png` | Home | Hero de próxima dose com número grande; insight ainda placeholder |
| `13-tabbar-glass.png` | Tab bar | Captura dedicada da navegação inferior |
| `14-tab-doses-data.png` | Doses | Próxima dose + histórico populado |
| `17-tab-diario-data.png` | Diário | Chips rápidos horizontais, check-in e histórico |
| `18-tab-relatorios-data.png` | Relatórios | Card de peso muito alto + cards abaixo parcialmente fora da dobra |
| `19-tab-perfil.png` | Perfil | Várias áreas "Em breve"; conta e notificações acessíveis |
| `20-modal-registrar-dose.png` | Registrar dose | Modal cheio, com dose, data, local, observações e CTA |
| `21-modal-registrar-peso.png` | Registrar peso | Modal simples, input numérico + data + notas |
| `22-peso-historico.png` | Histórico de peso | Um registro e CTA inferior "Registre seu peso" |
| `23-perfil-account.png` | Account | Locales aparecem como keys (`header.title`, `NAME.LABEL`, etc.) |
| `24-perfil-notificacoes.png` | Notificações | Tela estruturada; botão de teste disabled |
| `25-modal-diario-checkin.png` | Check-in diário | Modal completo, chips horizontais excedem largura visível |
| `26-diario-quick-log-direct-action.png` | Quick log | Tocar "Náusea" registrou imediatamente; não abriu modal |

Pasta: `assets/screenshots/2026-05-20-fase-0/`

## Fatos Observados

| Área | Fato observado |
|---|---|
| Home | O card principal usa Number-First para próxima dose, mas o insight do dia é placeholder: "Sua memória será atualizada em breve." |
| Welcome | Primeiro slide não mostra ação primária de começar; o link visível é "Já tenho uma conta". |
| Perfil Account | Há keys de i18n visíveis para usuário: `header.title`, `NAME.LABEL`, `email.readonlyHint`, `delete.label`, `delete.description`, `delete.button`. |
| Doses | Existe ação de registrar nova dose no header. Lista mostra próxima e histórico. |
| Registrar dose | Botão "Fechar" observado via hierarchy gerou warning `GO_BACK was not handled by any navigator` quando acionado a partir do estado atual. |
| Registrar peso | Botão fechar funcionou e voltou para Histórico de Peso. |
| Diário | Quick log "Náusea" registrou dado imediatamente sem tela intermediária visível. |
| Relatórios | Primeiro card de peso ocupa quase metade da tela. Demais cards ficam abaixo da dobra. |
| Perfil | Health profile e Sobre ainda aparecem como "Em breve". |
| Notificações | Tela existe e tem permissão, lembretes, horário, próximo lembrete e teste. |

## Hipóteses

| Hipótese | Evidência atual | Próximo passo |
|---|---|---|
| Home ainda não entrega "motivo para voltar amanhã" | Insight placeholder e poucos atalhos contextuais | Capturar Home D1+ após estado controlado e discutir direção visual |
| Welcome ainda parece carousel tradicional | Slide 1 sem CTA primário visível | Capturar slides 2/3 antes de decidir |
| Perfil Account tem bug de i18n | Keys visíveis em screenshot | Confirmar locale/arquivo e tratar como bug P1 |
| Modal dose é pesado para ação rápida | 7 blocos antes do CTA | Auditar contra meta "registrar em 10 segundos" |
| Quick log pode ser ação sensível | Toque registrou dado direto | Confirmar se precisa confirmação ou feedback mais claro |
| Relatórios parece dashboard antes de memória clínica | Cards gráficos empilhados | Avaliar ordem e hierarquia na direção visual |

## P0 Pendente

| Evidência | Motivo |
|---|---|
| Onboarding personal info vazio/preenchido | Conta atual já tem onboarding completo |
| Onboarding medication vazio/selecionado | Conta atual já tem onboarding completo |
| Onboarding concerns vazio/selecionado | Conta atual já tem onboarding completo |
| Loading IA steps | Exige fluxo de onboarding real |
| Result com insight | Exige fluxo de onboarding real |
| Welcome slides 2 e 3 | Não capturado nesta leva após relogin |

## Divergências

| Tema | Posição Codex App |
|---|---|
| Fase 0 completa vs primeira leva | Esta é a primeira leva. Ainda não considero Fase 0 completa. |
| Alterar banco para capturar onboarding | Não farei sem confirmação explícita do Léo. |
| Apagar quick log criado por engano | Não farei sem confirmação explícita do Léo. |

## Riscos

| Risco | Mitigação |
|---|---|
| Decidir redesign com onboarding incompleto | Bloquear direção final dos primeiros 3 minutos até capturar onboarding ou aceitar limitação |
| Confundir warning dev com bug de produção | Marcar warnings como dev-only, mas ainda investigar rotas se afetarem fechar modal |
| Over-index em screenshots de uma conta só | Coletar depois estado empty ou usuário limpo |

## Ação esperada

Cowork deve:

1. revisar `05a` e `05b`;
2. responder em `06-cowork-revisao-fase-0.md`;
3. dizer se esta primeira leva já basta para iniciar discussão de Home/Perfil bugs, ou se precisa completar onboarding antes;
4. propor o método mais seguro para capturar onboarding sem bagunçar dados reais.

