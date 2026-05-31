-- CreateEnum
CREATE TYPE "DesignPresetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReusableBlockStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BlockTemplateType" AS ENUM ('PAGE', 'SECTION', 'HEADER', 'FOOTER', 'LOOP', 'SINGLE');

-- CreateTable
CREATE TABLE "PostMeta" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaMeta" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMeta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryMeta" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagMeta" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TagMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "DesignPresetStatus" NOT NULL DEFAULT 'DRAFT',
    "tokens" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "BlockTemplateType" NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "blocks" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReusableBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "status" "ReusableBlockStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReusableBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostMeta_key_idx" ON "PostMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PostMeta_postId_key_key" ON "PostMeta"("postId", "key");

-- CreateIndex
CREATE INDEX "MediaMeta_key_idx" ON "MediaMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MediaMeta_mediaId_key_key" ON "MediaMeta"("mediaId", "key");

-- CreateIndex
CREATE INDEX "UserMeta_key_idx" ON "UserMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_userId_key_key" ON "UserMeta"("userId", "key");

-- CreateIndex
CREATE INDEX "CategoryMeta_key_idx" ON "CategoryMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMeta_categoryId_key_key" ON "CategoryMeta"("categoryId", "key");

-- CreateIndex
CREATE INDEX "TagMeta_key_idx" ON "TagMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "TagMeta_tagId_key_key" ON "TagMeta"("tagId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "DesignPreset_slug_key" ON "DesignPreset"("slug");

-- CreateIndex
CREATE INDEX "DesignPreset_status_idx" ON "DesignPreset"("status");

-- CreateIndex
CREATE INDEX "DesignPreset_createdById_idx" ON "DesignPreset"("createdById");

-- CreateIndex
CREATE INDEX "DesignPreset_updatedById_idx" ON "DesignPreset"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "BlockTemplate_slug_key" ON "BlockTemplate"("slug");

-- CreateIndex
CREATE INDEX "BlockTemplate_type_idx" ON "BlockTemplate"("type");

-- CreateIndex
CREATE INDEX "BlockTemplate_status_idx" ON "BlockTemplate"("status");

-- CreateIndex
CREATE INDEX "BlockTemplate_createdById_idx" ON "BlockTemplate"("createdById");

-- CreateIndex
CREATE INDEX "BlockTemplate_updatedById_idx" ON "BlockTemplate"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "ReusableBlock_slug_key" ON "ReusableBlock"("slug");

-- CreateIndex
CREATE INDEX "ReusableBlock_blockType_idx" ON "ReusableBlock"("blockType");

-- CreateIndex
CREATE INDEX "ReusableBlock_status_idx" ON "ReusableBlock"("status");

-- CreateIndex
CREATE INDEX "ReusableBlock_createdById_idx" ON "ReusableBlock"("createdById");

-- CreateIndex
CREATE INDEX "ReusableBlock_updatedById_idx" ON "ReusableBlock"("updatedById");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "PostMeta" ADD CONSTRAINT "PostMeta_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaMeta" ADD CONSTRAINT "MediaMeta_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMeta" ADD CONSTRAINT "UserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryMeta" ADD CONSTRAINT "CategoryMeta_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagMeta" ADD CONSTRAINT "TagMeta_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignPreset" ADD CONSTRAINT "DesignPreset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignPreset" ADD CONSTRAINT "DesignPreset_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockTemplate" ADD CONSTRAINT "BlockTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockTemplate" ADD CONSTRAINT "BlockTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableBlock" ADD CONSTRAINT "ReusableBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReusableBlock" ADD CONSTRAINT "ReusableBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
