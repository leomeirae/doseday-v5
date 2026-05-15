# Bootstrap Expo — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar projeto Expo SDK 55 do zero em `/Users/leofrancaia/Desktop/dose-day-v5/`, com TypeScript estrito, Expo Router, dependências core instaladas, estrutura canônica, Bundle ID `com.doseday.premium`, rodando "Hello DoseDay" no simulador iOS 26+, com Git inicializado e remote configurado.

**Architecture:** Create-expo-app gera o scaffolding inicial (template blank-typescript) e depois reestruturamos para a estrutura canônica do `architecture.md`. Todos os arquivos de configuração (app.json, tsconfig.json, eas.json) são substituídos pelas versões definitivas do projeto. Stubs de i18n e theme/tokens são criados para que os prompts seguintes tenham onde plugar.

**Tech Stack:** Expo SDK 55, React Native (bundled), TypeScript 5.x strict, Expo Router (file-based), @expo/ui (Liquid Glass iOS 26+), i18next + react-i18next, @tanstack/react-query, date-fns, zod, expo-secure-store, expo-haptics, expo-blur, expo-localization.

---

## A) Skills que serão utilizadas

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | `superpowers:writing-plans` | Plano estruturado para prompt multi-etapa sem código de domínio |
| Implementação | `react-native-best-practices` | Garante New Architecture, Hermes, Reanimated 4, padrões SDK 55 antes de qualquer código |
| Validação final | nenhuma skill — tsc + expo start | Validação técnica objetiva (tsc + simulador) |

> **Nota sobre skills NÃO usadas aqui:**
> - `grill-with-docs` — não toca domínio (GLP-1, Movimentos IA, schema clínico). É setup puro de infraestrutura.
> - `impeccable` — não há UI ainda. Reservado para Prompt 02+ quando houver telas.
> - `liquid-glass` — tab bar fica no Prompt 04.

---

## B) Plano de execução

### Pré-condições verificadas ✅
- Node v26.0.0 disponível
- npm v11.14.1 disponível
- Expo CLI v55.0.30 disponível (SDK 55 — satisfaz requisito "54+")
- Diretório contém apenas `.claude/` e `docs/` — sem conflito com create-expo-app

### Etapas numeradas

**CHECKPOINT 1 — Scaffolding base (etapas 1-3)**
1. Inicializar Git + criar branch `feature/00-bootstrap`
2. Rodar `create-expo-app@latest . --template blank-typescript` para gerar scaffolding base
3. Confirmar que o scaffolding não sobrescreveu `docs/` e `.claude/`

⏸️ **Checkpoint:** Léo confirma que `docs/` está intacta e `package.json` foi criado → prosseguir

**CHECKPOINT 2 — Configurações críticas (etapas 4-8)**
4. Substituir `app.json` pela versão definitiva (bundle ID, iOS 26+, plugins, scheme)
5. Substituir `tsconfig.json` pela versão strict (strict: true, path aliases)
6. Atualizar `babel.config.js` para suportar path aliases (`babel-plugin-module-resolver`)
7. Atualizar `metro.config.js` para resolver path aliases no bundler
8. Criar `eas.json` com profiles development/preview/production

⏸️ **Checkpoint:** `tsc --noEmit` passa sem erros após as configs → prosseguir

**CHECKPOINT 3 — Dependências core (etapa 9)**
9. Instalar todas as dependências core da lista do Prompt 00

⏸️ **Checkpoint:** `npm install` termina sem erros críticos (peer warnings tolerados) → prosseguir

**CHECKPOINT 4 — Estrutura canônica + telas (etapas 10-15)**
10. Criar estrutura de pastas canônica (sem mover docs/ — ela já existe)
11. Criar `app/_layout.tsx` (Root layout com QueryClient + i18n)
12. Criar `app/index.tsx` ("Hello DoseDay" básico)
13. Criar `app/+not-found.tsx` (404)
14. Criar `lib/i18n/index.ts` (stub i18next)
15. Criar `lib/theme/tokens.ts` (stub de tokens — preenchido no Prompt 02)

**CHECKPOINT 5 — Locales + assets + configs finais (etapas 16-20)**
16. Criar `locales/pt-BR/common.json`, `locales/en/common.json`, `locales/es/common.json`
17. Criar `.env.example` com todas as variáveis documentadas
18. Criar `.eslintrc.js` + `.prettierrc`
19. Criar `README.md` com instruções de setup
20. Criar `types/domain.ts` (stub vazio tipado)

**CHECKPOINT 6 — Validação + Git (etapas 21-23)**
21. Rodar `tsc --noEmit` — deve passar sem erros
22. Rodar `npx expo start --ios` — abrir no simulador iPhone 17 Pro, confirmar "Hello DoseDay"
23. Primeiro commit + push pra `github.com/leomeirae/doseday-v5`

---

## C) Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `create-expo-app` sobrescreve `docs/` | Baixa | Verificar no Checkpoint 1; se ocorrer, restaurar via Git stash antes do init |
| `@expo/ui` com `deploymentTarget: "26.0"` — iOS 26 não disponível no simulador Xcode atual | Média | Plugin incluído no app.json mas não usamos componentes de glass neste prompt; o app sobe sem precisar de iOS 26 ainda |
| Path aliases no tsconfig não funcionam em runtime (só em type-check) | Alta — armadilha comum | Configurar `babel-plugin-module-resolver` (babel.config.js) E `metro.config.js` simultâneo |
| SDK 55 vs SDK 54 — algum dep do Prompt 00 pode não ter versão pra SDK 55 | Baixa | Expo SDK 55 é a versão atual (CLI v55). `create-expo-app@latest` usa SDK 55. Satisfaz "54+". |
| `eas.json` campo `projectId` vazio — EAS Init não roda aqui | Intencional | Marcado como `<PREENCHER_COM_EAS_INIT>` no arquivo; rodar `eas init` separadamente antes do Prompt 33 |
| `noUnusedLocals: true` + `noUnusedParameters: true` causando erros em stubs | Média | Stubs usam `// eslint-disable-next-line` APENAS para parâmetros de placeholder obrigatório — documentado com justificativa |
| Remote `github.com/leomeirae/doseday-v5` pode não existir | Baixa | Verificar antes do push; se não existir, criamos via `gh repo create` |

---

## D) Arquivos que serão criados ou editados

| Arquivo | Ação | Resumo |
|---|---|---|
| `package.json` | gerado + editado | create-expo-app gera base; scripts npm padrão adicionados |
| `app.json` | substituído | Bundle ID, iOS 26+, @expo/ui plugin, scheme "doseday", dark mode |
| `tsconfig.json` | substituído | strict: true, todos os flags, path aliases @/* @components/* @hooks/* @lib/* @types/* |
| `babel.config.js` | editado | module-resolver para path aliases |
| `metro.config.js` | editado | resolver.alias para path aliases |
| `eas.json` | criado | profiles development/preview/production |
| `.eslintrc.js` | criado | Expo + TypeScript + React Native |
| `.prettierrc` | criado | single quotes, semi false, tab width 2 |
| `.gitignore` | ajustado | adicionar .env, .env.local |
| `.env.example` | criado | todas as variáveis documentadas sem valores reais |
| `app/_layout.tsx` | criado | Root layout com Stack, QueryClientProvider, I18nextProvider |
| `app/index.tsx` | criado | "Hello DoseDay" — texto centralizado com tema básico |
| `app/+not-found.tsx` | criado | tela 404 padrão Expo Router |
| `components/.gitkeep` | criado | placeholder |
| `hooks/.gitkeep` | criado | placeholder |
| `lib/i18n/index.ts` | criado | stub i18next: carrega pt-BR por padrão |
| `lib/theme/tokens.ts` | criado | stub de tokens: cores placeholder (preenchidas no Prompt 02) |
| `locales/pt-BR/common.json` | criado | `{ "hello": "Olá, DoseDay" }` |
| `locales/en/common.json` | criado | `{ "hello": "Hello, DoseDay" }` |
| `locales/es/common.json` | criado | `{ "hello": "Hola, DoseDay" }` |
| `types/domain.ts` | criado | arquivo vazio exportando namespace vazio (preenchido nos prompts seguintes) |
| `README.md` | criado | instruções: npm install, npx expo start --ios, variáveis de ambiente |

**Arquivos que NÃO serão tocados:**
- `docs/` — todo o conteúdo preservado intacto
- `.claude/` — configurações Claude Code intactas
- `CLAUDE.md` — será atualizado apenas na etapa final via skill `/init` (sugerida ao fim)

---

## E) Como vai validar

- [ ] `tsc --noEmit` passa sem nenhum erro (via `Bash: rtk tsc --noEmit`)
- [ ] `npx expo start --ios` sobe sem warnings críticos no terminal
- [ ] Simulador iPhone 17 Pro abre e exibe texto "Hello DoseDay" centralizado
- [ ] `grep bundleIdentifier app.json` retorna `com.doseday.premium`
- [ ] `docs/` intacta (nenhum arquivo sobrescrito)
- [ ] Git log mostra 1 commit limpo na branch `feature/00-bootstrap`
- [ ] Estrutura de pastas bate com `architecture.md` seção 3

---

## Observação sobre SDK 55

O Expo CLI disponível localmente é v55.0.30, que corresponde ao Expo **SDK 55** — a versão estável atual. O requisito do projeto é "SDK 54+", então SDK 55 **satisfaz** o requisito. O plano usará SDK 55.

Se por alguma razão específica você quiser fixar SDK 54, precisaríamos de `npx create-expo-app@latest . --template blank-typescript` seguido de downgrade manual — não recomendado, pois perdemos correções e melhorias do SDK mais recente.

---

## Tasks detalhadas (para execução step-by-step)

### Task 1: Git + Branch

**Files:**
- Modify: `.git/` (init)
- Create: `.gitignore`

- [ ] **Step 1.1:** Inicializar Git e criar branch

```bash
cd /Users/leofrancaia/Desktop/dose-day-v5
git init
git checkout -b feature/00-bootstrap
```

- [ ] **Step 1.2:** Verificar que `docs/` e `.claude/` estão intactos

```bash
ls -la
```
Expected: `.claude/`, `docs/`, `CLAUDE.md` presentes

- [ ] **Step 1.3:** Commit inicial com docs

```bash
git add docs/ CLAUDE.md .claude/
git commit -m "chore: init repo com docs e CLAUDE.md"
```

---

### Task 2: Scaffolding Expo

**Files:**
- Create: `package.json`, `app.json` (temporário), `tsconfig.json` (temporário), `babel.config.js`, `app/index.tsx`, `app/_layout.tsx`

- [ ] **Step 2.1:** Rodar create-expo-app no diretório existente

```bash
npx create-expo-app@latest . --template blank-typescript
```
Expected: arquivos Expo criados, `docs/` e `.claude/` intactos

- [ ] **Step 2.2:** Verificar que docs/ não foi sobrescrita

```bash
ls docs/
```
Expected: `plano-estrategico-v5.md`, `skills-stack.md`, `architecture.md`, `prompts/`, etc. todos presentes

---

### Task 3: app.json definitivo

**Files:**
- Modify: `app.json`

- [ ] **Step 3.1:** Substituir app.json pelo definitivo

```json
{
  "expo": {
    "name": "DoseDay",
    "slug": "doseday",
    "version": "5.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "doseday",
    "userInterfaceStyle": "dark",
    "ios": {
      "bundleIdentifier": "com.doseday.premium",
      "supportsTablet": false,
      "buildNumber": "1",
      "infoPlist": {
        "NSHealthShareUsageDescription": "DoseDay lê peso e atividade do Apple Saúde para ajudar a entender seu tratamento.",
        "NSHealthUpdateUsageDescription": "DoseDay pode salvar peso e doses no Apple Saúde se você autorizar.",
        "NSMicrophoneUsageDescription": "DoseDay grava perguntas para sua consulta apenas se você autorizar (feature opcional).",
        "ITSAppUsesNonExemptEncryption": false
      },
      "associatedDomains": ["applinks:getdoseday.com"]
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      "expo-secure-store",
      "expo-notifications",
      "expo-font",
      ["@expo/ui", { "ios": { "deploymentTarget": "26.0" } }]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": { "projectId": "<PREENCHER_COM_EAS_INIT>" }
    },
    "runtimeVersion": "5.0.0"
  }
}
```

- [ ] **Step 3.2:** Confirmar bundle ID

```bash
grep -o 'com.doseday.premium' app.json
```
Expected: `com.doseday.premium`

---

### Task 4: tsconfig.json strict + path aliases

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 4.1:** Substituir tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@hooks/*": ["./hooks/*"],
      "@lib/*": ["./lib/*"],
      "@types/*": ["./types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

### Task 5: babel.config.js + metro.config.js (path aliases em runtime)

**Files:**
- Modify: `babel.config.js`
- Modify: `metro.config.js`

- [ ] **Step 5.1:** Instalar babel-plugin-module-resolver

```bash
npm install --save-dev babel-plugin-module-resolver
```

- [ ] **Step 5.2:** Atualizar babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@components': './components',
            '@hooks': './hooks',
            '@lib': './lib',
            '@types': './types',
          },
        },
      ],
    ],
  };
};
```

- [ ] **Step 5.3:** Atualizar metro.config.js

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@components': path.resolve(__dirname, 'components'),
  '@hooks': path.resolve(__dirname, 'hooks'),
  '@lib': path.resolve(__dirname, 'lib'),
  '@types': path.resolve(__dirname, 'types'),
};

module.exports = config;
```

---

### Task 6: Instalar dependências core

**Files:**
- Modify: `package.json`

- [ ] **Step 6.1:** Instalar dependências Expo nativas (via `npx expo install` para garantir compatibilidade com SDK)

```bash
npx expo install expo-status-bar expo-splash-screen expo-system-ui expo-font expo-localization expo-secure-store expo-haptics expo-blur @expo/ui
```

- [ ] **Step 6.2:** Instalar dependências npm (não-Expo)

```bash
npm install i18next react-i18next @tanstack/react-query date-fns zod
```

- [ ] **Step 6.3:** Confirmar instalação sem erros críticos

```bash
npm ls --depth=0 2>&1 | head -40
```

---

### Task 7: Estrutura de pastas canônica

**Files:**
- Create: `components/.gitkeep`, `hooks/.gitkeep`, `lib/i18n/index.ts`, `lib/theme/tokens.ts`, `types/domain.ts`
- Create: `locales/pt-BR/common.json`, `locales/en/common.json`, `locales/es/common.json`

- [ ] **Step 7.1:** Criar pastas e placeholders

```bash
mkdir -p components hooks lib/i18n lib/theme lib/utils types locales/pt-BR locales/en locales/es assets/images assets/fonts
touch components/.gitkeep hooks/.gitkeep
```

- [ ] **Step 7.2:** Criar lib/i18n/index.ts (stub)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ptBRCommon from '../../locales/pt-BR/common.json';
import enCommon from '../../locales/en/common.json';
import esCommon from '../../locales/es/common.json';

const resources = {
  'pt-BR': { common: ptBRCommon },
  en: { common: enCommon },
  es: { common: esCommon },
};

const detectedLocale = Localization.getLocales()[0]?.languageTag ?? 'pt-BR';

i18n.use(initReactI18next).init({
  resources,
  lng: detectedLocale,
  fallbackLng: 'pt-BR',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
```

- [ ] **Step 7.3:** Criar lib/theme/tokens.ts (stub — preenchido no Prompt 02)

```typescript
// Tokens de design: preenchidos definitivamente após /impeccable teach (Prompt 02)
// Valores abaixo são placeholders estruturais
export const colors = {
  primary: '#00B37E',      // verde-menta placeholder
  background: '#111827',   // azul-grafite placeholder
  surface: '#1F2937',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
```

- [ ] **Step 7.4:** Criar locales

```json
// locales/pt-BR/common.json
{ "hello": "Olá, DoseDay" }

// locales/en/common.json
{ "hello": "Hello, DoseDay" }

// locales/es/common.json
{ "hello": "Hola, DoseDay" }
```

- [ ] **Step 7.5:** Criar types/domain.ts (stub)

```typescript
// Tipos de domínio: preenchidos progressivamente nos prompts de features
// Estrutura inicial vazia para satisfazer imports futuros

export type Dose = Record<string, never>; // placeholder
export type CheckIn = Record<string, never>; // placeholder
export type WeightEntry = Record<string, never>; // placeholder
```

---

### Task 8: app/_layout.tsx + app/index.tsx

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 8.1:** Criar app/_layout.tsx (Root layout com providers)

```tsx
import '../lib/i18n'; // inicializa i18n antes de qualquer tela
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#111827' },
        }}
      />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 8.2:** Criar app/index.tsx (Hello DoseDay)

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@lib/theme/tokens';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DoseDay</Text>
      <Text style={styles.subtitle}>V5 — Inicializando</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
```

- [ ] **Step 8.3:** Criar app/+not-found.tsx

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@lib/theme/tokens';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>Voltar ao início</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 16,
  },
  link: {
    color: colors.primary,
    fontSize: 16,
  },
});
```

---

### Task 9: Configs finais

**Files:**
- Create: `eas.json`, `.eslintrc.js`, `.prettierrc`, `.env.example`

- [ ] **Step 9.1:** Criar eas.json

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "autoIncrement": "buildNumber" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "<PREENCHER>",
        "ascAppId": "6756668672",
        "appleTeamId": "<PREENCHER>"
      }
    }
  }
}
```

- [ ] **Step 9.2:** Criar .eslintrc.js

```js
module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

- [ ] **Step 9.3:** Criar .prettierrc

```json
{
  "singleQuote": true,
  "semi": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 9.4:** Criar .env.example

```bash
# Supabase (mesmo projeto da V4)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# RevenueCat (mesmo projeto, app "Dose Day App" produção)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry (entra antes do beta)
EXPO_PUBLIC_SENTRY_DSN=

# ANTHROPIC / OPENAI: APENAS server-side (Edge Functions). NUNCA nesta lista com EXPO_PUBLIC_
# ANTHROPIC_API_KEY=  → fica SOMENTE no Supabase Edge Function env
# OPENAI_API_KEY=     → fica SOMENTE no Supabase Edge Function env
```

- [ ] **Step 9.5:** Adicionar .env ao .gitignore

```bash
echo -e "\n# Env vars\n.env\n.env.local\n.env.*.local" >> .gitignore
```

---

### Task 10: Adicionar scripts npm

**Files:**
- Modify: `package.json`

- [ ] **Step 10.1:** Adicionar scripts ao package.json (campo "scripts")

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "test": "jest",
    "build:ios:dev": "eas build --platform ios --profile development",
    "build:ios:preview": "eas build --platform ios --profile preview",
    "build:ios:prod": "eas build --platform ios --profile production",
    "submit:ios": "eas submit --platform ios --latest",
    "supabase:types": "supabase gen types typescript --project-id pjesgdczasumgjzqyzzk > types/database.ts"
  }
}
```

---

### Task 11: README.md

**Files:**
- Create: `README.md`

- [ ] **Step 11.1:** Criar README.md

```markdown
# DoseDay V5

**Memória inteligente do tratamento com canetas emagrecedoras (GLP-1)**

Stack: React Native + Expo SDK 55 · TypeScript strict · Expo Router · Supabase · RevenueCat · Anthropic SDK

---

## Pré-requisitos

- Node 20+
- Xcode 16+ com simulador iOS 26 (ou iOS 17+ para desenvolvimento sem Liquid Glass)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Setup

1. Clone o repo
2. Copie `.env.example` → `.env` e preencha as variáveis
3. Instale dependências: `npm install`
4. Inicie o app: `npm run ios`

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run ios` | Abre no simulador iOS |
| `npm run type-check` | Verifica TypeScript sem compilar |
| `npm run lint` | Roda ESLint |
| `npm run format` | Formata código com Prettier |

## Estrutura

Ver `docs/architecture.md` para estrutura de pastas completa.

## Bundle ID

`com.doseday.premium` (preservado da V4)

## Supabase Project

`pjesgdczasumgjzqyzzk`

## RevenueCat Project

`proj521a5bc0` — trial 14d configurado em produção
```

---

### Task 12: Validação + Commit final

**Files:**
- Nenhum novo arquivo

- [ ] **Step 12.1:** Checar TypeScript

```bash
npx tsc --noEmit
```
Expected: zero erros

- [ ] **Step 12.2:** Verificar bundle ID

```bash
grep -o 'com.doseday.premium' app.json
```
Expected: `com.doseday.premium`

- [ ] **Step 12.3:** Testar no simulador

```bash
npx expo start --ios
```
Expected: app abre, exibe "DoseDay" + "V5 — Inicializando"

- [ ] **Step 12.4:** Commit final

```bash
git add .
git commit -m "feat(bootstrap): Expo SDK 55 + TypeScript strict + Expo Router + deps core

Bundle ID: com.doseday.premium
Stack: Expo 55, React Native, TypeScript strict, Expo Router, i18next,
React Query, date-fns, zod, @expo/ui, expo-secure-store, expo-haptics"
```

- [ ] **Step 12.5:** Configurar remote e push

```bash
git remote add origin https://github.com/leomeirae/doseday-v5.git
git push -u origin feature/00-bootstrap
```

---

## Self-Review (spec coverage)

| Critério do Prompt 00 | Tarefa que cobre |
|---|---|
| Expo SDK 54+ criado | Task 2 (SDK 55, satisfaz 54+) |
| bundleIdentifier = com.doseday.premium | Task 3 |
| TypeScript strict | Task 4 |
| Expo Router instalado e configurado | Task 2 + Task 3 (plugin) + Task 8 |
| App roda no simulador iOS 26+ | Task 12.3 |
| Estrutura de pastas alinhada com architecture.md | Task 7 |
| Dependências core instaladas | Task 6 |
| Git inicializado + primeiro commit + remote | Task 1 + Task 12 |
| tsc --noEmit passa sem erros | Task 12.1 |
| Expo CLI sem warnings críticos | Task 12.3 |
| README.md básico | Task 11 |

**Nota:** Tela inicial é "DoseDay / V5 — Inicializando" em vez de "Hello World" — mais representativo, ainda básico.
