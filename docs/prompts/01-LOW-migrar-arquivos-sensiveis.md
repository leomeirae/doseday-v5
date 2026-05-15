# DoseDay V5 — Prompt 01-LOW-migrar-arquivos-sensiveis

**Instância de destino:** ☑ Aba 1 (mesma do Prompt 00 — ainda não criamos worktrees)
**Worktree:** `dose-day-v5/` (pasta principal)
**Branch a criar:** `feature/01-migrar-arquivos-sensiveis`
**Caveman:** N/A (decisão estratégica: não usar no projeto)

> **Importante:** este prompt só roda DEPOIS que o Prompt 00 (bootstrap) tiver concluído com sucesso. Verifique que o projeto Expo está rodando "Hello DoseDay" no simulador antes de começar.

## Contexto obrigatório (leia antes de qualquer coisa)

- `/Users/leofrancaia/Desktop/dose-day-v5/CLAUDE.md` — memória do projeto
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/plano-estrategico-v5.md` — estratégia
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/architecture.md` — onde cada arquivo mora na V5
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/PRODUCT.md` — guardrails LGPD + Apple
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/prompts/README.md` — regras anti-pirraça

**Pasta-fonte (referência apenas, NÃO mexer):** `/Users/leofrancaia/Desktop/Dose-Day-Jules-1/`

## Objetivo desta tarefa

Migrar os arquivos sensíveis da V4 pra V5, preservando: bundle ID, chaves de API, configuração de build, e strings de i18n. Resultado: o projeto Expo da V5 deve conseguir conectar no MESMO Supabase + MESMO RevenueCat da V4 sem precisar refazer setup desses serviços.

## Critérios de aceitação

- [ ] `.env` criado na raiz da V5 com as mesmas chaves da V4 (Supabase URL/anon key, RevenueCat iOS key, PostHog key)
- [ ] `.env.example` criado mostrando estrutura sem valores reais
- [ ] `.gitignore` confirma que `.env` (com valores) NÃO é commitado
- [ ] `app.json` da V5 contém `bundleIdentifier: "com.doseday.premium"`, `name: "DoseDay"`, `version: "5.0.0"`
- [ ] `GoogleService-Info.plist` copiado pra raiz da V5
- [ ] `eas.json` criado/adaptado pra EAS Build (development, preview, production)
- [ ] Pasta `locales/` da V5 contém as 3 línguas (pt-BR, en, es) com todos os arquivos JSON
- [ ] Ícone do app (`assets/icon.png`) copiado e validado
- [ ] `tsc --noEmit` passa (validar via `Bash: rtk tsc` em vez do `Read` pra economizar tokens)
- [ ] `npx expo start --ios` ainda sobe o app sem warnings novos
- [ ] Commits descritivos com tipo + área (`feat(env): ...`, `chore(i18n): ...`)
- [ ] Branch `feature/01-low-migrar-arquivos-sensiveis` criada, mergeada via PR em `main`

## Restrições explícitas

- **NÃO** copie código React Native (`app/`, `components/`, `hooks/`, `lib/`) da V4 — refatoração completa, código novo
- **NÃO** copie `node_modules/` (instalação fresca já feita no Prompt 00)
- **NÃO** copie assets de welcome antigos (`assets/welcome/slide-*.png`, `Fundo de icone-correto Removido.png`) — eram os mockups 3D banidos da V4
- **NÃO** copie `android/`, `ios/` build outputs — vamos gerar novos
- **NÃO** copie migrations Supabase antigas — vamos rodar limpas
- **NÃO** rode `supabase db push` (lição V4.5) — apenas leitura
- **NÃO** commite `.env` com valores reais — verifique `.gitignore` antes de qualquer `git add`
- **NÃO** use `Read` em arquivos grandes (>300 linhas) — preferir `Bash: rtk read` pra economia de tokens

## Arquivos da V4 mapeados (referência precisa)

### Migrar com cópia direta + adaptação

| Origem (V4) | Destino (V5) | Adaptação |
|---|---|---|
| `~/Desktop/Dose-Day-Jules-1/.env` | `~/Desktop/dose-day-v5/.env` | Copiar conteúdo. Verificar se variáveis seguem padrão `EXPO_PUBLIC_*` |
| `~/Desktop/Dose-Day-Jules-1/GoogleService-Info.plist` | `~/Desktop/dose-day-v5/GoogleService-Info.plist` | Cópia direta |
| `~/Desktop/Dose-Day-Jules-1/eas.json` | `~/Desktop/dose-day-v5/eas.json` | Revisar versão EAS CLI, simplificar pra V5 |
| `~/Desktop/Dose-Day-Jules-1/locales/pt-BR/*.json` | `~/Desktop/dose-day-v5/locales/pt-BR/*.json` | Cópia direta — strings curadas mantidas |
| `~/Desktop/Dose-Day-Jules-1/locales/en/*.json` | `~/Desktop/dose-day-v5/locales/en/*.json` | Cópia direta |
| `~/Desktop/Dose-Day-Jules-1/locales/es/*.json` | `~/Desktop/dose-day-v5/locales/es/*.json` | Cópia direta |
| `~/Desktop/Dose-Day-Jules-1/assets/welcome/icone-correto.png` | `~/Desktop/dose-day-v5/assets/icon.png` | Cópia direta — único asset que sobrevive |

### Migrar com adaptação significativa

| Origem (V4) | Destino (V5) | Adaptação |
|---|---|---|
| `~/Desktop/Dose-Day-Jules-1/app.json` | `~/Desktop/dose-day-v5/app.json` | Manter `bundleIdentifier`, atualizar `version` pra `5.0.0`, atualizar `runtimeVersion`, remover plugins V4 que não vamos usar, garantir `userInterfaceStyle: "dark"`, `deploymentTarget: "26.0"` pra Liquid Glass. Ver `architecture.md` seção 4.1 |

### Não migrar

- `assets/welcome/slide-*.png` (mockups 3D banidos)
- `assets/welcome/Fundo de icone-correto Removido.png` (não é referência)
- `node_modules/` (instalação fresca)
- `android/`, `ios/` (build outputs)
- Código React Native (`App.tsx`, `app/`, `components/`, `hooks/`, `lib/`)
- Migrations antigas (`supabase/migrations/`)
- Documentação V4 (`docs/CLAUDE.md` antigo, etc.)
- Vídeos, GIFs (`*.mp4`, `*.gif`)
- CSVs e arquivos não relacionados

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Plano com checkpoints |
| Execução de cópia | `Bash` (com hook RTK) | Operações de FS rápidas |
| Validação | `Bash: tsc --noEmit` | Verifica TypeScript |
| Security review final | `security-review` | Confirmar que `.env` não vaza |

(Preencher com base em `docs/skills-stack.md`. Se quiser usar outra, justificar.)

### B) Plano de execução

Lista numerada com checkpoints. Sugestão de etapas:

1. Verificar pré-requisitos (Prompt 00 concluído, app rodando "Hello DoseDay")
2. Criar branch `feature/01-low-migrar-arquivos-sensiveis`
3. Copiar `.env` da V4 + criar `.env.example` + validar `.gitignore`
4. Copiar `GoogleService-Info.plist`
5. Adaptar `app.json` (bundle ID, version, deploymentTarget, plugins)
6. Adaptar `eas.json` (3 perfis: development, preview, production)
7. Copiar pasta `locales/` inteira (pt-BR, en, es)
8. Copiar `icone-correto.png` como `assets/icon.png`
9. Rodar `tsc --noEmit` + `npx expo start --ios` pra validar
10. Commit: `chore(migration): migra arquivos sensíveis da V4`
11. PR em `main`, aguardar merge

### C) Riscos identificados

Listar coisas que podem dar errado. Sugestões:

- `.env` da V4 pode ter variáveis com nome diferente do padrão Expo (precisar prefixo `EXPO_PUBLIC_`)
- `app.json` da V4 pode ter plugins não compatíveis com Expo SDK 54+
- Versão do EAS CLI no `eas.json` pode estar desatualizada
- `.gitignore` pode não estar bloqueando `.env` — risco de vazamento

### D) Arquivos que vai criar/editar

Tabela com cada arquivo + ação + resumo.

### E) Como vai validar

- [ ] `Bash: tsc --noEmit` passa
- [ ] `Bash: npx expo start --ios` sobe sem warnings novos
- [ ] `Bash: git status` mostra apenas arquivos esperados
- [ ] `Bash: cat .gitignore | grep -E "\.env$"` retorna match (env ignorado)
- [ ] `Bash: ls locales/` mostra `pt-BR/`, `en/`, `es/`
- [ ] `Bash: cat app.json | grep bundleIdentifier` retorna `"com.doseday.premium"`

### F) Otimização de tokens (RTK)

Para esta tarefa, comandos `rtk *` específicos:
- `rtk ls ~/Desktop/Dose-Day-Jules-1/` — pra mapear estrutura da V4 sem ler tudo
- `rtk grep "EXPO_PUBLIC" ~/Desktop/Dose-Day-Jules-1/` — pra confirmar padrão de variáveis env
- `rtk read ~/Desktop/Dose-Day-Jules-1/app.json` — pra ler app.json da V4 compactado
- `rtk read ~/Desktop/Dose-Day-Jules-1/eas.json` — idem

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Observação adicional

Se ao mapear o `.env` da V4 você encontrar variáveis que não fazem sentido pra V5 (ex.: chave do OpenAI antigo, Sentry DSN que vamos refazer, etc.), liste-as no plano e pergunte ao Léo o que fazer antes de copiar. **NÃO assuma.**
