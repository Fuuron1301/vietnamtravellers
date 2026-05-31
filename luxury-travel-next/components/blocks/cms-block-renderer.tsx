'use client';

import type { CmsBlockNode, ReusableBlockMap } from '@/lib/blocks/block-types';
import { renderBlock } from '@/lib/blocks/block-renderer';

export function CmsBlockRenderer({ blocks, reusableBlocks }: { blocks: CmsBlockNode[]; reusableBlocks?: ReusableBlockMap }) {
  return <>{blocks.map((block) => renderBlock(block, reusableBlocks))}</>;
}
