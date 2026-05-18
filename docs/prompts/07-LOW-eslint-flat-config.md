# Prompt 07-LOW-eslint-flat-config

**Branch:** `feature/07-eslint-flat-config`
**Modelo recomendado:** Haiku (mecânico, sem decisão arquitetural)
**Pré-requisito:** Prompt 06 mergeado em `main`.

---

## Contexto

`npm run lint` quebra hoje. Identificado durante a execução do Prompt 06:

> **ESLint v10 não suporta mais o formato legacy `.eslintrc.*`.** A v10 só lê **flat config** (`eslint.config.js` ou `eslint.config.mjs`). Nosso repo ainda tem `.eslintrc.js` herdado do bootstrap (Prompt 00). Type-check e build funcionam normalmente — só o linter está inacessível.

Estado atual:
- `eslint@^10.3.0` instalado
- `eslint-config-expo@~10.0.0` instalado (já suporta flat config)
- `@typescript-eslint/eslint-plugin@^8.59.3` instalado
- `@typescript-eslint/parser@^8.59.3` instalado
- `.eslintrc.js` legado contém `extends: ['expo', 'plugin:@typescript-eslint/recommended']` + 2 regras (`no-explicit-any: error`, `no-unused-vars: error`)
- Script `lint` em `package.json`: `eslint . --ext .ts,.tsx` (flag `--ext` é legacy, flat config usa pattern via `files`)

---

## Tarefa

Migrar a configuração do ESLint do formato legacy para o formato flat, mantendo o comportamento atual (mesmas regras, mesma severidade).

### O que fazer

1. **Criar** `eslint.config.js` na raiz do projeto com:
   - Extends do `eslint-config-expo` em formato flat (`eslint-config-expo/flat.js` — confirmar nome exato do export consultando `node_modules/eslint-config-expo/package.json`)
   - Parser `@typescript-eslint/parser` aplicado a `**/*.ts` e `**/*.tsx`
   - Plugin `@typescript-eslint` registrado
   - Regras preservadas (mesmo comportamento do `.eslintrc.js`):
     - `@typescript-eslint/no-explicit-any: 'error'`
     - `@typescript-eslint/no-unused-vars: 'error'`
   - Ignores explícitos: `node_modules`, `.expo`, `ios`, `android`, `dist`, `build`, `*.config.js` (se aplicável)
2. **Apagar** `.eslintrc.js`
3. **Atualizar** script `lint` em `package.json`: remover `--ext .ts,.tsx` (flat config define os files via pattern). Novo script: `"lint": "eslint ."`
4. **Rodar** `npm run lint` — deve passar com 0 erros (ou só com warnings legítimos de código existente, que devem ser corrigidos se houver)

### Decisão sobre módulos (CommonJS vs ESM)

O projeto usa CommonJS no `package.json` (sem `"type": "module"`). Pra evitar conflito, usar `eslint.config.js` em **CommonJS** (`module.exports = [...]`). Se o `eslint-config-expo/flat.js` for ESM puro e não importável via CommonJS, usar `eslint.config.mjs` (ESM) como fallback — registrar a escolha no commit message.

---

## Skills obrigatórias

| Skill | Por quê |
|---|---|
| `react-native-best-practices` | Padrão Expo para configurações de tooling |

Skills opcionais:
- Web search/fetch para consultar `eslint-config-expo` README e migration guide do ESLint 9 → flat config (se houver dúvida sobre o nome do export flat)

---

## Critérios de aceitação

- [ ] Arquivo `eslint.config.js` (ou `.mjs`) criado na raiz com configuração equivalente
- [ ] Arquivo `.eslintrc.js` apagado
- [ ] Script `lint` em `package.json` atualizado para `eslint .`
- [ ] `npm run lint` roda sem erros de configuração (saída esperada: limpa ou warnings de código preexistente)
- [ ] Regras `no-explicit-any` e `no-unused-vars` continuam ativas como `error`
- [ ] `npm run type-check` continua 0 erros (não deve ser afetado)
- [ ] Commit: `chore(lint): migra ESLint para flat config (eslint.config.js)`
- [ ] PR + merge

---

## Restrições

- Sem instalar libs novas (`eslint-config-expo` v10 já suporta flat)
- Sem alterar regras (mesmas 2 regras, mesma severidade)
- Sem alterar nenhum arquivo de código-fonte (`app/`, `components/`, `lib/`)
- Sem alterar `tsconfig.json`, `babel.config.js`, `metro.config.js`

---

## Validação rápida

```bash
# Garante que .eslintrc sumiu e eslint.config existe
ls -la | grep -i eslint
# Esperado: só eslint.config.js (ou .mjs)

# Roda lint
npm run lint
# Esperado: 0 erros de config. Warnings de código preexistente OK (a corrigir se houver)

# Garante que type-check segue passando
npm run type-check
# Esperado: 0 erros

# Confirma que as 2 regras estão ativas
grep -E "no-explicit-any|no-unused-vars" eslint.config.*
# Esperado: ambas presentes
```

---

## Pós-execução

1. Se `npm run lint` retornar warnings de código preexistente (linhas com `any` ou unused vars não pegas antes), decidir caso a caso:
   - Corrigir se for trivial
   - Adiar via comentário `// TODO(prompt-XX)` se for grande
   - Registrar no PR description
2. Atualizar `docs/architecture.md` seção "Aprendizados" com nota sobre ESLint v10 = flat config obrigatório
3. Atualizar `CLAUDE.md` tabela "Histórico" com linha do Prompt 07
