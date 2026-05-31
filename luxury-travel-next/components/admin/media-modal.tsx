'use client';

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import { WpButton, WpField, WpNotice, WpSelect } from '@/components/admin/wp-admin-ui';

export type AdminMediaItem = {
  id: string;
  url: string;
  title: string;
  originalName?: string;
  mimeType?: string;
  kind?: string;
  altText?: string;
  caption?: string;
  description?: string;
};

type AdminFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function toMediaItem(value: Record<string, unknown>): AdminMediaItem {
  return {
    id: String(value.id || value.url || ''),
    url: String(value.url || value.src || ''),
    title: String(value.title || value.originalName || value.fileName || 'Media item'),
    originalName: typeof value.originalName === 'string' ? value.originalName : undefined,
    mimeType: typeof value.mimeType === 'string' ? value.mimeType : undefined,
    kind: typeof value.kind === 'string' ? value.kind : undefined,
    altText: typeof value.altText === 'string' ? value.altText : '',
    caption: typeof value.caption === 'string' ? value.caption : '',
    description: typeof value.description === 'string' ? value.description : ''
  };
}

function metaFromItem(item: AdminMediaItem) {
  return {
    title: item.title || item.originalName || 'Media item',
    altText: item.altText || '',
    caption: item.caption || '',
    description: item.description || ''
  };
}

export function MediaPickerModal({
  adminFetch,
  open,
  onClose,
  onSelect,
  selectedUrl = '',
  attachmentTarget
}: {
  adminFetch: AdminFetcher;
  open: boolean;
  onClose: () => void;
  onSelect: (item: AdminMediaItem) => void;
  selectedUrl?: string;
  attachmentTarget?: { postId: string; role?: string; sortOrder?: number };
}) {
  const [items, setItems] = useState<AdminMediaItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('IMAGE');
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ title: '', altText: '', caption: '', description: '' });
  const selectedCount = selectedIds.length;

  async function loadMedia() {
    const params = new URLSearchParams({ perPage: '80' });
    if (search.trim()) params.set('search', search.trim());
    if (kind && kind !== 'ALL') params.set('kind', kind);
    const response = await adminFetch(`/api/admin/media?${params.toString()}`, { cache: 'no-store' });
    const payload = await response.json() as { data?: { items?: unknown[] }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || 'Unable to load media.');
    const next = (payload.data?.items || [])
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(toMediaItem)
      .filter((item) => item.id && item.url);
    setItems(next);
    const nextActive = next.find((item) => item.id === activeId) || next.find((item) => item.url === selectedUrl) || next[0];
    if (nextActive) {
      setActiveId(nextActive.id);
      setMeta(metaFromItem(nextActive));
    }
  }

  useEffect(() => {
    if (!open) return;
    loadMedia().catch((error) => setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load media.' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const activeItem = useMemo(() => items.find((item) => item.id === activeId) || null, [items, activeId]);

  function selectActiveItem(item: AdminMediaItem) {
    setActiveId(item.id);
    setMeta(metaFromItem(item));
  }

  async function uploadFile() {
    if (!file) return;
    setSaving(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('altText', file.name);
      const response = await adminFetch('/api/admin/media', { method: 'POST', body: form });
      const payload = await response.json() as { data?: { item?: Record<string, unknown> }; error?: { message?: string } };
      if (!response.ok || !payload.data?.item) throw new Error(payload.error?.message || 'Unable to upload media.');
      const item = toMediaItem(payload.data.item);
      setItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
      setActiveId(item.id);
      setMeta(metaFromItem(item));
      setFile(null);
      setNotice({ type: 'success', text: 'Upload complete.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to upload media.' });
    } finally {
      setSaving(false);
    }
  }

  async function saveMetadata() {
    if (!activeItem) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminFetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: activeItem.id, action: 'update', ...meta })
      });
      const payload = await response.json() as { data?: { item?: Record<string, unknown> }; error?: { message?: string } };
      if (!response.ok || !payload.data?.item) throw new Error(payload.error?.message || 'Unable to save metadata.');
      const item = toMediaItem(payload.data.item);
      setItems((current) => current.map((entry) => entry.id === item.id ? item : entry));
      setNotice({ type: 'success', text: 'Attachment details saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save metadata.' });
    } finally {
      setSaving(false);
    }
  }

  async function attachMedia() {
    if (!activeItem || !attachmentTarget?.postId) return;
    const response = await adminFetch('/api/admin/media', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: activeItem.id,
        action: 'attach',
        postId: attachmentTarget.postId,
        role: attachmentTarget.role || 'gallery',
        sortOrder: attachmentTarget.sortOrder || 0
      })
    });
    const payload = await response.json() as { error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || 'Unable to attach media.');
  }

  async function detachMedia() {
    if (!activeItem || !attachmentTarget?.postId) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminFetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: activeItem.id,
          action: 'detach',
          postId: attachmentTarget.postId,
          role: attachmentTarget.role || 'gallery'
        })
      });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to detach media.');
      setNotice({ type: 'success', text: 'Media detached from this content item.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to detach media.' });
    } finally {
      setSaving(false);
    }
  }

  async function chooseMedia() {
    if (!activeItem) return;
    setSaving(true);
    setNotice(null);
    try {
      if (attachmentTarget?.postId) await attachMedia();
      onSelect(activeItem);
      onClose();
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to select media.' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    setSaving(true);
    setNotice(null);
    try {
      for (const id of selectedIds) {
        const response = await adminFetch('/api/admin/media', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const payload = await response.json() as { error?: { message?: string } };
        if (!response.ok) throw new Error(payload.error?.message || 'Unable to delete selected media.');
      }
      setItems((current) => current.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setNotice({ type: 'success', text: 'Selected media deleted.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to delete selected media.' });
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 p-[22px]">
      <div className="mx-auto flex h-[calc(100vh-44px)] max-w-[1180px] flex-col border border-[#1d2327] bg-[#f0f0f1] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex min-h-[48px] items-center justify-between border-b border-[#c3c4c7] bg-white px-[16px]">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1d2327]">Media Library</h2>
            <p className="text-[12px] text-[#646970]">Upload, reuse, edit metadata, attach or detach media.</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="rounded-full border border-[#c3c4c7] bg-[#f6f7f7] px-[10px] py-[3px] text-[12px] text-[#50575e]">{selectedCount} selected</span>
            <button type="button" className="text-[24px] leading-none text-[#646970] hover:text-[#1d2327]" onClick={onClose} aria-label="Close media modal">&times;</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[8px] border-b border-[#c3c4c7] bg-[#f6f7f7] p-[10px]">
          <div className="flex flex-wrap gap-[6px]">
            <WpSelect value={kind} onChange={setKind} options={[{ label: 'All media items', value: 'ALL' }, { label: 'Images', value: 'IMAGE' }, { label: 'Video', value: 'VIDEO' }, { label: 'Documents', value: 'DOCUMENT' }]} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px] text-[13px]" placeholder="Search media" />
            <WpButton onClick={() => loadMedia().catch((error) => setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to search media.' }))}>Search</WpButton>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="min-h-[30px] rounded-[2px] border border-[#8c8f94] bg-white px-[8px] text-[13px]" />
            <WpButton primary onClick={uploadFile} disabled={!file || saving}>{saving ? 'Working...' : 'Upload'}</WpButton>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 overflow-auto p-[12px]">
            {notice ? <WpNotice type={notice.type} onDismiss={() => setNotice(null)}>{notice.text}</WpNotice> : null}
            <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {items.map((item) => {
                const selected = selectedIds.includes(item.id);
                const active = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectActiveItem(item)}
                    onDoubleClick={() => void chooseMedia()}
                    className={`group overflow-hidden border bg-white text-left shadow-[0_1px_1px_rgba(0,0,0,0.04)] ${active ? 'border-[#2271b1] ring-2 ring-[#2271b1]' : 'border-[#c3c4c7] hover:border-[#8c8f94]'}`}
                  >
                    <span className="relative block">
                      <img src={item.url} alt={item.altText || item.title} className="aspect-square w-full bg-[#f6f7f7] object-cover" />
                      <span className="absolute left-[6px] top-[6px] bg-white/90 px-[4px] py-[2px] text-[11px] text-[#1d2327]">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            event.stopPropagation();
                            setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
                          }}
                          aria-label={`Select ${item.title}`}
                        />
                      </span>
                    </span>
                    <span className="block truncate px-[7px] py-[6px] text-[12px] text-[#1d2327]">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="min-h-0 overflow-auto border-l border-[#c3c4c7] bg-white p-[12px] text-[13px]">
            {activeItem ? (
              <div className="space-y-[10px]">
                <img src={activeItem.url} alt={activeItem.altText || activeItem.title} className="aspect-video w-full border border-[#dcdcde] object-cover" />
                <p className="break-all text-[12px] text-[#646970]">{activeItem.url}</p>
                <p className="text-[12px] text-[#646970]">Selected item can be used as featured image or attached to post, page, or tour.</p>
                <WpField label="Title" value={meta.title} onChange={(title) => setMeta((current) => ({ ...current, title }))} />
                <WpField label="Alt text" value={meta.altText} onChange={(altText) => setMeta((current) => ({ ...current, altText }))} />
                <WpField label="Caption" value={meta.caption} onChange={(caption) => setMeta((current) => ({ ...current, caption }))} textarea />
                <WpField label="Description" value={meta.description} onChange={(description) => setMeta((current) => ({ ...current, description }))} textarea />
                <div className="flex flex-wrap gap-[6px]">
                  <WpButton onClick={saveMetadata} disabled={saving}>Save details</WpButton>
                  {attachmentTarget?.postId ? <WpButton onClick={detachMedia} disabled={saving}>Detach</WpButton> : null}
                  <WpButton primary onClick={chooseMedia} disabled={saving}>Use this media</WpButton>
                </div>
                {selectedIds.length ? <WpButton destructive onClick={deleteSelected} disabled={saving}>Delete selected ({selectedIds.length})</WpButton> : null}
              </div>
            ) : (
              <p className="text-[#646970]">Select a media item to view attachment details.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
