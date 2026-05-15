alter table public.reports
  add column if not exists flagged_for_qc boolean default false;

alter table public.reports
  add column if not exists qc_flag_reason text;

create index if not exists idx_reports_flagged_for_qc
  on public.reports (flagged_for_qc)
  where flagged_for_qc = true;
