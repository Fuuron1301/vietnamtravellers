import { CmsBlockRenderer } from '@/components/blocks/cms-block-renderer';
import { getActiveTemplateBlocks, getReusableBlockMap } from '@/lib/blocks/cms-runtime';
import type { CmsBlockNode } from '@/lib/blocks/block-types';

export async function CmsBlockRuntime({
  blocks,
  className = 'bg-[color:var(--cms-color-background)] px-4 py-[var(--cms-space-section-y)]'
}: {
  blocks?: CmsBlockNode[] | Array<Record<string, unknown>>;
  className?: string;
}) {
  const safeBlocks = Array.isArray(blocks) ? blocks as CmsBlockNode[] : [];
  if (!safeBlocks.length) return null;
  const reusableBlocks = await getReusableBlockMap();
  return (
    <section className={className} data-cms-runtime="blocks">
      <div className="mx-auto max-w-7xl space-y-8">
        <CmsBlockRenderer blocks={safeBlocks} reusableBlocks={reusableBlocks} />
      </div>
    </section>
  );
}

export async function ActivePageTemplateRuntime({ className }: { className?: string }) {
  const blocks = await getActiveTemplateBlocks('PAGE');
  return <CmsBlockRuntime blocks={blocks} className={className} />;
}
