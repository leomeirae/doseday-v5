# DoseDay V5

**Memória inteligente do tratamento com canetas emagrecedoras (GLP-1)**

Stack: React Native + Expo SDK 54 · TypeScript strict · Expo Router · Supabase · RevenueCat · Anthropic SDK

---

## Pré-requisitos

- Node 20+
- Xcode 18 com simulador iOS 26 (para Liquid Glass nativo)
- `npm install -g eas-cli`

## Setup

```bash
# 1. Clone o repo
git clone https://github.com/leomeirae/doseday-v5.git
cd doseday-v5

# 2. Copie e preencha as variáveis de ambiente
cp .env.example .env

# 3. Instale dependências
npm install --legacy-peer-deps

# 4. Inicie o app no simulador iOS
npm run ios
```

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run ios` | Abre no simulador iOS |
| `npm run type-check` | Verifica TypeScript sem compilar |
| `npm run lint` | Roda ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run build:ios:dev` | Build development (simulador) via EAS |
| `npm run build:ios:prod` | Build production via EAS |

## Estrutura

Ver `docs/architecture.md` para estrutura completa de pastas.

## IDs do projeto

| Item | Valor |
|---|---|
| Bundle ID | `com.doseday.premium` |
| Supabase Project | `pjesgdczasumgjzqyzzk` |
| RevenueCat Project | `proj521a5bc0` |
| App Store App ID | `6756668672` |

## Variáveis de ambiente

Copie `.env.example` → `.env` e preencha:
- `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` — mesmos da V4
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` — app "Dose Day App" produção
- Chaves de IA (`ANTHROPIC_API_KEY`) ficam **somente** nas Edge Functions do Supabase — nunca no app
