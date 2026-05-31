'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SiteContent, TourNavItem, NavLink, HomeSectionId, HomeSectionContent, StaticPagesContent } from '@/lib/site-content-schema';
import { defaultSiteContent, defaultHomeSectionContent, homeSectionIds, resolveHomeSectionContent, resolveStaticPagesContent } from '@/lib/site-content-schema';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type EditorProps = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
  onSave: () => void;
  onReset: () => void;
  status: SaveStatus;
};

const sectionLabels: Record<HomeSectionId, string> = {
  destinations: 'Destination Mosaic',
  styles: 'Trip Style Deck',
  featuredTours: 'Featured Tours',
  spotlight: 'Home Feature Spotlight',
  whyChooseUs: 'Why Choose Us',
  journeyFlow: 'Journey Flow',
  bookingSteps: 'Easy Booking Steps',
  testimonials: 'Testimonials',
  designers: 'Travel Designers Strip',
  trustedBy: 'Trusted By Strip',
  blogPreview: 'Blog Preview',
  memoryGallery: 'Memory Gallery'
};

function AdminSaveBar({ onSave, onReset, status }: Pick<EditorProps, 'onSave' | 'onReset' | 'status'>) {
  const label = status === 'saving' ? 'Đang lưu...' : status === 'saved' ? 'Đã lưu' : status === 'error' ? 'Lỗi lưu' : 'Lưu thay đổi';
  return (
    <div className="sticky top-[32px] z-20 mb-[14px] flex flex-wrap items-center justify-between gap-[10px] border border-[#c3c4c7] bg-white px-[12px] py-[10px] shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
      <p className="text-[13px] text-[#50575e]">Dữ liệu đang lưu vào bản mirror admin-only trong database; public site chưa đổi nguồn chạy.</p>
      <div className="flex gap-[8px]"><button type="button" onClick={onReset} className="min-h-[30px] rounded-[3px] border border-[#2271b1] bg-[#f6f7f7] px-[10px] text-[13px] text-[#2271b1]">Reset mặc định</button><button type="button" onClick={onSave} disabled={status === 'saving'} className="min-h-[30px] rounded-[3px] border border-[#2271b1] bg-[#2271b1] px-[12px] text-[13px] text-white disabled:opacity-65">{label}</button></div>
    </div>
  );
}

function Field({ label, value, onChange, textarea = false, help }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; help?: string }) {
  return (
    <label className="grid gap-[7px] border-b border-[#dcdcde] py-[11px] text-[13px] sm:grid-cols-[210px_1fr]">
      <span><strong>{label}</strong>{help ? <small className="mt-[4px] block font-normal leading-5 text-[#646970]">{help}</small> : null}</span>
      {textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[96px] rounded-[2px] border border-[#8c8f94] px-[8px] py-[6px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[30px] rounded-[2px] border border-[#8c8f94] px-[8px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" />}
    </label>
  );
}

function EditorPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]"><h2 className="border-b border-[#c3c4c7] px-[12px] py-[9px] text-[14px] font-semibold">{title}</h2><div className="p-[12px]">{children}</div></section>;
}

export function SiteIdentityEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const identity = content.identity;
  const update = (patch: Partial<typeof identity>) => onChange({ ...content, identity: { ...identity, ...patch } });
  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">Site Identity</h1><AdminSaveBar onSave={onSave} onReset={onReset} status={status} /><EditorPanel title="Logo và thương hiệu"><Field label="Tên trên admin bar" value={identity.adminSiteName} onChange={(adminSiteName) => update({ adminSiteName })} /><Field label="Logo dòng 1" value={identity.titleLine1} onChange={(titleLine1) => update({ titleLine1 })} /><Field label="Logo dòng 2" value={identity.titleLine2} onChange={(titleLine2) => update({ titleLine2 })} /><Field label="Tagline" value={identity.tagline} onChange={(tagline) => update({ tagline })} /><Field label="Ảnh logo/mark URL" value={identity.markImage} onChange={(markImage) => update({ markImage })} help="Để trống sẽ dùng icon mặc định. Có thể nhập /images/... hoặc URL ảnh." /><Field label="Aria label" value={identity.ariaLabel} onChange={(ariaLabel) => update({ ariaLabel })} /></EditorPanel></section>;
}

function updateListItem<T>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
}

export function NavigationEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const navigation = content.navigation;
  const update = (patch: Partial<typeof navigation>) => onChange({ ...content, navigation: { ...navigation, ...patch } });
  const updateTour = (index: number, patch: Partial<TourNavItem>) => update({ tourChoices: updateListItem(navigation.tourChoices, index, patch) });
  const updateAbout = (index: number, patch: Partial<NavLink>) => update({ aboutChoices: updateListItem(navigation.aboutChoices, index, patch) });
  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">Navigation</h1><AdminSaveBar onSave={onSave} onReset={onReset} status={status} /><div className="grid gap-[16px]"><EditorPanel title="Header CTA"><Field label="CTA label" value={navigation.primaryCta.label} onChange={(label) => update({ primaryCta: { ...navigation.primaryCta, label } })} /><Field label="CTA URL" value={navigation.primaryCta.href} onChange={(href) => update({ primaryCta: { ...navigation.primaryCta, href } })} /><Field label="Mobile blog label" value={navigation.mobileBlogLink.label} onChange={(label) => update({ mobileBlogLink: { ...navigation.mobileBlogLink, label } })} /><Field label="Mobile blog URL" value={navigation.mobileBlogLink.href} onChange={(href) => update({ mobileBlogLink: { ...navigation.mobileBlogLink, href } })} /></EditorPanel><EditorPanel title="Our Tours dropdown">{navigation.tourChoices.map((item, index) => <div key={`${item.href}-${index}`} className="mb-[12px] border border-[#dcdcde] p-[10px]"><p className="mb-[6px] font-semibold">Tour item {index + 1}</p><Field label="Label" value={item.label} onChange={(label) => updateTour(index, { label })} /><Field label="URL" value={item.href} onChange={(href) => updateTour(index, { href })} /><Field label="Note" value={item.note} onChange={(note) => updateTour(index, { note })} /><Field label="Landmark" value={item.landmark} onChange={(landmark) => updateTour(index, { landmark })} /><Field label="Description" value={item.description || ''} onChange={(description) => updateTour(index, { description })} textarea /><Field label="Image" value={item.image} onChange={(image) => updateTour(index, { image })} /><Field label="Image alt" value={item.imageAlt} onChange={(imageAlt) => updateTour(index, { imageAlt })} /></div>)}</EditorPanel><EditorPanel title="About dropdown">{navigation.aboutChoices.map((item, index) => <div key={`${item.href}-${index}`} className="mb-[12px] border border-[#dcdcde] p-[10px]"><Field label={`Label ${index + 1}`} value={item.label} onChange={(label) => updateAbout(index, { label })} /><Field label="URL" value={item.href} onChange={(href) => updateAbout(index, { href })} /><Field label="Description" value={item.description || ''} onChange={(description) => updateAbout(index, { description })} textarea /></div>)}</EditorPanel></div></section>;
}

function moveSection(order: HomeSectionId[], index: number, direction: -1 | 1) {
  const next = [...order];
  const target = index + direction;
  if (target < 0 || target >= next.length) return order;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function HomeBuilderEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const home = content.home;
  const hero = home.hero;
  const updateHome = (patch: Partial<typeof home>) => onChange({ ...content, home: { ...home, ...patch } });
  const updateHero = (patch: Partial<typeof hero>) => updateHome({ hero: { ...hero, ...patch } });
  const sections = home.sections;
  const updateSections = (patch: Partial<typeof sections>) => updateHome({ sections: { ...sections, ...patch } });
  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">Homepage Builder</h1><AdminSaveBar onSave={onSave} onReset={onReset} status={status} /><div className="grid gap-[16px]"><EditorPanel title="Hero section"><Field label="Eyebrow" value={hero.eyebrow} onChange={(eyebrow) => updateHero({ eyebrow })} /><Field label="Title" value={hero.title} onChange={(title) => updateHero({ title })} textarea /><Field label="Subtitle" value={hero.subtitle} onChange={(subtitle) => updateHero({ subtitle })} textarea /><Field label="Main image" value={hero.image} onChange={(image) => updateHero({ image })} /><Field label="Primary CTA label" value={hero.primaryCta.label} onChange={(label) => updateHero({ primaryCta: { ...hero.primaryCta, label } })} /><Field label="Primary CTA URL" value={hero.primaryCta.href} onChange={(href) => updateHero({ primaryCta: { ...hero.primaryCta, href } })} /><Field label="Secondary CTA label" value={hero.secondaryCta.label} onChange={(label) => updateHero({ secondaryCta: { ...hero.secondaryCta, label } })} /><Field label="Secondary CTA URL" value={hero.secondaryCta.href} onChange={(href) => updateHero({ secondaryCta: { ...hero.secondaryCta, href } })} />{hero.images.map((image, index) => <div key={`${image.src}-${index}`} className="border-t border-[#dcdcde] pt-[10px]"><Field label={`Hero image ${index + 1}`} value={image.src} onChange={(src) => updateHero({ images: hero.images.map((item, itemIndex) => itemIndex === index ? { ...item, src } : item) })} /><Field label="Object position" value={image.position} onChange={(position) => updateHero({ images: hero.images.map((item, itemIndex) => itemIndex === index ? { ...item, position } : item) })} /></div>)}</EditorPanel><EditorPanel title="Section layout"><p className="mb-[10px] text-[13px] text-[#646970]">Bật/tắt và đổi thứ tự các section đang hiển thị trên homepage.</p><div className="grid gap-[8px]">{sections.order.map((sectionId, index) => <div key={sectionId} className="flex flex-wrap items-center justify-between gap-[10px] border border-[#dcdcde] bg-[#f6f7f7] px-[10px] py-[8px]"><label className="flex items-center gap-[8px]"><input checked={sections.visibility[sectionId]} onChange={() => updateSections({ visibility: { ...sections.visibility, [sectionId]: !sections.visibility[sectionId] } })} type="checkbox" /><span className="font-semibold">{sectionLabels[sectionId]}</span><span className="text-[#646970]">#{index + 1}</span></label><div className="flex gap-[6px]"><button type="button" onClick={() => updateSections({ order: moveSection(sections.order, index, -1) })} className="rounded border border-[#c3c4c7] bg-white px-[8px] py-[4px]">Lên</button><button type="button" onClick={() => updateSections({ order: moveSection(sections.order, index, 1) })} className="rounded border border-[#c3c4c7] bg-white px-[8px] py-[4px]">Xuống</button></div></div>)}</div></EditorPanel></div></section>;
}

export function FooterEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const footer = content.footer;
  const update = (patch: Partial<typeof footer>) => onChange({ ...content, footer: { ...footer, ...patch } });
  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">Footer</h1><AdminSaveBar onSave={onSave} onReset={onReset} status={status} /><EditorPanel title="Footer contact"><Field label="Heading" value={footer.contactHeading} onChange={(contactHeading) => update({ contactHeading })} /><Field label="Open hours" value={footer.openHours} onChange={(openHours) => update({ openHours })} /><Field label="Phone label" value={footer.phoneLabel} onChange={(phoneLabel) => update({ phoneLabel })} /><Field label="Phone href" value={footer.phoneHref} onChange={(phoneHref) => update({ phoneHref })} /><Field label="Phone display" value={footer.phoneDisplay} onChange={(phoneDisplay) => update({ phoneDisplay })} /><Field label="Email" value={footer.email} onChange={(email) => update({ email })} /><Field label="Address" value={footer.address} onChange={(address) => update({ address })} /><Field label="Map link" value={footer.mapLink} onChange={(mapLink) => update({ mapLink })} /><Field label="Copyright" value={footer.copyright} onChange={(copyright) => update({ copyright })} textarea /></EditorPanel></section>;
}

export function JsonContentEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const initialDraft = JSON.stringify(content, null, 2);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState('');
  const lastEmittedRef = useRef(initialDraft);

  useEffect(() => {
    const incoming = JSON.stringify(content, null, 2);
    if (incoming !== lastEmittedRef.current) {
      lastEmittedRef.current = incoming;
      setDraft(incoming);
      setError('');
    }
  }, [content]);

  function updateDraft(value: string) {
    setDraft(value);
    try {
      const parsed = JSON.parse(value) as SiteContent;
      lastEmittedRef.current = JSON.stringify(parsed, null, 2);
      onChange(parsed);
      setError('');
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'JSON không hợp lệ');
    }
  }

  return <section><h1 className="mb-[12px] text-[23px] font-normal leading-8">All Site JSON</h1><AdminSaveBar onSave={onSave} onReset={onReset} status={status} /><EditorPanel title="Advanced full-site content"><p className="mb-[8px] text-[13px] text-[#646970]">Dùng phần này để sửa mọi dữ liệu site content khi chưa có form riêng. JSON sai sẽ không được áp dụng.</p>{error ? <p className="mb-[8px] border-l-[4px] border-[#d63638] bg-[#fcf0f1] px-[10px] py-[6px] text-[13px] text-[#8a2424]">{error}</p> : null}<textarea value={draft} onChange={(event) => updateDraft(event.target.value)} className="min-h-[560px] w-full rounded-[2px] border border-[#8c8f94] bg-[#111] p-[12px] font-mono text-[12px] leading-5 text-[#e5e5e5] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]" spellCheck={false} /></EditorPanel></section>;
}

type SectionKey = keyof HomeSectionContent;

const sectionTitles: Record<SectionKey, string> = {
  whyChooseUs: 'Why Choose Us',
  journeyFlow: 'Journey Flow',
  bookingSteps: 'Easy Booking Steps',
  trustedBy: 'Trusted By',
  spotlight: 'Home Feature Spotlight',
  blogPreview: 'Blog Preview',
  testimonials: 'Testimonials',
  designers: 'Travel Designers Strip',
  memoryGallery: 'Memory Gallery',
  destinations: 'Destination Mosaic',
  styles: 'Trip Style Deck',
  featuredTours: 'Featured Tours'
};

function ItemsJsonEditor({ label, value, onChange }: { label: string; value: unknown; onChange: (next: unknown) => void }) {
  const initialDraft = JSON.stringify(value, null, 2);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState('');
  const lastEmittedRef = useRef(initialDraft);

  useEffect(() => {
    const incoming = JSON.stringify(value, null, 2);
    if (incoming !== lastEmittedRef.current) {
      lastEmittedRef.current = incoming;
      setDraft(incoming);
      setError('');
    }
  }, [value]);

  function update(text: string) {
    setDraft(text);
    try {
      const parsed = JSON.parse(text);
      lastEmittedRef.current = JSON.stringify(parsed, null, 2);
      onChange(parsed);
      setError('');
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'JSON không hợp lệ');
    }
  }

  return (
    <label className="grid gap-[7px] border-b border-[#dcdcde] py-[11px] text-[13px]">
      <span><strong>{label}</strong> <small className="ml-[6px] font-normal text-[#646970]">Sửa danh sách dạng JSON. Nếu sai cú pháp sẽ không lưu.</small></span>
      {error ? <span className="border-l-[4px] border-[#d63638] bg-[#fcf0f1] px-[8px] py-[4px] text-[12px] text-[#8a2424]">{error}</span> : null}
      <textarea value={draft} onChange={(event) => update(event.target.value)} className="min-h-[180px] rounded-[2px] border border-[#8c8f94] bg-[#111] p-[10px] font-mono text-[12px] leading-5 text-[#e5e5e5] outline-none focus:border-[#2271b1]" spellCheck={false} />
    </label>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-[#c3c4c7] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between border-b border-[#c3c4c7] px-[12px] py-[9px] text-left text-[14px] font-semibold hover:bg-[#f6f7f7]">
        <span>{title}</span>
        <span className="text-[#646970]">{open ? '▴' : '▾'}</span>
      </button>
      {open ? <div className="p-[12px]">{children}</div> : null}
    </section>
  );
}

export function HomeSectionsEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const resolved = resolveHomeSectionContent(content);

  function updateSection<K extends SectionKey>(key: K, patch: Partial<HomeSectionContent[K]>) {
    const current = (content.home.sectionContent || {}) as Partial<HomeSectionContent>;
    const next: SiteContent = {
      ...content,
      home: {
        ...content.home,
        sectionContent: { ...current, [key]: { ...resolved[key], ...patch } }
      }
    };
    onChange(next);
  }

  const sec = resolved;

  return (
    <section>
      <h1 className="mb-[12px] text-[23px] font-normal leading-8">Homepage Sections Content</h1>
      <AdminSaveBar onSave={onSave} onReset={onReset} status={status} />
      <p className="mb-[12px] text-[13px] text-[#646970]">Chỉnh sửa nội dung text/CTA/list cho từng section đang hiển thị trên trang chủ. Mỗi panel có thể mở/đóng.</p>

      <div className="grid gap-[12px]">
        <CollapsibleSection title={sectionTitles.whyChooseUs} defaultOpen>
          <Field label="Eyebrow" value={sec.whyChooseUs.eyebrow} onChange={(eyebrow) => updateSection('whyChooseUs', { eyebrow })} />
          <Field label="Heading" value={sec.whyChooseUs.heading} onChange={(heading) => updateSection('whyChooseUs', { heading })} textarea />
          <Field label="Background image" value={sec.whyChooseUs.backgroundImage} onChange={(backgroundImage) => updateSection('whyChooseUs', { backgroundImage })} />
          <ItemsJsonEditor label="Items (4 cards)" value={sec.whyChooseUs.items} onChange={(items) => updateSection('whyChooseUs', { items: items as HomeSectionContent['whyChooseUs']['items'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.journeyFlow}>
          <Field label="Eyebrow" value={sec.journeyFlow.eyebrow} onChange={(eyebrow) => updateSection('journeyFlow', { eyebrow })} />
          <Field label="Heading" value={sec.journeyFlow.heading} onChange={(heading) => updateSection('journeyFlow', { heading })} textarea />
          <Field label="Lead" value={sec.journeyFlow.lead} onChange={(lead) => updateSection('journeyFlow', { lead })} textarea />
          <Field label="Banner eyebrow" value={sec.journeyFlow.bannerEyebrow} onChange={(bannerEyebrow) => updateSection('journeyFlow', { bannerEyebrow })} />
          <Field label="Banner body" value={sec.journeyFlow.bannerBody} onChange={(bannerBody) => updateSection('journeyFlow', { bannerBody })} textarea />
          <ItemsJsonEditor label="Steps (4)" value={sec.journeyFlow.steps} onChange={(steps) => updateSection('journeyFlow', { steps: steps as HomeSectionContent['journeyFlow']['steps'] })} />
          <ItemsJsonEditor label="Assurance items (3)" value={sec.journeyFlow.assuranceItems} onChange={(assuranceItems) => updateSection('journeyFlow', { assuranceItems: assuranceItems as HomeSectionContent['journeyFlow']['assuranceItems'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.bookingSteps}>
          <Field label="Heading" value={sec.bookingSteps.heading} onChange={(heading) => updateSection('bookingSteps', { heading })} textarea />
          <Field label="CTA label" value={sec.bookingSteps.ctaLabel} onChange={(ctaLabel) => updateSection('bookingSteps', { ctaLabel })} />
          <Field label="CTA URL" value={sec.bookingSteps.ctaHref} onChange={(ctaHref) => updateSection('bookingSteps', { ctaHref })} />
          <Field label="Image URL" value={sec.bookingSteps.image} onChange={(image) => updateSection('bookingSteps', { image })} />
          <Field label="Image alt" value={sec.bookingSteps.imageAlt} onChange={(imageAlt) => updateSection('bookingSteps', { imageAlt })} />
          <Field label="Image overlay text" value={sec.bookingSteps.imageOverlay} onChange={(imageOverlay) => updateSection('bookingSteps', { imageOverlay })} textarea />
          <ItemsJsonEditor label="Steps (3)" value={sec.bookingSteps.steps} onChange={(steps) => updateSection('bookingSteps', { steps: steps as HomeSectionContent['bookingSteps']['steps'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.trustedBy}>
          <Field label="Eyebrow" value={sec.trustedBy.eyebrow} onChange={(eyebrow) => updateSection('trustedBy', { eyebrow })} />
          <Field label="Heading" value={sec.trustedBy.heading} onChange={(heading) => updateSection('trustedBy', { heading })} textarea />
          <Field label="Lead" value={sec.trustedBy.lead} onChange={(lead) => updateSection('trustedBy', { lead })} textarea />
          <Field label="Partners label" value={sec.trustedBy.partnersLabel} onChange={(partnersLabel) => updateSection('trustedBy', { partnersLabel })} />
          <Field label="Press label" value={sec.trustedBy.pressLabel} onChange={(pressLabel) => updateSection('trustedBy', { pressLabel })} />
          <ItemsJsonEditor label="Logos" value={sec.trustedBy.logos} onChange={(logos) => updateSection('trustedBy', { logos: logos as HomeSectionContent['trustedBy']['logos'] })} />
          <ItemsJsonEditor label="Press marks" value={sec.trustedBy.pressMarks} onChange={(pressMarks) => updateSection('trustedBy', { pressMarks: pressMarks as string[] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.spotlight}>
          <Field label="Eyebrow" value={sec.spotlight.eyebrow} onChange={(eyebrow) => updateSection('spotlight', { eyebrow })} />
          <Field label="Heading" value={sec.spotlight.heading} onChange={(heading) => updateSection('spotlight', { heading })} textarea />
          <Field label="Lead" value={sec.spotlight.lead} onChange={(lead) => updateSection('spotlight', { lead })} textarea />
          <Field label="CTA label" value={sec.spotlight.ctaLabel} onChange={(ctaLabel) => updateSection('spotlight', { ctaLabel })} />
          <Field label="CTA URL" value={sec.spotlight.ctaHref} onChange={(ctaHref) => updateSection('spotlight', { ctaHref })} />
          <Field label="Hero image" value={sec.spotlight.heroImage} onChange={(heroImage) => updateSection('spotlight', { heroImage })} />
          <Field label="Hero image alt" value={sec.spotlight.heroImageAlt} onChange={(heroImageAlt) => updateSection('spotlight', { heroImageAlt })} />
          <Field label="Hero badge left" value={sec.spotlight.heroBadgeLeft} onChange={(heroBadgeLeft) => updateSection('spotlight', { heroBadgeLeft })} />
          <Field label="Hero badge right" value={sec.spotlight.heroBadgeRight} onChange={(heroBadgeRight) => updateSection('spotlight', { heroBadgeRight })} />
          <Field label="Hero eyebrow" value={sec.spotlight.heroEyebrow} onChange={(heroEyebrow) => updateSection('spotlight', { heroEyebrow })} />
          <Field label="Hero title" value={sec.spotlight.heroTitle} onChange={(heroTitle) => updateSection('spotlight', { heroTitle })} textarea />
          <ItemsJsonEditor label="Assurance pills (string[])" value={sec.spotlight.assurances} onChange={(assurances) => updateSection('spotlight', { assurances: assurances as string[] })} />
          <ItemsJsonEditor label="Features (3 cards, iconKey ∈ Compass|Hotel|ShieldCheck|BadgeCheck)" value={sec.spotlight.features} onChange={(features) => updateSection('spotlight', { features: features as HomeSectionContent['spotlight']['features'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.blogPreview}>
          <Field label="Eyebrow" value={sec.blogPreview.eyebrow} onChange={(eyebrow) => updateSection('blogPreview', { eyebrow })} />
          <Field label="Heading" value={sec.blogPreview.heading} onChange={(heading) => updateSection('blogPreview', { heading })} textarea />
          <Field label="Lead" value={sec.blogPreview.lead} onChange={(lead) => updateSection('blogPreview', { lead })} textarea />
          <Field label="CTA label" value={sec.blogPreview.ctaLabel} onChange={(ctaLabel) => updateSection('blogPreview', { ctaLabel })} />
          <Field label="CTA URL" value={sec.blogPreview.ctaHref} onChange={(ctaHref) => updateSection('blogPreview', { ctaHref })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.testimonials}>
          <Field label="Eyebrow" value={sec.testimonials.eyebrow} onChange={(eyebrow) => updateSection('testimonials', { eyebrow })} />
          <Field label="Background image" value={sec.testimonials.backgroundImage} onChange={(backgroundImage) => updateSection('testimonials', { backgroundImage })} />
          <Field label="Fallback quote" value={sec.testimonials.fallbackQuote} onChange={(fallbackQuote) => updateSection('testimonials', { fallbackQuote })} textarea />
          <Field label="Fallback author" value={sec.testimonials.fallbackAuthor} onChange={(fallbackAuthor) => updateSection('testimonials', { fallbackAuthor })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.designers}>
          <Field label="Eyebrow" value={sec.designers.eyebrow} onChange={(eyebrow) => updateSection('designers', { eyebrow })} />
          <Field label="Heading" value={sec.designers.heading} onChange={(heading) => updateSection('designers', { heading })} textarea />
          <Field label="Lead" value={sec.designers.lead} onChange={(lead) => updateSection('designers', { lead })} textarea />
          <Field label="CTA label" value={sec.designers.ctaLabel} onChange={(ctaLabel) => updateSection('designers', { ctaLabel })} />
          <Field label="CTA URL" value={sec.designers.ctaHref} onChange={(ctaHref) => updateSection('designers', { ctaHref })} />
          <Field label="Slider helper" value={sec.designers.sliderHelper} onChange={(sliderHelper) => updateSection('designers', { sliderHelper })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.memoryGallery}>
          <Field label="Eyebrow" value={sec.memoryGallery.eyebrow} onChange={(eyebrow) => updateSection('memoryGallery', { eyebrow })} />
          <Field label="Heading" value={sec.memoryGallery.heading} onChange={(heading) => updateSection('memoryGallery', { heading })} textarea />
          <Field label="Description" value={sec.memoryGallery.description} onChange={(description) => updateSection('memoryGallery', { description })} textarea />
          <Field label="Side note" value={sec.memoryGallery.sideNote} onChange={(sideNote) => updateSection('memoryGallery', { sideNote })} textarea />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.destinations}>
          <Field label="Eyebrow" value={sec.destinations.eyebrow} onChange={(eyebrow) => updateSection('destinations', { eyebrow })} />
          <Field label="Heading" value={sec.destinations.heading} onChange={(heading) => updateSection('destinations', { heading })} textarea />
          <Field label="Lead" value={sec.destinations.lead} onChange={(lead) => updateSection('destinations', { lead })} textarea />
          <Field label="Index eyebrow" value={sec.destinations.indexEyebrow} onChange={(indexEyebrow) => updateSection('destinations', { indexEyebrow })} />
          <Field label="Index caption" value={sec.destinations.indexCaption} onChange={(indexCaption) => updateSection('destinations', { indexCaption })} textarea />
          <ItemsJsonEditor label="Atlas (6 hub cards)" value={sec.destinations.atlas} onChange={(atlas) => updateSection('destinations', { atlas: atlas as HomeSectionContent['destinations']['atlas'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.styles}>
          <Field label="Eyebrow" value={sec.styles.eyebrow} onChange={(eyebrow) => updateSection('styles', { eyebrow })} />
          <Field label="Heading" value={sec.styles.heading} onChange={(heading) => updateSection('styles', { heading })} textarea />
          <Field label="Lead" value={sec.styles.lead} onChange={(lead) => updateSection('styles', { lead })} textarea />
          <Field label="CTA label" value={sec.styles.ctaLabel} onChange={(ctaLabel) => updateSection('styles', { ctaLabel })} />
          <Field label="CTA URL" value={sec.styles.ctaHref} onChange={(ctaHref) => updateSection('styles', { ctaHref })} />
          <Field label="Count label" value={sec.styles.countLabel} onChange={(countLabel) => updateSection('styles', { countLabel })} />
          <Field label="Gallery eyebrow" value={sec.styles.galleryEyebrow} onChange={(galleryEyebrow) => updateSection('styles', { galleryEyebrow })} />
          <Field label="Gallery title" value={sec.styles.galleryTitle} onChange={(galleryTitle) => updateSection('styles', { galleryTitle })} />
        </CollapsibleSection>

        <CollapsibleSection title={sectionTitles.featuredTours}>
          <Field label="Eyebrow" value={sec.featuredTours.eyebrow} onChange={(eyebrow) => updateSection('featuredTours', { eyebrow })} />
          <Field label="Heading" value={sec.featuredTours.heading} onChange={(heading) => updateSection('featuredTours', { heading })} textarea />
        </CollapsibleSection>
      </div>
    </section>
  );
}

void defaultHomeSectionContent;

type StaticPageKey = keyof StaticPagesContent;

const staticPageTitles: Record<StaticPageKey, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  contact: 'Contact',
  faqs: 'FAQs',
  hubs: 'Hub Destinations',
  travelStyles: 'Travel Styles index',
  cruisesIndex: 'Cruises index'
};

export function StaticPagesEditor({ content, onChange, onSave, onReset, status }: EditorProps) {
  const resolved = resolveStaticPagesContent(content);

  function updatePage<K extends StaticPageKey>(key: K, patch: Partial<StaticPagesContent[K]>) {
    const current = content.pages || {};
    const next: SiteContent = {
      ...content,
      pages: { ...current, [key]: { ...resolved[key], ...patch } }
    };
    onChange(next);
  }

  return (
    <section>
      <h1 className="mb-[12px] text-[23px] font-normal leading-8">Static Pages Content</h1>
      <AdminSaveBar onSave={onSave} onReset={onReset} status={status} />
      <p className="mb-[12px] text-[13px] text-[#646970]">Chỉnh sửa nội dung text/CTA/sections cho các trang phụ. Mỗi panel có thể mở/đóng.</p>

      <div className="grid gap-[12px]">
        <CollapsibleSection title={staticPageTitles.privacy} defaultOpen>
          <Field label="Meta title" value={resolved.privacy.metaTitle} onChange={(metaTitle) => updatePage('privacy', { metaTitle })} />
          <Field label="Meta description" value={resolved.privacy.metaDescription} onChange={(metaDescription) => updatePage('privacy', { metaDescription })} textarea />
          <Field label="Eyebrow" value={resolved.privacy.eyebrow} onChange={(eyebrow) => updatePage('privacy', { eyebrow })} />
          <Field label="Title" value={resolved.privacy.title} onChange={(title) => updatePage('privacy', { title })} />
          <Field label="Description" value={resolved.privacy.description} onChange={(description) => updatePage('privacy', { description })} textarea />
          <Field label="Updated date" value={resolved.privacy.updated} onChange={(updated) => updatePage('privacy', { updated })} />
          <ItemsJsonEditor label="Highlights (string[])" value={resolved.privacy.highlights} onChange={(highlights) => updatePage('privacy', { highlights: highlights as string[] })} />
          <ItemsJsonEditor label="Sections [{title, intro, points[]}]" value={resolved.privacy.sections} onChange={(sections) => updatePage('privacy', { sections: sections as StaticPagesContent['privacy']['sections'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={staticPageTitles.terms}>
          <Field label="Meta title" value={resolved.terms.metaTitle} onChange={(metaTitle) => updatePage('terms', { metaTitle })} />
          <Field label="Meta description" value={resolved.terms.metaDescription} onChange={(metaDescription) => updatePage('terms', { metaDescription })} textarea />
          <Field label="Eyebrow" value={resolved.terms.eyebrow} onChange={(eyebrow) => updatePage('terms', { eyebrow })} />
          <Field label="Title" value={resolved.terms.title} onChange={(title) => updatePage('terms', { title })} />
          <Field label="Description" value={resolved.terms.description} onChange={(description) => updatePage('terms', { description })} textarea />
          <Field label="Updated date" value={resolved.terms.updated} onChange={(updated) => updatePage('terms', { updated })} />
          <ItemsJsonEditor label="Highlights (string[])" value={resolved.terms.highlights} onChange={(highlights) => updatePage('terms', { highlights: highlights as string[] })} />
          <ItemsJsonEditor label="Sections [{title, intro, points[]}]" value={resolved.terms.sections} onChange={(sections) => updatePage('terms', { sections: sections as StaticPagesContent['terms']['sections'] })} />
        </CollapsibleSection>

        <CollapsibleSection title={staticPageTitles.contact}>
          <Field label="Meta title" value={resolved.contact.metaTitle} onChange={(metaTitle) => updatePage('contact', { metaTitle })} />
          <Field label="Meta description" value={resolved.contact.metaDescription} onChange={(metaDescription) => updatePage('contact', { metaDescription })} textarea />
          <Field label="Hero eyebrow" value={resolved.contact.heroEyebrow} onChange={(heroEyebrow) => updatePage('contact', { heroEyebrow })} />
          <Field label="Hero title" value={resolved.contact.heroTitle} onChange={(heroTitle) => updatePage('contact', { heroTitle })} textarea />
          <Field label="Hero subtitle" value={resolved.contact.heroSubtitle} onChange={(heroSubtitle) => updatePage('contact', { heroSubtitle })} textarea />
          <Field label="Hero image URL" value={resolved.contact.heroImage} onChange={(heroImage) => updatePage('contact', { heroImage })} />
          <Field label="Hero CTA label" value={resolved.contact.heroCtaLabel} onChange={(heroCtaLabel) => updatePage('contact', { heroCtaLabel })} />
          <Field label="Hero CTA URL" value={resolved.contact.heroCtaHref} onChange={(heroCtaHref) => updatePage('contact', { heroCtaHref })} />
          <Field label="Phone number (display)" value={resolved.contact.phoneNumber} onChange={(phoneNumber) => updatePage('contact', { phoneNumber })} />
          <Field label="Phone (compact, digits only)" value={resolved.contact.compactPhoneNumber} onChange={(compactPhoneNumber) => updatePage('contact', { compactPhoneNumber })} />
          <Field label="Email address" value={resolved.contact.emailAddress} onChange={(emailAddress) => updatePage('contact', { emailAddress })} />
          <Field label="Office address" value={resolved.contact.officeAddress} onChange={(officeAddress) => updatePage('contact', { officeAddress })} />
          <Field label="Map URL" value={resolved.contact.mapHref} onChange={(mapHref) => updatePage('contact', { mapHref })} />
          <Field label="Consult eyebrow" value={resolved.contact.consultEyebrow} onChange={(consultEyebrow) => updatePage('contact', { consultEyebrow })} />
          <Field label="Consult heading" value={resolved.contact.consultHeading} onChange={(consultHeading) => updatePage('contact', { consultHeading })} textarea />
          <Field label="Consult lead" value={resolved.contact.consultLead} onChange={(consultLead) => updatePage('contact', { consultLead })} textarea />
          <Field label="Response eyebrow" value={resolved.contact.responseEyebrow} onChange={(responseEyebrow) => updatePage('contact', { responseEyebrow })} />
          <Field label="Response heading" value={resolved.contact.responseHeading} onChange={(responseHeading) => updatePage('contact', { responseHeading })} textarea />
          <ItemsJsonEditor label="Response steps [{step, title, copy}]" value={resolved.contact.responseSteps} onChange={(responseSteps) => updatePage('contact', { responseSteps: responseSteps as StaticPagesContent['contact']['responseSteps'] })} />
          <Field label="Planning details heading" value={resolved.contact.planningDetailsHeading} onChange={(planningDetailsHeading) => updatePage('contact', { planningDetailsHeading })} />
          <ItemsJsonEditor label="Planning details (string[])" value={resolved.contact.planningDetails} onChange={(planningDetails) => updatePage('contact', { planningDetails: planningDetails as string[] })} />
        </CollapsibleSection>

        <CollapsibleSection title={staticPageTitles.faqs}>
          <Field label="Meta title" value={resolved.faqs.metaTitle} onChange={(metaTitle) => updatePage('faqs', { metaTitle })} />
          <Field label="Meta description" value={resolved.faqs.metaDescription} onChange={(metaDescription) => updatePage('faqs', { metaDescription })} textarea />
          <Field label="Hero eyebrow" value={resolved.faqs.heroEyebrow} onChange={(heroEyebrow) => updatePage('faqs', { heroEyebrow })} />
          <Field label="Hero title" value={resolved.faqs.heroTitle} onChange={(heroTitle) => updatePage('faqs', { heroTitle })} textarea />
          <Field label="Hero lead" value={resolved.faqs.heroLead} onChange={(heroLead) => updatePage('faqs', { heroLead })} textarea />
          <Field label="Hero image URL" value={resolved.faqs.heroImage} onChange={(heroImage) => updatePage('faqs', { heroImage })} />
          <Field label="Hero primary CTA label" value={resolved.faqs.heroPrimaryCtaLabel} onChange={(heroPrimaryCtaLabel) => updatePage('faqs', { heroPrimaryCtaLabel })} />
          <Field label="Hero primary CTA URL" value={resolved.faqs.heroPrimaryCtaHref} onChange={(heroPrimaryCtaHref) => updatePage('faqs', { heroPrimaryCtaHref })} />
          <Field label="Hero secondary CTA label" value={resolved.faqs.heroSecondaryCtaLabel} onChange={(heroSecondaryCtaLabel) => updatePage('faqs', { heroSecondaryCtaLabel })} />
          <Field label="Hero secondary CTA URL" value={resolved.faqs.heroSecondaryCtaHref} onChange={(heroSecondaryCtaHref) => updatePage('faqs', { heroSecondaryCtaHref })} />
          <ItemsJsonEditor label="Quick notes [{label, copy}]" value={resolved.faqs.quickNotes} onChange={(quickNotes) => updatePage('faqs', { quickNotes: quickNotes as StaticPagesContent['faqs']['quickNotes'] })} />
          <Field label="Nav eyebrow" value={resolved.faqs.navEyebrow} onChange={(navEyebrow) => updatePage('faqs', { navEyebrow })} />
          <Field label="Nav title" value={resolved.faqs.navTitle} onChange={(navTitle) => updatePage('faqs', { navTitle })} textarea />
          <Field label="Nav lead" value={resolved.faqs.navLead} onChange={(navLead) => updatePage('faqs', { navLead })} textarea />
          <Field label="Nav concierge eyebrow" value={resolved.faqs.navConciergeEyebrow} onChange={(navConciergeEyebrow) => updatePage('faqs', { navConciergeEyebrow })} />
          <Field label="Nav concierge body" value={resolved.faqs.navConciergeBody} onChange={(navConciergeBody) => updatePage('faqs', { navConciergeBody })} textarea />
          <Field label="Promise eyebrow" value={resolved.faqs.promiseEyebrow} onChange={(promiseEyebrow) => updatePage('faqs', { promiseEyebrow })} />
          <Field label="Promise heading" value={resolved.faqs.promiseHeading} onChange={(promiseHeading) => updatePage('faqs', { promiseHeading })} textarea />
          <Field label="Promise lead" value={resolved.faqs.promiseLead} onChange={(promiseLead) => updatePage('faqs', { promiseLead })} textarea />
          <Field label="Final eyebrow" value={resolved.faqs.finalEyebrow} onChange={(finalEyebrow) => updatePage('faqs', { finalEyebrow })} />
          <Field label="Final heading" value={resolved.faqs.finalHeading} onChange={(finalHeading) => updatePage('faqs', { finalHeading })} textarea />
          <Field label="Final lead" value={resolved.faqs.finalLead} onChange={(finalLead) => updatePage('faqs', { finalLead })} textarea />
          <Field label="Final CTA primary label" value={resolved.faqs.finalCtaPrimaryLabel} onChange={(finalCtaPrimaryLabel) => updatePage('faqs', { finalCtaPrimaryLabel })} />
          <Field label="Final CTA primary URL" value={resolved.faqs.finalCtaPrimaryHref} onChange={(finalCtaPrimaryHref) => updatePage('faqs', { finalCtaPrimaryHref })} />
          <Field label="Final CTA secondary label" value={resolved.faqs.finalCtaSecondaryLabel} onChange={(finalCtaSecondaryLabel) => updatePage('faqs', { finalCtaSecondaryLabel })} />
          <Field label="Final CTA secondary URL" value={resolved.faqs.finalCtaSecondaryHref} onChange={(finalCtaSecondaryHref) => updatePage('faqs', { finalCtaSecondaryHref })} />
          <ItemsJsonEditor label="Groups (note: nội dung items vẫn lấy từ code mặc định, schema này dùng cho heading nhóm)" value={resolved.faqs.groups} onChange={(groups) => updatePage('faqs', { groups: groups as StaticPagesContent['faqs']['groups'] })} />
        </CollapsibleSection>

        <CollapsibleSection title="Hub Destinations (Vietnam/Thailand/Cambodia/Laos/Myanmar/Multi-country)">
          <p className="mb-[8px] text-[13px] text-[#646970]">Chỉnh sửa overrides theo từng hub. Key gợi ý: vietnam, thailand, cambodia, laos, myanmar, multi-country. Mỗi giá trị bỏ trống = dùng default từ `lib/fallback-data.ts`.</p>
          <ItemsJsonEditor label="Hubs (Record<HubKey, HubPageOverride>)" value={resolved.hubs} onChange={(hubs) => updatePage('hubs', hubs as StaticPagesContent['hubs'])} />
          <p className="mt-[8px] text-[12px] text-[#646970]">Mỗi entry có thể chứa: <code>kicker, title, intro, narrative, highlights[], heroImage, heroPosition, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, sectionEyebrow, sectionHeadingSuffix, featuredEyebrow, featuredLead</code>.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Travel Styles index (/travel-styles/)">
          <Field label="Meta title" value={resolved.travelStyles.metaTitle} onChange={(metaTitle) => updatePage('travelStyles', { metaTitle })} />
          <Field label="Meta description" value={resolved.travelStyles.metaDescription} onChange={(metaDescription) => updatePage('travelStyles', { metaDescription })} textarea />
          <Field label="Hero image URL" value={resolved.travelStyles.heroImage} onChange={(heroImage) => updatePage('travelStyles', { heroImage })} />
          <Field label="Hero eyebrow" value={resolved.travelStyles.heroEyebrow} onChange={(heroEyebrow) => updatePage('travelStyles', { heroEyebrow })} />
          <Field label="Hero title" value={resolved.travelStyles.heroTitle} onChange={(heroTitle) => updatePage('travelStyles', { heroTitle })} textarea />
          <Field label="Hero lead (dùng `{count}` để chèn số kiểu)" value={resolved.travelStyles.heroLead} onChange={(heroLead) => updatePage('travelStyles', { heroLead })} textarea />
          <Field label="Refine eyebrow" value={resolved.travelStyles.refineEyebrow} onChange={(refineEyebrow) => updatePage('travelStyles', { refineEyebrow })} />
          <Field label="Styles badge suffix" value={resolved.travelStyles.stylesBadgeSuffix} onChange={(stylesBadgeSuffix) => updatePage('travelStyles', { stylesBadgeSuffix })} />
          <Field label="Private badge" value={resolved.travelStyles.privateBadge} onChange={(privateBadge) => updatePage('travelStyles', { privateBadge })} />
        </CollapsibleSection>

        <CollapsibleSection title="Cruises index (/cruises/)">
          <Field label="Meta title" value={resolved.cruisesIndex.metaTitle} onChange={(metaTitle) => updatePage('cruisesIndex', { metaTitle })} />
          <Field label="Meta description" value={resolved.cruisesIndex.metaDescription} onChange={(metaDescription) => updatePage('cruisesIndex', { metaDescription })} textarea />
          <Field label="Hero eyebrow" value={resolved.cruisesIndex.heroEyebrow} onChange={(heroEyebrow) => updatePage('cruisesIndex', { heroEyebrow })} />
          <Field label="Hero title" value={resolved.cruisesIndex.heroTitle} onChange={(heroTitle) => updatePage('cruisesIndex', { heroTitle })} textarea />
          <Field label="Hero subtitle" value={resolved.cruisesIndex.heroSubtitle} onChange={(heroSubtitle) => updatePage('cruisesIndex', { heroSubtitle })} textarea />
          <Field label="Hero image URL" value={resolved.cruisesIndex.heroImage} onChange={(heroImage) => updatePage('cruisesIndex', { heroImage })} />
          <Field label="Hero CTA label" value={resolved.cruisesIndex.heroCtaLabel} onChange={(heroCtaLabel) => updatePage('cruisesIndex', { heroCtaLabel })} />
          <Field label="Hero CTA URL" value={resolved.cruisesIndex.heroCtaHref} onChange={(heroCtaHref) => updatePage('cruisesIndex', { heroCtaHref })} />
          <Field label="Section eyebrow" value={resolved.cruisesIndex.sectionEyebrow} onChange={(sectionEyebrow) => updatePage('cruisesIndex', { sectionEyebrow })} />
          <Field label="Section heading" value={resolved.cruisesIndex.sectionHeading} onChange={(sectionHeading) => updatePage('cruisesIndex', { sectionHeading })} textarea />
          <Field label="Section lead" value={resolved.cruisesIndex.sectionLead} onChange={(sectionLead) => updatePage('cruisesIndex', { sectionLead })} textarea />
          <Field label="Empty heading" value={resolved.cruisesIndex.emptyHeading} onChange={(emptyHeading) => updatePage('cruisesIndex', { emptyHeading })} />
          <Field label="Empty lead" value={resolved.cruisesIndex.emptyLead} onChange={(emptyLead) => updatePage('cruisesIndex', { emptyLead })} textarea />
          <Field label="Final CTA label" value={resolved.cruisesIndex.finalCtaLabel} onChange={(finalCtaLabel) => updatePage('cruisesIndex', { finalCtaLabel })} />
          <Field label="Final CTA URL" value={resolved.cruisesIndex.finalCtaHref} onChange={(finalCtaHref) => updatePage('cruisesIndex', { finalCtaHref })} />
        </CollapsibleSection>
      </div>
    </section>
  );
}

export function defaultEditableSiteContent() {
  return defaultSiteContent;
}



