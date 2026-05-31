'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react';
import { BlockCanvas } from '@/components/admin/block-canvas';
import { BlockPreviewPanel } from '@/components/admin/block-preview-panel';
import { RevisionDiff, type RevisionDiffItem } from '@/components/admin/revision-diff';
import { WpButton, WpField, WpNotice, WpPageHeader, WpPostbox, WpSelect } from '@/components/admin/wp-admin-ui';
import type { ReusableBlockMap } from '@/lib/blocks/block-types';

type AdminFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type BlockStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type BlockKind = 'reusable' | 'template';
type BlockType = 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'tourGrid' | 'blogGrid' | 'customHtml' | 'reusable' | 'container';
type TemplateType = 'PAGE' | 'SECTION' | 'HEADER' | 'FOOTER' | 'LOOP' | 'SINGLE';

type CmsBlockNode = {
  id: string;
  type: BlockType;
  props?: Record<string, unknown>;
  children?: CmsBlockNode[];
};

type ReusableBlockItem = {
  id: string;
  name: string;
  slug: string;
  blockType: string;
  status: BlockStatus;
  content: CmsBlockNode[];
  updatedAt?: string;
};

type BlockTemplateItem = {
  id: string;
  name: string;
  slug: string;
  type: TemplateType;
  status: BlockStatus;
  blocks: CmsBlockNode[];
  updatedAt?: string;
};

type BlockRevisionItem = RevisionDiffItem;

const defaultReusableBlocks: CmsBlockNode[] = [
  {
    id: 'reusable-cta',
    type: 'cta',
    props: {
      eyebrow: 'Travel Designers',
      title: 'Plan a private journey made for you',
      href: '/customize-your-trip/',
      label: 'Start planning'
    }
  }
];

const defaultTemplateBlocks: CmsBlockNode[] = [
  {
    id: 'hero-home',
    type: 'hero',
    props: {
      eyebrow: 'Luxury Travel CMS',
      title: 'Design foundations for premium page building',
      subtitle: 'Phase A introduces reusable blocks, templates, and a DB-backed design system.'
    }
  },
  {
    id: 'cta-home',
    type: 'reusable',
    props: { slug: 'tailor-made-cta' }
  }
];

function stringifyBlocks(value: CmsBlockNode[]) {
  return JSON.stringify(value, null, 2);
}

function parseBlocks(value: string) {
  const parsed = JSON.parse(value) as unknown;
  if (Array.isArray(parsed)) return parsed as CmsBlockNode[];
  if (parsed && typeof parsed === 'object') {
    const candidate = parsed as { blocks?: unknown; content?: unknown };
    if (Array.isArray(candidate.blocks)) return candidate.blocks as CmsBlockNode[];
    if (Array.isArray(candidate.content)) return candidate.content as CmsBlockNode[];
  }
  throw new Error('Blocks JSON must be an array or an object with blocks/content arrays.');
}

export function BlockManager({ adminFetch }: { adminFetch: AdminFetcher }) {
  const [kind, setKind] = useState<BlockKind>('reusable');
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlockItem[]>([]);
  const [templates, setTemplates] = useState<BlockTemplateItem[]>([]);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('Reusable block');
  const [slug, setSlug] = useState('reusable-block');
  const [blockType, setBlockType] = useState('container');
  const [templateType, setTemplateType] = useState<TemplateType>('PAGE');
  const [status, setStatus] = useState<BlockStatus>('DRAFT');
  const [blocksText, setBlocksText] = useState(stringifyBlocks(defaultReusableBlocks));
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<BlockRevisionItem[]>([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState('');

  async function loadBlocks() {
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/blocks', { cache: 'no-store' });
      const payload = await response.json() as {
        data?: {
          reusable?: { items?: ReusableBlockItem[] };
          templates?: { items?: BlockTemplateItem[] };
        };
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to load blocks.');
      setReusableBlocks(payload.data?.reusable?.items || []);
      setTemplates(payload.data?.templates?.items || []);
      setNotice(null);
      if (!editingId) {
        const firstReusable = payload.data?.reusable?.items?.[0];
        const firstTemplate = payload.data?.templates?.items?.[0];
        if (kind === 'reusable' && firstReusable) {
          selectReusable(firstReusable);
        } else if (kind === 'template' && firstTemplate) {
          selectTemplate(firstTemplate);
        }
      }
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load blocks.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlocks().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectReusable(item: ReusableBlockItem) {
    setKind('reusable');
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setBlockType(item.blockType || 'container');
    setStatus(item.status);
    setBlocksText(stringifyBlocks(item.content || []));
    setRevisions([]);
    setSelectedRevisionId('');
  }

  function selectTemplate(item: BlockTemplateItem) {
    setKind('template');
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setTemplateType(item.type);
    setStatus(item.status);
    setBlocksText(stringifyBlocks(item.blocks || []));
    setRevisions([]);
    setSelectedRevisionId('');
  }

  function startNew(nextKind: BlockKind) {
    setKind(nextKind);
    setEditingId('');
    setName(nextKind === 'reusable' ? 'Reusable block' : 'Page template');
    setSlug(nextKind === 'reusable' ? 'reusable-block' : 'page-template');
    setBlockType('container');
    setTemplateType('PAGE');
    setStatus('DRAFT');
    setBlocksText(stringifyBlocks(nextKind === 'reusable' ? defaultReusableBlocks : defaultTemplateBlocks));
    setRevisions([]);
    setSelectedRevisionId('');
    setNotice({ type: 'info', text: nextKind === 'reusable' ? 'New reusable block draft is ready.' : 'New block template draft is ready.' });
  }

  const parsedBlocks = useMemo(() => {
    try {
      return { blocks: parseBlocks(blocksText), error: '' };
    } catch (error) {
      return { blocks: [], error: error instanceof Error ? error.message : 'Blocks JSON is invalid.' };
    }
  }, [blocksText]);

  const reusableBlockMap = useMemo<ReusableBlockMap>(() => {
    return reusableBlocks.reduce<ReusableBlockMap>((acc, item) => {
      if (item.status !== 'ARCHIVED') acc[item.slug] = item.content || [];
      return acc;
    }, {});
  }, [reusableBlocks]);

  const selectedRevision = revisions.find((item) => item.id === selectedRevisionId) || null;
  const currentSnapshot = kind === 'reusable'
    ? { id: editingId, name, slug, blockType, status, content: parsedBlocks.blocks }
    : { id: editingId, name, slug, type: templateType, status, blocks: parsedBlocks.blocks };

  function updateBlocksFromCanvas(blocks: CmsBlockNode[]) {
    setBlocksText(stringifyBlocks(blocks));
  }

  async function saveBlock(activate = false) {
    setSaving(true);
    setNotice(null);
    try {
      if (parsedBlocks.error) throw new Error(parsedBlocks.error);
      const payload = kind === 'reusable'
        ? {
            kind: 'reusable',
            ...(editingId ? { id: editingId } : {}),
            name,
            slug,
            blockType,
            status: activate ? 'ACTIVE' : status,
            content: parsedBlocks.blocks
          }
        : {
            kind: 'template',
            ...(editingId ? { id: editingId } : {}),
            name,
            slug,
            type: templateType,
            status: activate ? 'ACTIVE' : status,
            blocks: parsedBlocks.blocks,
            ...(activate && editingId ? { action: 'activate' } : {})
          };
      const response = await adminFetch('/api/admin/blocks', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as { data?: { item?: ReusableBlockItem | BlockTemplateItem }; error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message || 'Unable to save block.');
      const item = result.data?.item as ReusableBlockItem | BlockTemplateItem | undefined;
      if (!item) throw new Error('Unable to read saved block response.');
      setEditingId(item.id);
      if (kind === 'reusable') {
        setStatus((item as ReusableBlockItem).status);
      } else {
        setStatus((item as BlockTemplateItem).status);
      }
      if (activate && kind === 'template') {
        const activateResponse = await adminFetch('/api/admin/blocks', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ kind: 'template', id: item.id, action: 'activate' })
        });
        if (!activateResponse.ok) throw new Error('Block template saved but activation failed.');
      }
      await loadBlocks();
      setNotice({ type: 'success', text: activate ? 'Block saved and activated.' : 'Block saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save block.' });
    } finally {
      setSaving(false);
    }
  }

  async function archiveBlock() {
    if (!editingId) {
      setNotice({ type: 'info', text: 'Select a block first.' });
      return;
    }
    setSaving(true);
    try {
      const response = await adminFetch('/api/admin/blocks', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editingId, kind })
      });
      const result = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message || 'Unable to archive block.');
      await loadBlocks();
      setNotice({ type: 'success', text: 'Block archived.' });
      startNew(kind);
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to archive block.' });
    } finally {
      setSaving(false);
    }
  }

  async function loadRevisions() {
    if (!editingId) {
      setNotice({ type: 'info', text: 'Save the block before loading revisions.' });
      return;
    }
    setLoading(true);
    try {
      const query = kind === 'reusable'
        ? `reusableBlockId=${encodeURIComponent(editingId)}`
        : `blockTemplateId=${encodeURIComponent(editingId)}`;
      const response = await adminFetch(`/api/admin/revisions?${query}`, { cache: 'no-store' });
      const payload = await response.json() as { data?: { items?: BlockRevisionItem[] }; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to load revisions.');
      const items = payload.data?.items || [];
      setRevisions(items);
      setSelectedRevisionId(items[0]?.id || '');
      setNotice({ type: 'success', text: `Loaded ${items.length} block revisions.` });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load revisions.' });
    } finally {
      setLoading(false);
    }
  }

  async function restoreRevision(revisionId: string) {
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminFetch('/api/admin/revisions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ revisionId })
      });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to restore revision.');
      await loadBlocks();
      setRevisions([]);
      setSelectedRevisionId('');
      setNotice({ type: 'success', text: 'Revision restored. The previous current state was kept as a new revision.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to restore revision.' });
    } finally {
      setSaving(false);
    }
  }

  const list = kind === 'reusable' ? reusableBlocks : templates;

  return (
    <div className="space-y-[14px]">
      <WpPageHeader title="Blocks & Templates" actionLabel={kind === 'reusable' ? 'New reusable block' : 'New template'} onAction={() => startNew(kind)} />
      {notice ? <WpNotice type={notice.type} onDismiss={() => setNotice(null)}>{notice.text}</WpNotice> : null}
      <div className="flex flex-wrap gap-[8px]">
        <WpButton primary={kind === 'reusable'} onClick={() => { setKind('reusable'); if (!editingId) startNew('reusable'); }}>Reusable blocks</WpButton>
        <WpButton primary={kind === 'template'} onClick={() => { setKind('template'); if (!editingId) startNew('template'); }}>Templates</WpButton>
        <WpButton onClick={loadBlocks} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</WpButton>
      </div>
      <div className="grid gap-[14px] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-[14px]">
          <WpPostbox title={kind === 'reusable' ? 'Reusable blocks' : 'Templates'}>
            <div className="space-y-[8px]">
              {list.length ? list.map((item) => {
                const isActive = editingId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => kind === 'reusable' ? selectReusable(item as ReusableBlockItem) : selectTemplate(item as BlockTemplateItem)}
                    className={`block w-full rounded-[2px] border px-[10px] py-[8px] text-left text-[13px] ${isActive ? 'border-[#2271b1] bg-[#f0f6fc]' : 'border-[#c3c4c7] bg-white hover:bg-[#f6f7f7]'}`}
                  >
                    <strong className="block text-[#1d2327]">{item.name}</strong>
                    <span className="block text-[12px] text-[#646970]">{item.slug} · {item.status}</span>
                  </button>
                );
              }) : <p className="text-[#646970]">No blocks created yet.</p>}
            </div>
          </WpPostbox>
          <WpPostbox title="Shortcuts">
            <p className="text-[#646970]">Create a reusable CTA or a page template, then assign the template to page runtime later.</p>
          </WpPostbox>
        </aside>
        <div className="space-y-[14px]">
          <WpPostbox title="Editor">
            <div className="space-y-[8px]">
              <div className="flex flex-wrap gap-[8px]">
                <WpSelect value={kind} onChange={(value) => {
                  setKind(value as BlockKind);
                  if (!editingId) startNew(value as BlockKind);
                }} options={[{ label: 'Reusable block', value: 'reusable' }, { label: 'Template', value: 'template' }]} />
                <WpSelect value={status} onChange={(value) => setStatus(value as BlockStatus)} options={[{ label: 'Draft', value: 'DRAFT' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Archived', value: 'ARCHIVED' }]} />
              </div>
              <WpField label="Name" value={name} onChange={setName} />
              <WpField label="Slug" value={slug} onChange={setSlug} />
              {kind === 'reusable' ? <WpField label="Block type" value={blockType} onChange={setBlockType} help="Examples: cta, container, hero." /> : <WpSelect label="Template type" value={templateType} onChange={(value) => setTemplateType(value as TemplateType)} options={['PAGE', 'SECTION', 'HEADER', 'FOOTER', 'LOOP', 'SINGLE']} />}
              <div className="rounded-[2px] border border-[#dcdcde] bg-[#f6f7f7] p-[10px]">
                <p className="mb-[8px] text-[12px] font-semibold text-[#1d2327]">Drag/drop block canvas</p>
                {parsedBlocks.error ? <p className="text-[12px] text-[#b32d2e]">Fix JSON errors before using the canvas.</p> : <BlockCanvas blocks={parsedBlocks.blocks} onChange={updateBlocksFromCanvas} adminFetch={adminFetch} />}
              </div>
              <details className="rounded-[2px] border border-[#dcdcde] bg-white p-[10px]">
                <summary className="cursor-pointer text-[13px] font-semibold text-[#2271b1]">Advanced JSON editor</summary>
                <div className="mt-[10px]">
                  <WpField label="Blocks JSON" value={blocksText} onChange={setBlocksText} textarea help="Use a JSON array of block nodes. Each node needs id, type, props, and optional children." />
                </div>
              </details>
            </div>
            {parsedBlocks.error ? <div className="mt-[10px]"><WpNotice type="error">{parsedBlocks.error}</WpNotice></div> : null}
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              <WpButton primary onClick={() => saveBlock(false)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</WpButton>
              <WpButton onClick={() => saveBlock(true)} disabled={saving}>Save & Activate</WpButton>
              <WpButton destructive onClick={archiveBlock} disabled={saving || !editingId}>Archive</WpButton>
              <WpButton onClick={() => startNew(kind)}>New {kind === 'reusable' ? 'Reusable' : 'Template'}</WpButton>
            </div>
          </WpPostbox>
          <WpPostbox title="Preview">
            {parsedBlocks.error ? <p className="text-[#646970]">Resolve JSON errors to preview the block tree.</p> : <BlockPreviewPanel blocks={parsedBlocks.blocks} reusableBlocks={reusableBlockMap} />}
          </WpPostbox>
          <WpPostbox title="Revisions">
            <div className="space-y-[10px]">
              <div className="flex flex-wrap gap-[8px]">
                <WpButton onClick={loadRevisions} disabled={loading || !editingId}>{loading ? 'Loading...' : 'Load revisions'}</WpButton>
                {selectedRevision ? <WpButton primary onClick={() => restoreRevision(selectedRevision.id)} disabled={saving}>Restore selected</WpButton> : null}
              </div>
              {revisions.length ? (
                <div className="grid gap-[10px] lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-[6px]">
                    {revisions.map((item) => (
                      <button key={item.id} type="button" onClick={() => setSelectedRevisionId(item.id)} className={`block w-full rounded-[2px] border px-[8px] py-[7px] text-left text-[12px] ${selectedRevisionId === item.id ? 'border-[#2271b1] bg-[#f0f6fc]' : 'border-[#c3c4c7] bg-white'}`}>
                        <strong className="block truncate">{item.title || 'Revision'}</strong>
                        <span className="text-[#646970]">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Unknown'}</span>
                      </button>
                    ))}
                  </div>
                  <RevisionDiff currentSnapshot={currentSnapshot} revision={selectedRevision} compact />
                </div>
              ) : <p className="text-[#646970]">No revisions loaded yet. Save an existing block/template once, then load revisions.</p>}
            </div>
          </WpPostbox>
        </div>
      </div>
    </div>
  );
}
