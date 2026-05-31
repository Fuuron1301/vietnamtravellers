'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export type WpNoticeType = 'success' | 'warning' | 'error' | 'info';
type WpSelectOption = string | { label: string; value: string };

export function WpButton({ children, primary = false, destructive = false, dataQa, onClick, type = 'button', disabled = false }: { children: ReactNode; primary?: boolean; destructive?: boolean; dataQa?: string; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  const base = 'inline-flex min-h-[30px] items-center justify-center rounded-[3px] px-[10px] text-[13px] leading-[2.15384615] shadow-[0_1px_0_rgba(0,0,0,0.08)] transition-colors focus:outline focus:outline-2 focus:outline-offset-1 disabled:cursor-not-allowed disabled:border-[#dcdcde] disabled:bg-[#f6f7f7] disabled:text-[#a7aaad] disabled:shadow-none';
  const className = primary
    ? `${base} border border-[#2271b1] bg-[#2271b1] text-white hover:border-[#135e96] hover:bg-[#135e96] focus:outline-[#72aee6]`
    : destructive
      ? `${base} border border-[#d63638] bg-[#f6f7f7] text-[#b32d2e] hover:border-[#b32d2e] hover:bg-[#fcf0f1] focus:outline-[#d63638]`
      : `${base} border border-[#2271b1] bg-[#f6f7f7] text-[#2271b1] hover:border-[#135e96] hover:bg-[#f0f0f1] hover:text-[#135e96] focus:outline-[#72aee6]`;
  return <button type={type} data-admin-qa={dataQa} onClick={onClick} disabled={disabled} className={className}>{children}</button>;
}

export function WpNotice({ type = 'info', children, onDismiss }: { type?: WpNoticeType; children: ReactNode; onDismiss?: () => void }) {
  const border = type === 'success' ? 'border-l-[#00a32a]' : type === 'warning' ? 'border-l-[#dba617]' : type === 'error' ? 'border-l-[#d63638]' : 'border-l-[#72aee6]';
  return (
    <div className={`relative mb-[12px] border border-[#c3c4c7] border-l-[4px] ${border} bg-white px-[12px] py-[9px] text-[13px] leading-[1.5] text-[#3c434a] shadow-[0_1px_1px_rgba(0,0,0,0.04)]`}>
      {onDismiss ? <button type="button" onClick={onDismiss} className="absolute right-[7px] top-[7px] grid h-[24px] w-[24px] place-items-center text-[18px] leading-none text-[#787c82] hover:text-[#1d2327] focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#72aee6]" aria-label="Dismiss notice">&times;</button> : null}
      <div className={onDismiss ? 'pr-[28px]' : undefined}>{children}</div>
    </div>
  );
}

export function WpPageHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="mb-[10px] flex flex-wrap items-center gap-[8px]"><h1 className="text-[23px] font-normal leading-8 text-[#1d2327]">{title}</h1>{actionLabel ? <WpButton onClick={onAction}>{actionLabel}</WpButton> : null}</div>;
}

export function WpTabBar({ active, tabs, onChange }: { active: string; tabs: Array<{ label: string; value: string; badge?: string | number }>; onChange: (value: string) => void }) {
  return (
    <div className="mb-[12px] flex flex-wrap gap-[6px] border-b border-[#c3c4c7] pb-[10px]">
      {tabs.map((tab) => {
        const selected = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={selected}
            className={`inline-flex min-h-[30px] items-center gap-[6px] rounded-[3px] border px-[10px] text-[13px] transition-colors ${selected ? 'border-[#2271b1] bg-[#2271b1] text-white' : 'border-[#c3c4c7] bg-white text-[#2271b1] hover:border-[#8c8f94] hover:bg-[#f6f7f7]'}`}
          >
            <span>{tab.label}</span>
            {tab.badge != null ? <span className={`rounded-full px-[6px] py-[1px] text-[11px] ${selected ? 'bg-white/15 text-white' : 'bg-[#f0f0f1] text-[#50575e]'}`}>{tab.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function WpPostbox({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
      <div className="flex min-h-[38px] items-center justify-between border-b border-[#c3c4c7] bg-white px-[12px] py-[8px]">
        <h2 className="text-[14px] font-semibold text-[#1d2327]">{title}</h2>
        {actions ? <div className="flex items-center gap-[6px] text-[12px] text-[#646970]">{actions}</div> : null}
      </div>
      <div className="p-[12px] text-[13px] leading-6 text-[#3c434a]">{children}</div>
    </section>
  );
}

export function WpField({ label, value, onChange, textarea = false, help, placeholder }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; help?: string; placeholder?: string }) {
  return (
    <label className="grid gap-[8px] border-b border-[#dcdcde] py-[11px] text-[13px] sm:grid-cols-[210px_1fr]">
      <span><strong>{label}</strong>{help ? <small className="mt-[4px] block font-normal leading-5 text-[#646970]">{help}</small> : null}</span>
      {textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[96px] rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px] text-[14px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" />}
    </label>
  );
}

export function WpSelect({ label, ariaLabel, dataQa, value, options, onChange }: { label?: string; ariaLabel?: string; dataQa?: string; value: string; options: WpSelectOption[]; onChange: (value: string) => void }) {
  const select = (
    <select aria-label={ariaLabel} data-admin-qa={dataQa} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[30px] max-w-full rounded-[3px] border border-[#8c8f94] bg-white px-[6px] text-[13px] text-[#2c3338] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]">
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  );
  return label ? <label className="flex items-center gap-[6px] text-[13px]"><span>{label}</span>{select}</label> : select;
}

export function WpClassicEditor({ title, content, onTitleChange, onContentChange, placeholder = 'Add title', contentPlaceholder = '' }: { title: string; content: string; onTitleChange: (value: string) => void; onContentChange: (value: string) => void; placeholder?: string; contentPlaceholder?: string }) {
  return (
    <div className="bg-white">
      <input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder={placeholder} className="mb-[10px] min-h-[46px] w-full border border-[#8c8f94] px-[12px] text-[1.7em] leading-[1.4] text-[#1d2327] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" />
      <div className="border border-[#8c8f94] bg-white">
        <div className="flex min-h-[36px] flex-wrap items-center gap-[3px] border-b border-[#dcdcde] bg-[#f6f7f7] px-[6px] py-[4px] text-[13px] text-[#50575e]">
          {['Paragraph', 'B', 'I', 'Link', 'Quote', 'UL', 'OL', 'Image'].map((item) => <button type="button" key={item} className="min-h-[26px] rounded-[2px] border border-[#c3c4c7] bg-white px-[7px] hover:border-[#8c8f94] hover:bg-[#f0f0f1] focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#72aee6]">{item}</button>)}
        </div>
        <textarea value={content} onChange={(event) => onContentChange(event.target.value)} placeholder={contentPlaceholder} className="min-h-[420px] w-full border-0 px-[12px] py-[10px] text-[14px] leading-6 outline-none" />
      </div>
    </div>
  );
}

export type WpTableColumn<T> = { key: string; label: string; width?: string; sortKey?: string; sortable?: boolean; render: (row: T, index: number) => ReactNode };

export function WpListTable<T extends { id: string }>({ rows, columns, emptyText, selectedIds, onSelect, onSelectAll, sortKey, sortOrder = 'asc', onSort }: { rows: T[]; columns: Array<WpTableColumn<T>>; emptyText: string; selectedIds: string[]; onSelect: (id: string) => void; onSelectAll: () => void; sortKey?: string; sortOrder?: 'asc' | 'desc'; onSort?: (key: string) => void }) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const someSelected = rows.some((row) => selectedIds.includes(row.id));
  const selectAllTopRef = useRef<HTMLInputElement | null>(null);
  const selectAllBottomRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    for (const ref of [selectAllTopRef, selectAllBottomRef]) {
      if (ref.current) ref.current.indeterminate = someSelected && !allSelected;
    }
  }, [allSelected, someSelected]);

  return (
    <div className="overflow-x-auto border border-[#c3c4c7] bg-white">
      <table className="w-full min-w-[880px] border-collapse text-left text-[13px] text-[#2c3338]">
        <thead><tr className="border-b border-[#c3c4c7] bg-white"><th className="w-[38px] px-[10px] py-[7px]"><input ref={selectAllTopRef} type="checkbox" checked={allSelected} onChange={onSelectAll} aria-label="Select all current page" aria-checked={someSelected && !allSelected ? 'mixed' : allSelected} /></th>{columns.map((column) => {
          const key = column.sortKey || column.key;
          const sortable = Boolean(onSort && column.sortable !== false);
          const active = sortKey === key;
          return <th key={column.key} className="px-[10px] py-[7px] font-normal text-[#2271b1]" style={column.width ? { width: column.width } : undefined} aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>{sortable ? <button type="button" onClick={() => onSort?.(key)} className="text-[#2271b1] hover:text-[#135e96]" aria-label={`Sort ${column.label}`}>{column.label}{active ? <span className="ml-[4px]" aria-hidden="true">{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span> : null}</button> : column.label}</th>;
        })}</tr></thead>
        <tbody>{rows.length ? rows.map((row, index) => <tr key={row.id} className={`${index % 2 === 0 ? 'bg-[#f6f7f7]' : 'bg-white'} hover:bg-[#f0f6fc]`}><td className="border-t border-[#c3c4c7] px-[10px] py-[8px] align-top"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onSelect(row.id)} aria-label={`Select row ${row.id}`} /></td>{columns.map((column) => <td key={column.key} className="border-t border-[#c3c4c7] px-[10px] py-[8px] align-top">{column.render(row, index)}</td>)}</tr>) : <tr><td colSpan={columns.length + 1} className="px-[10px] py-[18px] text-[#646970]">{emptyText}</td></tr>}</tbody>
        <tfoot><tr className="border-t border-[#c3c4c7] bg-white"><th className="w-[38px] px-[10px] py-[7px]"><input ref={selectAllBottomRef} type="checkbox" checked={allSelected} onChange={onSelectAll} aria-label="Select all current page footer" aria-checked={someSelected && !allSelected ? 'mixed' : allSelected} /></th>{columns.map((column) => <th key={column.key} className="px-[10px] py-[7px] font-normal text-[#2271b1]" style={column.width ? { width: column.width } : undefined}>{column.label}</th>)}</tr></tfoot>
      </table>
    </div>
  );
}

export function WpPagination({ total, page = 1, perPage = 20, onPageChange }: { total: number; page?: number; perPage?: number; onPageChange?: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return <div className="flex items-center gap-[6px] text-[13px] text-[#50575e]"><span>{total} mục</span><button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className="min-h-[28px] min-w-[28px] rounded-[2px] border border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e] hover:border-[#8c8f94] disabled:cursor-default disabled:border-[#dcdcde] disabled:text-[#a7aaad]">&lt;</button><span>{page} trong {pages}</span><button type="button" aria-label="Trang sau" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)} className="min-h-[28px] min-w-[28px] rounded-[2px] border border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e] hover:border-[#8c8f94] disabled:cursor-default disabled:border-[#dcdcde] disabled:text-[#a7aaad]">&gt;</button></div>;
}
