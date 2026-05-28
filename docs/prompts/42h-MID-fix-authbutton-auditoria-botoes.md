# Prompt 42h — MID — Fix AuthButton disabled + Auditoria geral de botões de salvar + investigação "Done" no peso

**Skills obrigatórias:** `karpathy-guidelines`, `superpowers:writing-plans`, `react-native-best-practices`
**Branch:** `feature/42h-fix-authbutton-completo`
**Pré-requisito:** PR #90 mergeado em `main`
**Agente recomendado:** Claude Code (Antigravity teve 2 tentativas frágeis nesse prompt)
**Tipo:** fix de componente central + auditoria global + investigação

---

# Objetivo

Resolver 3 problemas relacionados a botões de salvamento de dados que o PO identificou ao testar o app pós-PR #90:

1. **`AuthButton` em estado disabled fica praticamente invisível.** Atualmente `styles.disabled` usa `backgroundColor: colors.bgSurface` (#1B2433) sobre `bgBase` (#050B12) — diferença visual ~3% de luminância. Botão desaparece.

2. **Auditoria geral:** PO identificou múltiplos botões de salvar SEM destaque adequado em diversas telas. Confirmar se todos usam `AuthButton` (fix do componente central propaga) OU se há `Pressable + Text` cru ("Remover data" provavelmente) que precisam tratamento próprio.

3. **"Done" em inglês** no sheet `/peso/registrar`. Investigar onde vem (keyboard accessory? returnKeyType? componente terceiro?) e traduzir/corrigir.

# Contexto

PO reportou bugs em sequência testando essas telas (todas com botão de salvar problemático):

- `/perfil/protocolo` → "Salvar protocolo" disabled
- `/configuracoes/tratamento/medico` → "Salvar acompanhamento" + "Remover data"
- `/configuracoes/lembretes` (verificar)
- `/peso/registrar` (sheet) → botão de salvar + "Done" no keyboard
- `/dose/registrar` (sheet) → botão de salvar
- `/memoria` → "Salvar sintoma" inline
- `/diario/anotar-memoria` (sheet) → "Registrar"
- `/diario/anotar-sintoma` (sheet) → similar
- `/diario/anotar-custo` (sheet) → similar

Estado real (validado via Bash):
- `components/ui/AuthButton.tsx` L60-90: `styles.disabled` com `backgroundColor: colors.bgSurface + borderColor: colors.bgSurface`. Vai sumir contra fundo escuro.
- `colors.brand` = `#00D4AA` (mint do design system)
- `colors.brandDim` = `#00B894` (versão "dim" do brand, já existe — pode ser útil)
- `colors.bgBase` = `#050B12`, `colors.bgSurface` = `#1B2433`
- Padrão iOS HIG: botões disabled mantêm cor base com opacidade reduzida — **não viram preto sobre preto**

Decisões de design:
- Estado disabled precisa ser **claramente um botão** (forma visível) mas **desativado** (não vibrante)
- Solução: usar cor brand com luminosidade reduzida ou opacity. **Garantir contraste WCAG 4.5:1 para texto** no estado disabled.
- Estados `primary` (ativo) e `secondary` (border) ficam intactos.

# Antigravity tentou e falhou (2 vezes)

A 1ª tentativa do Antigravity (`rgba(0, 212, 170, 0.30)` sólido) ficou tão escuro que sumiu. A 2ª tentativa (`rgba(0, 212, 170, 0.12)` bg + border `rgba(0, 212, 170, 0.50)` 1px) afirmou funcionar, mas o resultado visual ainda não convenceu o PO + as alterações nem foram pushed.

**Por isso vamos com Claude Code dessa vez e prompt mais detalhado.**

# O que analisar antes de alterar

1. **Ler `components/ui/AuthButton.tsx` completo** — entender styles `primary`, `secondary`, `disabled`, `pressed`, `label`, `labelPrimary`, `labelSecondary`, e se existe `labelDisabled`.

2. **Auditar TODOS os usos de `AuthButton` no app:**
   ```bash
   grep -rln "AuthButton" app/ components/ | head -30
   grep -rn "disabled=" app/ components/ | grep -i "authbutton\|button" | head -20
   ```
   Listar telas onde aparece, confirmar que o fix do componente central propaga.

3. **Auditar botões que NÃO são AuthButton mas funcionam como "salvar"/"ação":**
   ```bash
   grep -rn "Remover\|Salvar\|Registrar" app/ --include="*.tsx" | grep -v "AuthButton\|//" | head -30
   ```
   Identificar se há `Pressable + Text` cru ou `TouchableOpacity` com texto sem styling visível.

4. **Inspecionar `app/peso/registrar.tsx` completo** + `components/ui/TextField.tsx` — investigar onde vem o "Done":
   - Procurar `returnKeyType`, `keyboardType`, `KeyboardAccessoryView`, `InputAccessoryView`
   - Se "Done" for nativo iOS sem hook, reportar e discutir antes de tocar em `info.plist` ou `app.json`
   - Cuidado: pode ser o **keyboard nativo iOS em inglês** porque o app não tem localização declarada — solução seria adicionar `pt-BR` em algum config

5. **Verificar `colors.brandDim` em `lib/theme/tokens.ts`** — confirmar valor exato. Útil pra disabled.

6. **Verificar contraste WCAG** — texto branco (`textInverse` ou `textPrimary`?) sobre o novo background do disabled precisa atingir ≥4.5:1 (texto normal) ou ≥3:1 (texto grande/bold). Validar com ferramenta de contraste **ou** ajustar empiricamente até parecer legível em screenshot dark mode.

# Arquivos prováveis

**Modificar:**
- `components/ui/AuthButton.tsx` — fix `styles.disabled` + possivelmente `labelDisabled`
- Possivelmente `components/ui/TextField.tsx` ou `app/peso/registrar.tsx` — depende da causa do "Done"
- Possivelmente `app.json` ou `app/_layout.tsx` — se "Done" exigir config de localização iOS

**Possivelmente modificar (auditoria):**
- Telas onde existir botão "Salvar" como `Pressable + Text` cru sem styling (corrigir um caso à vontade, se for trivial)

**NÃO modificar:**
- Telas que usam AuthButton — fix propaga via componente central
- `lib/theme/tokens.ts` (usar cores existentes + opacity literal)
- Hooks, queries, schemas
- Configurações de NativeWind, Tailwind, etc

# Instruções

## 1. Fix do `styles.disabled` em AuthButton.tsx

Princípios:
- Estado disabled visível como **botão fantasma** com identidade da marca
- Não pode sumir contra `bgBase`
- Deve ter **contraste claro entre background e border**
- Deve manter **identidade mint** (não cinza neutro)

**Solução proposta (validar com Claude Code antes):**

```diff
   disabled: {
-    backgroundColor: colors.bgSurface,
-    borderColor: colors.bgSurface,
+    backgroundColor: colors.bgSurface,           // fundo levemente elevado, distinguível
+    borderWidth: 1,
+    borderColor: colors.brandDim,                // border MINT DIM = identidade preservada + affordance visível
+    opacity: 0.7,                                // opacidade global pra suavizar todo o conjunto
   },
```

E garantir que texto continua legível:

```diff
+  labelDisabled: {
+    color: colors.brand,  // texto MINT (não branco fraco) — fica claramente visível na borda
+  },
```

E aplicar `labelDisabled` quando `isDisabled` for true:

```tsx
<Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary, isDisabled && styles.labelDisabled]}>
```

**Alternativa caso a primeira não convença visualmente:**
- Aumentar `opacity` pra 0.5
- Ou trocar `backgroundColor` pra `colors.bgElevated` (#0E1620) com border mais opaca

**Claude Code deve testar EMPIRICAMENTE no simulador** e ajustar até parecer correto. Anexar screenshot ANTES e DEPOIS no PR.

## 2. Auditoria global

Rodar os greps listados na seção "O que analisar". Reportar:
- Lista de telas que usam AuthButton (devem ser corrigidas automaticamente)
- Lista de telas com botões "salvar"/"ação" que NÃO são AuthButton — propor fix individual no PR ou anotar pra prompt futuro
- Em particular: **"Remover data"** em `/configuracoes/tratamento/medico.tsx` — qual componente usa? Se for Pressable cru, corrigir.

## 3. Investigação do "Done" no peso

Passos:
- Ler `components/ui/TextField.tsx` completo
- Ler `app/peso/registrar.tsx` completo (não só primeiros 90 lines)
- Identificar onde vem o "Done"
- Reportar:
  - Causa exata
  - Solução proposta
  - Se exige mudança em config (`app.json`, info.plist), parar e discutir

## 4. Validação local

```bash
npm run type-check
npm run lint
npx expo start --clear
```

No simulador iOS, validar **antes e depois**:

1. `/perfil/protocolo` → botão "Salvar protocolo":
   - **Antes:** invisível
   - **Depois:** visível como botão fantasma mint, claramente disabled
   - Após mudar o campo: botão fica primary mint completo
2. `/configuracoes/tratamento/medico` → botões "Salvar acompanhamento" e "Remover data"
3. `/peso/registrar` → botão de salvar + keyboard com "Done"
4. `/dose/registrar` → botão de salvar
5. `/memoria` → "Salvar sintoma" inline

Capturar **6 screenshots em `assets/screenshots/prompt42h/`**:
- AuthButton disabled NOVO (em pelo menos 2 telas)
- AuthButton primary NOVO (confirmar que não quebrou)
- Sheet /peso/registrar com keyboard mostrando "Done" → diagnóstico
- "Remover data" antes/depois (se aplicável)
- Screenshot comparativo ANTES (do main) vs DEPOIS

## 5. Commit + PR

**ATENÇÃO CRÍTICA — REGRA QUEBROU 3 VEZES (PRs 42d, 42f, 42g):**

```bash
git status --short  # VALIDAR PRIMEIRO
# Se houver QUALQUER graphify-out/* ou .codegraph/* no staging:
git restore --staged graphify-out/ .codegraph/
git status --short  # VALIDAR DE NOVO
# Só então commitar
git add -A
git status --short  # VALIDAR UMA TERCEIRA VEZ
git commit -m "fix(ui): AuthButton disabled visível + auditoria de botões + diagnóstico Done peso"
git push -u origin feature/42h-fix-authbutton-completo
```

Abrir PR via MCP GitHub. Description deve confirmar EXPLICITAMENTE: "git status validado 3× pré-commit, ZERO `graphify-out/*` ou `.codegraph/*` no PR."

# O que preservar

- **Variants `primary` e `secondary` do AuthButton** intactas — só corrige `disabled`
- **Componentes que usam AuthButton** intocados (telas)
- **Lógica de `isDirty`/`disabled`** das telas intacta
- **Settings Hub, Dashboard, NativeWind, hooks, queries** intocados

# Critérios de sucesso (verificáveis)

- [ ] `grep "colors.bgSurface" components/ui/AuthButton.tsx` retorna match APENAS em `styles.secondary` (não em `styles.disabled`)
- [ ] `grep "rgba\|opacity\|brandDim" components/ui/AuthButton.tsx` mostra que disabled tem identidade mint visível
- [ ] `styles.labelDisabled` existe e é aplicado quando `isDisabled` for true
- [ ] Screenshot ANTES/DEPOIS prova visualmente que botão disabled saiu de "invisível" pra "visível como fantasma"
- [ ] `npm run type-check` passa
- [ ] `npm run lint` passa
- [ ] 6 screenshots em `assets/screenshots/prompt42h/`
- [ ] `git diff --stat` mostra apenas arquivos esperados (AuthButton.tsx + investigação do peso + screenshots + plano + docs)
- [ ] `git status --short` confirma **ZERO** `graphify-out/*`, `.codegraph/*`, `prompt42a-g` antigos
- [ ] PR description menciona "git status validado 3× pré-commit"
- [ ] Walkthrough do PR lista telas onde AuthButton foi auditado (afetadas pelo fix global)
- [ ] Walkthrough relata causa do "Done" no peso (mesmo que não corrija, diagnóstico claro)

# Restrições

- **Não criar novo variant** ("ghost", "outline") — só corrigir `disabled`.
- **Não tocar em `lib/theme/tokens.ts`** — usar `colors.brand`, `colors.brandDim` existentes + opacity literal se necessário.
- **Não migrar AuthButton pra NativeWind**.
- **Não tocar em hooks, queries, schemas**.
- **Não ampliar escopo pra refactor de outras telas** — auditoria é só pra IDENTIFICAR, não pra refatorar tudo.
- **Não tocar em `info.plist`, `app.json` localizações** sem confirmar com PO.
- **Parar e reportar** se a solução visual não estiver convincente após 2 tentativas — não pode falhar como o Antigravity.
- **Validar `git status --short` 3× antes de `git add`** — anti-contaminação é crítica.

---

**Karpathy assumptions explícitos:**
- Fix do `AuthButton.styles.disabled` é causa raiz da maioria dos botões "invisíveis" reportados
- Pode haver casos isolados de `Pressable + Text` cru (ex: "Remover data") que precisam tratamento próprio
- "Done" no peso pode ser keyboard nativo iOS sem hook — exige investigação antes de fix
- `colors.brandDim` existe (#00B894) e pode ser usado como border do disabled
- WCAG ≥4.5:1 deve ser respeitado entre texto e fundo do disabled

**Could 50 lines do this?** O fix do AuthButton é ~10 linhas. Auditoria não muda código (só investiga). Done pode ser 1-3 linhas. Total: ~15-30 linhas em código de produção.

**Success criteria verificáveis:** ver checklist acima. Screenshots ANTES/DEPOIS são obrigatórios.

**Próximos passos (roadmap, não dependência):**
- Pós merge: ciclo Prompt 42 fechado de vez (a-h completo)
- Se auditoria identificar bugs visuais em telas que NÃO são AuthButton (ex: Remover data, chips de tratamento médico) → Prompt 42i pra esses casos
- Próximo tema grande: pre-ship App Store ou refinamento adicional
