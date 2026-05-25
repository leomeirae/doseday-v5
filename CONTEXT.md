# CONTEXT.md — Glossário do domínio DoseDay V5

Termos canônicos compartilhados entre PO, designers e código. Toda decisão arquitetural relevante referencia o vocabulário daqui.

---

## Diário (`quick_logs`)

- **memória** — nota livre do paciente. Texto curto sem tipo nem intensidade. Rota: `/diario/anotar-memoria`. Armazenada em `quick_logs` com `log_type='other'` e `intensity=null`.
- **sintoma** — tipo enumerado (`nausea`, `headache`, `fatigue`, `diarrhea`, `constipation`, `heartburn`, `injection_pain`, `alcohol`, `feeling_good`) + intensidade `Leve` (1) / `Moderado` (2) / `Forte` (3). Rota: `/diario/quick-log?type=<sintoma>`. Armazenada em `quick_logs` com `log_type=<sintoma>` e `intensity` preenchido.
- **nota:** o valor `'other'` em `QUICK_LOG_TYPES` é **shape de storage legado**, não conceito de UI. UI redireciona `type=other` (ou ausente) pra `/diario/anotar-memoria` via guard em `app/diario/quick-log.tsx`. Rows históricos com `log_type='other'` permanecem visíveis na timeline como "Memória adicionada."

## Captura na Home v7 (a partir do Prompt 37)

- **sheet** — modal iOS Form Sheet (`presentation: 'formSheet'` do Expo Router 6+) com detents (fractions 0-1 ou `'fitToContents'`) que mantém dashboard visível atrás. Usado para todos os entries de dados na Home v7: dose, peso, sintoma, nota, custo. Substitui o padrão anterior de `presentation: 'modal'` (tela cheia push-screen).
- **Notas** — substitui o termo "memória" como label de UI. "Notas recentes" substitui "Memória recente" no header do bloco da Home; toast diz "Nota anotada" (era "Memória registrada"). O conceito-guarda-chuva do produto continua sendo **"memória do tratamento"** (frase de norte) — só o vocabulário de captura mudou. Rota e storage permanecem: `/diario/anotar-memoria` insere em `quick_logs` com `log_type='other'` via `useRegisterMemoryNote`.
- **Frequentes (sintomas)** — chips dos top 5 `symptom_type` (excluindo `'other'`) que o próprio usuário registrou mais vezes nos últimos 30 dias. Renderizados apenas no sheet `/diario/anotar-sintoma`. Atalho de digitação, não condicionante. Query SQL pura via `lib/supabase/queries/symptoms.ts:fetchFrequentSymptoms`, agrupamento JS-side. Zero IA. Quando o usuário tem 0 sintomas registrados nos últimos 30 dias, a seção "Frequentes" não é renderizada (sem label órfão).
