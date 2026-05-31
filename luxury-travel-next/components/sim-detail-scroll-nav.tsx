'use client';

import { useEffect, useRef, useState } from 'react';

type ScrollTab = {
  id: string;
  label: string;
};

type SimDetailScrollNavProps = {
  tabs: ScrollTab[];
  triggerId: string;
  topOffset?: number;
};

export default function SimDetailScrollNav({ tabs, triggerId, topOffset = 88 }: SimDetailScrollNavProps) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? 'overview');
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const updateFromScroll = () => {
      const triggerElement = document.getElementById(triggerId);
      if (triggerElement) {
        const triggerBottom = triggerElement.getBoundingClientRect().bottom;
        setIsVisible(triggerBottom <= topOffset + 8);
      }

      const scrollPoint = window.scrollY + topOffset + 64;
      let currentId = tabs[0]?.id ?? 'overview';

      for (const tab of tabs) {
        const section = document.getElementById(tab.id);
        if (!section) continue;
        if (section.offsetTop <= scrollPoint) {
          currentId = tab.id;
        }
      }

      setActiveId(currentId);
    };

    const onScroll = () => {
      requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [tabs, topOffset, triggerId]);

  useEffect(() => {
    const nav = navRef.current;
    const activeTab = tabRefs.current[activeId];
    if (!nav || !activeTab) {
      setIndicator(prev => ({ ...prev, visible: false }));
      return;
    }

    setIndicator({
      left: activeTab.offsetLeft - nav.scrollLeft,
      width: activeTab.offsetWidth,
      visible: true
    });
  }, [activeId, isVisible]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onNavScroll = () => {
      const activeTab = tabRefs.current[activeId];
      if (!activeTab) return;
      setIndicator({
        left: activeTab.offsetLeft - nav.scrollLeft,
        width: activeTab.offsetWidth,
        visible: true
      });
    };

    nav.addEventListener('scroll', onNavScroll, { passive: true });
    return () => nav.removeEventListener('scroll', onNavScroll);
  }, [activeId]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    const navHeight = 44;
    const targetTop = section.offsetTop - topOffset - navHeight - 8;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  };

  return (
    <div
      className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
      style={{ top: `${topOffset}px` }}
    >
      <div className="mx-auto max-w-[1120px] px-4 md:px-6">
        <div className="relative border-y border-[#e8e8e8] bg-[#f5f5f5]">
          <div ref={navRef} className="relative flex h-[44px] items-center overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  ref={node => {
                    tabRefs.current[tab.id] = node;
                  }}
                  onClick={() => scrollToSection(tab.id)}
                  className={`shrink-0 px-4 py-3 text-[14px] transition-colors duration-200 ${
                    isActive ? 'text-[#ff5b26]' : 'text-[#444] hover:text-[#ff5b26]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            <span
              className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-[#ff5b26] transition-all duration-300"
              style={{
                left: `${indicator.left}px`,
                width: `${indicator.width}px`,
                opacity: indicator.visible ? 1 : 0
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
