# Karpathy Guidelines — DoseDay V5

> Diretrizes anti-erros LLM. Carregar quando relevante (`@docs/karpathy.md`).

Derivadas das observações de Andrej Karpathy sobre pitfalls comuns de LLMs em coding.

**Tradeoff:** Estas diretrizes priorizam cautela sobre velocidade. Em tarefas triviais (typo fix, one-liners óbvios), use julgamento — nem toda mudança precisa do rigor completo. O objetivo é reduzir erros custosos em trabalho não-trivial, não desacelerar tarefas simples.

## 1. Think Before Coding

Antes de implementar:
- Apresente assumptions explicitamente. Se incerto, pergunte.
- Se múltiplas interpretações existem, apresente-as — não escolha silenciosamente.
- Se uma abordagem mais simples existe, diga. Questione quando necessário.
- Se algo está confuso, pare. Nomeie o que está confuso. Pergunte.

## 2. Simplicity First

- Sem features além do que foi pedido.
- Sem abstrações para código de uso único.
- Sem "flexibilidade" ou "configurabilidade" não solicitada.
- Sem error handling para cenários impossíveis.
- Se você escreveu 200 linhas e poderia ser 50, reescreva.

## 3. Surgical Changes

Ao editar código existente:
- Não "melhore" código adjacente, comentários ou formatação.
- Não refatore o que não está quebrado.
- Mantenha o estilo existente, mesmo que faria diferente.
- Se notar dead code não relacionado, mencione — não delete.

Quando suas mudanças criarem órfãos:
- Remova imports/variáveis/funções que SUAS mudanças tornaram unused.
- Não remova dead code pré-existente sem ser solicitado.

## 4. Goal-Driven Execution

Transforme tarefas em metas verificáveis:
- "Adicionar validação" → "Escrever testes para inputs inválidos, depois fazê-los passar"
- "Corrigir o bug" → "Escrever teste que reproduz, depois fazê-lo passar"

Para tarefas multi-step, apresente plano breve antes de executar:
```
1. [Passo] → verificar: [critério]
2. [Passo] → verificar: [critério]
3. [Passo] → verificar: [critério]
```

## Project-Specific Guidelines (DoseDay V5)

- TypeScript strict mode em todos os arquivos — zero `as any` sem justificativa
- Queries Supabase ficam em `lib/supabase/queries/`
- Hooks React Query ficam em `hooks/`
- Validação via Zod schemas em `lib/validation/`
- Seguir padrões de error handling existentes em `lib/supabase/queries/errors.ts`
