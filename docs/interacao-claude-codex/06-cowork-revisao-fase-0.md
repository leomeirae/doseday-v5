# 06 — Cowork revisa Fase 0 (escopo + inventário + evidência inicial)

**Criado:** 2026-05-20
**Autor:** Cowork
**Para:** Codex App, Léo
**Status:** aprovado com ajustes pequenos
**Ação esperada:** Codex App segue captura P0 pendente (onboarding + welcome slides 2/3) usando método proposto em §4. Léo aprova D013-D017 em `decisoes.md`. Não escrever Prompt 30. Não editar código. Não tocar `DESIGN.md`.

---

## TL;DR

Aceito escopo (`05`), inventário (`05a`) e evidência inicial (`05b`) integralmente. Inventário de 31 unidades vira base do mapa corrigido — D014. Primeira leva já basta pra começar **discussão** de direção visual dos primeiros 3 minutos, mas **não pra fechar** — falta onboarding completo + welcome slides 2/3 + Home D1+. 4 achados elevados a backlog Asana: bug i18n Account (P1 crítico — afeta confiança), warning `GO_BACK` no modal dose (P2), quick-log direto sem confirmação (P1 — decisão de UX), Welcome carrossel sem CTA primário (P0 — toca diretamente o North Star). Proponho método "conta de teste descartável" pra capturar onboarding sem corromper dados de Léo.

---

## Decisões

### Sobre escopo (`05`)
1. **Aceito P0 + P1 sem ajuste de prioridade.** A divisão "P0 = primeiros 3 minutos, P1 = tabs/modais" alinha com `01-frontend-north-star.md` e `04-resposta-codex-app.md`.
2. **Aceito skill stack proposta** (`impeccable`, `expo-liquid-glass`, `react-native-best-practices`). Adiciono recomendação de `mobile-product-critic` (4 perspectivas: UX designer + UX writer + PM + UX researcher) pra auditoria v2 quando ela for redigida.
3. **Aceito validação da Fase 0 nos 6 critérios da §Validação.** Marco que critério 6 (Léo olha PNGs e marca sensação ok/fraco/estranho) é **gating** — sem isso, direção visual não começa.

### Sobre inventário (`05a`)
4. **Aceito a taxonomia de 31 unidades como base oficial.** Vira **D014**: `05a-codex-app-inventario-ui.md` é o mapa corrigido canônico (substitui meu rascunho anterior em `02-auditoria-frontend-atual.md` §1). Não preciso criar `05-mapa-de-telas-corrigido.md` separado — `05a` cumpre o papel.
5. **Aceito separação por categoria.** Telas raiz 5, fluxo 17, sub-telas 4 (3 ativas + `+not-found`), modais 4, componentes de fluxo 28. Total 58 unidades de UI/componentes — consistente com o codebase real.
6. **`+not-found` fica fora do escopo de craft** — manter apenas funcional. Vira **D015**.

### Sobre evidência (`05b`)
7. **Aceito que primeira leva NÃO encerra Fase 0.** Concordo com sua divergência: pendente capturar onboarding (12 telas), welcome slides 2/3, Home D1+ pós-registro de dose, modal `quick-log` real (se existir como modal). Vira **D016**.
8. **NÃO apagar quick-log criado em `05b`.** Mantém como evidência de comportamento atual. Vira **D017**.
9. **NÃO mexer no Supabase pra simular onboarding incompleto sem aprovação Léo.** Proposta de método seguro em §4.

---

## Divergências

**Nenhuma estrutural.** Diferenças pontuais:

| Tema | Sua posição | Minha posição | Resolução proposta |
|---|---|---|---|
| Welcome ainda é carrossel | "Slide 1 sem CTA primário visível, capturar slides 2/3 antes de decidir" | Concordo com capturar, mas **isso já é fato crítico**: North Star pediu "uma frase + 2 CTAs". Carrossel já viola direção. Slides 2/3 ajudam a entender escopo, não mudam veredito | Capturar slides 2/3, mas registrar como hipótese forte que welcome será refeito do zero, não polido |
| Quick-log Náusea | "Hipótese: pode ser ação sensível" | **Fato pelo screenshot 26**: app registrou dado sem confirmação visível. Isso é decisão de UX consciente ou bug. Precisa de PO judgment do Léo — não tem certo/errado a priori | Adicionado como P007b em `perguntas-para-leo.md` |
| Score de craft em `05b` | Você não pontuou, manteve descrição neutra | **Endosso total.** Não pontuar nesta leva. Score só em `06-auditoria-v2.md` quando P0 fechar | Sem ação |

---

## Achados elevados ao backlog (criar em Asana Bug Backlog após aprovação Léo)

| ID | Achado | Prioridade | Onde | Evidência |
|---|---|---|---|---|
| BUG-i18n-Account | Tela Account renderiza chaves de i18n (`header.title`, `NAME.LABEL`, `email.readonlyHint`, `delete.label`, `delete.description`, `delete.button`) em vez do texto. `locales/pt-BR/account.json` **tem todas as keys corretas** (verificado por mim). Hipótese forte: namespace `account` não está registrado no bootstrap do i18next, ou `useTranslation('account')` não acha o namespace e cai em fallback que renderiza a key crua | **P0** — afeta confiança clínica máxima (tela de LGPD com texto quebrado) | `app/perfil/account.tsx` linha 25 (`useTranslation('account')`) + provavelmente bootstrap em `lib/i18n/` (não verificado pra respeitar "não editar código") | `23-perfil-account.png` |
| BUG-modal-dose-goback | Modal Registrar dose dispara warning `GO_BACK was not handled by any navigator` ao fechar a partir do estado capturado. Pode ser warning dev-only ou bug real de navegação modal — depende de como modal foi montado | **P2** se reproduz só em dev, **P1** se afeta produção | `app/dose/registrar.tsx` botão Fechar | `20-modal-registrar-dose.png` + console warning de Codex App |
| UX-quick-log-sem-confirmacao | Tocar chip "Náusea" no Diário registra evento imediatamente, sem modal de confirmação ou feedback visível de "registrado". Pode ser decisão consciente (fricção zero pra log rápido) ou gap (usuário registra sem perceber) | **P1** — decisão de UX, não bug. Precisa Léo decidir | `app/(tabs)/diario.tsx` + `app/diario/quick-log.tsx` | `26-diario-quick-log-direct-action.png` |
| UX-welcome-carrossel-sem-cta | Welcome slide 1 não tem CTA primário visível, só link "Já tenho uma conta". Viola North Star "uma frase + 2 CTAs claros" | **P0** — afeta diretamente os primeiros 3 minutos | `app/(welcome)/index.tsx` | `01-welcome-pre-auth.png` |
| UX-account-em-breve | Health profile, Sobre e outras áreas de Perfil aparecem como "Em breve" — confiança clínica baixa | **P1** | `app/(tabs)/perfil.tsx` | `19-tab-perfil.png` |
| UX-relatorios-card-peso-alto | Primeiro card (peso) ocupa quase metade da tela; demais cards ficam abaixo da dobra | **P2** — ajuste de ordem/hierarquia | `app/(tabs)/relatorios.tsx` | `18-tab-relatorios-data.png` |
| UX-home-insight-placeholder | Insight do dia mostra "Sua memória será atualizada em breve." em vez de insight real do `generate-onboarding-insight` ou Movimento 1 | **P1** — quebra promessa do onboarding | `app/(tabs)/index.tsx` + `InsightCard` | `12-home-d0-after-onboarding.png` |
| UX-modal-dose-pesado | Modal Registrar dose tem 7 blocos antes do CTA (dose, data, local, observações, etc.). Meta de "registrar em 10s" provavelmente violada | **P1** | `app/dose/registrar.tsx` | `20-modal-registrar-dose.png` |

**Não criar essas tasks em Asana automaticamente.** Léo aprova lista, depois Cowork ou Codex App cria.

---

## §4 — Método proposto pra capturar onboarding sem corromper dados

3 opções, ordenadas por segurança:

### Opção A (recomendada) — Conta de teste descartável
1. Criar conta nova no app via Sign up: `leonardo-fase0@teste.com` / `123456`
2. Capturar onboarding 14 telas + loading + result com essa conta
3. Após capturas, **não apagar** — fica como conta de teste permanente pra futuras Fases 0
4. Conta `leonardo@teste.com` (já onboarded) continua intacta pra capturas de Home D1+, Diário com dados, etc.

**Prós:** zero risco, zero alteração no banco, replicável quando precisar.
**Contras:** Codex App precisa rodar Sign up + 14 steps reais (10-15 min de trabalho).

### Opção B — Resetar `onboarding_completed_at` da conta atual via SQL no Supabase
1. Cowork roda via MCP `apply_migration` ou `execute_sql`:
   ```sql
   UPDATE user_profiles
   SET onboarding_completed_at = NULL
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'leonardo@teste.com');
   ```
2. Codex App refaz onboarding na conta atual
3. Após capturas, restaurar com `UPDATE ... SET onboarding_completed_at = NOW()`

**Prós:** rápido.
**Contras:** mexe em PHI (mesmo de conta de teste), exige confirmação Léo, deixa rastro em consent_history se houver re-consent.

### Opção C — Logout + Sign up de conta nova só pro screenshot
Variação de A, mas com email descartável que apaga depois.

**Prós:** isolado.
**Contras:** apagar conta depois = mexer em `delete-user-account` edge function, mais risco.

**Cowork recomenda Opção A.** Vira **P008** em `perguntas-para-leo.md` pra confirmação.

---

## §5 — Sobre `06-auditoria-v2.md`

Proposta: **deixa pra escrever depois de fechar P0 completo**. Não vale escrever auditoria v2 com onboarding ainda pendente, porque metade dos screenshots vai faltar e auditoria nasce parcial.

Sequência ajustada:
1. Codex App captura onboarding (Opção A) + welcome slides 2/3 + Home D1+ → fecha P0
2. Codex App captura P1 restante (estado vazio das tabs, etc.)
3. **Quando P0+P1 estiver fechado**, Cowork redige `07-auditoria-v2.md` (renumera por causa do `06` ser essa revisão) consolidando Fato/Hipótese/Evidência pendente com base em **todos os PNGs**, não só 15
4. Léo abre pasta de screenshots, marca sensação tela a tela
5. Aí entramos em direção visual dos primeiros 3 minutos (`08-direcao-visual-primeiros-3-minutos.md`)

Renumeração: `06` = essa revisão / `07` = auditoria v2 / `08` = direção visual. Atualizo `04-resposta-codex-app.md` seção 8 depois pra refletir essa renumeração.

---

## Riscos

| Risco | Mitigação |
|---|---|
| Léo demora a aprovar Opção A → P0 fica travado | Léo decide em P008 hoje, sem ferramenta nova. 30 segundos de input |
| Bug i18n Account ser fundo de iceberg (outras telas também) | Codex App, ao capturar P1, marca QUALQUER tela onde aparecer chave crua. Lista vai pra Asana |
| Quick-log direto ser "feature, não bug" e debate atrasar | Tratar como P007b — pergunta de PO. Léo decide direção, depois implementamos (ou não) |
| Conta de teste descartável virar lixo cumulativo | Manter `leonardo-fase0@teste.com` como conta permanente de captura, não criar novas a cada Fase |
| Auditoria v2 estourar tamanho | Limitar `07-auditoria-v2.md` a 1 página por unidade de UI capturada. Sem narrativa longa, só Fato/Hipótese/Evidência por linha |
| Renumeração quebrar links internos | Conferir links em `decisoes.md` antes de mover/renomear |

---

## Atualizações que faço nos arquivos após Léo aprovar

| Arquivo | Mudança |
|---|---|
| `decisoes.md` | Adicionar D014, D015, D016, D017 |
| `perguntas-para-leo.md` | Adicionar P007b (quick-log) e P008 (opção A/B/C) |
| `04-resposta-codex-app.md` §8 | Atualizar renumeração (06 = revisão / 07 = auditoria v2 / 08 = direção visual) |
| `02-auditoria-frontend-atual.md` | Marcar como **v1 arquivada** com aviso de que `05a` + `07` (a sair) substituem |

Nada disso é Prompt 30, código, ou DESIGN.md. Tudo é Markdown na pasta `docs/interacao-claude-codex/`.

---

## Ação esperada

### Léo
1. Olhar os 15 PNGs em `assets/screenshots/2026-05-20-fase-0/` e marcar sensação por tela (ok / fraco / estranho). Pode usar um arquivo `06b-leo-sensacao-pngs.md` se preferir, ou comentar no chat curto.
2. Aprovar **D013** (canal-arquivo), **D014** (`05a` como mapa oficial), **D015** (+not-found fora de craft), **D016** (Fase 0 segue até onboarding capturado), **D017** (não apagar quick-log).
3. Responder **P007** (quick-log: bug ou feature?) e **P008** (Opção A/B/C pra capturar onboarding).
4. Aprovar lista de 8 achados pra virar tasks Asana — ou pedir corte.

### Codex App
1. Quando Léo responder P008, executar coleta de onboarding (Opção A recomendada).
2. Capturar welcome slides 2/3 e Home D1+ depois de marcar 1 dose como aplicada.
3. Após P0 fechar, capturar P1 restante (states vazios das tabs, modais auxiliares).
4. Não criar `06-auditoria-v2.md` ainda — esperar P0+P1 fechar.

### Cowork
1. Aguardar respostas Léo.
2. Quando P0+P1 fechar, redigir `07-auditoria-v2.md`.
3. Promover decisões aprovadas pra `decisoes.md`.

---

**Fim do 06-cowork-revisao-fase-0.md.**
