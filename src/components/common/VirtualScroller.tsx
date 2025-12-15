import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface VirtualScrollerProps<T> {
  items: T[];
  itemHeight?: number;
  getItemHeight?: (index: number) => number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onLoadMore?: () => void;
  className?: string;
  seamless?: boolean;
  gap?: number;
}

function VirtualScroller<T>({
  items,
  itemHeight,
  getItemHeight,
  renderItem,
  overscan = 3,
  onLoadMore,
  className = '',
  seamless = false,
  gap = 16,
}: VirtualScrollerProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelTopRef = useRef<HTMLDivElement>(null);
  const sentinelBottomRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  // Calculate item heights
  const getHeightForItem = useCallback((index: number): number => {
    if (itemHeight) return itemHeight;
    if (getItemHeight) return getItemHeight(index);
    return 180;
  }, [itemHeight, getItemHeight]);
  
  // Calculate positions for all items including gaps
  const itemMetadata = useMemo(() => {
    const metadata: Array<{ offset: number; size: number }> = [];
    let offset = 0;
    
    for (let i = 0; i < items.length; i++) {
      const size = getHeightForItem(i);
      metadata[i] = { offset, size };
      offset += size + (i < items.length - 1 ? gap : 0);
    }
    
    return metadata;
  }, [items.length, getHeightForItem, gap]);
  
  // Total height including gaps
  const totalHeight = useMemo(() => {
    if (itemMetadata.length === 0) return 0;
    const lastItem = itemMetadata[itemMetadata.length - 1];
    return lastItem.offset + lastItem.size;
  }, [itemMetadata]);
  
  // Setup IntersectionObserver for visibility detection
  useEffect(() => {
    if (!sentinelTopRef.current || !sentinelBottomRef.current) return;
    
    const root = seamless ? null : scrollContainerRef.current;
    
    const topObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRange((prev) => ({
            start: Math.max(0, prev.start - overscan),
            end: prev.end,
          }));
        }
      },
      {
        root,
        rootMargin: `${overscan * 100}px 0px 0px 0px`,
        threshold: 0,
      }
    );
    
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRange((prev) => ({
            start: prev.start,
            end: Math.min(items.length - 1, prev.end + overscan),
          }));
        }
      },
      {
        root,
        rootMargin: `0px 0px ${overscan * 100}px 0px`,
        threshold: 0,
      }
    );
    
    topObserver.observe(sentinelTopRef.current);
    bottomObserver.observe(sentinelBottomRef.current);
    
    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [seamless, overscan, items.length]);
  
  // Setup IntersectionObserver for load more
  useEffect(() => {
    if (!onLoadMore || !loadMoreTriggerRef.current) return;
    
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: seamless ? null : scrollContainerRef.current,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );
    
    loadMoreObserver.observe(loadMoreTriggerRef.current);
    
    return () => {
      loadMoreObserver.disconnect();
    };
  }, [onLoadMore, seamless]);
  
  // Calculate actual visible range with overscan
  const actualRange = useMemo(() => ({
    start: Math.max(0, visibleRange.start - overscan),
    end: Math.min(items.length - 1, visibleRange.end + overscan),
  }), [visibleRange, overscan, items.length]);
  
  // Render visible items
  const visibleItems = [];
  for (let i = actualRange.start; i <= actualRange.end; i++) {
    const item = items[i];
    const { offset, size } = itemMetadata[i];
    
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
        }}
      >
        <div style={{ height: size }}>
          {renderItem(item, i)}
        </div>
        {i < items.length - 1 && <div style={{ height: gap }} />}
      </div>
    );
  }
  
  // Get sentinel positions
  const topSentinelOffset = actualRange.start > 0 
    ? itemMetadata[actualRange.start].offset 
    : 0;
  const bottomSentinelOffset = actualRange.end < items.length - 1
    ? itemMetadata[actualRange.end].offset + itemMetadata[actualRange.end].size
    : totalHeight;
  
  const content = (
    <>
      <div style={{ position: 'relative', height: totalHeight, width: '100%' }}>
        {/* Top sentinel for detecting upward scroll */}
        <div
          ref={sentinelTopRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 1,
            transform: `translateY(${topSentinelOffset}px)`,
          }}
          aria-hidden="true"
        />
        
        {visibleItems}
        
        {/* Bottom sentinel for detecting downward scroll */}
        <div
          ref={sentinelBottomRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 1,
            transform: `translateY(${bottomSentinelOffset}px)`,
          }}
          aria-hidden="true"
        />
      </div>
      {onLoadMore && (
        <div ref={loadMoreTriggerRef} style={{ height: 1 }} aria-hidden="true" />
      )}
    </>
  );
  
  if (seamless) {
    return content;
  }
  
  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 ${className}`}
      style={{ height: '100%' }}
    >
      {content}
    </div>
  );
}

export default VirtualScroller;