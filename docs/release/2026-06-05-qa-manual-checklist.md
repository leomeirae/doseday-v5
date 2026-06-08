# QA Manual — Build 12 (TestFlight) · DoseDay V5 5.0.0

**Para:** Léo · **Build:** 12 (CFBundleVersion 12, version 5.0.0) · **Canal:** TestFlight
**Como usar:** instale o build 12 pelo TestFlight no iPhone e percorra cada fluxo abaixo. Marque ✅/❌. Qualquer ❌ → anote o passo e mande print.

> Lembrete: o build 12 é o primeiro a conter o copy novo do paywall + welcome + olhinho de senha (PR #108). O build 11 (03/06) é anterior a isso.

## 1. Onboarding do zero
- [ ] Abrir o app pela 1ª vez (ou após reinstalar) → onboarding aparece do começo
- [ ] Avançar por todas as telas sem travar
- [ ] Insight final do onboarding aparece sem erro/flash

## 2. Cadastro / Login
- [ ] Criar conta nova (cadastro) → entra no app
- [ ] Sair e entrar de novo com a mesma conta (login) → funciona
- [ ] Mensagens de erro claras em senha errada / e-mail inválido

## 3. Olhinho de senha (toggle de visibilidade)
- [ ] Campo de senha começa oculto (•••)
- [ ] Tocar no olhinho → senha vira texto visível
- [ ] Tocar de novo → volta a ocultar
- [ ] Vale tanto na tela de cadastro quanto na de login

## 4. Registrar dose
- [ ] Registrar uma dose → salva e aparece no histórico/estado
- [ ] Valor e horário corretos

## 5. Registrar sintoma
- [ ] Registrar sintoma em texto livre (ex: "dor fraca", "náusea forte")
- [ ] Salva sem erro; intensidade coerente (fraca=leve, forte=forte)

## 6. Histórico
- [ ] Abrir Histórico → doses e sintomas registrados aparecem
- [ ] Sem tela em branco / crash

## 7. Memória do Tratamento (Premium)
- [ ] Com conta **premium**: abrir "Memória do Tratamento"
- [ ] Resumo de IA carrega
- [ ] Variação de peso aparece como **−7,2 kg** (variação total, não janela de 30d)
- [ ] Sintomas aparecem com **rótulos em PT** (náusea, dor de cabeça, etc.), não em inglês

## 8. Sessão (sair/entrar)
- [ ] Sair da conta → volta pra tela de login/welcome
- [ ] Entrar de novo → estado restaurado corretamente

## 9. Cold start sem flash de gate (Premium)
- [ ] Com conta **premium**: fechar o app de vez (swipe up) e reabrir
- [ ] No cold start, **não** pisca a tela de bloqueio/paywall antes de liberar o conteúdo premium

## 10. Restaurar compras após reinstalar
- [ ] Deletar o app e reinstalar pelo TestFlight
- [ ] Logar e usar "Restaurar compras"
- [ ] Entitlement premium volta sem precisar pagar de novo

## 11. SEM toggle DEV no TestFlight
- [ ] Em Configurações → Conta: **não** existe o botão "[DEV] Simular Premium"
- [ ] (Esse botão só aparece em build de desenvolvimento; no TestFlight deve estar ausente)

## 12. Free vs Premium (gate)
- [ ] Conta **free**: recurso premium mostra o gate/bloqueio (paywall)
- [ ] Conta **premium**: mesmo recurso aparece desbloqueado

---
**Resultado:** ____ ✅ / ____ ❌ · Observações:
