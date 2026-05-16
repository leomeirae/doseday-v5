# Prompt 05-LOW-remover-fontfamily-system

**Branch:** `feature/05-remover-fontfamily-system`
**Pré-requisito:** Prompt 04 mergeado em `main`.

## Contexto

No Prompt 04 (tab bar) descobrimos que `fontFamily: 'system'` em `lib/theme/tokens.ts` **não é fonte válida em React Native** — gera warning e pode quebrar render. Solução: remover esse campo de todos os tokens de typography. Omitir o `fontFamily` deixa o RN usar a font default do sistema (que é exatamente o que queremos — SF Pro no iOS).

## Tarefa

Remover o campo `fontFamily: 'system'` de TODOS os tokens em `typography` no arquivo `lib/theme/tokens.ts`.

Manter `fontFamily: 'SF Mono, monospace'` no `monoData` (esse é específico e válido).

## Critérios de aceitação

- [ ] Arquivo `lib/theme/tokens.ts`: remover `fontFamily: 'system'` de display, headline, title, subtitle, body, bodyClinical, label, caption, tabLabel, numberLarge, numberMedium
- [ ] Manter `monoData.fontFamily: 'SF Mono, monospace'`
- [ ] `tsc --noEmit` zero erros
- [ ] `npx expo run:ios` abre sem warnings novos sobre font
- [ ] Commit: `chore(theme): remove fontFamily 'system' inválido em RN`
- [ ] PR + merge

## Restrições

- Sem mudar VALORES de fontSize, fontWeight, lineHeight
- Sem mexer em outros tokens (colors, spacing, radius, elevation)
- Sem instalar libs

## Validação rápida

```bash
grep "fontFamily" lib/theme/tokens.ts
```

Esperado: aparece SÓ 1 linha — `monoData: { fontFamily: 'SF Mono, monospace', ... }`. Nenhuma outra ocorrência.
