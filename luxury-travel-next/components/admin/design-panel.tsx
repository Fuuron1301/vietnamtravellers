'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { WpButton, WpField, WpNotice, WpPageHeader, WpPostbox, WpTabBar } from '@/components/admin/wp-admin-ui';

type AdminFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type DesignTokens = {
  colors: Record<'primary' | 'secondary' | 'accent' | 'background' | 'foreground' | 'muted' | 'border', string>;
  typography: Record<'headingFont' | 'bodyFont' | 'baseSize' | 'scaleRatio' | 'lineHeight', string>;
  spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'sectionY', string>;
  radius: Record<'sm' | 'md' | 'lg' | 'pill', string>;
  shadow: Record<'sm' | 'md' | 'lg' | 'luxury', string>;
  componentStyles: Record<'buttons' | 'cards' | 'forms' | 'tables' | 'navigation' | 'sections', Record<string, string>>;
  responsive: Record<'desktop' | 'tablet' | 'mobile', Record<string, string>>;
};
type SimpleTokenGroup = 'colors' | 'typography' | 'spacing' | 'radius' | 'shadow';

type DesignPreset = {
  id: string;
  name: string;
  slug: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  tokens: DesignTokens;
  updatedAt?: string;
};

const defaultTokens: DesignTokens = {
  colors: {
    primary: '#0b1b2b',
    secondary: '#12323f',
    accent: '#c8a96a',
    background: '#f8f5ef',
    foreground: '#0b1b2b',
    muted: '#6d746f',
    border: '#ded3bc'
  },
  typography: {
    headingFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    bodyFont: 'Manrope, Inter, Aptos, sans-serif',
    baseSize: '16px',
    scaleRatio: '1.2',
    lineHeight: '1.65'
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px', sectionY: '96px' },
  radius: { sm: '4px', md: '8px', lg: '22px', pill: '999px' },
  shadow: {
    sm: '0 2px 8px rgba(11,27,43,0.08)',
    md: '0 12px 28px rgba(11,27,43,0.12)',
    lg: '0 24px 60px rgba(11,27,43,0.16)',
    luxury: '0 30px 90px rgba(11,27,43,0.18)'
  },
  componentStyles: {
    buttons: { background: '#0b1b2b', color: '#fffaf0', radius: '999px', padding: '12px 20px', shadow: '0 12px 28px rgba(11,27,43,0.12)' },
    cards: { background: '#fffaf0', radius: '22px', padding: '24px', shadow: '0 24px 60px rgba(11,27,43,0.16)' },
    forms: { background: '#ffffff', radius: '18px', border: '1px solid #ded3bc' },
    tables: { headerBackground: '#f8f5ef', border: '1px solid #ded3bc' },
    navigation: { linkColor: '#0b1b2b', activeColor: '#c8a96a' },
    sections: { background: '#f8f5ef', paddingY: '96px' }
  },
  responsive: {
    desktop: { sectionY: '96px', container: '1180px' },
    tablet: { sectionY: '72px', container: '760px' },
    mobile: { sectionY: '48px', container: '360px' }
  }
};

function tokenCopy(tokens: DesignTokens): DesignTokens {
  const source = JSON.parse(JSON.stringify(tokens || defaultTokens)) as Partial<DesignTokens>;
  return {
    colors: { ...defaultTokens.colors, ...source.colors },
    typography: { ...defaultTokens.typography, ...source.typography },
    spacing: { ...defaultTokens.spacing, ...source.spacing },
    radius: { ...defaultTokens.radius, ...source.radius },
    shadow: { ...defaultTokens.shadow, ...source.shadow },
    componentStyles: {
      buttons: { ...defaultTokens.componentStyles.buttons, ...source.componentStyles?.buttons },
      cards: { ...defaultTokens.componentStyles.cards, ...source.componentStyles?.cards },
      forms: { ...defaultTokens.componentStyles.forms, ...source.componentStyles?.forms },
      tables: { ...defaultTokens.componentStyles.tables, ...source.componentStyles?.tables },
      navigation: { ...defaultTokens.componentStyles.navigation, ...source.componentStyles?.navigation },
      sections: { ...defaultTokens.componentStyles.sections, ...source.componentStyles?.sections }
    },
    responsive: {
      desktop: { ...defaultTokens.responsive.desktop, ...source.responsive?.desktop },
      tablet: { ...defaultTokens.responsive.tablet, ...source.responsive?.tablet },
      mobile: { ...defaultTokens.responsive.mobile, ...source.responsive?.mobile }
    }
  };
}

function TokenFields<T extends SimpleTokenGroup>({
  title,
  group,
  tokens,
  onChange
}: {
  title: string;
  group: T;
  tokens: DesignTokens;
  onChange: (group: T, key: keyof DesignTokens[T], value: string) => void;
}) {
  return (
    <WpPostbox title={title}>
      {Object.entries(tokens[group]).map(([key, value]) => (
        <WpField
          key={`${String(group)}-${key}`}
          label={key}
          value={String(value)}
          onChange={(next) => onChange(group, key as keyof DesignTokens[T], next)}
        />
      ))}
    </WpPostbox>
  );
}

function NestedTokenFields<T extends 'componentStyles' | 'responsive'>({
  title,
  group,
  tokens,
  onChange
}: {
  title: string;
  group: T;
  tokens: DesignTokens;
  onChange: (group: T, section: keyof DesignTokens[T], key: string, value: string) => void;
}) {
  return (
    <WpPostbox title={title}>
      <div className="space-y-[12px]">
        {Object.entries(tokens[group]).map(([section, values]) => (
          <div key={`${String(group)}-${section}`} className="border-b border-[#dcdcde] pb-[10px]">
            <h3 className="mb-[6px] text-[13px] font-semibold capitalize text-[#1d2327]">{section}</h3>
            {Object.entries(values).map(([key, value]) => (
              <WpField
                key={`${String(group)}-${section}-${key}`}
                label={key}
                value={String(value)}
                onChange={(next) => onChange(group, section as keyof DesignTokens[T], key, next)}
              />
            ))}
          </div>
        ))}
      </div>
    </WpPostbox>
  );
}

export function DesignPanel({ adminFetch }: { adminFetch: AdminFetcher }) {
  const [items, setItems] = useState<DesignPreset[]>([]);
  const [active, setActive] = useState<DesignPreset | null>(null);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('Luxury Theme');
  const [slug, setSlug] = useState('luxury-theme');
  const [tokens, setTokens] = useState<DesignTokens>(() => tokenCopy(defaultTokens));
  const [activeTab, setActiveTab] = useState<'global' | 'components' | 'responsive' | 'preview'>('global');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadDesign() {
    const response = await adminFetch('/api/admin/design');
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Unable to load design presets.');
    setItems(payload.data.items || []);
    setActive(payload.data.active || null);
    const current = payload.data.active || payload.data.items?.[0];
    if (current) {
      setEditingId(current.id);
      setName(current.name);
      setSlug(current.slug);
      setTokens(tokenCopy(current.tokens));
    }
  }

  useEffect(() => {
    loadDesign().catch((error) => setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load design presets.' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateToken<T extends keyof DesignTokens>(group: T, key: keyof DesignTokens[T], value: string) {
    setTokens((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value }
    }));
  }

  function updateNestedToken<T extends 'componentStyles' | 'responsive'>(group: T, section: keyof DesignTokens[T], key: string, value: string) {
    setTokens((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [section]: {
          ...current[group][section],
          [key]: value
        }
      }
    }));
  }

  function newPreset() {
    setEditingId('');
    setName('New Luxury Theme');
    setSlug(`new-luxury-theme-${Date.now()}`);
    setTokens(tokenCopy(active?.tokens || defaultTokens));
    setNotice({ type: 'info', text: 'New preset draft is ready.' });
  }

  async function savePreset(activate = false) {
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminFetch('/api/admin/design', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), name, slug, tokens, status: activate ? 'ACTIVE' : undefined })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Unable to save design preset.');
      const item = payload.data.item as DesignPreset;
      setEditingId(item.id);
      if (activate && item.status !== 'ACTIVE') {
        const activateResponse = await adminFetch('/api/admin/design', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: item.id, action: 'activate' })
        });
        if (!activateResponse.ok) throw new Error('Preset saved but activation failed.');
      }
      await loadDesign();
      setNotice({ type: 'success', text: activate ? 'Design preset saved and activated.' : 'Design preset saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save design preset.' });
    } finally {
      setSaving(false);
    }
  }

  async function activatePreset(id: string) {
    setSaving(true);
    try {
      const response = await adminFetch('/api/admin/design', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, action: 'activate' })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Unable to activate preset.');
      await loadDesign();
      setNotice({ type: 'success', text: 'Design preset activated.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to activate preset.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-[14px]">
      <WpPageHeader title="Design System" actionLabel="Add New Preset" onAction={newPreset} />
      {notice ? <WpNotice type={notice.type} onDismiss={() => setNotice(null)}>{notice.text}</WpNotice> : null}
      <WpTabBar
        active={activeTab}
        onChange={(value) => setActiveTab(value as typeof activeTab)}
        tabs={[
          { label: 'Global', value: 'global' },
          { label: 'Components', value: 'components' },
          { label: 'Responsive', value: 'responsive' },
          { label: 'Preview', value: 'preview' }
        ]}
      />
      <div className="grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-[14px]">
          <WpPostbox title="Preset Details">
            <WpField label="Name" value={name} onChange={setName} />
            <WpField label="Slug" value={slug} onChange={setSlug} />
            <div className="flex flex-wrap gap-[8px] pt-[12px]">
              <WpButton primary onClick={() => savePreset(false)} disabled={saving}>{saving ? 'Saving...' : 'Save Preset'}</WpButton>
              <WpButton onClick={() => savePreset(true)} disabled={saving}>Save & Activate</WpButton>
            </div>
          </WpPostbox>
          {activeTab === 'global' ? (
            <>
              <TokenFields title="Global Colors" group="colors" tokens={tokens} onChange={updateToken} />
              <TokenFields title="Typography" group="typography" tokens={tokens} onChange={updateToken} />
              <TokenFields title="Spacing System" group="spacing" tokens={tokens} onChange={updateToken} />
              <TokenFields title="Radius" group="radius" tokens={tokens} onChange={updateToken} />
              <TokenFields title="Shadows" group="shadow" tokens={tokens} onChange={updateToken} />
            </>
          ) : null}
          {activeTab === 'components' ? <NestedTokenFields title="Component Styles" group="componentStyles" tokens={tokens} onChange={updateNestedToken} /> : null}
          {activeTab === 'responsive' ? <NestedTokenFields title="Responsive Breakpoints" group="responsive" tokens={tokens} onChange={updateNestedToken} /> : null}
          {activeTab === 'preview' ? (
            <WpPostbox title="Design Preview">
              <div
                className="space-y-[14px] rounded-[10px] border border-[#ded3bc] p-[18px]"
                style={{
                  background: tokens.colors.background,
                  color: tokens.colors.foreground,
                  fontFamily: tokens.typography.bodyFont,
                  boxShadow: tokens.shadow.luxury
                }}
              >
                <div className="space-y-[8px]">
                  <p className="text-[12px] uppercase tracking-[0.08em]" style={{ color: tokens.colors.muted }}>Luxury preview</p>
                  <h3 className="text-[28px] leading-[1.15]" style={{ fontFamily: tokens.typography.headingFont }}>Private itinerary card</h3>
                  <p className="max-w-[64ch] text-[14px] leading-[1.65]" style={{ color: tokens.colors.muted }}>Preview honors current font system and shows button, card, form, and table surfaces together, so token changes are obvious before save.</p>
                </div>
                <div className="grid gap-[12px] md:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[22px] p-[20px]" style={{ background: tokens.componentStyles.cards.background, borderRadius: tokens.componentStyles.cards.radius, boxShadow: tokens.componentStyles.cards.shadow }}>
                    <p className="text-[12px]" style={{ color: tokens.colors.muted }}>Card sample</p>
                    <p className="mt-[8px] text-[18px] font-semibold" style={{ fontFamily: tokens.typography.headingFont }}>Halong Bay Signature Route</p>
                    <p className="mt-[6px] text-[13px] leading-[1.6]" style={{ color: tokens.colors.muted }}>Buttons, typography, radius, and shadow come from active preset.</p>
                    <div className="mt-[12px] flex flex-wrap gap-[8px]">
                      <button type="button" className="min-h-[34px] rounded-full px-[14px] text-[13px]" style={{ background: tokens.componentStyles.buttons.background, color: tokens.componentStyles.buttons.color, borderRadius: tokens.componentStyles.buttons.radius, boxShadow: tokens.componentStyles.buttons.shadow }}>Primary button</button>
                      <button type="button" className="min-h-[34px] rounded-full border px-[14px] text-[13px]" style={{ color: tokens.colors.primary, borderColor: tokens.colors.border, background: tokens.colors.background }}>Secondary button</button>
                    </div>
                  </div>
                  <div className="rounded-[18px] border p-[16px]" style={{ background: tokens.componentStyles.forms.background, borderRadius: tokens.componentStyles.forms.radius, borderColor: tokens.colors.border }}>
                    <p className="text-[12px] uppercase tracking-[0.08em]" style={{ color: tokens.colors.muted }}>Form sample</p>
                    <label className="mt-[10px] block text-[13px] font-semibold">Trip title</label>
                    <input className="mt-[6px] min-h-[34px] w-full rounded-[8px] border px-[10px] text-[13px]" style={{ borderColor: tokens.colors.border, background: tokens.colors.background }} defaultValue="Luxury Vietnam Tour" />
                    <label className="mt-[10px] block text-[13px] font-semibold">Notes</label>
                    <textarea className="mt-[6px] min-h-[76px] w-full rounded-[8px] border px-[10px] py-[8px] text-[13px]" style={{ borderColor: tokens.colors.border, background: tokens.colors.background }} defaultValue="Spacing should feel calm, not cramped." />
                  </div>
                </div>
                <div className="overflow-hidden rounded-[18px] border" style={{ borderColor: tokens.colors.border }}>
                  <div className="px-[12px] py-[9px] text-[13px] font-semibold" style={{ background: tokens.componentStyles.tables.headerBackground }}>Table sample</div>
                  <div className="divide-y" style={{ borderColor: tokens.colors.border }}>
                    <div className="grid grid-cols-[1.6fr_0.6fr_0.8fr] gap-[10px] px-[12px] py-[10px] text-[13px]"><span>Tour title</span><span>12 days</span><span>USD 3,400</span></div>
                    <div className="grid grid-cols-[1.6fr_0.6fr_0.8fr] gap-[10px] px-[12px] py-[10px] text-[13px]"><span>Tour title</span><span>9 days</span><span>USD 2,800</span></div>
                  </div>
                </div>
              </div>
            </WpPostbox>
          ) : null}
        </div>
        <aside className="space-y-[14px]">
          <WpPostbox title="Active Preset">
            <p><strong>{active?.name || 'No active preset'}</strong></p>
            <p className="mt-[4px] text-[#646970]">{active?.slug || 'Seed a preset or save a new active design.'}</p>
          </WpPostbox>
          <WpPostbox title="Presets">
            <div className="space-y-[8px]">
              {items.map((item) => (
                <div key={item.id} className="border-b border-[#dcdcde] pb-[8px]">
                  <button type="button" onClick={() => { setEditingId(item.id); setName(item.name); setSlug(item.slug); setTokens(tokenCopy(item.tokens)); }} className="font-semibold text-[#2271b1] hover:text-[#135e96]">
                    {item.name}
                  </button>
                  <p className="text-[12px] text-[#646970]">{item.status} - {item.slug}</p>
                  {item.status !== 'ACTIVE' ? <button type="button" onClick={() => activatePreset(item.id)} className="text-[12px] text-[#2271b1]">Activate</button> : null}
                </div>
              ))}
            </div>
          </WpPostbox>
        </aside>
      </div>
    </div>
  );
}
