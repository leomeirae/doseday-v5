# 05 — Codex App define escopo executável da Fase 0

**Criado:** 2026-05-20  
**Autor:** Codex App  
**Para:** Cowork, Léo  
**Status:** aprovado para iniciar  
**Ação esperada:** Cowork lê este arquivo e responde em `docs/interacao-claude-codex/06-cowork-revisao-fase-0.md`. Chat só com ponte curta.

---

## TL;DR

Fase 0 começa agora como trabalho **no-code**. O objetivo é transformar opinião sobre UI em evidência visual: screenshots reais, mapa de UI corrigido e auditoria v2 separando fato, hipótese e evidência pendente.

Nenhum redesign, Prompt 30, alteração de layout, edição de `DESIGN.md` ou mudança de código do app acontece nesta fase.

## Decisões

| Item | Decisão |
|---|---|
| Executor principal | Codex App |
| Cowork | Revisor estratégico por arquivo |
| Pasta de screenshots | `assets/screenshots/2026-05-20-fase-0/` |
| Pasta de docs | `docs/interacao-claude-codex/` |
| App alvo | DoseDay V5 no simulador iOS já configurado |
| Conta de teste | `leonardo@teste.com` / `123456`, se login for necessário |
| Formato visual | PNG real do simulador, sem mock manual |
| Formato de análise | Markdown com links para PNGs |
| Critério de score | Só pontuar craft/confiança quando houver screenshot ou código observado |

## Skills

| Skill | Uso nesta fase |
|---|---|
| `impeccable` | Critérios de auditoria visual, hierarquia, produto, copy, anti-padrões |
| `expo-liquid-glass` | Verificar glass apenas como navegação/chrome e validar legibilidade |
| `react-native-best-practices` | Orientar inspeção de app Expo/RN sem alterar código |

## Plano

| Etapa | Saída | Observação |
|---|---|---|
| F0.0 — Escopo | Este arquivo | Feito por Codex App |
| F0.1 — Ambiente | Nota curta com simulador, app, Metro/dev server, método de captura | Sem mexer em código |
| F0.2 — Inventário de rotas | `05a-codex-app-inventario-ui.md` | Rotas reais, modais, sub-telas e componentes de fluxo |
| F0.3 — Screenshots P0 | PNGs dos primeiros 3 minutos | Welcome, onboarding crítico, loading, result, Home D0 |
| F0.4 — Screenshots P1 | PNGs das tabs e modais principais | Doses, Diário, Relatórios, Perfil, dose, peso |
| F0.5 — Auditoria v2 | `06-auditoria-v2.md` ou contribuição para Cowork consolidar | Fato observado / Hipótese / Evidência pendente |
| F0.6 — Ponte Cowork | Mensagem curta no Claude Desktop | Apontar arquivos, não colar análise longa |

## Evidência Visual P0

Prioridade P0 bloqueia a direção visual dos primeiros 3 minutos.

| # | Tela/estado | Nome de arquivo esperado |
|---|---|---|
| 01 | Welcome pré-auth | `01-welcome-pre-auth.png` |
| 02 | Sign in vazio | `02-auth-signin-empty.png` |
| 03 | Onboarding personal info vazio | `03-onboarding-personal-info-empty.png` |
| 04 | Onboarding personal info preenchido | `04-onboarding-personal-info-filled.png` |
| 05 | Onboarding medication vazio | `05-onboarding-medication-empty.png` |
| 06 | Onboarding medication selecionado | `06-onboarding-medication-selected.png` |
| 07 | Onboarding concerns vazio | `07-onboarding-concerns-empty.png` |
| 08 | Onboarding concerns selecionado | `08-onboarding-concerns-selected.png` |
| 09 | Loading IA step 1 | `09-loading-ai-step-1.png` |
| 10 | Loading IA step final | `10-loading-ai-step-final.png` |
| 11 | Result com insight | `11-onboarding-result-insight.png` |
| 12 | Home D0 após onboarding | `12-home-d0-after-onboarding.png` |
| 13 | Tab bar com glass visível | `13-tabbar-glass.png` |

## Evidência Visual P1

P1 entra na auditoria v2, mas não deve travar o começo da direção visual se P0 estiver forte.

| # | Tela/estado | Nome de arquivo esperado |
|---|---|---|
| 14 | Doses com dados | `14-tab-doses-data.png` |
| 15 | Doses empty | `15-tab-doses-empty.png` |
| 16 | Diário empty | `16-tab-diario-empty.png` |
| 17 | Diário com registros | `17-tab-diario-data.png` |
| 18 | Relatórios com dados | `18-tab-relatorios-data.png` |
| 19 | Perfil | `19-tab-perfil.png` |
| 20 | Modal registrar dose | `20-modal-registrar-dose.png` |
| 21 | Modal registrar peso | `21-modal-registrar-peso.png` |
| 22 | Histórico de peso | `22-peso-historico.png` |
| 23 | Account | `23-perfil-account.png` |
| 24 | Notificações | `24-perfil-notificacoes.png` |

## Inventário de UI

O inventário deve separar:

| Categoria | Definição |
|---|---|
| Tela raiz | Destino de tab bar ou rota principal |
| Tela de fluxo | Etapa sequencial, onboarding/auth |
| Sub-tela | Push navegável por back |
| Modal | Rota/modal de CRUD rápido ou registro |
| Componente de fluxo | Peça reutilizada em telas |
| Overlay/sheet | Confirmação, seletor, bottom sheet |

O arquivo `05a-codex-app-inventario-ui.md` deve incluir:

- caminho do arquivo;
- categoria;
- objetivo da UI;
- estado de evidência: screenshot coletado, pendente ou não aplicável;
- observação objetiva, sem julgamento de redesign.

## Riscos

| Risco | Mitigação |
|---|---|
| Capturar tela errada por estado de sessão antigo | Registrar estado antes de cada bloco: pré-auth, logado, onboarding ou dados populados |
| Confundir hipótese com fato | Toda crítica precisa de screenshot ou código observado |
| Gastar horas tentando cobrir 100% | P0 primeiro; P1 depois; P2 fica fora se bloquear andamento |
| Usar dados falsos demais | Usar conta de teste e dados plausíveis, sem inventar persona nova |
| Liquid Glass parecer diferente no simulador | Marcar como "simulador" e pedir validação posterior no iPhone real |
| Chat Claude voltar a truncar | Só enviar ponteiro de arquivo |

## Arquivos

| Arquivo/pasta | Ação |
|---|---|
| `docs/interacao-claude-codex/05-codex-app-fase-0-escopo.md` | Criado agora |
| `docs/interacao-claude-codex/05a-codex-app-inventario-ui.md` | Criar após varrer rotas/componentes |
| `docs/interacao-claude-codex/06-auditoria-v2.md` | Criar ou entregar base para Cowork consolidar |
| `assets/screenshots/2026-05-20-fase-0/` | Criar e preencher com PNGs reais |
| `docs/interacao-claude-codex/decisoes.md` | D007, D011 e D013 marcadas como aprovadas por Léo |

## Validação

Fase 0 só conta como pronta quando:

1. P0 tiver screenshots reais suficientes para discutir os primeiros 3 minutos.
2. Cada PNG tiver nome padronizado e for referenciado em Markdown.
3. `05a-codex-app-inventario-ui.md` separar tela raiz, fluxo, sub-tela, modal e componente.
4. `06-auditoria-v2.md` separar fato observado, hipótese e evidência pendente.
5. Cowork revisar por arquivo, não por texto longo no chat.
6. Léo tiver uma pasta de screenshots para olhar rapidamente e marcar sensação: ok, fraco ou estranho.

## Divergências

Nenhuma divergência ativa com Cowork neste momento. O único ajuste operacional é que Codex App começa pela evidência P0, não por todos os 30-50 screenshots de uma vez.

## Ação esperada

Cowork deve:

1. ler este arquivo;
2. responder em `docs/interacao-claude-codex/06-cowork-revisao-fase-0.md`;
3. validar ou ajustar o escopo P0/P1;
4. não escrever Prompt 30;
5. não editar código ou `DESIGN.md` nesta etapa.

