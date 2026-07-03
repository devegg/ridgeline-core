-- Add 'scheduled_delete' as a valid status across all entities.
-- Owner reviews flagged records on the /cleanup page before permanently deleting.

ALTER TABLE clients     DROP CONSTRAINT clients_status_check;
ALTER TABLE clients     ADD  CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'prospective', 'past', 'archived', 'scheduled_delete'));

ALTER TABLE projects    DROP CONSTRAINT projects_status_check;
ALTER TABLE projects    ADD  CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'on_hold', 'completed', 'archived', 'scheduled_delete'));

ALTER TABLE proposals   DROP CONSTRAINT proposals_status_check;
ALTER TABLE proposals   ADD  CONSTRAINT proposals_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'archived', 'scheduled_delete'));

ALTER TABLE assessments DROP CONSTRAINT assessments_status_check;
ALTER TABLE assessments ADD  CONSTRAINT assessments_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'scheduled_delete'));

ALTER TABLE deliverables DROP CONSTRAINT deliverables_status_check;
ALTER TABLE deliverables ADD  CONSTRAINT deliverables_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'delivered', 'scheduled_delete'));

ALTER TABLE invoices    DROP CONSTRAINT invoices_status_check;
ALTER TABLE invoices    ADD  CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'scheduled_delete'));
