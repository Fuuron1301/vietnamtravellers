'use client';

import { useState } from 'react';
import { CmsBlockRenderer } from '@/components/blocks/cms-block-renderer';
import type { CmsBlockNode, ReusableBlockMap } from '@/lib/blocks/block-types';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportWidth: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px'
};

export function BlockPreviewPanel({
  blocks,
  reusableBlocks
}: {
  blocks: CmsBlockNode[];
  reusableBlocks?: ReusableBlockMap;
}) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  return (
    <div className="space-y-[10px]">
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <p className="text-[12px] text-[#646970]">Live preview uses the same CMS block renderer and current design CSS variables.</p>
        <div className="flex rounded-[2px] border border-[#c3c4c7] bg-white">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setViewport(item)}
              className={`px-[10px] py-[5px] text-[12px] ${viewport === item ? 'bg-[#2271b1] text-white' : 'text-[#2271b1] hover:bg-[#f0f0f1]'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto rounded-[4px] border border-[#c3c4c7] bg-[#dcdcde] p-[12px]">
        <div
          className="mx-auto min-h-[280px] bg-[color:var(--cms-color-background)] p-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
          style={{ width: viewportWidth[viewport], maxWidth: '100%' }}
        >
          {blocks.length ? <div className="space-y-6"><CmsBlockRenderer blocks={blocks} reusableBlocks={reusableBlocks} /></div> : <div className="grid min-h-[220px] place-items-center border border-dashed border-[#c3c4c7] text-[#646970]">Add blocks to preview.</div>}
        </div>
      </div>
    </div>
  );
}
