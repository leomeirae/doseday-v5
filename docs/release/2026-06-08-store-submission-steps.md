# Store Submission — DoseDay V5 5.0.0 (build 12)

**Para:** Léo · **Data:** 2026-06-08 · **App Store Connect:** Dose Day App (`com.doseday.premium`, ascAppId `6756668672`)

> Este doc é o passo-a-passo do **submit**. O Claude Code apenas **verificou** o estado da loja via MCP — **não** criou versão e **não** submeteu nada. Tudo abaixo é manual, feito por você.

---

## Build path: Xcode → TestFlight (NÃO EAS)

Decisão travada: o build e o upload do binário são feitos via **Xcode Archive → Organizer → Distribute → TestFlight/App Store**, **não** via EAS Build.

- O campo `extra.eas.projectId` foi **removido** do `app.json` (era um placeholder `<PREENCHER_COM_EAS_INIT>` que já causava erro 400 de push token — ver memória #257; remoção é neutra-ou-melhor, não regressão). Não rodar `eas init`.

**Build number 12 — onde fica o quê (projeto usa Expo CNG / prebuild):**

Este projeto tem `ios/` e `android/` no `.gitignore` (Continuous Native Generation). Ou seja: **o único arquivo de build number versionado no repo é o `app.json`**. Os arquivos nativos são artefatos gerados por `expo prebuild` a partir do `app.json`.

| Fonte | Campo | Valor | Status |
|---|---|---|---|
| `app.json` | `ios.buildNumber` | 12 | ✅ **versionado no repo** (fonte de verdade / CNG) |
| `ios/DoseDay/Info.plist` | `CFBundleVersion` | 12 | ⚙️ gitignored — editado **localmente nesta máquina** p/ o archive sair 12 |
| `ios/DoseDay.xcodeproj/project.pbxproj` (Debug) | `CURRENT_PROJECT_VERSION` | 12 | ⚙️ gitignored — idem |
| `ios/DoseDay.xcodeproj/project.pbxproj` (Release) | `CURRENT_PROJECT_VERSION` | 12 | ⚙️ gitignored — idem |

`version` / `CFBundleShortVersionString` seguem **5.0.0**.

**Importante p/ o archive:**
- **Não precisa rodar `expo prebuild`.** O `ios/` desta máquina já está em build 12 — pode abrir o Xcode e arquivar direto.
- O archive lê os arquivos nativos; como eles já estão em 12, o build que sobe pra Apple é o **12**, sem ajuste manual no Xcode.
- Se um dia o `ios/` for regenerado (`expo prebuild`), o `app.json` (=12) mantém tudo consistente automaticamente.

---

## Estado da loja (verificado via MCP App Store Connect — 2026-06-08)

| Item | Estado | Ação |
|---|---|---|
| **Versão 5.0.0 na App Store** | ❌ **NÃO existe.** Maior versão hoje é 4.1.0 (READY_FOR_SALE) | **Criar** versão 5.0.0 (passo 2) |
| **IAP `mensal_premium`** | ✅ APROVADO (auto-renewable subscription), linkado ao app | Nenhuma |
| **IAP `anual_premium`** | ✅ APROVADO (auto-renewable subscription), linkado ao app | Nenhuma |
| **Webhook RevenueCat (S2S)** | ✅ Configurado (subscriptionStatusUrl → RevenueCat, V2) | Nenhuma |
| **Bundle ID** | ✅ `com.doseday.premium` | Nenhuma |
| **Idioma primário** | ✅ pt-BR | Nenhuma |
| **Links Termos / Privacidade no listing** | ⚠️ Não confirmável 100% via MCP | **Verificar na UI** (passo 4) |
| **App Privacy (data collection / nutrition labels)** | ⚠️ Não confirmável via MCP | **Verificar na UI** (passo 4) |

> Versões existentes na loja (todas READY_FOR_SALE): 4.1.0, 4.0.1, 3.3.0, 2.0, 1.0.2, 1.0.1, 1.0. Nenhuma 5.x.

---

## Passo-a-passo do submit (manual, por você)

### 1. Archive build 12 no Xcode
1. Abrir `ios/DoseDay.xcworkspace` no Xcode
2. Selecionar destino **Any iOS Device (arm64)**
3. **Product → Archive**
4. No Organizer: **Distribute App → App Store Connect → Upload**
5. Aguardar o build 12 processar no App Store Connect (alguns minutos, status "Processing")

### 2. Criar a versão 5.0.0 na App Store Connect
1. App Store Connect → **Dose Day App** → aba **Distribution / App Store**
2. Botão **＋ (Add Version or Platform)** → iOS → versão **5.0.0**

### 3. Anexar o build 12
1. Na página da versão 5.0.0, seção **Build** → **＋** → selecionar o **build 12** (depois que terminar "Processing")
2. Responder a pergunta de export compliance (o app declara `ITSAppUsesNonExemptEncryption = false`, então normalmente é "No")

### 4. Verificar listing, privacidade e metadata
1. **Privacy Policy URL** e **Support/Marketing URL**: confirmar preenchidos na aba **App Information** (Termos/Privacidade)
2. **App Privacy** (data collection): confirmar o questionário preenchido (App Store Connect → App Privacy)
3. **Promotional Text / Description / Keywords**: revisar pt-BR
4. **What's New (Novidades desta versão)** — sugestão de copy:
   > Nesta versão: paywall e tela de boas-vindas repaginados, opção de mostrar/ocultar senha, e melhorias na Memória do Tratamento (resumo de IA com variação total de peso e sintomas em português). Correções de estabilidade.

### 5. Screenshots
1. Confirmar screenshots 6.7" (e demais tamanhos exigidos) atualizados na página da versão 5.0.0
2. Se reaproveitar de 4.1.0, validar que ainda refletem a UI atual

### 6. Submeter para revisão
1. Revisar tudo (build 12 anexado, IAPs incluídos se for primeira submissão dos produtos, metadata, screenshots, App Privacy)
2. **Add for Review → Submit to App Review**

---

## Checklist rápido pré-submit
- [ ] Build 12 processado e anexado na versão 5.0.0
- [ ] Versão 5.0.0 criada
- [ ] What's New preenchido (pt-BR)
- [ ] Screenshots atualizados
- [ ] Privacy Policy URL + App Privacy confirmados
- [ ] IAPs mensal_premium / anual_premium presentes (já APROVADOS)
- [ ] Export compliance respondido
- [ ] Submit to App Review
