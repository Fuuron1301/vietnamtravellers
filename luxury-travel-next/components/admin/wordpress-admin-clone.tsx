'use client';

/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FooterEditor, HomeBuilderEditor, JsonContentEditor, NavigationEditor, SiteIdentityEditor, type SaveStatus } from '@/components/admin/site-content-editor';
import { WpButton as AdminButton, WpClassicEditor, WpField, WpListTable, WpNotice, WpPageHeader, WpPagination, WpPostbox, WpSelect, type WpTableColumn } from '@/components/admin/wp-admin-ui';
import { defaultSiteContent, type SiteContent, type SiteIdentity } from '@/lib/site-content-schema';

const HomeSectionsEditor = dynamic(() => import('@/components/admin/site-content-editor').then((m) => ({ default: m.HomeSectionsEditor })), { ssr: false, loading: () => <div className="p-[24px] text-[13px] text-[#646970]">Đang tải editor…</div> });
const StaticPagesEditor = dynamic(() => import('@/components/admin/site-content-editor').then((m) => ({ default: m.StaticPagesEditor })), { ssr: false, loading: () => <div className="p-[24px] text-[13px] text-[#646970]">Đang tải editor…</div> });

export type AdminContentMeta = {
  gallery?: string[];
  itinerary?: Array<Record<string, string>>;
  faq?: Array<{ question: string; answer: string }>;
  pricing?: Array<Record<string, string>>;
  details?: Record<string, unknown>;
  translations?: Record<string, unknown>;
  tourMeta?: { basePrice?: string; currency?: string; duration?: string; availability?: string };
  googleMapsEmbed?: string;
  inclusions?: string[];
  exclusions?: string[];
  categories?: string[];
  tags?: string[];
};

export type AdminContentRow = { id: string; title: string; kind: string; status: string; author: string; date: string; href: string; slug?: string; excerpt?: string; content?: string; score?: number | null; comments?: number; seoTitle?: string; seoDescription?: string; featuredImage?: string; price?: string; meta?: AdminContentMeta };
export type AdminCaptureRow = { id: string; title: string; kind: string; status: string; contact: string; date: string };
export type AdminRecentItem = { title: string; type: string; href: string; date: string };
export type AdminCloneData = {
  counts: { posts: number; tours: number; cruises: number; styles: number; leads: number; bookings: number };
  posts: AdminContentRow[];
  pages?: AdminContentRow[];
  tours?: AdminContentRow[];
  products: AdminContentRow[];
  cruises: AdminContentRow[];
  leads: AdminCaptureRow[];
  bookings: AdminCaptureRow[];
  recent: AdminRecentItem[];
  averageScore: string;
};

export type AdminScreen = 'dashboard' | 'identity' | 'navigation' | 'homeBuilder' | 'homeSections' | 'staticPages' | 'footerBuilder' | 'siteJson' | 'posts' | 'tours' | 'cruises' | 'media' | 'pages' | 'comments' | 'getwoo' | 'woocommerce' | 'products' | 'analytics' | 'marketing' | 'elementor' | 'templates' | 'design' | 'blocks' | 'appearance' | 'plugins' | 'users' | 'tools' | 'migration' | 'settings' | 'leads' | 'bookings' | 'travelOs';
type Screen = AdminScreen;
type Draft = { id: string; title: string; content: string; createdAt: string };
type WidgetKey = 'welcome' | 'tracking' | 'woocommerce' | 'elementor' | 'draft' | 'news' | 'dropzones' | 'activity' | 'health';
type MenuItem = { id: Screen; label: string; icon: string; badge?: number; sub?: Array<{ label: string; badge?: number }> };

const STORAGE_KEY = 'hlt-local-wp-admin-clone-v3';
const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Bảng tin', icon: '⌂', sub: [{ label: 'Trang chủ' }, { label: 'Cập nhật', badge: 2 }] },
  { id: 'posts', label: 'Bài viết', icon: '✎', sub: [{ label: 'Tất cả bài viết' }, { label: 'Viết bài mới' }, { label: 'Chuyên mục' }, { label: 'Thẻ' }] },
  { id: 'media', label: 'Media', icon: '▧', sub: [{ label: 'Thư viện' }, { label: 'Thêm tập tin mới' }] },
  { id: 'pages', label: 'Trang', icon: '▤', sub: [{ label: 'Tất cả các trang' }, { label: 'Thêm trang mới' }] },
  { id: 'comments', label: 'Phản hồi', icon: '▰' },
  { id: 'tours', label: 'Tours', icon: '✈', sub: [{ label: 'Tất cả tours' }, { label: 'Thêm tour mới' }, { label: 'Danh mục tour' }, { label: 'Giá & lịch khởi hành' }] },
  { id: 'cruises', label: 'Cruises', icon: '⚓', sub: [{ label: 'Tất cả cruises' }, { label: 'Thêm cruise mới' }] },
  { id: 'woocommerce', label: 'WooCommerce', icon: 'W', sub: [{ label: 'Trang chủ' }, { label: 'Đơn hàng' }, { label: 'Khách hàng' }, { label: 'Báo cáo' }, { label: 'Cài đặt' }] },
  { id: 'products', label: 'Sản phẩm', icon: '▦', sub: [{ label: 'Tất cả sản phẩm' }, { label: 'Thêm mới' }, { label: 'Danh mục' }, { label: 'Thẻ' }] },
  { id: 'analytics', label: 'Analytics', icon: '▥' },
  { id: 'marketing', label: 'Tiếp thị', icon: '◒' },
  { id: 'elementor', label: 'Elementor', icon: 'E' },
  { id: 'templates', label: 'Templates', icon: '◰' },
  { id: 'appearance', label: 'Giao diện', icon: '◨', sub: [{ label: 'Giao diện' }, { label: 'Tùy biến' }, { label: 'Widget' }, { label: 'Menu' }, { label: 'Theme File Editor' }] },
  { id: 'plugins', label: 'Plugin', icon: '◈', badge: 2, sub: [{ label: 'Plugin đã cài' }, { label: 'Cài mới' }, { label: 'Plugin File Editor' }] },
  { id: 'users', label: 'Thành viên', icon: '●', sub: [{ label: 'Tất cả thành viên' }, { label: 'Thêm thành viên mới' }, { label: 'Hồ sơ' }] },
  { id: 'tools', label: 'Công cụ', icon: '⚙', sub: [{ label: 'Công cụ có sẵn' }, { label: 'Nhập vào' }, { label: 'Xuất ra' }, { label: 'Tình trạng website' }] },
  { id: 'settings', label: 'Cài đặt', icon: '▥', sub: [{ label: 'Tổng quan' }, { label: 'Viết' }, { label: 'Đọc' }, { label: 'Thảo luận' }, { label: 'Đường dẫn tĩnh' }] },
  { id: 'identity', label: 'Site Identity', icon: '◎' },
  { id: 'navigation', label: 'Navigation', icon: '☰' },
  { id: 'homeBuilder', label: 'Homepage Builder', icon: '▣' },
  { id: 'homeSections', label: 'Homepage Sections', icon: '▥' },
  { id: 'staticPages', label: 'Static Pages', icon: '📄' },
  { id: 'footerBuilder', label: 'Footer', icon: '▨' },
  { id: 'siteJson', label: 'All Site JSON', icon: '{}' },
  { id: 'leads', label: 'Leads', icon: 'L' },
  { id: 'bookings', label: 'Bookings', icon: 'B' },
  { id: 'travelOs', label: 'Travel OS', icon: 'OS' }
];

const widgetLabels: Record<WidgetKey, string> = {
  welcome: 'Welcome panel', tracking: 'Notice theo dõi', woocommerce: 'Cài đặt WooCommerce', elementor: 'Tổng quan Elementor', draft: 'Bản nháp', news: 'Tin tức WordPress', dropzones: 'Khu vực kéo thả', activity: 'Hoạt động', health: 'Tình trạng website'
};

function adminScreenPath(screen: Screen) {
  return screen === 'dashboard' ? '/admin' : `/admin/${screen}`;
}

function WpButton({ children, primary = false, onClick, type = 'button' }: { children: ReactNode; primary?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} className={primary ? 'min-h-[30px] rounded-[3px] border border-[#2271b1] bg-[#2271b1] px-[10px] text-[13px] leading-7 text-white shadow-[0_1px_0_#135e96] hover:border-[#135e96] hover:bg-[#135e96] focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#72aee6]' : 'min-h-[30px] rounded-[3px] border border-[#2271b1] bg-[#f6f7f7] px-[10px] text-[13px] leading-7 text-[#2271b1] hover:border-[#135e96] hover:bg-[#f0f0f1] focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#72aee6]'}>{children}</button>;
}

function RedBadge({ value }: { value: number }) {
  return <span className="ml-[5px] inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#d63638] px-[5px] text-[11px] leading-none text-white">{value}</span>;
}

function Sidebar({ active, collapsed, onNavigate, onToggleCollapse }: { active: Screen; collapsed: boolean; onNavigate: (screen: Screen) => void; onToggleCollapse: () => void }) {
  return (
    <aside className={`${collapsed ? 'w-[36px]' : 'w-[160px]'} fixed bottom-0 left-0 top-[32px] z-40 overflow-y-auto bg-[#1d2327] text-[#c3c4c7] transition-[width] duration-150`}>
      <nav aria-label="Admin menu">
        <ul>
          {menuItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="relative">
                <button type="button" onClick={() => onNavigate(item.id)} className={`group relative flex min-h-[34px] w-full items-center text-left text-[13px] leading-[18px] transition ${isActive ? 'bg-[#2271b1] text-white' : 'text-[#c3c4c7] hover:bg-[#2271b1] hover:text-white'} ${collapsed ? 'justify-center px-0' : 'px-[8px]'}`} title={collapsed ? item.label : undefined}>
                  <span className={`grid h-[34px] w-[20px] shrink-0 place-items-center text-[15px] ${isActive ? 'text-white' : 'text-[#a7aaad] group-hover:text-white'}`}>{item.icon}</span>
                  {!collapsed ? <span className="min-w-0 truncate pl-[8px] font-normal">{item.label}{item.badge ? <RedBadge value={item.badge} /> : null}</span> : null}
                  {isActive && !collapsed ? <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[8px] border-r-[8px] border-y-transparent border-r-[#f0f0f1]" /> : null}
                </button>
                {isActive && item.sub && !collapsed ? <ul className="bg-[#2c3338] py-[7px] text-[13px]">{item.sub.map((sub, index) => <li key={sub.label}><button type="button" onClick={() => onNavigate(item.id)} className={`flex min-h-[28px] w-full items-center px-[12px] pl-[36px] text-left ${index === 0 ? 'text-white' : 'text-[#c3c4c7] hover:text-[#72aee6]'}`}>{sub.label}{sub.badge ? <RedBadge value={sub.badge} /> : null}</button></li>)}</ul> : null}
              </li>
            );
          })}
          <li><button type="button" onClick={onToggleCollapse} className={`mt-[8px] flex min-h-[34px] w-full items-center text-left text-[13px] text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6] ${collapsed ? 'justify-center px-0' : 'px-[8px]'}`}><span className="grid h-[34px] w-[20px] place-items-center text-[12px]">{collapsed ? '▶' : '◀'}</span>{!collapsed ? <span className="pl-[8px]">Thu gọn menu</span> : null}</button></li>
        </ul>
      </nav>
    </aside>
  );
}

export function AdminSidebar({ active, collapsed, onNavigate, onToggleCollapse }: { active: AdminScreen; collapsed: boolean; onNavigate: (screen: AdminScreen) => void; onToggleCollapse: () => void }) {
  return <Sidebar active={active} collapsed={collapsed} onNavigate={onNavigate} onToggleCollapse={onToggleCollapse} />;
}

function AdminBar({ identity, onNew, onDashboard }: { identity: SiteIdentity; onNew: () => void; onDashboard: () => void }) {
  const brandName = `${identity.titleLine1} ${identity.titleLine2}`.trim() || identity.adminSiteName;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-[32px] items-center justify-between bg-[#1d2327] px-0 text-[13px] text-[#c3c4c7] shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex h-full min-w-0 items-center">
        <button type="button" onClick={onDashboard} className="grid h-[32px] w-[36px] place-items-center text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]" aria-label={`${brandName} admin`}><span className="text-[18px] font-bold leading-none">W</span></button>
        <Link className="hidden h-[32px] items-center gap-[6px] px-[8px] text-[#c3c4c7] hover:bg-[#2c3338] hover:text-[#72aee6] sm:flex" href="/"><span>⌂</span><span>{brandName}</span></Link>
        <button type="button" className="hidden h-[32px] items-center gap-[5px] px-[8px] hover:bg-[#2c3338] hover:text-[#72aee6] md:flex"><span>↻</span><span>2</span></button>
        <button type="button" className="hidden h-[32px] items-center gap-[5px] px-[8px] hover:bg-[#2c3338] hover:text-[#72aee6] md:flex"><span>▰</span><span>0</span></button>
        <button type="button" onClick={onNew} className="flex h-[32px] items-center gap-[5px] px-[8px] hover:bg-[#2c3338] hover:text-[#72aee6]"><span className="text-[18px] leading-none">+</span><span>Mới</span></button>
      </div>
      <div className="flex h-full items-center gap-[8px] px-[10px] hover:bg-[#2c3338] hover:text-[#72aee6]"><button type="button" onClick={async () => { await fetch('/api/admin/auth/logout', { method: 'POST' }); window.location.href = '/admin/login'; }} className="flex items-center gap-[8px] text-left"><span>Chào, admin</span><span className="grid h-[18px] w-[18px] place-items-center rounded-sm bg-[#dcdcde] text-[11px] text-[#50575e]">👤</span></button></div>
    </div>
  );
}

export function AdminTopbar({ identity, onNew, onDashboard }: { identity: SiteIdentity; onNew: () => void; onDashboard: () => void }) {
  return <AdminBar identity={identity} onNew={onNew} onDashboard={onDashboard} />;
}

function ScreenTabs({ screenOptionsOpen, helpOpen, onScreenOptions, onHelp, hiddenWidgets, onToggleWidget, columns, onColumns }: {
  screenOptionsOpen: boolean; helpOpen: boolean; onScreenOptions: () => void; onHelp: () => void; hiddenWidgets: Record<string, boolean>; onToggleWidget: (key: WidgetKey) => void; columns: 2 | 4; onColumns: (columns: 2 | 4) => void;
}) {
  return (
    <div className="relative min-h-[34px]">
      <div className="absolute right-0 top-0 z-20 flex gap-[6px]">
        <button type="button" onClick={onScreenOptions} className="rounded-b-[3px] border border-t-0 border-[#ddd] bg-white px-[14px] py-[7px] text-[13px] text-[#555] hover:bg-[#f5f5f5]">Tùy chọn hiển thị ▾</button>
        <button type="button" onClick={onHelp} className="rounded-b-[3px] border border-t-0 border-[#ddd] bg-white px-[14px] py-[7px] text-[13px] text-[#555] hover:bg-[#f5f5f5]">Trợ giúp ▾</button>
      </div>
      {screenOptionsOpen ? <div className="border border-t-0 border-[#ddd] bg-white px-[16px] pb-[14px] pt-[44px] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="mb-[8px] font-semibold text-[#23282d]">Hộp trên màn hình</p><div className="grid gap-[6px] sm:grid-cols-2 lg:grid-cols-3">{(Object.keys(widgetLabels) as WidgetKey[]).map((key) => <label key={key} className="flex items-center gap-[6px] cursor-pointer"><input checked={!hiddenWidgets[key]} onChange={() => onToggleWidget(key)} type="checkbox" /> <span className="text-[#32373c]">{widgetLabels[key]}</span></label>)}</div><div className="mt-[12px] flex items-center gap-[12px]"><span className="font-semibold text-[#23282d]">Số cột</span><label className="flex items-center gap-[5px] cursor-pointer"><input checked={columns === 2} onChange={() => onColumns(2)} name="columns" type="radio" /> <span className="text-[#32373c]">2</span></label><label className="flex items-center gap-[5px] cursor-pointer"><input checked={columns === 4} onChange={() => onColumns(4)} name="columns" type="radio" /> <span className="text-[#32373c]">4</span></label></div></div> : null}
      {helpOpen ? <div className="border border-t-0 border-[#ddd] bg-white px-[16px] pb-[14px] pt-[44px] text-[13px] leading-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="font-semibold text-[#23282d]">Trợ giúp Bảng tin</p><p className="mt-[4px] max-w-[760px] text-[#555]">Đây là bản clone local của wp-admin. Các nút như Lưu nháp, ẩn thông báo, thu gọn widget và chọn cột được lưu trên trình duyệt để bạn thao tác thử mà không cần WordPress thật.</p></div> : null}
    </div>
  );
}

function Panel({ id, title, collapsed, onToggle, children }: { id: WidgetKey; title: string; collapsed: boolean; onToggle: (id: WidgetKey) => void; children: ReactNode }) {
  return <section className="border border-[#ddd] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]" style={{borderRadius: '4px'}}><div className="flex min-h-[40px] items-center justify-between border-b border-[#eee] px-[14px] py-[12px]" style={{backgroundColor: '#fafafa'}}><h2 className="text-[13px] font-semibold text-[#23282d]">{title}</h2><div className="flex items-center gap-[4px] text-[#72777c]"><button type="button" className="grid h-[24px] w-[24px] place-items-center hover:text-[#0073aa]" aria-label="Move widget up">⌃</button><button type="button" className="grid h-[24px] w-[24px] place-items-center hover:text-[#0073aa]" aria-label="Move widget down">⌄</button><button type="button" onClick={() => onToggle(id)} className="grid h-[24px] w-[24px] place-items-center hover:text-[#0073aa]" aria-label="Collapse widget">{collapsed ? '▾' : '▴'}</button></div></div>{!collapsed ? <div className="p-[14px] text-[13px] leading-6 text-[#32373c]">{children}</div> : null}</section>;
}

function WelcomePanel({ onDismiss, onStart }: { onDismiss: () => void; onStart: () => void }) {
  return <section className="relative mb-[16px] border border-[#dcdcde] bg-[#f3f8fd] px-[18px] py-[28px] text-center shadow-[0_1px_1px_rgba(0,0,0,0.04)]"><button type="button" onClick={onDismiss} className="absolute right-[14px] top-[12px] grid h-[22px] w-[22px] place-items-center rounded-full text-[18px] text-[#787c82] hover:bg-white hover:text-[#1d2327]" aria-label="Đóng welcome panel">×</button><h2 className="text-[22px] font-normal leading-8 text-[#1d2327]">Welcome to Orchid Store - Version 1.5.3</h2><p className="mx-auto mt-[12px] max-w-[820px] text-[13px] leading-6 text-[#646970]">Welcome! Thank you for choosing Orchid Store! To fully take advantage of the best our theme can offer please make sure you visit our <Link href="#welcome" className="text-[#2271b1] underline">Welcome page</Link>.</p><div className="mt-[12px]"><WpButton primary onClick={onStart}>Get started with Orchid Store</WpButton></div></section>;
}

function TrackingNotice({ onClose }: { onClose: () => void }) {
  return <section className="relative mb-[20px] border border-[#c3c4c7] border-l-[4px] border-l-[#dba617] bg-white px-[14px] py-[12px] shadow-[0_1px_1px_rgba(0,0,0,0.04)]"><button type="button" onClick={onClose} className="absolute right-[10px] top-[8px] grid h-[20px] w-[20px] place-items-center rounded-full text-[18px] text-[#787c82] hover:text-[#1d2327]" aria-label="Đóng thông báo">×</button><p className="pr-[28px] text-[13px] leading-6 text-[#3c434a]">Orchid Store is asking to allow tracking your non-sensitive WordPress data?</p><div className="mt-[10px] flex flex-wrap gap-[8px]"><WpButton primary onClick={onClose}>Allow</WpButton><WpButton onClick={onClose}>Do not show again</WpButton><WpButton onClick={onClose}>Later</WpButton></div></section>;
}

function WooWidget({ started, onStart }: { started: boolean; onStart: () => void }) {
  return <div className="flex items-center justify-between gap-[12px]"><div><span className="inline-flex rounded-full border border-[#c3c4c7] bg-white px-[14px] py-[4px] text-[12px] text-[#646970]">◌ Bước {started ? '3' : '2'} của 5</span><p className="mt-[14px] max-w-[300px] leading-6">You&apos;re almost there! Once you complete store setup you can start receiving orders.</p><div className="mt-[10px]"><WpButton primary onClick={onStart}>{started ? 'Tiếp tục cài đặt' : 'Bắt đầu bán hàng'}</WpButton></div></div><div className="hidden h-[88px] w-[110px] place-items-center bg-[#f3f8fd] text-[42px] sm:grid">🛒</div></div>;
}

function ElementorWidget() {
  return <div><div className="flex items-center justify-between gap-[10px] border-b border-[#dcdcde] pb-[10px]"><div className="flex items-center gap-[10px]"><span className="grid h-[32px] w-[32px] place-items-center rounded-full bg-black text-white">E</span><span>Elementor v3.19.0</span></div><WpButton>+ Tạo Trang Mới</WpButton></div><h3 className="mt-[12px] font-semibold">Chỉnh sửa gần đây</h3><ul className="mt-[6px] space-y-[4px]"><li><Link href="/" className="text-[#2271b1] hover:text-[#135e96]">Homepage</Link> <span className="text-[#646970]">✎ Th2 2nd, 19:43</span></li><li><Link href="/contact/" className="text-[#2271b1] hover:text-[#135e96]">Contact us</Link> <span className="text-[#646970]">✎ Th2 1st, 19:12</span></li></ul><h3 className="mt-[14px] font-semibold">Tin tức & Cập nhật</h3><p className="mt-[6px]"><span className="rounded-sm bg-[#00a32a] px-[5px] py-[1px] text-[11px] text-white">NEW</span> <a href="#elementor" className="text-[#2271b1] hover:text-[#135e96]">Introducing Elementor updates for local clone.</a></p></div>;
}

function QuickDraft({ drafts, onSave }: { drafts: Draft[]; onSave: (title: string, content: string) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!title.trim() && !content.trim()) return; onSave(title.trim() || 'Bản nháp không tiêu đề', content.trim()); setTitle(''); setContent(''); }
  return <form onSubmit={submit}><label htmlFor="draft-title" className="block text-[13px]">Tiêu đề</label><input id="draft-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-[4px] min-h-[30px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] text-[14px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" /><label htmlFor="draft-content" className="mt-[12px] block text-[13px]">Nội dung</label><textarea id="draft-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Bạn đang nghĩ gì?" className="mt-[4px] min-h-[88px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" /><div className="mt-[10px]"><WpButton primary type="submit">Lưu nháp</WpButton></div>{drafts.length ? <div className="mt-[14px] border-t border-[#dcdcde] pt-[10px]"><h3 className="font-semibold">Bản nháp local</h3><ul className="mt-[6px] space-y-[4px]">{drafts.slice(0, 3).map((draft) => <li key={draft.id}><a className="text-[#2271b1] hover:text-[#135e96]" href="#drafts">{draft.title}</a> <span className="text-[#646970]">{draft.createdAt}</span></li>)}</ul></div> : null}</form>;
}

function NewsWidget() {
  return <div><p>Tham dự một sự kiện sắp tới gần bạn. <span className="text-[#2271b1]">📍 Chọn địa điểm</span></p><div className="mt-[10px] border-y border-[#dcdcde] bg-[#f6f7f7] px-[10px] py-[9px]">Hiện không có sự kiện nào gần nơi bạn sống. Bạn có muốn <a href="#events" className="text-[#2271b1] underline">tổ chức sự kiện</a> không?</div><p className="mt-[10px]"><a href="#meetup" className="text-[#2271b1] hover:text-[#135e96]">Hà Nội WordPress Meetup tháng 01.2024</a></p></div>;
}

function DropZone() { return <div className="grid min-h-[255px] place-items-center border-[3px] border-dashed border-[#c3c4c7] bg-[#f6f7f7] text-[15px] text-[#646970]">Kéo các mục vào đây</div>; }

function Dashboard({ data, hiddenWidgets, collapsedWidgets, columns, dismissedWelcome, dismissedTracking, setupStarted, drafts, onDismissWelcome, onDismissTracking, onToggleWidget, onStartSetup, onSaveDraft }: {
  data: AdminCloneData; hiddenWidgets: Record<string, boolean>; collapsedWidgets: Record<string, boolean>; columns: 2 | 4; dismissedWelcome: boolean; dismissedTracking: boolean; setupStarted: boolean; drafts: Draft[]; onDismissWelcome: () => void; onDismissTracking: () => void; onToggleWidget: (id: WidgetKey) => void; onStartSetup: () => void; onSaveDraft: (title: string, content: string) => void;
}) {
  const gridClass = columns === 4 ? 'grid gap-[14px] xl:grid-cols-[minmax(250px,1fr)_minmax(250px,1fr)_minmax(250px,1fr)_minmax(250px,1fr)]' : 'grid gap-[14px] xl:grid-cols-2';
  return <>{!dismissedWelcome && !hiddenWidgets.welcome ? <WelcomePanel onDismiss={onDismissWelcome} onStart={onStartSetup} /> : null}{!dismissedTracking && !hiddenWidgets.tracking ? <TrackingNotice onClose={onDismissTracking} /> : null}<div className={gridClass}><div className="space-y-[18px]">{!hiddenWidgets.woocommerce ? <Panel id="woocommerce" title="Cài đặt WooCommerce" collapsed={Boolean(collapsedWidgets.woocommerce)} onToggle={onToggleWidget}><WooWidget started={setupStarted} onStart={onStartSetup} /></Panel> : null}{!hiddenWidgets.elementor ? <Panel id="elementor" title="Tổng quan Elementor" collapsed={Boolean(collapsedWidgets.elementor)} onToggle={onToggleWidget}><ElementorWidget /></Panel> : null}</div><div className="space-y-[18px]">{!hiddenWidgets.draft ? <Panel id="draft" title="Bản nháp" collapsed={Boolean(collapsedWidgets.draft)} onToggle={onToggleWidget}><QuickDraft drafts={drafts} onSave={onSaveDraft} /></Panel> : null}{!hiddenWidgets.news ? <Panel id="news" title="Tin tức và sự kiện về WordPress" collapsed={Boolean(collapsedWidgets.news)} onToggle={onToggleWidget}><NewsWidget /></Panel> : null}</div>{!hiddenWidgets.dropzones ? <DropZone /> : null}{!hiddenWidgets.dropzones ? <DropZone /> : null}</div><div className="mt-[18px] grid gap-[14px] xl:grid-cols-2">{!hiddenWidgets.activity ? <Panel id="activity" title="Hoạt động" collapsed={Boolean(collapsedWidgets.activity)} onToggle={onToggleWidget}><ul className="space-y-[8px]">{data.recent.map((item) => <li key={`${item.type}-${item.title}`}><span className="text-[#646970]">{item.type}</span> <a href={item.href} className="font-semibold text-[#2271b1] hover:text-[#135e96]">{item.title}</a><br /><span className="text-[#646970]">{item.date}</span></li>)}</ul></Panel> : null}{!hiddenWidgets.health ? <Panel id="health" title="Tình trạng website" collapsed={Boolean(collapsedWidgets.health)} onToggle={onToggleWidget}><p><strong>Tốt</strong>. Website đang chạy bằng dữ liệu local/fallback, không cần WordPress thật.</p><p className="mt-[6px]">Điểm governance trung bình: <strong>{data.averageScore}</strong>. Leads: <strong>{data.counts.leads}</strong>. Bookings: <strong>{data.counts.bookings}</strong>.</p></Panel> : null}</div></>;
}

function StatusPill({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const className = lower.includes('draft') || lower.includes('nháp') || lower.includes('pending') ? 'border-[#f0df9a] bg-[#fcf9e8] text-[#7a5d00]' : lower.includes('broken') || lower.includes('cancel') ? 'border-[#f0c9cc] bg-[#fcf0f1] text-[#b32d2e]' : 'border-[#b8e6bf] bg-[#edfaef] text-[#008a20]';
  return <span className={`inline-flex rounded-full border px-[7px] py-[1px] text-[11px] font-semibold uppercase leading-4 ${className}`}>{value}</span>;
}

type ItineraryDay = { day: string; title: string; description: string; image: string };
type PriceTier = { label: string; price: string; description: string };
type FaqItem = { question: string; answer: string };

type CmsEditorDraft = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
  price: string;
  status: string;
  // Hero / header
  route: string;
  theme: string;
  reviewRating: string;
  reviewCount: string;
  oldPrice: string;
  placesText: string;
  // Tour overview
  style: string;
  duration: string;
  departure: string;
  groupSize: string;
  suitable: string;
  tourType: string;
  fitnessLevel: string;
  language: string;
  country: string;
  // Logistics
  meals: string;
  transport: string;
  accommodation: string;
  // Highlights / notes
  highlightsText: string;
  travelNotesText: string;
  importantNotesText: string;
  // Pricing meta
  basePrice: string;
  currency: string;
  availability: string;
  // Map
  googleMapsEmbed: string;
  // Includes/excludes (frontend keys: includes/excludes)
  inclusionsText: string;
  exclusionsText: string;
  // Media
  galleryText: string;
  // Lists
  itinerary: ItineraryDay[];
  pricing: PriceTier[];
  faq: FaqItem[];
  // Source attribution
  sourceUrl: string;
  sourceName: string;
  sourceCompliance: string;
  sourceFactsText: string;
  // Translations
  translationsJson: string;
};

function toEditorDraft(row?: AdminContentRow): CmsEditorDraft {
  const meta = row?.meta || {};
  const details = (meta.details || {}) as Record<string, unknown>;
  const tourMeta = meta.tourMeta || {};
  const itinerary: ItineraryDay[] = (meta.itinerary || []).map((entry) => ({
    day: String(entry.day || ''),
    title: String(entry.title || ''),
    description: String(entry.description || entry.body || ''),
    image: String(entry.image || '')
  }));
  const pricing: PriceTier[] = (meta.pricing || []).map((entry) => ({
    label: String(entry.label || entry.name || ''),
    price: String(entry.price || entry.amount || ''),
    description: String(entry.description || entry.notes || '')
  }));
  const faq: FaqItem[] = (meta.faq || []).map((entry) => ({
    question: String(entry.question || ''),
    answer: String(entry.answer || '')
  }));
  const detailValue = (key: string) => typeof details[key] === 'string' ? (details[key] as string) : '';
  const detailArray = (key: string): string[] => Array.isArray(details[key]) ? (details[key] as unknown[]).filter((entry): entry is string => typeof entry === 'string') : [];
  const includes = detailArray('includes').length ? detailArray('includes') : (meta.inclusions || []);
  const excludes = detailArray('excludes').length ? detailArray('excludes') : (meta.exclusions || []);
  return {
    title: row?.title || '',
    slug: row?.slug || '',
    content: row?.content || row?.excerpt || '',
    excerpt: row?.excerpt || '',
    seoTitle: row?.seoTitle || row?.title || '',
    seoDescription: row?.seoDescription || row?.excerpt || '',
    featuredImage: row?.featuredImage || '',
    price: row?.price || tourMeta.basePrice || '',
    status: row?.status || 'Draft',
    // Hero / header
    route: detailValue('route'),
    theme: detailValue('theme'),
    reviewRating: detailValue('reviewRating') || detailValue('rating'),
    reviewCount: detailValue('reviewCount'),
    oldPrice: detailValue('oldPrice'),
    placesText: detailArray('places').join('\n'),
    // Tour overview
    style: detailValue('style'),
    duration: tourMeta.duration || detailValue('duration'),
    departure: detailValue('departure'),
    groupSize: detailValue('groupSize') || detailValue('group_size'),
    suitable: detailValue('suitable'),
    tourType: detailValue('tourType'),
    fitnessLevel: detailValue('fitnessLevel') || detailValue('fitness'),
    language: detailValue('language'),
    country: detailValue('country'),
    // Logistics
    meals: detailValue('meals'),
    transport: detailValue('transport'),
    accommodation: detailValue('accommodation'),
    // Highlights / notes
    highlightsText: detailArray('highlights').join('\n'),
    travelNotesText: detailArray('travelNotes').join('\n'),
    importantNotesText: detailArray('importantNotes').join('\n'),
    // Pricing meta
    basePrice: tourMeta.basePrice || (row?.price || ''),
    currency: tourMeta.currency || 'USD',
    availability: tourMeta.availability || 'available',
    // Map
    googleMapsEmbed: meta.googleMapsEmbed || detailValue('googleMapsEmbed'),
    // Includes/excludes
    inclusionsText: includes.join('\n'),
    exclusionsText: excludes.join('\n'),
    // Media
    galleryText: (meta.gallery || []).join('\n'),
    // Lists
    itinerary,
    pricing,
    faq,
    // Source attribution
    sourceUrl: detailValue('sourceUrl'),
    sourceName: detailValue('sourceName'),
    sourceCompliance: detailValue('sourceCompliance'),
    sourceFactsText: detailArray('sourceFacts').join('\n'),
    // Translations
    translationsJson: JSON.stringify(meta.translations || {}, null, 2)
  };
}

function slugFromTitle(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

function contentHref(resource: 'posts' | 'pages' | 'tours' | 'cruises' | 'products', slug: string, fallbackHref = '#preview') {
  if (!slug) return fallbackHref;
  if (resource === 'posts') return `/blog/${slug}/`;
  if (resource === 'pages') return `/${slug}/`;
  if (resource === 'cruises') return `/halong-bay-cruises/${slug}/`;
  return fallbackHref;
}

type EditorResource = 'posts' | 'pages' | 'tours' | 'cruises' | 'products';

function ContentEditorScreen({ title, noun, resource, draft, setDraft, onBack, onSave, supportsPrice = false, readOnly = false, saveLabel = 'Publish' }: { title: string; noun: string; resource: EditorResource; draft: CmsEditorDraft; setDraft: (draft: CmsEditorDraft) => void; onBack: () => void; onSave: () => void; supportsPrice?: boolean; readOnly?: boolean; saveLabel?: string }) {
  const update = (patch: Partial<CmsEditorDraft>) => setDraft({ ...draft, ...patch });
  const isTourLike = resource === 'tours' || resource === 'cruises' || resource === 'products';
  return (
    <section>
      <WpPageHeader title={title} actionLabel={`← Back to ${noun}s`} onAction={onBack} />
      {readOnly ? <WpNotice type="warning">This content type is currently locked for maintenance. You can review it, but write operations are disabled.</WpNotice> : <WpNotice type="info">Changes are saved to the local admin content store and merged into the public CMS data.</WpNotice>}
      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-[18px]">
          <WpClassicEditor title={draft.title} content={draft.content} onTitleChange={(value) => update({ title: value, seoTitle: draft.seoTitle || value })} onContentChange={(value) => update({ content: value })} />
          <WpPostbox title="Excerpt">
            <textarea value={draft.excerpt} onChange={(event) => update({ excerpt: event.target.value })} className="min-h-[96px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] text-[14px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" />
          </WpPostbox>
          <WpPostbox title="SEO fields">
            <WpField label="SEO title" value={draft.seoTitle} onChange={(value) => update({ seoTitle: value })} />
            <WpField label="Slug" value={draft.slug} onChange={(value) => update({ slug: value })} help="Matches the WordPress permalink field." />
            <WpField label="Meta description" value={draft.seoDescription} onChange={(value) => update({ seoDescription: value })} textarea />
          </WpPostbox>
          {isTourLike ? (
            <>
              <WpPostbox title="Hero header (route dossier + tagline + rating)">
                <p className="mb-[8px] text-[11px] text-[#646970]">Hiển thị trên hero banner: route dossier, tagline, badges, điểm review, route summary.</p>
                <div className="grid gap-[10px] sm:grid-cols-2">
                  <WpField label="Route (Hanoi - Halong Bay - ...)" value={draft.route} onChange={(route) => update({ route })} />
                  <WpField label="Theme / Tagline (Private countryside day)" value={draft.theme} onChange={(theme) => update({ theme })} />
                  <WpField label="Review rating (9.5)" value={draft.reviewRating} onChange={(reviewRating) => update({ reviewRating })} />
                  <WpField label="Review count label (Guest reviews / 128 reviews)" value={draft.reviewCount} onChange={(reviewCount) => update({ reviewCount })} />
                </div>
                <WpField label="Places (one per line) — chips dưới hero" value={draft.placesText} onChange={(placesText) => update({ placesText })} textarea />
              </WpPostbox>
              <WpPostbox title="Tour overview">
                <p className="mb-[8px] text-[11px] text-[#646970]">Chi tiết hiển thị ở tab Overview / Quick facts.</p>
                <div className="grid gap-[10px] sm:grid-cols-2">
                  <WpField label="Style" value={draft.style} onChange={(style) => update({ style })} />
                  <WpField label="Duration" value={draft.duration} onChange={(duration) => update({ duration })} />
                  <WpField label="Departure" value={draft.departure} onChange={(departure) => update({ departure })} />
                  <WpField label="Group size" value={draft.groupSize} onChange={(groupSize) => update({ groupSize })} />
                  <WpField label="Tour type (Private / Group / Flexible)" value={draft.tourType} onChange={(tourType) => update({ tourType })} />
                  <WpField label="Suitable for" value={draft.suitable} onChange={(suitable) => update({ suitable })} />
                  <WpField label="Fitness level" value={draft.fitnessLevel} onChange={(fitnessLevel) => update({ fitnessLevel })} />
                  <WpField label="Language" value={draft.language} onChange={(language) => update({ language })} />
                  <WpField label="Country" value={draft.country} onChange={(country) => update({ country })} />
                </div>
              </WpPostbox>
              <WpPostbox title="Logistics (meals / transport / accommodation)">
                <WpField label="Meals" value={draft.meals} onChange={(meals) => update({ meals })} textarea />
                <WpField label="Transport" value={draft.transport} onChange={(transport) => update({ transport })} textarea />
                <WpField label="Accommodation" value={draft.accommodation} onChange={(accommodation) => update({ accommodation })} textarea />
              </WpPostbox>
              <WpPostbox title="Highlights & notes">
                <WpField label="Highlights (one per line)" value={draft.highlightsText} onChange={(highlightsText) => update({ highlightsText })} textarea />
                <WpField label="Travel notes (one per line)" value={draft.travelNotesText} onChange={(travelNotesText) => update({ travelNotesText })} textarea />
                <WpField label="Important notes (one per line)" value={draft.importantNotesText} onChange={(importantNotesText) => update({ importantNotesText })} textarea />
              </WpPostbox>
              <WpPostbox title="Map">
                <WpField label="Google Maps embed URL" value={draft.googleMapsEmbed} onChange={(googleMapsEmbed) => update({ googleMapsEmbed })} help="Dán URL từ Google Maps → Share → Embed map (src=...)" />
              </WpPostbox>
              <WpPostbox title="Gallery (one image URL per line)">
                <textarea value={draft.galleryText} onChange={(event) => update({ galleryText: event.target.value })} className="min-h-[140px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] font-mono text-[12px] outline-none focus:border-[#2271b1]" placeholder="https://...jpg&#10;https://...jpg" />
                <p className="mt-[6px] text-[12px] text-[#646970]">{draft.galleryText.split('\n').filter((line) => line.trim()).length} images</p>
              </WpPostbox>
              <WpPostbox title="Itinerary (lịch trình theo ngày)">
                <ItineraryEditor value={draft.itinerary} onChange={(itinerary) => update({ itinerary })} />
              </WpPostbox>
              <WpPostbox title="Includes / Excludes">
                <label className="block">
                  <span className="text-[12px] font-semibold">Includes (one per line) — bao gồm trong giá</span>
                  <textarea value={draft.inclusionsText} onChange={(event) => update({ inclusionsText: event.target.value })} className="mt-[4px] min-h-[100px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] text-[13px] outline-none focus:border-[#2271b1]" />
                </label>
                <label className="mt-[10px] block">
                  <span className="text-[12px] font-semibold">Excludes (one per line) — không bao gồm</span>
                  <textarea value={draft.exclusionsText} onChange={(event) => update({ exclusionsText: event.target.value })} className="mt-[4px] min-h-[100px] w-full rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] text-[13px] outline-none focus:border-[#2271b1]" />
                </label>
              </WpPostbox>
              <WpPostbox title="Pricing tiers (bảng giá)">
                <PricingEditor value={draft.pricing} onChange={(pricing) => update({ pricing })} />
              </WpPostbox>
              <WpPostbox title="FAQ">
                <FaqEditor value={draft.faq} onChange={(faq) => update({ faq })} />
              </WpPostbox>
              <WpPostbox title="Source attribution (compliance)">
                <p className="mb-[8px] text-[11px] text-[#646970]">Ghi nguồn tham khảo public để tránh vi phạm bản quyền nội dung.</p>
                <div className="grid gap-[10px] sm:grid-cols-2">
                  <WpField label="Source URL" value={draft.sourceUrl} onChange={(sourceUrl) => update({ sourceUrl })} />
                  <WpField label="Source name" value={draft.sourceName} onChange={(sourceName) => update({ sourceName })} />
                </div>
                <WpField label="Compliance note" value={draft.sourceCompliance} onChange={(sourceCompliance) => update({ sourceCompliance })} textarea />
                <WpField label="Source facts (one per line)" value={draft.sourceFactsText} onChange={(sourceFactsText) => update({ sourceFactsText })} textarea />
              </WpPostbox>
            </>
          ) : null}
          <WpPostbox title="Translations (advanced JSON)">
            <p className="mb-[6px] text-[12px] text-[#646970]">Per-locale overrides for title/excerpt/content. Use locale keys (en, vi, fr, ...).</p>
            <textarea value={draft.translationsJson} onChange={(event) => update({ translationsJson: event.target.value })} className="min-h-[160px] w-full rounded-[2px] border border-[#8c8f94] bg-[#111] px-[10px] py-[8px] font-mono text-[12px] text-[#e5e5e5] outline-none focus:border-[#2271b1]" spellCheck={false} />
          </WpPostbox>
        </div>
        <aside className="space-y-[14px]">
          <WpPostbox title="Publish">
            <div className="space-y-[8px]">
              <p>Status: <strong>{draft.status}</strong></p>
              <p>Visibility: <strong>Public</strong></p>
              <p>Publish: <strong>Immediately</strong></p>
              <div className="flex flex-wrap gap-[8px] pt-[8px]"><AdminButton disabled={readOnly}>Save Draft</AdminButton><AdminButton primary onClick={readOnly ? undefined : onSave} disabled={readOnly}>{saveLabel}</AdminButton></div>
            </div>
          </WpPostbox>
          <WpPostbox title="Featured image">
            <WpField label="Image URL" value={draft.featuredImage} onChange={(value) => update({ featuredImage: value })} help="Use media library URL or remote image URL." />
            {draft.featuredImage ? <img src={draft.featuredImage} alt="" className="mt-[10px] aspect-video w-full border border-[#dcdcde] object-cover" /> : <div className="mt-[10px] grid min-h-[120px] place-items-center border border-dashed border-[#c3c4c7] bg-[#f6f7f7] text-[#646970]">No image selected</div>}
          </WpPostbox>
          {supportsPrice || isTourLike ? (
            <WpPostbox title="Price & availability">
              <div className="grid grid-cols-2 gap-[8px]">
                <WpField label="Base price" value={draft.basePrice} onChange={(basePrice) => update({ basePrice, price: basePrice })} />
                <WpField label="Currency" value={draft.currency} onChange={(currency) => update({ currency })} />
              </div>
              <WpSelect label="Availability" value={draft.availability} options={['available', 'on_request', 'sold_out']} onChange={(availability) => update({ availability })} />
            </WpPostbox>
          ) : null}
          <WpPostbox title="Categories"><label className="flex gap-[6px]"><input type="checkbox" defaultChecked /> <span>Uncategorized</span></label><label className="mt-[6px] flex gap-[6px]"><input type="checkbox" /> <span>Vietnam Travel</span></label><label className="mt-[6px] flex gap-[6px]"><input type="checkbox" /> <span>Luxury Tours</span></label><p className="mt-[6px] text-[11px] text-[#646970]">Wire categories đầy đủ khi DB live.</p></WpPostbox>
          <WpPostbox title="Tags"><input className="min-h-[30px] w-full rounded-[2px] border border-[#8c8f94] px-[8px]" placeholder="Separate tags with commas" /><p className="mt-[6px] text-[12px] text-[#646970]">Add or remove tags like WordPress.</p></WpPostbox>
        </aside>
      </div>
    </section>
  );
}

function ListItemControls({ onUp, onDown, onRemove, canUp, canDown }: { onUp: () => void; onDown: () => void; onRemove: () => void; canUp: boolean; canDown: boolean }) {
  return (
    <div className="flex gap-[6px]">
      <AdminButton onClick={onUp} disabled={!canUp}>↑</AdminButton>
      <AdminButton onClick={onDown} disabled={!canDown}>↓</AdminButton>
      <AdminButton onClick={onRemove}>Remove</AdminButton>
    </div>
  );
}

function ItineraryEditor({ value, onChange }: { value: ItineraryDay[]; onChange: (value: ItineraryDay[]) => void }) {
  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function patch(index: number, partial: Partial<ItineraryDay>) {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...partial } : entry)));
  }
  function add() {
    onChange([...value, { day: String(value.length + 1), title: '', description: '', image: '' }]);
  }
  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }
  return (
    <div className="space-y-[12px]">
      {value.length === 0 ? <p className="text-[12px] text-[#646970]">Chưa có ngày nào.</p> : null}
      {value.map((entry, index) => (
        <div key={index} className="rounded-[3px] border border-[#dcdcde] bg-[#fafafa] p-[10px]">
          <div className="mb-[6px] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#1d2327]">Day #{index + 1}</span>
            <ListItemControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} onRemove={() => remove(index)} canUp={index > 0} canDown={index < value.length - 1} />
          </div>
          <div className="grid gap-[8px] sm:grid-cols-2">
            <WpField label="Day label" value={entry.day} onChange={(day) => patch(index, { day })} />
            <WpField label="Title" value={entry.title} onChange={(title) => patch(index, { title })} />
            <WpField label="Image URL" value={entry.image} onChange={(image) => patch(index, { image })} />
            <WpField label="Description" value={entry.description} onChange={(description) => patch(index, { description })} textarea />
          </div>
        </div>
      ))}
      <AdminButton primary onClick={add}>+ Add day</AdminButton>
    </div>
  );
}

function PricingEditor({ value, onChange }: { value: PriceTier[]; onChange: (value: PriceTier[]) => void }) {
  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function patch(index: number, partial: Partial<PriceTier>) {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...partial } : entry)));
  }
  return (
    <div className="space-y-[10px]">
      {value.length === 0 ? <p className="text-[12px] text-[#646970]">Chưa có hạng giá nào.</p> : null}
      {value.map((entry, index) => (
        <div key={index} className="rounded-[3px] border border-[#dcdcde] bg-[#fafafa] p-[10px]">
          <div className="mb-[6px] flex items-center justify-between">
            <span className="text-[12px] font-semibold">Tier #{index + 1}</span>
            <ListItemControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} onRemove={() => onChange(value.filter((_, i) => i !== index))} canUp={index > 0} canDown={index < value.length - 1} />
          </div>
          <div className="grid gap-[8px] sm:grid-cols-3">
            <WpField label="Label" value={entry.label} onChange={(label) => patch(index, { label })} />
            <WpField label="Price" value={entry.price} onChange={(price) => patch(index, { price })} />
            <WpField label="Description" value={entry.description} onChange={(description) => patch(index, { description })} />
          </div>
        </div>
      ))}
      <AdminButton primary onClick={() => onChange([...value, { label: '', price: '', description: '' }])}>+ Add tier</AdminButton>
    </div>
  );
}

function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (value: FaqItem[]) => void }) {
  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function patch(index: number, partial: Partial<FaqItem>) {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...partial } : entry)));
  }
  return (
    <div className="space-y-[10px]">
      {value.length === 0 ? <p className="text-[12px] text-[#646970]">Chưa có FAQ nào.</p> : null}
      {value.map((entry, index) => (
        <div key={index} className="rounded-[3px] border border-[#dcdcde] bg-[#fafafa] p-[10px]">
          <div className="mb-[6px] flex items-center justify-between">
            <span className="text-[12px] font-semibold">FAQ #{index + 1}</span>
            <ListItemControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} onRemove={() => onChange(value.filter((_, i) => i !== index))} canUp={index > 0} canDown={index < value.length - 1} />
          </div>
          <WpField label="Question" value={entry.question} onChange={(question) => patch(index, { question })} />
          <WpField label="Answer" value={entry.answer} onChange={(answer) => patch(index, { answer })} textarea />
        </div>
      ))}
      <AdminButton primary onClick={() => onChange([...value, { question: '', answer: '' }])}>+ Add FAQ</AdminButton>
    </div>
  );
}

function CmsListScreen({ title, noun, resource, addLabel, rows, emptyText, supportsPrice = false, readOnly = false }: { title: string; noun: string; resource: 'posts' | 'pages' | 'tours' | 'cruises' | 'products'; addLabel: string; rows: AdminContentRow[]; emptyText: string; supportsPrice?: boolean; readOnly?: boolean }) {
  const [localRows, setLocalRows] = useState(rows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<AdminContentRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<CmsEditorDraft>(() => toEditorDraft());
  const visibleRows = localRows;

  function startEdit(row?: AdminContentRow) {
    setEditingRow(row || null);
    setIsCreating(!row);
    setDraft(toEditorDraft(row));
  }

  async function saveDraftToRows() {
    if (readOnly) {
      setError(`${noun} is locked for maintenance.`);
      return;
    }
    const slug = draft.slug || slugFromTitle(draft.title);
    const linesOf = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean);
    const gallery = linesOf(draft.galleryText);
    const includes = linesOf(draft.inclusionsText);
    const excludes = linesOf(draft.exclusionsText);
    const places = linesOf(draft.placesText);
    const highlights = linesOf(draft.highlightsText);
    const travelNotes = linesOf(draft.travelNotesText);
    const importantNotes = linesOf(draft.importantNotesText);
    const sourceFacts = linesOf(draft.sourceFactsText);
    const itineraryClean = draft.itinerary.filter((entry) => entry.title || entry.description || entry.day);
    const pricingClean = draft.pricing.filter((entry) => entry.label || entry.price);
    const faqClean = draft.faq.filter((entry) => entry.question && entry.answer);
    let translations: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(draft.translationsJson || '{}');
      if (parsed && typeof parsed === 'object') translations = parsed as Record<string, unknown>;
    } catch {
      setError('Translations JSON không hợp lệ.');
      return;
    }
    const detailsPayload: Record<string, unknown> = {
      ...(draft.route ? { route: draft.route } : {}),
      ...(draft.theme ? { theme: draft.theme } : {}),
      ...(draft.reviewRating ? { reviewRating: draft.reviewRating, rating: draft.reviewRating } : {}),
      ...(draft.reviewCount ? { reviewCount: draft.reviewCount } : {}),
      ...(draft.oldPrice ? { oldPrice: draft.oldPrice } : {}),
      ...(places.length ? { places } : {}),
      ...(draft.style ? { style: draft.style } : {}),
      ...(draft.duration ? { duration: draft.duration } : {}),
      ...(draft.departure ? { departure: draft.departure } : {}),
      ...(draft.groupSize ? { groupSize: draft.groupSize } : {}),
      ...(draft.suitable ? { suitable: draft.suitable } : {}),
      ...(draft.tourType ? { tourType: draft.tourType } : {}),
      ...(draft.fitnessLevel ? { fitnessLevel: draft.fitnessLevel } : {}),
      ...(draft.language ? { language: draft.language } : {}),
      ...(draft.country ? { country: draft.country } : {}),
      ...(draft.meals ? { meals: draft.meals } : {}),
      ...(draft.transport ? { transport: draft.transport } : {}),
      ...(draft.accommodation ? { accommodation: draft.accommodation } : {}),
      ...(highlights.length ? { highlights } : {}),
      ...(travelNotes.length ? { travelNotes } : {}),
      ...(importantNotes.length ? { importantNotes } : {}),
      ...(draft.basePrice ? { price: draft.basePrice } : {}),
      ...(draft.currency ? { currency: draft.currency } : {}),
      ...(draft.availability ? { availability: draft.availability } : {}),
      ...(draft.googleMapsEmbed ? { googleMapsEmbed: draft.googleMapsEmbed } : {}),
      ...(includes.length ? { includes } : {}),
      ...(excludes.length ? { excludes } : {}),
      ...(draft.sourceUrl ? { sourceUrl: draft.sourceUrl } : {}),
      ...(draft.sourceName ? { sourceName: draft.sourceName } : {}),
      ...(draft.sourceCompliance ? { sourceCompliance: draft.sourceCompliance } : {}),
      ...(sourceFacts.length ? { sourceFacts } : {})
    };
    const nextRow: AdminContentRow = {
      id: editingRow?.id || `local-${Date.now()}`,
      title: draft.title || `Untitled ${noun}`,
      kind: noun,
      status: 'Published',
      author: 'admin',
      date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
      href: editingRow?.href || contentHref(resource, slug),
      slug,
      excerpt: draft.excerpt || draft.content.slice(0, 120),
      content: draft.content,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      featuredImage: draft.featuredImage,
      price: draft.basePrice || draft.price,
      score: editingRow?.score ?? null,
      comments: editingRow?.comments ?? 0,
      meta: {
        gallery,
        itinerary: itineraryClean,
        faq: faqClean,
        pricing: pricingClean,
        details: detailsPayload,
        translations,
        tourMeta: { basePrice: draft.basePrice, currency: draft.currency, duration: draft.duration, availability: draft.availability },
        googleMapsEmbed: draft.googleMapsEmbed,
        inclusions: includes,
        exclusions: excludes
      }
    };
    setSaving(true);
    setError('');
    try {
      const payload = {
        resource,
        item: {
          ...nextRow,
          tourMeta: { basePrice: draft.basePrice, currency: draft.currency, duration: draft.duration, availability: draft.availability, gallery, itinerary: itineraryClean },
          meta: { _public_details: detailsPayload, _public_pricing: pricingClean, _public_faq: faqClean, _google_maps_embed: draft.googleMapsEmbed, translations }
        }
      };
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as { item?: Partial<AdminContentRow>; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error || 'Save failed');
      const savedRow: AdminContentRow = {
        ...nextRow,
        id: String(result.item.id || nextRow.id),
        title: String(result.item.title || nextRow.title),
        slug: typeof result.item.slug === 'string' ? result.item.slug : nextRow.slug,
        excerpt: typeof result.item.excerpt === 'string' ? result.item.excerpt : nextRow.excerpt,
        href: contentHref(resource, typeof result.item.slug === 'string' ? result.item.slug : nextRow.slug || '', nextRow.href)
      };
      setLocalRows((current) => editingRow ? current.map((row) => row.id === editingRow.id ? savedRow : row) : [savedRow, ...current]);
      setEditingRow(null);
      setIsCreating(false);
      setNotice(`${noun} saved. Public CMS data now reads from the local admin content store.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRows(rowsToDelete: AdminContentRow[]) {
    if (readOnly) {
      setError(`${noun} is locked for maintenance.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await Promise.all(rowsToDelete.map(async (row) => {
        const response = await fetch('/api/admin/site-content', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource, id: row.id, slug: row.slug })
        });
        if (!response.ok) {
          const result = await response.json() as { error?: string };
          throw new Error(result.error || 'Delete failed');
        }
      }));
      const deletedIds = new Set(rowsToDelete.map((row) => row.id));
      setLocalRows((current) => current.filter((row) => !deletedIds.has(row.id)));
      setNotice(`${rowsToDelete.length} item(s) moved to trash. Public CMS data will no longer show matching local/fallback slugs.`);
      setSelectedIds([]);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  function moveSelectedToTrash() {
    const rowsToDelete = localRows.filter((row) => selectedIds.includes(row.id));
    void deleteRows(rowsToDelete);
  }

  function moveRowToTrash(row: AdminContentRow) {
    void deleteRows([row]);
  }

  const columns: Array<WpTableColumn<AdminContentRow>> = [
    { key: 'title', label: 'Tiêu đề', render: (row) => <div><button type="button" onClick={() => startEdit(row)} className="font-semibold text-[#2271b1] hover:text-[#135e96]">{row.title}</button>{row.excerpt ? <p className="mt-[5px] max-w-[620px] text-[12px] leading-5 text-[#646970]">{row.excerpt}</p> : null}<div className="mt-[4px] flex flex-wrap gap-[5px] text-[12px]"><button type="button" onClick={() => startEdit(row)} className="text-[#2271b1]">{readOnly ? 'Xem' : 'Chỉnh sửa'}</button><span>|</span><button type="button" className="text-[#2271b1] disabled:text-[#a7aaad]" disabled={readOnly}>Sửa nhanh</button><span>|</span><button type="button" onClick={() => moveRowToTrash(row)} className="text-[#b32d2e] disabled:text-[#a7aaad]" disabled={readOnly || saving}>Thùng rác</button><span>|</span><a href={row.href} className="text-[#2271b1]">Xem public</a></div></div> },
    { key: 'author', label: 'Tác giả', width: '120px', render: (row) => row.author },
    { key: 'taxonomy', label: supportsPrice ? 'Giá' : 'Danh mục / Thẻ', width: '150px', render: (row) => supportsPrice ? (row.price || 'On request') : <span className="text-[#2271b1]">Uncategorized</span> },
    { key: 'score', label: 'SEO', width: '80px', render: (row) => row.score == null ? 'N/A' : `${row.score}%` },
    { key: 'date', label: 'Ngày', width: '145px', render: (row) => <div><span>{row.status}</span><br /><span className="text-[#646970]">{row.date}</span></div> }
  ];

  if (editingRow || isCreating) {
    return <ContentEditorScreen title={isCreating ? `Add New ${noun}` : readOnly ? `View ${noun}` : `Edit ${noun}`} noun={noun} resource={resource} draft={draft} setDraft={setDraft} onBack={() => { setEditingRow(null); setIsCreating(false); }} onSave={saveDraftToRows} supportsPrice={supportsPrice} readOnly={readOnly} saveLabel={saving ? 'Saving...' : 'Publish'} />;
  }

  return (
    <section>
      <WpPageHeader title={title} actionLabel={readOnly ? undefined : addLabel} onAction={() => startEdit()} />
      {readOnly ? <WpNotice type="warning">{title} is currently locked for maintenance. Write operations are disabled.</WpNotice> : null}
      {notice ? <WpNotice type="success" onDismiss={() => setNotice('')}>{notice}</WpNotice> : null}
      {error ? <WpNotice type="error" onDismiss={() => setError('')}>{error}</WpNotice> : null}
      <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[6px] text-[13px]"><a href="#all" className="font-semibold text-[#2271b1]">Tất cả ({visibleRows.length})</a><span>|</span><a href="#published" className="text-[#2271b1]">Đã xuất bản</a><span>|</span><a href="#draft" className="text-[#2271b1]">Nháp</a><span>|</span><a href="#trash" className="text-[#b32d2e]">Thùng rác</a></div>
        <div className="flex gap-[6px]"><input className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px]" placeholder={`Tìm ${noun.toLowerCase()}`} /><AdminButton>Tìm</AdminButton></div>
      </div>
      <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex flex-wrap gap-[6px]"><WpSelect value="Hành động hàng loạt" options={['Hành động hàng loạt', 'Chỉnh sửa', 'Bỏ vào thùng rác']} onChange={() => undefined} /><AdminButton onClick={selectedIds.length ? moveSelectedToTrash : undefined}>Áp dụng</AdminButton><WpSelect value="Tất cả các ngày" options={['Tất cả các ngày', 'Tháng này', 'Tháng trước']} onChange={() => undefined} /><WpSelect value="Tất cả danh mục" options={['Tất cả danh mục', 'Vietnam', 'Luxury Travel']} onChange={() => undefined} /><AdminButton>Lọc</AdminButton></div>
        <WpPagination total={visibleRows.length} />
      </div>
      <WpListTable rows={visibleRows} columns={columns} emptyText={emptyText} selectedIds={selectedIds} onSelect={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onSelectAll={() => setSelectedIds((current) => current.length === visibleRows.length ? [] : visibleRows.map((row) => row.id))} />
      <div className="mt-[8px] flex justify-end"><WpPagination total={visibleRows.length} /></div>
    </section>
  );
}

function AdminListTable({ title, addLabel, rows, emptyText }: { title: string; addLabel: string; rows: AdminContentRow[] | AdminCaptureRow[]; emptyText: string }) {
  return (
    <section>
      <div className="mb-[10px] flex flex-wrap items-center gap-[8px]"><h1 className="text-[23px] font-normal leading-8 text-[#1d2327]">{title}</h1><WpButton>{addLabel}</WpButton></div>
      <div className="mb-[8px] flex flex-wrap items-center justify-between gap-[10px]"><div className="flex items-center gap-[6px] text-[13px]"><a href="#all" className="font-semibold text-[#2271b1]">Tất cả ({rows.length})</a><span>|</span><a href="#published" className="text-[#2271b1]">Đã xuất bản</a><span>|</span><a href="#draft" className="text-[#2271b1]">Nháp</a></div><div className="flex gap-[6px]"><input className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px]" placeholder="Tìm kiếm" /><WpButton>Tìm</WpButton></div></div>
      <div className="mb-[8px] flex flex-wrap gap-[6px]"><select className="min-h-[30px] border border-[#8c8f94] bg-white px-[6px]"><option>Hành động hàng loạt</option><option>Chỉnh sửa</option><option>Bỏ vào thùng rác</option></select><WpButton>Áp dụng</WpButton><select className="min-h-[30px] border border-[#8c8f94] bg-white px-[6px]"><option>Tất cả các ngày</option></select><WpButton>Lọc</WpButton></div>
      <div className="overflow-x-auto border border-[#c3c4c7] bg-white"><table className="min-w-[850px] w-full border-collapse text-left text-[13px]"><thead><tr className="border-b border-[#c3c4c7]"><th className="w-[38px] px-[10px] py-[8px]"><input type="checkbox" aria-label="Chọn tất cả" /></th><th className="px-[10px] py-[8px] font-normal text-[#2271b1]">Tiêu đề</th><th className="w-[150px] px-[10px] py-[8px] font-normal">Tác giả / Liên hệ</th><th className="w-[130px] px-[10px] py-[8px] font-normal">Trạng thái</th><th className="w-[90px] px-[10px] py-[8px] font-normal">Điểm</th><th className="w-[150px] px-[10px] py-[8px] font-normal">Ngày</th></tr></thead><tbody>{rows.length ? rows.map((row, index) => { const isContent = 'href' in row; return <tr key={row.id} className={index % 2 === 0 ? 'bg-[#f6f7f7]' : 'bg-white'}><td className="border-t border-[#c3c4c7] px-[10px] py-[10px]"><input type="checkbox" aria-label={`Chọn ${row.title}`} /></td><td className="border-t border-[#c3c4c7] px-[10px] py-[10px] align-top"><a href={isContent ? row.href : '#capture'} className="font-semibold text-[#2271b1] hover:text-[#135e96]">{row.title}</a>{isContent && row.excerpt ? <p className="mt-[5px] max-w-[640px] text-[12px] leading-5 text-[#646970]">{row.excerpt}</p> : null}<div className="mt-[4px] flex gap-[5px] text-[12px]"><a href="#edit" className="text-[#2271b1]">Chỉnh sửa</a><span>|</span><a href="#quick" className="text-[#2271b1]">Sửa nhanh</a><span>|</span><a href={isContent ? row.href : '#view'} className="text-[#2271b1]">Xem</a></div></td><td className="border-t border-[#c3c4c7] px-[10px] py-[10px] align-top">{isContent ? row.author : row.contact}</td><td className="border-t border-[#c3c4c7] px-[10px] py-[10px] align-top"><StatusPill value={row.status} /></td><td className="border-t border-[#c3c4c7] px-[10px] py-[10px] align-top">{isContent ? (row.score == null ? 'N/A' : `${row.score}%`) : row.kind}</td><td className="border-t border-[#c3c4c7] px-[10px] py-[10px] align-top">{row.date}</td></tr>; }) : <tr><td colSpan={6} className="px-[10px] py-[30px] text-center text-[#646970]">{emptyText}</td></tr>}</tbody><tfoot><tr className="border-t border-[#c3c4c7]"><th className="px-[10px] py-[8px]"><input type="checkbox" aria-label="Chọn tất cả cuối bảng" /></th><th className="px-[10px] py-[8px] font-normal">Tiêu đề</th><th className="px-[10px] py-[8px] font-normal">Tác giả / Liên hệ</th><th className="px-[10px] py-[8px] font-normal">Trạng thái</th><th className="px-[10px] py-[8px] font-normal">Điểm</th><th className="px-[10px] py-[8px] font-normal">Ngày</th></tr></tfoot></table></div>
    </section>
  );
}

function MediaScreen() {
  const assets = ['/images/destinations/vietnam-ha-long-bay.jpg', '/images/hero/vietnam-hanoi-temple-of-literature-4k.jpg', '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg', '/images/booking/vietnam-ha-long-kayaks-4k.jpg', '/images/assurance/vietnam-golden-bridge-da-nang-4k.jpg', '/images/assurance-hd/vietnam-ha-giang-limestone-landscape-4k-hd.jpg'];
  const [mediaItems, setMediaItems] = useState(assets.map((src, index) => ({ id: `seed-${index}`, src, title: src.split('/').pop() || 'Media' })));
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveMediaUrl() {
    if (!newMediaUrl.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'media', item: { src: newMediaUrl.trim(), title: newMediaUrl.trim().split('/').pop() || 'Media item' } })
      });
      const result = await response.json() as { item?: { id?: string; src?: string; title?: string }; error?: string };
      if (!response.ok || !result.item?.src) throw new Error(result.error || 'Unable to save media');
      setMediaItems((current) => [{ id: result.item?.id || `media-${Date.now()}`, src: result.item?.src || newMediaUrl.trim(), title: result.item?.title || 'Media item' }, ...current]);
      setNewMediaUrl('');
      setNotice('Media item saved to .local-data/admin-content.json.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save media');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <WpPageHeader title="Thư viện Media" actionLabel="Thêm mới" />
      <WpNotice type="info">Media library follows the WordPress grid/list pattern. URL-based media items are saved locally; binary upload can be added later with a multipart endpoint.</WpNotice>
      {notice ? <WpNotice type="success" onDismiss={() => setNotice('')}>{notice}</WpNotice> : null}
      {error ? <WpNotice type="error" onDismiss={() => setError('')}>{error}</WpNotice> : null}
      <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex gap-[6px]"><button type="button" className="min-h-[30px] border border-[#2271b1] bg-[#2271b1] px-[10px] text-[13px] text-white">Grid</button><button type="button" className="min-h-[30px] border border-[#c3c4c7] bg-[#f6f7f7] px-[10px] text-[13px] text-[#50575e]">List</button><WpSelect value="All media items" options={['All media items', 'Images', 'Video', 'Unattached']} onChange={() => undefined} /><WpSelect value="All dates" options={['All dates', 'This month', 'Last month']} onChange={() => undefined} /></div>
        <div className="flex gap-[6px]"><input className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px]" placeholder="Search media" /><AdminButton>Search</AdminButton></div>
      </div>
      <div className="border border-dashed border-[#c3c4c7] bg-white p-[34px] text-center text-[#646970] shadow-[0_1px_1px_rgba(0,0,0,0.04)]"><p className="text-[18px]">Add media by URL</p><div className="mx-auto mt-[12px] flex max-w-[720px] gap-[6px]"><input value={newMediaUrl} onChange={(event) => setNewMediaUrl(event.target.value)} className="min-h-[30px] flex-1 rounded-[2px] border border-[#8c8f94] px-[8px] text-left" placeholder="https://... or /images/..." /><AdminButton primary onClick={saveMediaUrl} disabled={saving}>{saving ? 'Saving...' : 'Add Media'}</AdminButton></div><p className="mt-[12px] text-[12px]">Maximum upload file size follows your WordPress/PHP configuration when binary upload is connected.</p></div>
      <div className="mt-[18px] grid grid-cols-2 gap-[12px] sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{mediaItems.map((asset) => <button type="button" key={asset.id} className="group aspect-square border border-[#c3c4c7] bg-[#f6f7f7] p-[6px] hover:border-[#2271b1] focus:outline focus:outline-2 focus:outline-[#2271b1]" title={asset.title}><img src={asset.src} alt="" className="h-full w-full object-cover" /></button>)}{Array.from({ length: 10 }).map((_, index) => <button type="button" key={`placeholder-${index}`} className="aspect-square border border-[#dcdcde] bg-[#f6f7f7] text-[12px] text-[#8c8f94] hover:border-[#2271b1]">Media</button>)}</div>
    </section>
  );
}

function SettingsScreen() {
  const [settings, setSettings] = useState({
    siteName: 'Ha Long Luxury Travel',
    tagline: 'Tailor-made private journeys in Vietnam',
    wordpressUrl: 'http://localhost:3000/admin',
    siteUrl: 'http://localhost:3000',
    logoUrl: '/images/logo.png',
    seoTitle: 'Luxury Vietnam Tours & Halong Cruises',
    seoDescription: 'Private luxury tours, cruises and tailor-made travel planning in Vietnam.',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/'
  });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (patch: Partial<typeof settings>) => setSettings((current) => ({ ...current, ...patch }));

  async function saveSettings() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'settings', settings })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to save settings');
      setNotice('Settings saved to .local-data/admin-content.json.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <WpPageHeader title="Cài đặt chung" />
      <WpNotice type="info">Settings are saved to the local admin content store. Header/footer/homepage editing continues to use the dedicated Site Identity, Navigation, Homepage Builder and Footer screens.</WpNotice>
      {notice ? <WpNotice type="success" onDismiss={() => setNotice('')}>{notice}</WpNotice> : null}
      {error ? <WpNotice type="error" onDismiss={() => setError('')}>{error}</WpNotice> : null}
      <form className="max-w-[980px] border border-[#c3c4c7] bg-white p-[16px] text-[13px] shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <WpField label="Tên website" value={settings.siteName} onChange={(siteName) => update({ siteName })} />
        <WpField label="Khẩu hiệu" value={settings.tagline} onChange={(tagline) => update({ tagline })} />
        <WpField label="Địa chỉ WordPress (URL)" value={settings.wordpressUrl} onChange={(wordpressUrl) => update({ wordpressUrl })} />
        <WpField label="Địa chỉ website (URL)" value={settings.siteUrl} onChange={(siteUrl) => update({ siteUrl })} />
        <WpField label="Logo URL" value={settings.logoUrl} onChange={(logoUrl) => update({ logoUrl })} />
        <WpField label="Default SEO title" value={settings.seoTitle} onChange={(seoTitle) => update({ seoTitle })} />
        <WpField label="Default SEO description" value={settings.seoDescription} onChange={(seoDescription) => update({ seoDescription })} textarea />
        <WpField label="Facebook" value={settings.facebook} onChange={(facebook) => update({ facebook })} />
        <WpField label="Instagram" value={settings.instagram} onChange={(instagram) => update({ instagram })} />
        <div className="pt-[14px]"><AdminButton primary onClick={saveSettings} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</AdminButton></div>
      </form>
    </section>
  );
}

function GenericScreen({ title, copy }: { title: string; copy: string }) {
  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">{title}</h1><div className="border border-[#c3c4c7] bg-white p-[16px] text-[13px] leading-6 shadow-[0_1px_1px_rgba(0,0,0,0.04)]"><p>{copy}</p><div className="mt-[12px]"><WpButton primary>Mở công cụ local</WpButton></div></div></section>;
}

export function WordPressAdminClone({ data, initialSiteContent = defaultSiteContent, initialScreen }: { data: AdminCloneData; initialSiteContent?: SiteContent; initialScreen?: Screen }) {
  const [active, setActive] = useState<Screen>(initialScreen || 'dashboard');
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [screenOptionsOpen, setScreenOptionsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dismissedWelcome, setDismissedWelcome] = useState(false);
  const [dismissedTracking, setDismissedTracking] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);
  const [columns, setColumns] = useState<2 | 4>(4);
  const [hiddenWidgets, setHiddenWidgets] = useState<Record<string, boolean>>({});
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ active: Screen; menuCollapsed: boolean; dismissedWelcome: boolean; dismissedTracking: boolean; setupStarted: boolean; columns: 2 | 4; hiddenWidgets: Record<string, boolean>; collapsedWidgets: Record<string, boolean>; drafts: Draft[] }>;
        if (!initialScreen && parsed.active) setActive(parsed.active);
        setMenuCollapsed(Boolean(parsed.menuCollapsed));
        setDismissedWelcome(Boolean(parsed.dismissedWelcome));
        setDismissedTracking(Boolean(parsed.dismissedTracking));
        setSetupStarted(Boolean(parsed.setupStarted));
        if (parsed.columns === 2 || parsed.columns === 4) setColumns(parsed.columns);
        setHiddenWidgets(parsed.hiddenWidgets || {});
        setCollapsedWidgets(parsed.collapsedWidgets || {});
        setDrafts(Array.isArray(parsed.drafts) ? parsed.drafts : []);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, [initialScreen]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, menuCollapsed, dismissedWelcome, dismissedTracking, setupStarted, columns, hiddenWidgets, collapsedWidgets, drafts }));
  }, [active, menuCollapsed, dismissedWelcome, dismissedTracking, setupStarted, columns, hiddenWidgets, collapsedWidgets, drafts, hydrated]);

  const pageTitle = useMemo(() => menuItems.find((entry) => entry.id === active)?.label || 'Bảng tin', [active]);

  function navigate(screen: Screen) {
    setActive(screen);
    setScreenOptionsOpen(false);
    setHelpOpen(false);
    window.history.pushState(null, '', adminScreenPath(screen));
  }

  function toggleWidget(key: WidgetKey) {
    setCollapsedWidgets((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleHiddenWidget(key: WidgetKey) {
    setHiddenWidgets((current) => ({ ...current, [key]: !current[key] }));
  }

  function saveDraft(title: string, content: string) {
    const now = new Date();
    setDrafts((current) => [{ id: `${now.getTime()}`, title, content, createdAt: now.toLocaleString('vi-VN') }, ...current].slice(0, 12));
  }

  async function saveSiteContent() {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: siteContent })
      });
      if (!response.ok) throw new Error('Save failed');
      const result = (await response.json()) as { content: SiteContent };
      setSiteContent(result.content);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } catch {
      setSaveStatus('error');
    }
  }

  function resetSiteContent() {
    setSiteContent(defaultSiteContent);
    setSaveStatus('idle');
  }

  function renderScreen() {
    if (active === 'dashboard') {
      return <Dashboard data={data} hiddenWidgets={hiddenWidgets} collapsedWidgets={collapsedWidgets} columns={columns} dismissedWelcome={dismissedWelcome} dismissedTracking={dismissedTracking} setupStarted={setupStarted} drafts={drafts} onDismissWelcome={() => setDismissedWelcome(true)} onDismissTracking={() => setDismissedTracking(true)} onToggleWidget={toggleWidget} onStartSetup={() => setSetupStarted(true)} onSaveDraft={saveDraft} />;
    }
    if (active === 'identity') return <SiteIdentityEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'navigation') return <NavigationEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'homeBuilder') return <HomeBuilderEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'homeSections') return <HomeSectionsEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'staticPages') return <StaticPagesEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'footerBuilder') return <FooterEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'siteJson') return <JsonContentEditor content={siteContent} onChange={setSiteContent} onSave={saveSiteContent} onReset={resetSiteContent} status={saveStatus} />;
    if (active === 'posts') return <CmsListScreen key="posts" title="Bài viết" noun="Post" resource="posts" addLabel="Viết bài mới" rows={data.posts} emptyText="Chưa có bài viết local." />;
    if (active === 'tours') return <CmsListScreen key="tours" title="Tours" noun="Tour" resource="tours" addLabel="Thêm tour mới" rows={data.tours || data.products.filter((item) => item.kind === 'Tour')} emptyText="Chưa có tour local." supportsPrice />;
    if (active === 'cruises') return <CmsListScreen key="cruises" title="Cruises" noun="Cruise" resource="cruises" addLabel="Thêm cruise mới" rows={data.cruises} emptyText="Chưa có cruise local." supportsPrice />;
    if (active === 'products') return <CmsListScreen key="products" title="Sản phẩm" noun="Product" resource="products" addLabel="Thêm mới" rows={data.products} emptyText="Chưa có sản phẩm local." supportsPrice readOnly />;
    if (active === 'woocommerce') return <AdminListTable title="WooCommerce" addLabel="Tạo đơn hàng" rows={data.products.slice(0, 6)} emptyText="Chưa có đơn hàng local." />;
    if (active === 'leads') return <AdminListTable title="Leads" addLabel="Xuất CSV" rows={data.leads} emptyText="Chưa có lead trong .local-data." />;
    if (active === 'bookings') return <AdminListTable title="Bookings" addLabel="Xuất CSV" rows={data.bookings} emptyText="Chưa có booking trong .local-data." />;
    if (active === 'media') return <MediaScreen />;
    if (active === 'settings') return <SettingsScreen />;
    if (active === 'pages') return <CmsListScreen key="pages" title="Trang" noun="Page" resource="pages" addLabel="Thêm trang mới" rows={data.pages || data.posts.slice(0, 4)} emptyText="Chưa có trang local." />;
    if (active === 'comments') return <GenericScreen title="Phản hồi" copy="Khu vực phản hồi local mô phỏng danh sách comment, kiểm duyệt và thùng rác giống WordPress." />;
    if (active === 'travelOs') return <GenericScreen title="Travel OS" copy={`Nội dung local đang có ${data.counts.posts} posts, ${data.counts.tours} tours, ${data.counts.cruises} cruises. Điểm governance trung bình: ${data.averageScore}.`} />;
    return <GenericScreen title={pageTitle} copy="Màn hình này được clone theo phong cách wp-admin và đang chạy local trong Next.js." />;
  }

  return (
    <main className="hlt-wp-admin-clone min-h-screen bg-[#f0f0f1] text-[#1d2327]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}>
      <style>{`body:has(.hlt-wp-admin-clone) > header, body:has(.hlt-wp-admin-clone) > footer { display: none !important; } body:has(.hlt-wp-admin-clone) { margin: 0; background: #f0f0f1; } body:has(.hlt-wp-admin-clone) a { text-decoration: none; }`}</style>
      <AdminBar identity={siteContent.identity} onDashboard={() => navigate('dashboard')} onNew={() => navigate('posts')} />
      <Sidebar active={active} collapsed={menuCollapsed} onNavigate={navigate} onToggleCollapse={() => setMenuCollapsed((value) => !value)} />
      <div className={`${menuCollapsed ? 'pl-[36px]' : 'pl-[160px]'} pt-[32px] transition-[padding] duration-150`}>
        <section className="min-w-0 px-[20px] pb-[32px] pt-0">
          <ScreenTabs screenOptionsOpen={screenOptionsOpen} helpOpen={helpOpen} onScreenOptions={() => { setScreenOptionsOpen((value) => !value); setHelpOpen(false); }} onHelp={() => { setHelpOpen((value) => !value); setScreenOptionsOpen(false); }} hiddenWidgets={hiddenWidgets} onToggleWidget={toggleHiddenWidget} columns={columns} onColumns={setColumns} />
          {active === 'dashboard' ? <h1 className="mb-[12px] mt-[12px] text-[23px] font-normal leading-8">Bảng tin</h1> : null}
          {renderScreen()}
          <footer className="mt-[28px] flex flex-wrap justify-between gap-[12px] border-t border-transparent pt-[10px] text-[13px] text-[#646970]">
            <p>Cảm ơn bạn đã khởi tạo với WordPress.</p>
            <p>Phiên bản 6.4.3</p>
          </footer>
        </section>
      </div>
    </main>
  );
}




