# Reta final DoseDay V5 — brief de escopo (release readiness)

**Data:** 2026-06-01 · **Autor:** Cowork (PO/consultor), com Léo
**Natureza:** documento de DIREÇÃO/escopo. O plano de EXECUÇÃO detalhado é do Claude Code → `docs/superpowers/plans/2026-06-01-release-readiness-paywall-freemium.md`.
**Princípio:** simplicidade, confiabilidade, foco em release. Cirúrgico. Sem onboarding cinematográfico, sem refatorar o app.

---

## Frente 1 — Fluxo inicial (welcome + auth)

Tela de boas-vindas simples + escolher **criar conta / entrar**, reusando o máximo de signin/signup que já existem. Sem animação complexa, sem fluxo longo antes da conta.

Promessa em poucos segundos: *"DoseDay ajuda você a registrar seu tratamento e lembrar o que aconteceu entre uma consulta e outra."*

**Estado:** `app/(welcome)/index.tsx` e `app/(auth)/{signin,signup,recover}.tsx` já existem. Esforço **BAIXO** — montar/ajustar o welcome + estado de escolha. (Há lixo `signin 2.tsx`/`signup 2.tsx` na árvore — duplicados macOS, ignorar/limpar.)

## Frente 2 — Paywall (RevenueCat)

Paywall simples, bonito, confiável: título claro, benefícios Premium, plano mensal/anual (via RevenueCat), CTA assinar/trial, **restaurar compra**, estados **loading/erro/sucesso**, texto de segurança ("cancele quando quiser / 14 dias grátis").

**Estado — ATENÇÃO (verificado 2026-06-01):** **greenfield.** Não há `react-native-purchases` no `package.json`, nem código de paywall/entitlement no app. A `architecture.md` descreve a estrutura planejada (`(paywall)/paywall.tsx`, `lib/revenuecat/`, `locales/paywall.json`), mas **nada foi construído**. O projeto RevenueCat existe no dashboard (trial 14d em produção). Então paywall = **construir**, não "finalizar". Esforço **ALTO** + dependências externas.

### Subfases do paywall (ordem de construção)

1. **UI/estados do paywall** — tela + estados loading/erro/sucesso, com dados mockados. Não depende de RevenueCat.
2. **Provider central de Subscription/Entitlement** — `SubscriptionProvider` + hook `useEntitlements()` como **fonte ÚNICA** do "é premium?". Nenhuma tela consulta RevenueCat direto nem espalha `isPremium`.
3. **Mock de entitlement (DEV-only)** — flag de desenvolvimento que liga/desliga premium **sem compra real**, pra validar UI + regras freemium/premium mesmo se RevenueCat/App Store Connect atrasarem. **Nunca em produção** (guard por `__DEV__`/build flag; sem caminho de ativação em release).
4. **Integração RevenueCat SDK** — instalar `react-native-purchases`, configurar chaves, dev build EAS. O `useEntitlements()` passa a ler o entitlement real (mock vira fallback dev).
5. **Purchase / restore / offering real** — comprar, restaurar, listar planos vindos do RevenueCat/App Store (preço/plano **nunca hardcoded**).
6. **Gating premium** — aplicar `useEntitlements()` nos pontos premium (IA, insights, relatório, exportação, análise avançada); ao tocar → paywall.

> O mock (subfase 3) desacopla o trabalho release-crítico (UI + regras + gating) das dependências externas (chaves, IAP). Dá pra entregar e validar tudo isso hoje; subfases 4-5 entram quando as credenciais/IAP estiverem prontas.

### Compliance (obrigatório no paywall e na IA)

- **Sem promessa de resultado médico.** A IA é apresentada como **organização/resumo dos dados**, não orientação médica.
- **Restore purchase visível.** Termos e Privacidade acessíveis na tela.
- **Preço/plano vêm do RevenueCat/App Store**, nunca hardcoded.

## Frente 3 — Freemium vs Premium

**Frase-guia: "Freemium registra. Premium entende."**

| Freemium (grátis) | Premium |
|---|---|
| Criar conta, onboarding, configurar tratamento | IA |
| Registrar dose, peso, sintoma, nota/memória, custo | Resumos inteligentes |
| Dashboard/Home, histórico básico | Insights de padrões |
| Configurações, lembretes básicos | Relatório pro médico |
| | Exportar/compartilhar relatório (se existir/previsto) |
| | Análise avançada do histórico |
| | Cards/insights premium na Home |

Regras: não bloquear o app inteiro; bloquear IA/relatórios/insights; ao tocar em premium → paywall; usar previews/copy de conversão.

**Estado:** sem gating premium no código hoje. Precisa do **contexto de entitlement** da Frente 2 (`useEntitlements()`). Esforço **MÉDIO**.

**Decisão de produto travada:** **Freemium = usuário autenticado SEM assinatura ativa.** NÃO criar modo anônimo agora — registro e histórico básico/manual exigem conta. Premium desbloqueia IA, insights, relatório inteligente/exportável e análise avançada. Não bloquear recursos básicos de registro.

## Frente 4 — Bugs QA

- **4A** notas no modal de peso · **4B** custos inconsistentes (dashboard vs tela Custos).
- **✅ JÁ RESOLVIDOS no PR #99 (mergeado 2026-06-01).** Não re-planejar.

---

## Ordem de execução sugerida

1. ~~QA (peso/custos)~~ — **feito (#99).**
2. Welcome + auth (baixo, reuso).
3. Paywall **UI/estados** (subfase 1) + **`SubscriptionProvider`/`useEntitlements()`** (subfase 2) + **mock dev-only** (subfase 3).
4. **Gating freemium/premium** (subfase 6) usando `useEntitlements()` — validável já com o mock.
5. **RevenueCat SDK + purchase/restore/offering real** (subfases 4-5) — quando chaves/IAP/dev build estiverem prontos.
6. Validação do fluxo completo: install limpo → welcome → criar conta → login → onboarding → uso freemium → tocar IA/relatório → paywall → (mock ou compra real) → restore → premium ativo.

> Passos 3-4 entregam e validam a experiência inteira com o mock, sem depender do externo. Passo 5 troca o mock pelo real.

## Riscos

- **Paywall é greenfield + nativo:** instalar `react-native-purchases` exige **dev build EAS** (não roda em Expo Go). Testar compra/restore exige produto IAP no App Store Connect + sandbox tester. Isto é o maior risco de prazo de "fechar hoje".
- Gating premium mal-calibrado pode bloquear recurso básico (violar "Freemium não pode ser inútil") — seguir a matriz acima à risca.
- Entitlement como fonte única: evitar checagens espalhadas; centralizar num contexto/hook.

## Decisões que dependem do Léo (bloqueiam a Frente 2)

1. **Chaves RevenueCat (iOS)** — existem/estão acessíveis? Onde guardar (env/app config)?
2. **Produtos IAP no App Store Connect** — mensal/anual já criados e linkados no RevenueCat? (RevenueCat precisa deles pra listar planos.)
3. **Dev build EAS** — ok gerar um novo dev client pra testar o SDK nativo?
4. **Lista premium final** — confirmar a matriz acima (IA, relatórios, insights, export, análise avançada). Os itens "exportar/compartilhar relatório" e "análise avançada" existem hoje ou são previstos?

## Critérios de aceite (específicos)

- Instalação limpa mostra o welcome.
- Signup e signin funcionam.
- Usuário grátis registra dose, peso, sintoma, nota e custo (sem parede).
- Usuário grátis, ao tocar IA / relatório / insight → vê o paywall.
- Usuário premium NÃO vê paywall nesses recursos.
- Restore atualiza o estado premium.
- Offerings com erro → fallback amigável (não tela quebrada).
- **Nenhum mock premium em produção** (guard `__DEV__`/build flag verificável).
- type-check + lint limpos.
- Screenshots reais no PR.
