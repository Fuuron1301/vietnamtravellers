import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CmsBlockNode, ReusableBlockMap } from '@/lib/blocks/block-types';

const allowCustomHtml = process.env.CMS_ALLOW_CUSTOM_HTML_BLOCKS === 'true';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function renderText(value: unknown) {
  const text = stringValue(value);
  return text ? <p className="whitespace-pre-wrap text-[16px] leading-7 text-[color:var(--cms-color-foreground)]/78">{text}</p> : null;
}

function renderImage(props: Record<string, unknown>) {
  const src = stringValue(props.src || props.url);
  if (!src) return null;
  const alt = stringValue(props.alt, stringValue(props.title, 'CMS image'));
  return (
    <div className="overflow-hidden rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-white shadow-[var(--cms-shadow-md)]">
      <div
        role="img"
        aria-label={alt}
        className="min-h-[240px] bg-cover bg-center"
        style={{ backgroundImage: `url(${src})` }}
      />
    </div>
  );
}

function renderGallery(props: Record<string, unknown>) {
  const items = Array.isArray(props.items) ? props.items : Array.isArray(props.images) ? props.images : [];
  if (!items.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const source = typeof item === 'string' ? item : stringValue((item as Record<string, unknown>).src || (item as Record<string, unknown>).url);
        if (!source) return null;
        const alt = typeof item === 'object' && item !== null ? stringValue((item as Record<string, unknown>).alt, `Gallery image ${index + 1}`) : `Gallery image ${index + 1}`;
        return (
          <div key={`${source}-${index}`} className="overflow-hidden rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-white shadow-[var(--cms-shadow-md)]">
            <div role="img" aria-label={alt} className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${source})` }} />
          </div>
        );
      })}
    </div>
  );
}

function renderCta(props: Record<string, unknown>) {
  const href = stringValue(props.href, '/customize-your-trip/');
  const label = stringValue(props.label, 'Start Planning');
  const title = stringValue(props.title, 'Tailor-made journeys');
  const eyebrow = stringValue(props.eyebrow, 'Travel designer');
  return (
    <div className="rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-[color:var(--cms-color-primary)] px-8 py-10 text-[color:var(--cms-color-background)] shadow-[var(--cms-shadow-luxury)]">
      <p className="text-[12px] font-black uppercase tracking-[0.28em] text-[color:var(--cms-color-accent)]">{eyebrow}</p>
      <h3 className="mt-3 text-[28px] font-black leading-tight text-white">{title}</h3>
      <Link href={href} className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-[color:var(--cms-color-accent)] px-6 text-[13px] font-black uppercase tracking-[0.18em] text-[color:var(--cms-color-primary)]">
        {label}
      </Link>
    </div>
  );
}

function renderTourGrid(props: Record<string, unknown>) {
  const items = Array.isArray(props.items) ? props.items : [];
  if (!items.length) {
    return <div className="rounded-[var(--cms-radius-lg)] border border-dashed border-[color:var(--cms-color-border)] px-6 py-10 text-sm text-[color:var(--cms-color-muted)]">Tour grid block is ready for CMS-driven data.</div>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const source = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {};
        const title = stringValue(source.title, `Tour ${index + 1}`);
        const href = stringValue(source.href, '/vietnam-tours/');
        const image = stringValue(source.image || source.featuredImage);
        return (
          <article key={`${href}-${index}`} className="overflow-hidden rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-white shadow-[var(--cms-shadow-md)]">
            {image ? <div role="img" aria-label={title} className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} /> : null}
            <div className="p-5">
              <h3 className="text-[18px] font-black text-[color:var(--cms-color-primary)]">{title}</h3>
              {renderText(source.excerpt)}
              <Link href={href} className="mt-4 inline-flex text-[13px] font-black uppercase tracking-[0.16em] text-[color:var(--cms-color-accent)]">View tour</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function renderBlogGrid(props: Record<string, unknown>) {
  const items = Array.isArray(props.items) ? props.items : [];
  if (!items.length) {
    return <div className="rounded-[var(--cms-radius-lg)] border border-dashed border-[color:var(--cms-color-border)] px-6 py-10 text-sm text-[color:var(--cms-color-muted)]">Blog grid block is ready for CMS-driven data.</div>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const source = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {};
        const title = stringValue(source.title, `Blog ${index + 1}`);
        const href = stringValue(source.href, '/blog/');
        const image = stringValue(source.image || source.featuredImage);
        return (
          <article key={`${href}-${index}`} className="overflow-hidden rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-white shadow-[var(--cms-shadow-md)]">
            {image ? <div role="img" aria-label={title} className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} /> : null}
            <div className="p-5">
              <h3 className="text-[18px] font-black text-[color:var(--cms-color-primary)]">{title}</h3>
              {renderText(source.excerpt)}
              <Link href={href} className="mt-4 inline-flex text-[13px] font-black uppercase tracking-[0.16em] text-[color:var(--cms-color-accent)]">Read article</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function renderReusable(props: Record<string, unknown>, reusableBlocks?: ReusableBlockMap) {
  const reference = stringValue(props.slug, stringValue(props.reference, stringValue(props.id)));
  if (!reference) return null;
  const tree = reusableBlocks?.[reference];
  if (!tree?.length) {
    return <div className="rounded-[var(--cms-radius-lg)] border border-dashed border-[color:var(--cms-color-border)] px-6 py-10 text-sm text-[color:var(--cms-color-muted)]">Reusable block <code>{reference}</code> is not available yet.</div>;
  }
  return <>{tree.map((node) => renderBlock(node, reusableBlocks))}</>;
}

export function renderBlock(node: CmsBlockNode, reusableBlocks?: ReusableBlockMap): ReactNode {
  const props = node.props || {};
  const children = node.children || [];

  if (node.type === 'container') {
    return (
      <section key={node.id} className="space-y-6">
        {children.map((child) => renderBlock(child, reusableBlocks))}
      </section>
    );
  }

  if (node.type === 'hero') {
    return (
      <section key={node.id} className="rounded-[var(--cms-radius-lg)] border border-[color:var(--cms-color-border)] bg-[linear-gradient(135deg,var(--cms-color-primary),var(--cms-color-secondary))] px-8 py-12 text-white shadow-[var(--cms-shadow-luxury)]">
        {stringValue(props.eyebrow) ? <p className="text-[12px] font-black uppercase tracking-[0.28em] text-[color:var(--cms-color-accent)]">{stringValue(props.eyebrow)}</p> : null}
        <h2 className="mt-3 text-[clamp(32px,4vw,58px)] font-black leading-tight">{stringValue(props.title, 'Hero section')}</h2>
        {renderText(props.subtitle)}
      </section>
    );
  }

  if (node.type === 'text') return <section key={node.id}>{renderText(props.content)}</section>;
  if (node.type === 'image') return <section key={node.id}>{renderImage(props)}</section>;
  if (node.type === 'gallery') return <section key={node.id}>{renderGallery(props)}</section>;
  if (node.type === 'cta') return <section key={node.id}>{renderCta(props)}</section>;
  if (node.type === 'tourGrid') return <section key={node.id}>{renderTourGrid(props)}</section>;
  if (node.type === 'blogGrid') return <section key={node.id}>{renderBlogGrid(props)}</section>;
  if (node.type === 'reusable') return <section key={node.id}>{renderReusable(props, reusableBlocks)}</section>;
  if (node.type === 'customHtml') {
    if (!allowCustomHtml) {
      return process.env.NODE_ENV === 'production'
        ? null
        : <section key={node.id} className="rounded-[var(--cms-radius-lg)] border border-dashed border-[color:var(--cms-color-border)] px-6 py-10 text-sm text-[color:var(--cms-color-muted)]">Custom HTML blocks are disabled by default.</section>;
    }
    return <section key={node.id} suppressHydrationWarning>{/* customHtml intentionally disabled in Phase A */}</section>;
  }

  if (process.env.NODE_ENV !== 'production') {
    return <section key={node.id} className="rounded-[var(--cms-radius-lg)] border border-dashed border-[color:var(--cms-color-border)] px-6 py-10 text-sm text-[color:var(--cms-color-muted)]">Unknown block type: {node.type}</section>;
  }
  return null;
}
