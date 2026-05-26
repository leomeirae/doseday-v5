# Handoff — PR Settings Hub final

**Data:** 2026-05-26  
**Branch:** `feature/38-settings-hub-screens`  
**Worktree:** `/private/tmp/dose-day-v5-settings-76`  
**Status:** implementação e validação final concluídas.

## Escopo entregue

- `/configuracoes` como hub principal com 6 grupos: Conta, Tratamento, Lembretes, Dados, Privacidade e Suporte.
- Tab `Perfil` mantida neste PR, mas reduzida a ponte real para o hub.
- Header compacto compartilhado para hub e sub-telas, com retorno visível.
- Conta com e-mail read-only, assinatura `Em breve` sem ação falsa e logout com confirmação.
- Tratamento com medicamento/preocupações read-only, protocolo, peso meta e acompanhamento 3-way.
- Dados como único destino LGPD: exportação, histórico de consentimento e exclusão com dupla confirmação.
- Privacidade limitada a Termos de Uso e Política de Privacidade, sem duplicar Dados.
- Suporte/Sobre com FAQ, contato, avaliação, compartilhamento e versão dinâmica.

## Decisões preservadas

- `next_appointment_date` em `user_profiles` é a fonte de Próxima consulta.
- `has_medical_support` é controle segmentado 3-way com copy do onboarding.
- URLs `https://dose-day.com/{termos,privacidade,faq}` seguem placeholder MVP.
- Tab bar inteira não sai neste PR; remoção fica para PR Gear Icon.

## Validação

- `npm run type-check`: PASS.
- `npm run lint`: PASS com 1 warning preexistente em `lib/i18n/index.ts`.
- Exportação real abriu share sheet no iPhone 17 simulator com JSON de 34 KB; não foi compartilhada.
- RLS anônima: 0 linhas retornadas nas 19 tabelas exportadas.
- RLS autenticada com `teste-22-maio@teste.com`: 0 linhas de outros usuários nas 19 tabelas.
- Screenshots reais: `assets/screenshots/settings-hub/`.

## Screenshots

- `00-perfil-ponte.png`
- `01-hub.png`
- `02-conta.png`
- `03-tratamento.png`
- `04-peso-meta-disabled.png`
- `04b-acompanhamento-disabled.png`
- `05-protocolo.png`
- `06-lembretes.png`
- `07-dados.png`
- `07-dados-consentimentos.png`
- `08-dados-delete-confirmacao.png`
- `09-privacidade.png`
- `10-suporte.png`
- `11-sobre.png`

## Atenções para PR

- `.codegraph/` está untracked e deve permanecer fora do commit.
- Branch local diverge do remoto do mesmo branch, mas está baseada em `origin/main` rebaseado. Push provavelmente precisa `--force-with-lease`.
- `delete-user-account` foi revisada estaticamente e usa JWT do usuário antes de `service_role`; não houve alteração em Edge Function.
