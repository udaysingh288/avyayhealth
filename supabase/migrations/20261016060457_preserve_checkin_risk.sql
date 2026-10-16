-- Concurrent/stale completion requests must not erase an earlier clinical risk.
-- The per-row UPDATE lock makes this guard apply to the latest stored state.
-- Clinical staff can adjust the displayed risk via patients.risk_override.
create or replace function public.preserve_checkin_risk()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(array_position(array['green', 'yellow', 'red'], old.risk_level), 0)
    > coalesce(array_position(array['green', 'yellow', 'red'], new.risk_level), 0)
  then
    new.risk_level := old.risk_level;
  end if;

  if old.status = 'escalated' or new.risk_level = 'red' then
    new.status := 'escalated';
  end if;

  -- Retain prior findings while accepting a new cumulative summary or adding
  -- distinct new information. Exact retries do not duplicate the summary.
  if nullif(old.summary, '') is not null then
    if nullif(new.summary, '') is null then
      new.summary := old.summary;
    elsif strpos(new.summary, old.summary) = 0 then
      if strpos(old.summary, new.summary) > 0 then
        new.summary := old.summary;
      else
        new.summary := old.summary || E'\n' || new.summary;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger preserve_checkin_risk_before_update
before update on public.check_ins
for each row execute function public.preserve_checkin_risk();
