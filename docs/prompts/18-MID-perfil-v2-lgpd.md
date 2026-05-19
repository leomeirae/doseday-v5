# Prompt 18-MID-perfil-v2-lgpd

**Branch:** `feature/18-perfil-v2-lgpd`
**Modelo recomendado:** Sonnet (decisões UX de exclusão de conta + estados destructivos + edge cases LGPD)
**Pré-requisito:** Prompt 16 (Conectar IA Movimento 1) mergeado.

---

## Contexto

Tab Perfil hoje é V1 mínimo (Prompt 11): card com email + botão "Sair". Apple **rejeita** submissão sem **exclusão de conta acessível em ≤2 taps** (Guideline 5.1.1(v)). LGPD exige política de privacidade + termos acessíveis.

Este prompt entrega o **Perfil V2 — Compliance Edition.** Foco cirúrgico: requisitos legais e App Store. Features de produto (edit medicamento, settings de notificação, idioma) ficam para Prompt 21+.

### Edge Function disponível (V4 ATIVA, validada via MCP)

**`delete-user-account` (POST)**

| Item | Detalhe |
|---|---|
| Auth | `Authorization: Bearer <jwt>` obrigatório (`verify_jwt: true`) |
| Body | empty |
| Side effect | `supabaseAdmin.auth.admin.deleteUser(userId)` — **CASCADE delete** apaga TUDO (user_profiles, medication_applications, daily_checkins, weight_logs, symptom_logs, quick_logs, etc) via foreign keys |
| Response 200 | `{ success: true, message: 'Account deleted successfully' }` |
| Response 400 | `{ success: false, error: string }` |

### Aprendizado (registrar)

- `delete-user-account` é one-shot e CASCADE-based. Cliente não precisa orquestrar deletes manuais
- LGPD + App Store compliance precisam de URLs externas (política, termos). V5 ainda não tem essas páginas — placeholders + follow-up registrado

---

## Tarefa

Substituir `app/(tabs)/perfil.tsx` V1 placeholder por **Perfil V2 compliance**. 4 frentes:

1. **Card de conta** — email, "membro desde", ID curto para suporte
2. **Section Privacidade & Dados** — links externos (Política, Termos) + botão destructivo "Excluir minha conta"
3. **Section Suporte** — link de contato + versão do app
4. **Botão Sair** — mantido do V1 (não regredir)

### Estrutura de arquivos

```
lib/supabase/queries/
└── account.ts                          ← NOVO (deleteAccount)

hooks/
└── useDeleteAccount.ts                 ← NOVO

lib/validation/
└── accountSchemas.ts                   ← NOVO (Zod do typed confirm "EXCLUIR")

components/perfil/
├── AccountCard.tsx                     ← NOVO (info-only do user)
├── SectionLink.tsx                     ← NOVO (link genérico: ícone + label + chevron)
├── DeleteAccountModal.tsx              ← NOVO (modal sheet de confirmação)
└── SectionHeader.tsx                   ← REUSAR (já em components/ui/ após Prompt 15)

app/perfil/
└── excluir.tsx                         ← NOVO (modal sheet route)

app/(tabs)/perfil.tsx                   ← MODIFICAR (substitui V1)
app/_layout.tsx                         ← MODIFICAR (+1 Stack.Screen modal)

locales/pt-BR/perfil.json               ← NOVO (strings da tela + modal)
```

### Layout `app/(tabs)/perfil.tsx`

```
┌────────────────────────────────────┐
│ Perfil                             │ ← typography.headline
│                                    │
│ Conta                              │ ← SectionHeader
│ ┌──────────────────────────────┐   │
│ │ Leonardo                     │   │ ← AccountCard
│ │ leonardo@teste.com           │   │
│ │ Membro desde 7 de maio       │   │
│ │ ID: 7f42257c                 │   │ ← últimos 8 chars (suporte)
│ └──────────────────────────────┘   │
│                                    │
│ Privacidade & Dados                │ ← SectionHeader
│ ┌──────────────────────────────┐   │
│ │ 📄 Política de privacidade →│   │ ← SectionLink (Linking.openURL)
│ │ 📋 Termos de uso          →│   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ 🗑️  Excluir minha conta    →│   │ ← SectionLink destructivo (cor critical)
│ └──────────────────────────────┘   │
│                                    │
│ Suporte                            │ ← SectionHeader
│ ┌──────────────────────────────┐   │
│ │ ✉️  Falar com suporte      →│   │ ← mailto:
│ │ Versão 5.0.0 (build 1)       │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │           Sair               │   │ ← AuthButton secondary (V1 mantido)
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### Layout `app/perfil/excluir.tsx` (modal sheet)

```
┌────────────────────────────────────┐
│ ✕                Excluir conta     │
├────────────────────────────────────┤
│                                    │
│ 🗑️  (ícone grande, vermelho)       │
│                                    │
│ Tem certeza?                       │ ← typography.title (semanticCritical)
│                                    │
│ Esta ação é permanente. Você vai   │ ← typography.body
│ perder:                            │
│   • Histórico de doses             │
│   • Diário e check-ins             │
│   • Insights gerados               │
│   • Sua sessão atual               │
│                                    │
│ Digite EXCLUIR para confirmar:     │ ← typography.label
│ ┌──────────────────────────────┐   │
│ │                              │   │ ← TextField (uppercase auto)
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │   Excluir permanentemente    │   │ ← AuthButton primary (mas em semanticCritical)
│ └──────────────────────────────┘   │   disabled até "EXCLUIR" exato
│                                    │
│ ┌──────────────────────────────┐   │
│ │          Cancelar            │   │ ← AuthButton secondary
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### Comportamentos

| Ação | Resultado |
|---|---|
| Tap "Política de privacidade" | `Linking.openURL('https://doseday.com.br/privacidade')` |
| Tap "Termos de uso" | `Linking.openURL('https://doseday.com.br/termos')` |
| Tap "Falar com suporte" | `Linking.openURL('mailto:suporte@doseday.com.br?subject=Suporte%20DoseDay')` |
| Tap "Excluir minha conta" | `router.push('/perfil/excluir')` (modal sheet) |
| Tap "Sair" | `signOut()` + AuthGuard redireciona (já implementado V1) |
| Modal: typed "EXCLUIR" exato | Botão habilita |
| Modal: tap "Excluir permanentemente" | Mutation `deleteAccount()`. Loading. Success: `signOut()` + toast "Conta excluída" + AuthGuard redireciona pra signin |
| Modal: tap "Cancelar" | `router.back()` |
| Erro de rede no delete | Modal continua aberto + toast "Não foi possível excluir. Tente novamente." |

### URLs placeholders (follow-up Léo)

⚠️ **Estas URLs precisam EXISTIR antes da submissão App Store:**

| URL | Status | Bloqueio |
|---|---|---|
| `https://doseday.com.br/privacidade` | Placeholder | Pré-ship (Prompt 30+) |
| `https://doseday.com.br/termos` | Placeholder | Pré-ship |
| `mailto:suporte@doseday.com.br` | Placeholder | Pré-ship (email forwarder) |

**Registrar como follow-up** em `docs/architecture.md` seção "Pendências Pre-ship". Apple rejeita PRs sem essas URLs funcionais. Mas para o Prompt 18, são apenas links — funcionam quando as páginas existirem.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | `Linking.openURL`, mutations destructivas, modal sheet pattern |
| `supabase-postgres-best-practices` | `supabase.functions.invoke`, JWT auth |
| `/impeccable craft` | Hierarquia visual destructiva, ícones SF Symbols, microcopy de aviso |
| `/impeccable harden` | Edge cases: rede caída, double-tap, sessão expirada durante delete, deslogar mid-delete |
| `app-store-compliance` | Validar que tela atende Guideline 5.1.1(v) — exclusão acessível em ≤2 taps |
| `security-review` | Confirmar que delete-user-account está protegido por JWT + CASCADE funciona |
| `superpowers:writing-plans` | **OBRIGATÓRIO** salvar plano em `docs/superpowers/plans/2026-05-18-perfil-v2-lgpd.md` antes de tocar em código (regra 21) |

---

## Validação automatizada via `react-native-devtools-mcp`

### Bateria (12 testes)

| # | Ação | Tool | Critério |
|---|---|---|---|
| 1 | Cold start + signin Leonardo | `tap` + `type_text` (3 fragmentos) | Home renderiza |
| 2 | Navegar tab Perfil | `tap` na tab Perfil | Tela renderiza com 3 seções |
| 3 | Screenshot Perfil V2 completo | `screenshot` | AccountCard + Privacidade + Suporte + Sair visíveis |
| 4 | A11y Perfil | `get_view_hierarchy` | Links com `accessibilityRole='link'`, botão Excluir com `accessibilityRole='button'` + `accessibilityHint='Ação destrutiva'` |
| 5 | Tap "Política de privacidade" | `tap` | Confirmar `Linking.openURL` chamada (via `get_js_logs`) ou tela do Safari abre |
| 6 | Voltar + tap "Excluir minha conta" | `tap` | Modal sheet `/perfil/excluir` abre |
| 7 | Screenshot modal vazio | `screenshot` | Layout: ícone destrutivo + título + lista + input + 2 botões |
| 8 | Tentar tap "Excluir permanentemente" sem typed | `tap` no botão | Botão disabled (sem efeito visual de press) |
| 9 | Digitar "exclui" (parcial, lowercase) | `type_text` | Botão segue disabled (case-sensitive + match exato "EXCLUIR") |
| 10 | Apagar + digitar "EXCLUIR" exato | `type_text` | Botão habilita visualmente |
| 11 | Tap "Cancelar" | `tap` | Modal fecha, volta pra Perfil sem alterações |
| 12 | A11y modal | `get_view_hierarchy` em modal aberto | `accessibilityViewIsModal=true`, foco vai pro título no abrir, botão Cancelar com `accessibilityHint` |

**❌ NÃO testar delete real do `leonardo@teste.com`.** Apagaria nossa subscription premium + dados clínicos. Em vez disso:

- **Teste 13 simulado via `/impeccable harden`:** `js_eval` injeta mock da resposta da Edge Function (success E error) pra validar fluxo pós-delete sem deletar de verdade

### Greps técnicos

```bash
npm run type-check                                            # 0 erros
npm run lint                                                  # 0 erros novos

# Garantir que delete-user-account é chamada via supabase.functions.invoke (não fetch direto)
grep -rn "delete-user-account\|deleteAccount" hooks/ lib/ app/
# Esperado: aparece em lib/supabase/queries/account.ts + hooks/useDeleteAccount.ts

# Garantir que Linking é usado pra URLs externas (não WebView)
grep -rn "Linking.openURL" app/\(tabs\)/perfil.tsx components/perfil/
# Esperado: 3 ocorrências (privacidade, termos, mailto)

# Vital Mint Rarity preservado — destructive usa semanticCritical, não brand
grep -rn "colors.brand" components/perfil/ app/perfil/excluir.tsx
# Esperado: vazio

# Hard-coded hex
grep -rE "#[0-9A-Fa-f]{6}" components/perfil/ app/\(tabs\)/perfil.tsx app/perfil/
# Esperado: vazio

# Confirmar Apple compliance
# "Excluir minha conta" acessível em ≤2 taps a partir de qualquer tela autenticada
#   Tap 1: tab Perfil → Tap 2: "Excluir minha conta" botão visível sem scroll
# Validado visualmente via screenshot
```

---

## Karpathy self-tests (declarar no plano antes do `ok`)

### Think Before Coding — assumptions
1. **URLs externas são placeholders.** Léo cria páginas web reais pré-ship (Prompt 30+). Não bloqueia este prompt
2. **"EXCLUIR" confirmation typed é case-sensitive + exato.** Não aceitar variações (excluir, EXCLUIR! etc) — proteção contra autofill/tap acidental
3. **Delete real NÃO é testado via bateria MCP.** Simulação via `js_eval` cobre fluxo pós-success/error sem destruir test user
4. **CASCADE delete é confiança no schema V4.** Não vamos auditar todas as foreign keys neste prompt — `delete-user-account` foi usada em produção V4 (105 users existentes)
5. **AccountCard.fullName** vem de `useProfile().fullName`. Fallback: primeira parte do email se vazio
6. **"Membro desde"** vem de `session.user.created_at` formatado via `date-fns/ptBR`

### Simplicity First
- ~250 linhas total (5 componentes pequenos + 1 hook + 1 query + 1 modal)
- Sem retry no cliente (mutation destruiva — usuário aciona manualmente se quiser)
- Sem cache (delete é one-shot)
- Sem multi-step wizard (1 modal resolve)
- Reuso máximo: AuthButton, SectionHeader (ui/), TextField (ui/), useSession

### Surgical Changes
- Não toca em: `lib/theme/tokens.ts`, infra auth, navegação (exceto +1 Stack.Screen), Doses, Diário, Home, schemas Zod existentes
- Substitui `app/(tabs)/perfil.tsx` inteiro (V1 era ~50 linhas placeholder — perda intencional)

### Goal-Driven Execution
- 12 testes MCP observáveis (DB não tem como ser testado sem deletar real — aceito)
- Cada step do bateria tem critério verificável
- Apple compliance verificável: ≤2 taps até "Excluir minha conta" visíveis

---

## Critérios de aceitação

- [ ] `lib/supabase/queries/account.ts` criado com `deleteAccount()`
- [ ] `hooks/useDeleteAccount.ts` criado (mutation React Query)
- [ ] `lib/validation/accountSchemas.ts` com `deleteConfirmSchema` (z.literal('EXCLUIR'))
- [ ] `components/perfil/AccountCard.tsx`, `SectionLink.tsx`, `DeleteAccountModal.tsx` criados
- [ ] `app/perfil/excluir.tsx` criado (route modal)
- [ ] `app/_layout.tsx` modificado: +1 `Stack.Screen` `'perfil/excluir'` `presentation: 'modal'`
- [ ] `app/(tabs)/perfil.tsx` substituído (3 seções + Sair)
- [ ] `locales/pt-BR/perfil.json` criado com strings da tela e modal
- [ ] Botão "Excluir minha conta" visível **sem scroll** a partir de qualquer tela autenticada em ≤2 taps (compliance App Store)
- [ ] Modal: confirm typed "EXCLUIR" exato (case-sensitive). Botão disabled até match
- [ ] `Linking.openURL` para os 3 links externos (privacidade, termos, mailto suporte)
- [ ] Destructive UI usa `colors.semanticCritical`, NÃO `colors.brand` (Vital Mint Rarity preservado)
- [ ] Zero `as any` / `// @ts-ignore`
- [ ] Zero `OPENAI_API_KEY` ou outro segredo no cliente
- [ ] `npm run type-check` zero erros
- [ ] `npm run lint` zero erros novos
- [ ] Bateria 12 testes MCP executada (delete real NÃO executado)
- [ ] Simulação de delete via `/impeccable harden` cobrindo success + error paths
- [ ] **5 screenshots REAIS** no PR (markdown `![desc](url)`):
  1. Perfil V2 completo (todas as seções visíveis)
  2. Modal Excluir conta — estado inicial (botão disabled)
  3. Modal Excluir conta — typed "EXCLUIR" (botão habilitado)
  4. Modal Excluir conta — pressed state do botão destructivo
  5. Tela suporte/contato visível (mailto preview ou modal de email)
- [ ] `/impeccable critique` ≥ 28/40, P1/P2 resolvidos
- [ ] **Plano salvo em `docs/superpowers/plans/2026-05-18-perfil-v2-lgpd.md` ANTES de executar** (regra 21)
- [ ] Follow-ups registrados em `docs/architecture.md` seção "Pendências Pre-ship":
  - Criar página `doseday.com.br/privacidade`
  - Criar página `doseday.com.br/termos`
  - Configurar email forwarder `suporte@doseday.com.br`
- [ ] Commit: `feat(perfil): perfil V2 com exclusão de conta (LGPD + App Store 5.1.1(v))`
- [ ] PR aberto via MCP github

---

## Restrições

- **Sem edit de medicamento/dose/peso** — V2+ (Prompt 21+)
- **Sem settings de notificações** — V2+
- **Sem exportar dados** (LGPD nice-to-have, não obrigatório App Store) — V2+
- **Sem histórico de consentimentos** — V2 (lista de `consent_history`)
- **Sem multi-idioma** — pt-BR apenas (regra projeto)
- **Sem chamar OpenAI/Anthropic** — irrelevante pra essa tela
- **Sem modificar Edge Functions** — `delete-user-account` fica intocada
- **Sem migrations** — schema V4 cobre
- **Sem mudanças em** `lib/theme/tokens.ts`, infra auth, navegação principal, outras tabs
- **NÃO deletar `leonardo@teste.com` real durante testes**

---

## Antes de executar

1. Ler `CLAUDE.md` (regras 14 RTK, 20 screenshots, 21 plano, 22 Karpathy)
2. Ler `docs/architecture.md` seções 14.x, 15 + aprendizados 20-39 (incluindo Prompt 16)
3. Ler `app/(tabs)/perfil.tsx` (V1 atual a substituir)
4. Ler `components/auth/AuthButton.tsx` (movido pra `components/ui/AuthButton.tsx` no PR #14 — confirmar path)
5. Ler `lib/supabase/auth.ts` (`signOut` helper existente)
6. Ler `hooks/useSession.ts` e `hooks/useProfile.ts`
7. Confirmar via `ping` que simulador booted
8. Credenciais teste: `leonardo@teste.com` / `123456`

## Pós-execução

1. Rodar `/impeccable critique` em Perfil V2 + modal Excluir
2. Rodar `/impeccable harden` simulando success + error paths via `js_eval`
3. Resolver P1/P2 antes do commit
4. 5 screenshots reais via MCP no PR
5. Atualizar `docs/architecture.md`:
   - Aprendizados novos (CASCADE delete, "EXCLUIR" typed, URLs placeholder)
   - **Seção "Pendências Pre-ship"** com as 3 URLs/email a configurar antes do submit
6. Atualizar `CLAUDE.md` tabela "Histórico"
7. PR description deve incluir:
   - "Compliance: App Store Guideline 5.1.1(v) + LGPD"
   - 5 screenshots
   - Lista de pendências pre-ship registradas
   - Confirmação que delete real NÃO foi executado (apenas simulado)
