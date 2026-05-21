# DoseDay V5 — Prompt 35-LOW-fix-i18n-account-namespace

**Instância de destino:** Aba 1 (principal) — Claude Code direto
**Branch a criar:** `feature/35-fix-i18n-account-namespace`
**Modelo recomendado:** Haiku 4.5 (LOW)
**Esforço estimado:** 30 min – 1h
**Origem estratégica:** Fase 1 do redesign (ver `docs/interacao-claude-codex/08-direcao-visual-primeiros-3-minutos.md` §10). Quick-win independente, primeiro PR da Fase 2 de implementação.

---

## Contexto obrigatório (leia antes de qualquer coisa)

- `CLAUDE.md` — regras anti-pirraça
- `docs/karpathy.md` — Karpathy Guidelines (regra 22)
- `docs/interacao-claude-codex/07-auditoria-v2.md` §8.1 + §10 (BUG-i18n-Account)
- `docs/interacao-claude-codex/decisoes.md` (D015 = P009=A)
- `lib/i18n/index.ts` (estado atual do bootstrap)
- `app/perfil/account.tsx` (consumer do namespace)
- `locales/{pt-BR,en,es}/account.json` (arquivos de origem, já existem)

---

## Objetivo desta tarefa

Corrigir **BUG-i18n-Account** (P0 Confiança em `07-auditoria-v2.md`): a tela `/perfil/account` renderiza **chaves de i18n cruas** (`header.title`, `name.label`, `email.readonlyHint`, `delete.label`, `delete.description`, `delete.button`) em vez do texto traduzido. Causa raiz é fato confirmado por inspeção do código: o namespace `account` **não está registrado** em `lib/i18n/index.ts`, embora `locales/{pt-BR,en,es}/account.json` existam e tenham as keys corretas.

Fix cirúrgico: adicionar 3 imports + registrar `account` em cada bloco `resources['lang']`. Sem efeito em outras telas.

---

## Critérios de aceitação

- [ ] `lib/i18n/index.ts` importa `ptBRAccount`, `enAccount`, `esAccount` dos respectivos `locales/<lang>/account.json`
- [ ] Bloco `resources['pt-BR']` inclui `account: ptBRAccount`
- [ ] Bloco `resources['en']` inclui `account: enAccount`
- [ ] Bloco `resources['es']` inclui `account: esAccount`
- [ ] Tela `/perfil/account` renderiza texto real em pt-BR (ex: "Conta" em vez de "header.title")
- [ ] Screenshot de antes/depois anexado no PR (PNG real, não descrição)
- [ ] `tsc --noEmit` passa sem erros novos
- [ ] Zero mudança de código além de `lib/i18n/index.ts` (plano e screenshot de validação são permitidos)

---

## Restrições explícitas

- **Karpathy guideline:** mudança cirúrgica. Não tocar em arquivos não relacionados. Zero "drive-by refactoring"
- **Não criar** novos arquivos `locales/*/account.json` — eles **já existem** (verificado)
- **Não mover** chaves entre namespaces — `account.json` fica como está
- **Não renomear** chaves dentro do JSON — o consumer `account.tsx` espera as chaves atuais (`header.title`, `name.label`, etc.)
- **Não mexer** em outros namespaces — só adicionar `account`
- Se aparecerem warnings i18next sobre fallback, **investigar mas não silenciar** com `// @ts-ignore`

---

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Persistir plano em `docs/superpowers/plans/2026-05-20-fix-i18n-account-namespace.md` antes de codar |
| Implementação | nenhuma skill especial — edição cirúrgica em 1 arquivo | Skill = overhead |
| Validação | `react-native-devtools-mcp` (screenshot antes/depois) | Evidência real exigida pela regra 20 |

### B) Plano de execução

1. **Confirmar estado atual** — ler `lib/i18n/index.ts`, contar imports atuais, confirmar ausência de `account`. Checkpoint: Léo aprova se contagem bate (16 namespaces atuais por idioma esperado).
2. **Verificar conteúdo dos `account.json`** — abrir os 3 arquivos rapidamente pra garantir que estrutura é compatível com `useTranslation('account')` em `account.tsx`. Checkpoint: nenhum erro estrutural.
3. **Persistir plano** com `superpowers:writing-plans` em `docs/superpowers/plans/2026-05-20-fix-i18n-account-namespace.md`.
4. **Editar `lib/i18n/index.ts`** — adicionar 3 imports + 3 entradas em `resources`. Diff esperado: ≤10 linhas adicionadas, 0 removidas.
5. **Validar com `react-native-devtools-mcp`**:
   - Abrir simulador iPhone 17 iOS 26.5
   - Login conta `leonardo-fase0@teste.com`
   - Navegar pra `/perfil/account`
   - Capturar screenshot `23b-perfil-account-fixed.png` em `assets/screenshots/2026-05-20-fase-1-pr35/`
   - Comparar com `23-perfil-account.png` (antes)
6. **Abrir PR** `feature/35-fix-i18n-account-namespace` com título `fix(i18n): registra namespace account no bootstrap` + body referenciando `BUG-i18n-Account` da auditoria v2 + screenshots antes/depois.

### C) Riscos identificados

- **Risco baixíssimo (LOW), mas vale registrar:**
  - **Risco 1:** Conteúdo de `account.json` ter estrutura diferente da esperada por `account.tsx` (ex: keys em camelCase vs snake_case) — **mitigação:** etapa 2 do plano valida antes de editar.
  - **Risco 2:** i18next cache de Metro reter resources antigos após restart — **mitigação:** após editar, `npx expo start --clear` antes de validar no simulador.
  - **Risco 3:** Outro namespace também ter o mesmo problema (não registrado) — **mitigação:** após fix, fazer `grep -r "useTranslation\(['\"]" app components` e cruzar com namespaces declarados em `resources`. Listar gaps em comentário do PR mas **não corrigir nesse PR** (escopo = só account).

### D) Arquivos que vai criar/editar

| Arquivo | Ação | Resumo |
|---|---|---|
| `lib/i18n/index.ts` | editar | +3 imports (ptBRAccount/enAccount/esAccount) + 3 entradas em `resources` |
| `docs/superpowers/plans/2026-05-20-fix-i18n-account-namespace.md` | criar | Plano aprovado persistido |
| `assets/screenshots/2026-05-20-fase-1-pr35/23b-perfil-account-fixed.png` | criar | Screenshot validação |

**Não tocar em:**
- `app/perfil/account.tsx` (consumer está correto)
- `locales/*/account.json` (arquivos de origem corretos)
- Qualquer outro namespace ou tela

### E) Como vai validar

- [ ] `npx tsc --noEmit` passa sem erros novos (via `Bash` com hook RTK)
- [ ] Screenshot real em `/perfil/account` mostra "Conta" (não "header.title")
- [ ] Screenshot real mostra "Nome" (não "NAME.LABEL")
- [ ] Screenshot real mostra "Apagar conta" (não "delete.label")
- [ ] Console limpo (sem warning `i18next::translator: missingKey`)
- [ ] Outras telas não regridem — abrir tab Doses + Diário + Relatórios + Perfil principal + Notificações pra confirmar
- [ ] `/impeccable critique` **NÃO** se aplica (não é mudança de UI, é fix de configuração)

### F) Otimização de tokens

Arquivo `lib/i18n/index.ts` tem ~120 linhas, então `Read` direto está OK (não exige RTK). Demais arquivos a checar (account.json) são <40 linhas. Não há leitura grande nesse prompt — RTK não traz ganho perceptível.

---

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Diagnóstico técnico (informação pra acelerar o plano)

**Fato confirmado por Cowork em 2026-05-20** lendo `lib/i18n/index.ts`:

```typescript
// Imports atuais (NÃO inclui Account)
import ptBRAuth from '../../locales/pt-BR/auth.json'
// ... 15 namespaces importados
// Falta: ptBRAccount

const resources = {
  'pt-BR': {
    auth: ptBRAuth,
    // ... 15 entradas
    // Falta: account: ptBRAccount
  },
  en: { /* idem, falta account */ },
  es: { /* idem, falta account */ },
}
```

**Diff esperado:**

```diff
+ import ptBRAccount from '../../locales/pt-BR/account.json'
  import ptBRAuth from '../../locales/pt-BR/auth.json'
  // ...

+ import enAccount from '../../locales/en/account.json'
  import enAuth from '../../locales/en/auth.json'
  // ...

+ import esAccount from '../../locales/es/account.json'
  import esAuth from '../../locales/es/auth.json'
  // ...

  const resources = {
    'pt-BR': {
+     account: ptBRAccount,
      auth: ptBRAuth,
      // ...
    },
    en: {
+     account: enAccount,
      auth: enAuth,
      // ...
    },
    es: {
+     account: esAccount,
      auth: esAuth,
      // ...
    },
  }
```

Total: **+9 linhas** (3 imports + 3 entradas).

---

## Pós-PR (entra em `docs/learnings.md` como aprendizado #53)

```
#53 — 2026-05-20 — Namespaces i18next devem ser explicitamente registrados no init.
Criar `locales/<lang>/<namespace>.json` NÃO basta. Se faltar o import + entrada em `resources`,
o `useTranslation('<namespace>')` cai em fallback que renderiza a key crua. Sem warning visível
no console em alguns casos. Checklist pra futuros namespaces: (1) criar JSON nos 3 idiomas;
(2) importar nos 3 idiomas em `lib/i18n/index.ts`; (3) registrar nos 3 blocos `resources`;
(4) validar visualmente.
```

---

**Fim do Prompt 35.**
