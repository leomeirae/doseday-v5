# CONTEXT.md — Glossário do domínio DoseDay V5

Termos canônicos compartilhados entre PO, designers e código. Toda decisão arquitetural relevante referencia o vocabulário daqui.

---

## Diário (`quick_logs`)

- **memória** — nota livre do paciente. Texto curto sem tipo nem intensidade. Rota: `/diario/anotar-memoria`. Armazenada em `quick_logs` com `log_type='other'` e `intensity=null`.
- **sintoma** — tipo enumerado (`nausea`, `headache`, `fatigue`, `diarrhea`, `constipation`, `heartburn`, `injection_pain`, `alcohol`, `feeling_good`) + intensidade `Leve` (1) / `Moderado` (2) / `Forte` (3). Rota: `/diario/quick-log?type=<sintoma>`. Armazenada em `quick_logs` com `log_type=<sintoma>` e `intensity` preenchido.
- **nota:** o valor `'other'` em `QUICK_LOG_TYPES` é **shape de storage legado**, não conceito de UI. UI redireciona `type=other` (ou ausente) pra `/diario/anotar-memoria` via guard em `app/diario/quick-log.tsx`. Rows históricos com `log_type='other'` permanecem visíveis na timeline como "Memória adicionada."
