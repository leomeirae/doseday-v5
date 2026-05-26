# DoseDay — Direcao de Configuracoes (Hub do Usuario)

**Data:** 2026-05-25
**Status:** documento de direcao. Nao e prompt de execucao.
**Referencia visual:** screenshots de "Ajustes" do app Shotsy (2026-05-25).
**Relacionado:** `docs/HOME_DESIGN_DIRECTION.md`, `docs/PRODUCT_COHERENCE.md`.

Este documento define a direcao da tela de Configuracoes do DoseDay como **hub completo** do que o usuario pode customizar — nao apenas configuracoes de app (conta, deletar, notificacoes), mas **tambem parametros do proprio tratamento** (medicacao, protocolo, peso meta, acompanhamento medico).

---

## 1. Decisao central

Configuracoes deixa de ser tela secundaria (conta + sair + deletar). Vira **hub unico de personalizacao** acessivel via icone de engrenagem **suspenso/sempre visivel** na Home.

A intencao e:

1. Permitir ao usuario editar tudo que pode mudar sobre si e sobre o tratamento — sem reabrir o onboarding (decisao §6 do PRODUCT_COHERENCE: "Onboarding e entrada. Perfil/Configuracoes e manutencao").
2. **Eliminar a tab bar inferior** quando Configuracoes existir como hub suficiente. A tab bar atual e provisoria; remocao gated pela conclusao deste hub.
3. Espelhar a clareza de apps como Shotsy: lista agrupada iOS-native, grupos por funcao, cards com `icone + label + chevron`.

---

## 2. Padrao visual

Lista **agrupada iOS-native** (grouped sections), com:

| Elemento | Direcao |
|---|---|
| Container do grupo | Card com `bg-elevated` + radius generoso + sem border duro |
| Linha | Icone outline (16-20px) a esquerda + label + chevron a direita |
| Separadores internos | Hairline `#1C2330` ou equivalente do token |
| Header de grupo | Opcional — preferir grupos sem header textual, usando apenas spacing entre cards |
| Background tela | Mesmo graphite da Home (`#0B1017`) — consistencia visual |
| Tipografia | System/SF Pro; sem serifa; sem display |
| Acento mint | Somente CTA primario ativo; nunca decoracao ou estado comum |

Cards podem ter ate 5-7 itens. Acima disso, dividir em multiplos cards por categoria.

---

## 3. Estrutura proposta (6 grupos)

| Grupo | Itens | Onde ja existe |
|---|---|---|
| **Conta** | Email/perfil; Sua assinatura (RevenueCat); Sair | Logout existente migra para Conta quando Perfil vira ponte |
| **Tratamento** | Medicamento atual; Protocolo de dose (intervalo); Peso meta; Acompanhamento medico; Preocupacoes (`main_concerns`); Proxima consulta | Parcial — `/perfil/protocolo` existe |
| **Lembretes** | Notificacoes (horario, ativar/desativar); Lembretes contextuais | Existe em `user_settings.notifications_enabled` |
| **Dados** | Exportar meus dados (LGPD); Excluir minha conta; Historico de consentimento | `delete-user-account` EF existe; export pendente |
| **Privacidade** | Termos de Uso; Politica de Privacidade | URLs placeholder MVP |
| **Suporte** | Sobre o app (versao); FAQ; Contate-nos; Avalie este app; Compartilhar link | Inexistente |

**Footer global (exceto na própria tela Privacidade, para não repetir links):**

- Termos de Uso · Versao X.Y.Z (build) · Politica de Privacidade

---

## 4. Mapping Shotsy -> DoseDay

| Shotsy | DoseDay | Status |
|---|---|---|
| Sua Assinatura | Conta -> Sua assinatura | RevenueCat ativo |
| Unidades de Medida | (postergado) | v2 — kg/lb, mg, etc |
| Editar agendas | Tratamento -> Protocolo de dose | `/perfil/protocolo` |
| Altura & Peso Meta | Tratamento -> Peso meta | Altura ja decidida remover (§6) |
| Personalizar / Widgets | (postergado) | v2 |
| Medicamentos | Tratamento -> Medicamento atual | `user_profiles.current_medication/dose` |
| Notificacoes | Lembretes -> Notificacoes | `user_settings.notifications_enabled` |
| Dados Apple Saude | (fora escopo) | HealthKit nao integrado |
| Gerenciar Meus Dados | Dados -> Exportar / Excluir | LGPD |
| Status iCloud | (nao usamos) | Supabase cobre |
| Privacidade | Privacidade | `consent_history` |
| Sobre / FAQ / Avalie / Contate / Compartilhar | Suporte | A construir |
| Termos · Versao · Privacidade | Footer | Obrigatorio, exceto tela Privacidade |

**Itens UNICOS do DoseDay (alem de Shotsy):**

- **Acompanhamento medico** (`doctor_name`, `has_medical_support`) — capturado no onboarding, editavel aqui
- **Preocupacoes** (`main_concerns`) — capturado no onboarding, editavel aqui
- **Proxima consulta** (`next_appointment_date`) — capturado no onboarding, editavel aqui

---

## 5. Acesso a Configuracoes

**Decisao:** botao de engrenagem **suspenso/sempre visivel** na Home substitui a aba Configuracoes da tab bar.

Localizacao sugerida:

| Opcao | Tradeoff |
|---|---|
| Header da Home (top-right) | Padrao iOS, mas pode competir com hero memory |
| Botao flutuante (FAB) bottom-right | Mais discreto durante scroll, mas FAB nao e nativo iOS |
| Header sempre fixo no topo | Sem competicao com hero, mas adiciona chrome persistente |

**Recomendacao:** **header top-right**, alinhado a regra "calma, sem chrome desnecessario". Icone outline (gear) em cor `semanticMuted`, nao mint.

---

## 6. Telas filhas (navegacao a partir do hub)

Cada item do hub abre uma sub-tela com formulario direto, sem progress bar, sem linguagem de onboarding (decisao §6).

Padroes:

| Tipo | UI | Exemplos |
|---|---|---|
| Selecao unica/multipla | Controle segmentado/lista com Salvar | Acompanhamento medico |
| Numerico com chips + input | Chips com presets + input livre | Protocolo (1/7/10/14 dias) |
| Texto curto | Input field + Salvar | Nome do medico |
| Toggle | Switch iOS | Notificacoes |
| Acao destrutiva | Tela dedicada com confirmacao | Excluir conta |
| Informacao sem editor MVP | Row read-only, sem chevron | Medicamento atual, Preocupacoes |

---

## 7. Regras de produto

- Configuracoes **nao reabre onboarding** (decisao §6 PRODUCT_COHERENCE).
- Editar protocolo de dose **nao apaga historico** — vale dali pra frente (decisao §6).
- Editar medicamento **nao apaga doses passadas** — historico preserva o medicamento em cada registro.
- Sair requer confirmacao; Excluir conta requer **confirmacao dupla** + revisao LGPD (consentimento, exportacao opcional).
- Nenhuma tela de configuracao chama IA paciente-facing (regra herdada da contencao P0).
- Sem "wellness", sem "coach", sem motivacional (§11.3 PRODUCT_COHERENCE).

---

## 8. Estado atual da `(tabs)/perfil.tsx`

No PR Settings Hub, a decisao tecnica foi criar uma nova rota **`/configuracoes`** como hub principal com 6 grupos: Conta, Tratamento, Lembretes, Dados, Privacidade e Suporte.

A tab **Perfil permanece neste PR** e passa a funcionar como ponte para o hub por meio da linha "Abrir Configuracoes". O logout legado e reposicionado em `Configuracoes > Conta` para a simplificacao nao retirar uma funcao essencial. A remocao da tab bar inteira nao faz parte deste PR; fica reservada para o PR futuro **Gear Icon**, depois do merge do hub.

Enquanto Perfil for a ponte, o hub exibe retorno explicito para Perfil. As telas
filhas usam header compacto compartilhado para preservar titulos em uma linha.

Status por area:

| Area | Estado no PR Settings Hub |
|---|---|
| Conta | Entrada única no hub; E-mail read-only + assinatura placeholder + Sair confirmado |
| Tratamento | Hub + peso meta + acompanhamento medico 3-way; medicamento/preocupacoes read-only no MVP |
| Lembretes | Toggle e horario em `user_settings` |
| Dados | Exportacao LGPD, historico de consentimento, excluir conta com confirmacao dupla |
| Privacidade | Termos/privacidade placeholders; Dados permanece destino LGPD unico |
| Suporte | FAQ placeholder, e-mail, avaliar, compartilhar, Sobre |

---

## 9. Sequencia recomendada de implementacao

A implementacao do PR Settings Hub segue etapas pequenas, sem substituir a tab bar de cara.

1. Criar `/configuracoes` como hub principal.
2. Implementar Conta, Tratamento, Lembretes, Dados, Privacidade e Suporte.
3. Registrar as rotas no Stack.
4. Transformar a tab Perfil em ponte para o hub.
5. Documentar decisoes em ADR 0007 e manter `CONTEXT.md` alinhado.
6. Validar com `type-check`, `lint`, simulador, screenshots reais, `/impeccable critique`, security-review LGPD e accessibility-review.
7. Em PR futuro **Gear Icon**, mover o acesso para engrenagem na Home.
8. **So no PR Gear Icon**, remover a tab "Perfil" da tab bar.

---

## 10. Guardrails

- Nao adicionar widgets, Apple Saude, iCloud na v1.
- Usar mint somente no CTA primario ativo; nunca como decoracao ou estado comum.
- Nao usar grupos com headers textuais grandes — preferir spacing.
- Nao usar cards brancos.
- Nao adicionar gradient.
- Nao adicionar glass em conteudo (glass continua restrito a navegacao quando aplicavel).
- Nao reabrir onboarding via Configuracoes.
- Nao tocar IA paciente-facing.

---

## 11. Frase de alinhamento

Configuracoes do DoseDay nao e tela de "ajustes do app". E o painel onde o usuario controla o proprio tratamento entre consultas.
