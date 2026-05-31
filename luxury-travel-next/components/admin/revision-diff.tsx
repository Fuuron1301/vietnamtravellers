'use client';

import { useMemo } from 'react';

export type RevisionDiffItem = {
  id: string;
  title?: string;
  createdAt?: string;
  entityType?: string;
  snapshot?: unknown;
};

function normalize(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value ?? '');
  }
}

function lineKey(line: string) {
  return line.trim();
}

function diffLines(left: string, right: string) {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const rightSet = new Set(rightLines.map(lineKey));
  const leftSet = new Set(leftLines.map(lineKey));
  const removed = leftLines.filter((line) => !rightSet.has(lineKey(line))).length;
  const added = rightLines.filter((line) => !leftSet.has(lineKey(line))).length;
  return { leftLines, rightLines, removed, added, rightSet, leftSet };
}

function formatDate(value?: string) {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN');
}

export function RevisionDiff({
  currentSnapshot,
  revision,
  compact = false
}: {
  currentSnapshot: unknown;
  revision: RevisionDiffItem | null;
  compact?: boolean;
}) {
  const currentText = useMemo(() => normalize(currentSnapshot), [currentSnapshot]);
  const revisionText = useMemo(() => normalize(revision?.snapshot), [revision?.snapshot]);
  const diff = useMemo(() => diffLines(revisionText, currentText), [currentText, revisionText]);

  if (!revision) {
    return <p className="text-[13px] text-[#646970]">Select a revision to compare before restoring.</p>;
  }

  return (
    <div className="space-y-[8px] text-[13px]">
      <div className="rounded-[2px] border border-[#c3c4c7] bg-[#f6f7f7] p-[8px]">
        <strong>{revision.title || 'Revision'}</strong>
        <span className="ml-[8px] text-[#646970]">{formatDate(revision.createdAt)}</span>
        <span className="ml-[8px] text-[#646970]">{diff.added} changed current lines, {diff.removed} removed revision lines</span>
      </div>
      <div className={`grid gap-[8px] ${compact ? '' : 'lg:grid-cols-2'}`}>
        <div className="min-w-0 border border-[#c3c4c7] bg-white">
          <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-[8px] py-[6px] font-semibold">Revision snapshot</div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap p-[8px] font-mono text-[12px] leading-5">
            {diff.leftLines.map((line, index) => (
              <span key={`${index}-${line}`} className={!diff.rightSet.has(lineKey(line)) ? 'block bg-[#fcf0f1] text-[#8a2424]' : 'block'}>{line || ' '}</span>
            ))}
          </pre>
        </div>
        <div className="min-w-0 border border-[#c3c4c7] bg-white">
          <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-[8px] py-[6px] font-semibold">Current editor state</div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap p-[8px] font-mono text-[12px] leading-5">
            {diff.rightLines.map((line, index) => (
              <span key={`${index}-${line}`} className={!diff.leftSet.has(lineKey(line)) ? 'block bg-[#edfaef] text-[#005c12]' : 'block'}>{line || ' '}</span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
