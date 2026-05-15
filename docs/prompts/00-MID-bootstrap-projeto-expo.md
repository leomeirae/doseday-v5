# DoseDay V5 — Prompt 00-MID-bootstrap-projeto-expo

**Instância de destino:** ☑ Aba única (Aba 1) — Léo está na pasta principal
**Worktree:** `dose-day-v5/` (pasta principal — worktrees paralelos só serão criados após este prompt)
**Branch a criar:** `feature/00-bootstrap` (ou trabalhar direto em `main` se for o primeiro commit do repo vazio)
**Caveman:** N/A (decisão estratégica: não usar no projeto)

> **Importante:** este é o ÚNICO prompt que roda em 1 instância só. Worktrees paralelos (Code-LOW, Code-MID-feature, Code-HIGH) só serão criados após o bootstrap concluir. Veja `docs/architecture.md` seção 11.0.

## Contexto obrigatório (leia antes de qualquer coisa)

- `/Users/leofrancaia/Desktop/dose-day-v5/docs/plano-estrategico-v5.md` — fonte da estratégia
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/skills-stack.md` — quais skills usar e quando
- `/Users/leofrancaia/Desktop/dose-day-v5/docs/prompts/README.md` — regras anti-pirraça + template
- Pasta de referência (não copy-paste — só consulta): `/Users/leofrancaia/Desktop/Dose-Day-Jules-1/`

## Objetivo desta tarefa

Bootstrapar o projeto Expo do zero em `/Users/leofrancaia/Desktop/dose-day-v5/`, deixando o app rodando "Hello World" no simulador iOS, conectado ao MESMO bundle ID (`com.doseday.premium`), com a stack completa decidida no plano estratégico. Após este prompt, devo ter um app funcional que abre, tem TypeScript estrito, segue a estrutura de pastas decidida, e está pronto pra receber a tab bar nas próximas etapas.

## Critérios de aceitação

- [ ] Projeto Expo SDK 54+ criado em `/Users/leofrancaia/Desktop/dose-day-v5/`
- [ ] `bundleIdentifier` em `app.json` igual a `com.doseday.premium`
- [ ] TypeScript estrito ativado (`strict: true`, sem `any` implícito)
- [ ] Expo Router instalado e configurado (file-based routing)
- [ ] App roda no simulador iPhone 17 Pro com iOS 26+ mostrando uma tela inicial básica
- [ ] Estrutura de pastas alinhada com `architecture.md` (será criado neste prompt ou referenciado)
- [ ] Dependências core instaladas (lista abaixo)
- [ ] Git inicializado, primeiro commit feito, remoto apontando pra `github.com/leomeirae/doseday-v5`
- [ ] `tsc --noEmit` passa sem erros
- [ ] Expo CLI rodando sem warnings críticos
- [ ] README.md básico do repo com instruções de como rodar

## Restrições explícitas

- **NÃO** copiar código da pasta `Dose-Day-Jules-1` — usar apenas como referência consciente. Tudo é reescrito limpo
- **NÃO** instalar Tailwind ou NativeWind. V5 usa StyleSheet nativo
- **NÃO** instalar Redux. Estado via React Query + Context API
- **NÃO** instalar libs de componente UI prontas (NativeBase, RN Paper, etc.). Componentes serão feitos com Impeccable
- **NÃO** rodar `/impeccable teach` agora — fica pro Prompt 02
- **NÃO** conectar Supabase/RevenueCat agora — fica pro Prompt 03
- Manter compatibilidade iOS 26+ como target principal
- Localização padrão: `pt-BR`

## Dependências core a instalar

```
expo (SDK 54+)
expo-router
expo-status-bar
expo-splash-screen
expo-system-ui
expo-font
expo-localization
expo-secure-store
expo-haptics
expo-blur
@expo/ui (Liquid Glass nativo iOS 26+)
react-native (versão pareada com Expo SDK)
typescript
@types/react
i18next + react-i18next
@tanstack/react-query
date-fns
zod (validação de schemas)
```

## Estrutura de pastas inicial proposta

```
/Users/leofrancaia/Desktop/dose-day-v5/
├── app/                          # Expo Router (file-based)
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Tela inicial Hello DoseDay
│   └── +not-found.tsx            # 404
├── components/                   # Componentes reutilizáveis
│   └── .gitkeep
├── lib/                          # Utilitários, clients
│   ├── i18n/
│   │   └── index.ts
│   └── theme/
│       └── tokens.ts             # Stub — preenchido após /impeccable teach
├── hooks/                        # React hooks
│   └── .gitkeep
├── locales/                      # i18n
│   ├── pt-BR/
│   │   └── common.json
│   ├── en/
│   │   └── common.json
│   └── es/
│       └── common.json
├── assets/                       # Imagens, fontes, ícones
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── docs/                         # Já existe — não tocar
│   ├── plano-estrategico-v5.md
│   ├── skills-stack.md
│   └── prompts/
├── app.json                      # Config Expo
├── package.json
├── tsconfig.json
├── eas.json                      # EAS Build config
├── .gitignore
├── .env.example                  # Template das env vars (sem secrets reais)
└── README.md
```

## Antes de executar, RETORNE:

### A) Skills que vai utilizar

| Fase | Skill | Por quê |
|---|---|---|
| Planejamento | ? | ? |
| Implementação | ? | ? |
| Validação | ? | ? |

(Você Claude Code preenche essa tabela com base em `/docs/skills-stack.md`.)

### B) Plano de execução

Lista numerada de etapas com checkpoints onde eu (Léo) posso aprovar/pausar.

### C) Riscos identificados

Quais coisas podem dar errado e como você vai mitigar.

### D) Arquivos que vai criar/editar

Tabela com cada arquivo + ação + resumo.

### E) Como vai validar

- [ ] `tsc --noEmit` passa
- [ ] `npx expo start` sobe sem erros
- [ ] Simulador iOS 26+ abre o app
- [ ] Git status limpo após primeiro commit
- [ ] Bundle ID confirmado `com.doseday.premium`
- [ ] Estrutura de pastas igual à proposta

## ⏸️ Pause aqui e aguarde aprovação do Léo antes de executar.

---

## Observação adicional pro Claude Code

Este é o PRIMEIRO prompt da V5. Define o tom dos próximos. Capriche em:

1. Plano detalhado — vou olhar com lupa
2. Skills bem justificadas — não chuta, consulta `/docs/skills-stack.md`
3. Commits descritivos
4. README do projeto com instruções claras (`npm install`, `npx expo start --ios`, etc.)
5. Não inventar bibliotecas que não estão na lista

Se algo na lista de dependências parecer obsoleto ou substituível por algo melhor (Expo SDK 54+ pode ter mudado), você sinaliza no plano com proposta de alternativa. Eu decido.
