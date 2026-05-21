# CLAUDE.md — `lib/i18n/`

**Escopo:** convenções locais do bootstrap i18next + namespaces do DoseDay V5.
**Carregamento:** este arquivo é carregado aditivamente quando Claude Code entra em `lib/i18n/` ou `locales/`. Soma ao CLAUDE.md root, não substitui.

---

## 1. Stack e regra de ouro

O DoseDay V5 usa **i18next + react-i18next** com 3 idiomas:

| Idioma | Status | Default |
|---|---|---|
| `pt-BR` | Canônico — copy revisado pelo PO | ✅ Fallback de toda chave faltante |
| `en` | Opt-in — traduzido | — |
| `es` | Opt-in — traduzido | — |

**Regra canônica:** TODA tela do app que renderiza texto usa `useTranslation('<namespace>')`. Zero string hardcoded em JSX. Zero `i18next.t(...)` direto fora de hook.

---

## 2. Adicionar namespace novo — checklist obrigatório

Esta sequência é a fonte mais comum de bug i18n no projeto (ver Aprendizado #53 + BUG-i18n-Account no PR #35).

| # | Ação | Onde |
|---|---|---|
| 1 | Criar `locales/pt-BR/<namespace>.json` com as chaves traduzidas | `locales/pt-BR/` |
| 2 | Criar `locales/en/<namespace>.json` com as mesmas chaves traduzidas pra inglês (ou marcar TODO temporário) | `locales/en/` |
| 3 | Criar `locales/es/<namespace>.json` com as mesmas chaves traduzidas pra espanhol (ou marcar TODO temporário) | `locales/es/` |
| 4 | **Adicionar import** no `lib/i18n/index.ts` (3 linhas, uma por idioma) | `lib/i18n/index.ts` |
| 5 | **Registrar entrada** no bloco `resources` de cada idioma (`pt-BR`, `en`, `es`) | `lib/i18n/index.ts` |
| 6 | Usar `useTranslation('<namespace>')` no consumer | `app/**/*.tsx` |
| 7 | Validar via screenshot real que renderiza texto, não chave crua | `react-native-devtools-mcp` |

**Cuidado mortal:** pular o passo 4 ou 5 = a tela renderiza chaves cruas (`header.title` em vez de "Conta"). É bug silencioso — i18next devolve a chave como fallback. Causou P0 Confiança no DoseDay (PR #35).

---

## 3. Estrutura canônica de cada `<namespace>.json`

Keys em camelCase, hierarquia rasa (max 2 níveis), sem chaves dinâmicas:

```json
{
  "header": {
    "title": "Conta"
  },
  "name": {
    "label": "Nome",
    "placeholder": "Como devemos te chamar",
    "saveButton": "Salvar",
    "savingButton": "Salvando...",
    "errors": {
      "minLength": "Nome muito curto"
    }
  }
}
```

Regras:
- **Sem placeholders genéricos** (`label.NAME` ou `BUTTON_SAVE`) — sempre semânticos
- **Erros agrupados** em `errors.*` dentro do contexto
- **Botões com sufixo de estado** (`saveButton` + `savingButton` pra loading)
- **Helpers e captions** em sub-chaves (`hint`, `caption`, `description`)

---

## 4. Anti-padrões

- ❌ **String hardcoded em JSX**: `<Text>Conta</Text>` — sempre `t('header.title')`
- ❌ **Chamar i18next.t() fora de hook**: usar `useTranslation()` que respeita re-render
- ❌ **Concatenar strings i18n** com `+` ou template literal pra montar frase: usar interpolação `t('msg', { name })`
- ❌ **Pluralização manual**: usar `t('item', { count })` com `item_one`, `item_other`
- ❌ **Esquecer fallback**: chaves opcionais devem ter `t('key', 'Fallback string')` ou sempre existir no JSON
- ❌ **Copy clínico em copy de UI**: este arquivo é técnico (i18n). Voice & Tone clínico vive em `docs/PRODUCT.md`

---

## 5. Voice & Tone (referência)

Copy do DoseDay segue regras estritas — ver `docs/PRODUCT.md` seção Voice & Tone. Resumo aplicável aqui:

- 2ª pessoa, calmo, sem hype, sem emoji
- Zero "Parabéns!!", zero exclamação dramática
- Errors com tom acolhedor: "Não consegui salvar. Tente novamente." (NÃO "ERRO! TENTE NOVAMENTE.")
- Disclaimers clínicos em namespaces específicos (`onboarding.json`, `result.disclaimer`) — texto canônico vem de `docs/PRODUCT.md`

---

## 6. Locale detection

O bootstrap usa `expo-localization` pra detectar idioma do device, com fallback `pt-BR`:

```typescript
const detectedLocale = Localization.getLocales()[0]?.languageTag ?? 'pt-BR'

i18n.use(initReactI18next).init({
  resources,
  lng: detectedLocale,
  fallbackLng: 'pt-BR',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})
```

**Não mudar** `defaultNS` sem ADR — pode quebrar telas legadas. **Não desativar** `fallbackLng` — toda chave faltante em en/es cai em pt-BR.

---

## 7. Quando criar ADR sobre i18n

ADR em `docs/adr/` se a decisão tocar:

- Trocar de biblioteca (i18next → outro)
- Mudar `defaultNS`
- Adicionar 4º idioma (significa custo permanente de tradução de todo namespace novo)
- Mover copy clínico pra Edge Function (responsabilidade compartilhada)
- Lazy-loading de namespaces (hoje todos carregam no init)

Decisões cirúrgicas (adicionar key nova, renomear chave dentro de namespace) NÃO precisam de ADR.

---

**Fim do `lib/i18n/CLAUDE.md`.**
