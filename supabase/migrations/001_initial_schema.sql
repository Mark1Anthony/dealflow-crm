-- ============================================================
-- DealFlow CRM — Initial Schema Migration
-- ============================================================

-- ---------- helper: auto-update updated_at ----------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. pipeline_stages
-- ============================================================

CREATE TABLE pipeline_stages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name       text        NOT NULL,
  position   int         NOT NULL,
  color      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_stages_select" ON pipeline_stages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "pipeline_stages_insert" ON pipeline_stages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "pipeline_stages_update" ON pipeline_stages FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "pipeline_stages_delete" ON pipeline_stages FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER set_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. contacts
-- ============================================================

CREATE TABLE contacts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name       text        NOT NULL,
  email      text,
  phone      text,
  company    text,
  position   text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_contacts_user_id ON contacts (user_id);

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. deals
-- ============================================================

CREATE TABLE deals (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title          text        NOT NULL,
  value          int,
  contact_id     uuid        REFERENCES contacts ON DELETE SET NULL,
  stage_id       uuid        NOT NULL REFERENCES pipeline_stages,
  expected_close date,
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON deals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "deals_insert" ON deals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "deals_update" ON deals FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "deals_delete" ON deals FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_deals_user_stage ON deals (user_id, stage_id);
CREATE INDEX idx_deals_contact    ON deals (contact_id);

CREATE TRIGGER set_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. notes
-- ============================================================

CREATE TABLE notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content    text        NOT NULL,
  contact_id uuid        REFERENCES contacts ON DELETE CASCADE,
  deal_id    uuid        REFERENCES deals ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT notes_requires_parent CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL)
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_notes_contact ON notes (contact_id);
CREATE INDEX idx_notes_deal    ON notes (deal_id);

-- ============================================================
-- 5. activities
-- ============================================================

CREATE TABLE activities (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task')),
  description  text        NOT NULL,
  contact_id   uuid        REFERENCES contacts ON DELETE CASCADE,
  deal_id      uuid        REFERENCES deals ON DELETE CASCADE,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_activities_user_created ON activities (user_id, created_at DESC);

-- ============================================================
-- 6. tags
-- ============================================================

CREATE TABLE tags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name       text        NOT NULL,
  color      text,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select" ON tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 7. contact_tags
-- ============================================================

CREATE TABLE contact_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags ON DELETE CASCADE,

  UNIQUE (contact_id, tag_id)
);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_tags_select" ON contact_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_tags.contact_id AND contacts.user_id = auth.uid()));

CREATE POLICY "contact_tags_insert" ON contact_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_tags.contact_id AND contacts.user_id = auth.uid()));

CREATE POLICY "contact_tags_update" ON contact_tags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_tags.contact_id AND contacts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_tags.contact_id AND contacts.user_id = auth.uid()));

CREATE POLICY "contact_tags_delete" ON contact_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_tags.contact_id AND contacts.user_id = auth.uid()));
