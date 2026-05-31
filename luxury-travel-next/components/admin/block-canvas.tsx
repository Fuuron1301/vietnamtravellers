'use client';

import { useState } from 'react';
import { MediaPickerModal, type AdminMediaItem } from '@/components/admin/media-modal';
import type { CmsBlockNode, CmsBlockType } from '@/lib/blocks/block-types';
import {
  appendBlock,
  duplicateBlock,
  getBlockAtPath,
  indentBlock,
  insertBlock,
  moveBlock,
  outdentBlock,
  removeBlock,
  replaceBlock,
  type BlockPath
} from '@/lib/blocks/block-tree';

const blockTypes: CmsBlockType[] = ['hero', 'text', 'image', 'gallery', 'cta', 'tourGrid', 'blogGrid', 'container', 'reusable', 'customHtml'];
type AdminFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function pathKey(path: BlockPath) {
  return path.join('.');
}

function createBlock(type: CmsBlockType): CmsBlockNode {
  const id = `${type}-${Date.now()}`;
  const propsByType: Partial<Record<CmsBlockType, Record<string, unknown>>> = {
    hero: { eyebrow: 'Luxury Travel', title: 'New hero block', subtitle: 'Write a clear intro for this page.' },
    text: { content: 'Write your content here.' },
    image: { src: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg', alt: 'CMS image' },
    gallery: { images: [] },
    cta: { eyebrow: 'Start planning', title: 'Design a private journey', href: '/customize-your-trip/', label: 'Talk to a designer' },
    reusable: { slug: 'tailor-made-cta' },
    customHtml: { html: '' }
  };
  return { id, type, props: propsByType[type] || {}, ...(type === 'container' ? { children: [] } : {}) };
}

function BlockRow({
  block,
  path,
  level,
  selectedKey,
  draggedPath,
  onSelect,
  onDragStart,
  onDropPath
}: {
  block: CmsBlockNode;
  path: BlockPath;
  level: number;
  selectedKey: string;
  draggedPath: BlockPath | null;
  onSelect: (path: BlockPath) => void;
  onDragStart: (path: BlockPath) => void;
  onDropPath: (path: BlockPath, position: 'before' | 'after' | 'inside') => void;
}) {
  const children = block.children || [];
  const pathLabel = pathKey(path);
  const selected = selectedKey === pathLabel;
  return (
    <div className="space-y-[4px]">
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={() => onDragStart(path)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onDropPath(path, event.shiftKey && block.type === 'container' ? 'inside' : 'after');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onSelect(path);
        }}
        onClick={() => onSelect(path)}
        className={`rounded-[2px] border bg-white px-[10px] py-[8px] text-[13px] shadow-[0_1px_1px_rgba(0,0,0,0.04)] ${selected ? 'border-[#2271b1] ring-1 ring-[#2271b1]' : 'border-[#c3c4c7] hover:border-[#8c8f94]'}`}
        style={{ marginLeft: level ? level * 16 : 0 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-[8px]">
          <div className="min-w-0">
            <span className="mr-[8px] cursor-grab text-[#646970]" title="Drag to reorder">☰</span>
            <strong className="text-[#1d2327]">{block.type}</strong>
            <span className="ml-[8px] text-[12px] text-[#646970]">#{block.id}</span>
          </div>
          <div className="flex flex-wrap gap-[5px]">
            <button type="button" className="text-[#2271b1]" onClick={(event) => { event.stopPropagation(); onDropPath(path, 'before'); }} disabled={!draggedPath}>Drop before</button>
            {block.type === 'container' ? <button type="button" className="text-[#2271b1]" onClick={(event) => { event.stopPropagation(); onDropPath(path, 'inside'); }} disabled={!draggedPath}>Drop inside</button> : null}
          </div>
        </div>
      </div>
      {children.length ? (
        <div className="space-y-[4px]">
          {children.map((child, index) => (
            <BlockRow
              key={`${child.id}-${index}`}
              block={child}
              path={[...path, index]}
              level={level + 1}
              selectedKey={selectedKey}
              draggedPath={draggedPath}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDropPath={onDropPath}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BlockCanvas({
  blocks,
  onChange,
  adminFetch
}: {
  blocks: CmsBlockNode[];
  onChange: (blocks: CmsBlockNode[]) => void;
  adminFetch?: AdminFetcher;
}) {
  const [selectedPath, setSelectedPath] = useState<BlockPath>(blocks.length ? [0] : []);
  const [draggedPath, setDraggedPath] = useState<BlockPath | null>(null);
  const [newType, setNewType] = useState<CmsBlockType>('text');
  const [mediaOpen, setMediaOpen] = useState(false);
  const selected = selectedPath.length ? getBlockAtPath(blocks, selectedPath) : null;
  const selectedProps = selected ? JSON.stringify(selected.props || {}, null, 2) : '';

  function updateBlocks(nextBlocks: CmsBlockNode[]) {
    onChange(nextBlocks);
    if (!selectedPath.length && nextBlocks.length) setSelectedPath([0]);
  }

  function updateSelectedProps(value: string) {
    try {
      const props = JSON.parse(value) as Record<string, unknown>;
      updateBlocks(replaceBlock(blocks, selectedPath, (node) => ({ ...node, props })));
    } catch {
      // Keep typing until JSON becomes valid.
    }
  }

  function dropPath(target: BlockPath, position: 'before' | 'after' | 'inside') {
    if (!draggedPath) return;
    updateBlocks(moveBlock(blocks, draggedPath, target, position));
    setDraggedPath(null);
  }

  function addBlock(position: 'root' | 'after' | 'inside') {
    const node = createBlock(newType);
    if (position === 'root' || !selectedPath.length) {
      updateBlocks(appendBlock(blocks, node));
      setSelectedPath([blocks.length]);
      return;
    }
    if (position === 'inside' && selected?.type === 'container') {
      updateBlocks(replaceBlock(blocks, selectedPath, (current) => ({ ...current, children: [...(current.children || []), node] })));
      setSelectedPath([...selectedPath, selected.children?.length || 0]);
      return;
    }
    updateBlocks(insertBlock(blocks, selectedPath, node, 'after'));
  }

  function applyMediaToSelected(item: AdminMediaItem) {
    if (!selected) return;
    updateBlocks(replaceBlock(blocks, selectedPath, (node) => {
      const props = { ...(node.props || {}) };
      if (node.type === 'gallery') {
        const currentImages = Array.isArray(props.images) ? props.images.filter((entry): entry is string => typeof entry === 'string') : [];
        props.images = Array.from(new Set([...currentImages, item.url]));
      } else if (node.type === 'hero') {
        props.image = item.url;
        props.alt = item.altText || item.title;
      } else {
        props.src = item.url;
        props.image = item.url;
        props.alt = item.altText || item.title;
      }
      return { ...node, props };
    }));
  }

  return (
    <div className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-[8px]">
        <div className="flex flex-wrap items-center gap-[8px] rounded-[2px] border border-[#c3c4c7] bg-[#f6f7f7] p-[8px]">
          <select value={newType} onChange={(event) => setNewType(event.target.value as CmsBlockType)} className="min-h-[30px] rounded-[2px] border border-[#8c8f94] bg-white px-[8px] text-[13px]">
            {blockTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <button type="button" className="rounded-[2px] border border-[#2271b1] bg-[#2271b1] px-[10px] py-[5px] text-[13px] text-white" onClick={() => addBlock('root')}>Add block</button>
          <button type="button" className="rounded-[2px] border border-[#c3c4c7] bg-white px-[10px] py-[5px] text-[13px] text-[#2271b1]" onClick={() => addBlock('after')} disabled={!selected}>Add after selected</button>
          <button type="button" className="rounded-[2px] border border-[#c3c4c7] bg-white px-[10px] py-[5px] text-[13px] text-[#2271b1]" onClick={() => addBlock('inside')} disabled={selected?.type !== 'container'}>Add inside container</button>
        </div>
        <div className="space-y-[6px] rounded-[2px] border border-[#c3c4c7] bg-[#f6f7f7] p-[8px]">
          {blocks.length ? blocks.map((block, index) => (
            <BlockRow
              key={`${block.id}-${index}`}
              block={block}
              path={[index]}
              level={0}
              selectedKey={pathKey(selectedPath)}
              draggedPath={draggedPath}
              onSelect={setSelectedPath}
              onDragStart={setDraggedPath}
              onDropPath={dropPath}
            />
          )) : <div className="grid min-h-[120px] place-items-center border border-dashed border-[#c3c4c7] bg-white text-[#646970]">No blocks yet. Add a block to start.</div>}
        </div>
      </div>
      <aside className="space-y-[10px]">
        <div className="rounded-[2px] border border-[#c3c4c7] bg-white p-[10px]">
          <h3 className="text-[13px] font-semibold text-[#1d2327]">Selected block</h3>
          {selected ? (
            <div className="mt-[8px] space-y-[8px]">
              <p className="text-[12px] text-[#646970]">{selected.type} / {selected.id}</p>
              <textarea defaultValue={selectedProps} onBlur={(event) => updateSelectedProps(event.target.value)} className="min-h-[160px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] font-mono text-[12px]" />
              <div className="flex flex-wrap gap-[6px] text-[12px]">
                <button type="button" className="text-[#2271b1]" onClick={() => updateBlocks(indentBlock(blocks, selectedPath))}>Indent</button>
                <button type="button" className="text-[#2271b1]" onClick={() => updateBlocks(outdentBlock(blocks, selectedPath))}>Outdent</button>
                <button type="button" className="text-[#2271b1]" onClick={() => updateBlocks(duplicateBlock(blocks, selectedPath))}>Duplicate</button>
                {adminFetch && selected.type !== 'container' ? <button type="button" className="text-[#2271b1]" onClick={() => setMediaOpen(true)}>Media</button> : null}
                <button type="button" className="text-[#b32d2e]" onClick={() => updateBlocks(removeBlock(blocks, selectedPath))}>Remove</button>
              </div>
            </div>
          ) : <p className="mt-[8px] text-[12px] text-[#646970]">Select a block to edit props.</p>}
        </div>
        <p className="text-[12px] leading-5 text-[#646970]">Tip: drag a block row and drop before/inside another row. Hold Shift while dropping on a container to nest quickly.</p>
      </aside>
      {adminFetch ? (
        <MediaPickerModal
          adminFetch={adminFetch}
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={applyMediaToSelected}
        />
      ) : null}
    </div>
  );
}
