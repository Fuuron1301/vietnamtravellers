-- Phase B: revision support for block templates and reusable blocks.
ALTER TYPE "CmsRevisionEntity" ADD VALUE IF NOT EXISTS 'BLOCK_TEMPLATE';
ALTER TYPE "CmsRevisionEntity" ADD VALUE IF NOT EXISTS 'REUSABLE_BLOCK';

ALTER TABLE "Revision" ADD COLUMN IF NOT EXISTS "blockTemplateId" TEXT;
ALTER TABLE "Revision" ADD COLUMN IF NOT EXISTS "reusableBlockId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Revision_blockTemplateId_fkey'
  ) THEN
    ALTER TABLE "Revision"
      ADD CONSTRAINT "Revision_blockTemplateId_fkey"
      FOREIGN KEY ("blockTemplateId") REFERENCES "BlockTemplate"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Revision_reusableBlockId_fkey'
  ) THEN
    ALTER TABLE "Revision"
      ADD CONSTRAINT "Revision_reusableBlockId_fkey"
      FOREIGN KEY ("reusableBlockId") REFERENCES "ReusableBlock"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Revision_blockTemplateId_idx" ON "Revision"("blockTemplateId");
CREATE INDEX IF NOT EXISTS "Revision_reusableBlockId_idx" ON "Revision"("reusableBlockId");
