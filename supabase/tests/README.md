# Authorization and clinical-risk regression checks

After applying migrations to a disposable local Supabase database, run:

```sh
psql "$LOCAL_SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/authorization_and_risk.sql
```

Use the local database owner. The test creates synthetic fixtures in a transaction
and rolls them back. It exercises the real profile trigger, RLS, RPC privileges,
coordinator/admin writes, quality-director denial, cross-hospital denial, anonymous
execution denial, unassigned signups, invalid risk values, null overrides, and
stale completion updates. It does not contact a deployed application or notify anyone.

## Provisioning and existing-account audit

New staff accounts must be created through a trusted admin process using the
Supabase Admin API's `app_metadata: { hospital_id, role }`. The demo provisioning
script follows this pattern. `user_metadata` is editable by users and supplies
only the display name. A public signup without trusted app metadata receives a
profile with no hospital membership and consequently cannot read hospital data.

The migration deliberately preserves existing profile rows. Before rollout,
review every existing `profiles.hospital_id` and `profiles.role` against trusted
staff/invitation records. Revoke incorrect assignments through an authorized
administrative process. Do not backfill app metadata or profiles from existing
user metadata: that would preserve the original trust vulnerability. Updating
app metadata on an existing user does not rerun the insert-only profile trigger;
any approved membership change must also update the profile through a trusted
admin process. The demo script skips existing accounts and does not remediate them.

Coordinators and admins can set or clear `risk_override` only for patients in
their own hospital through `set_patient_risk_override(p_patient_id, p_risk)`.
Quality directors retain read-only access. No general patient UPDATE policy is
added. Invalid, inaccessible, and missing targets fail rather than silently
reporting success.

Stored check-in risk can only increase, and an escalated check-in stays escalated.
The database retains previous summary findings across retries/stale writes.
Clinical staff may adjust displayed risk through the separate manual override;
they cannot clear the underlying check-in's clinical history through this RPC.
