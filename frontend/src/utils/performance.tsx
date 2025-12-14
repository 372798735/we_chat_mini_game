/**
 * 性能优化工具函数
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 内存缓存类
export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; expiry: number }>();

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 默认5分钟

  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// 创建全局缓存实例
export const globalCache = new MemoryCache();

// 定期清理过期缓存
setInterval(() => {
  globalCache.cleanup();
}, 60 * 1000); // 每分钟清理一次

// 图片懒加载 hook
export function useLazyLoad() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const loadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [loadedImages]);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  return { loadImage, isImageLoaded };
}

// 虚拟滚动 hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
}

// 页面性能监控
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endTiming(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.metrics.delete(name);

    // 记录到控制台（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>) => {
      this.startTiming(name);
      const result = fn(...args);
      this.endTiming(name);
      return result;
    }) as T;
  }

  // 获取页面加载性能指标
  getPageMetrics(): Record<string, number> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      // DNS 查询时间
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      // TCP 连接时间
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      // 请求响应时间
      requestResponse: navigation.responseEnd - navigation.requestStart,
      // DOM 解析时间
      domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      // 资源加载时间
      resourceLoading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
      // 首次绘制时间
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      // 首次内容绘制时间
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  }
}

// 性能监控实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// React 组件性能优化 HOC
export function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    useEffect(() => {
      performanceMonitor.startTiming(`${componentName}-render`);

      return () => {
        performanceMonitor.endTiming(`${componentName}-render`);
      };
    });

    return <WrappedComponent {...props} />;
  });
}

// 批量操作优化
export function batchOperations<T>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<void>
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches.reduce(async (promise, batch) => {
    await promise;
    return operation(batch);
  }, Promise.resolve());
}

// 异步加载资源
export function loadResource<T>(
  loader: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  if (cacheKey) {
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  return loader().then(result => {
    if (cacheKey) {
      globalCache.set(cacheKey, result, 10 * 60 * 1000); // 缓存10分钟
    }
    return result;
  });
}

// 预加载组件
export function preloadComponent<T extends React.ComponentType<any>>(
  componentFactory: () => Promise<{ default: T }>
): () => Promise<T> {
  let componentPromise: Promise<T> | null = null;

  return () => {
    if (!componentPromise) {
      componentPromise = componentFactory().then(module => module.default);
    }
    return componentPromise;
  };
}

// Intersection Observer Hook
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);

  const observer = useMemo(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return null;
    }

    return new IntersectionObserver(setEntries, options);
  }, [options]);

  const observe = useCallback((element: Element) => {
    if (observer) {
      observer.observe(element);
    }
  }, [observer]);

  const unobserve = useCallback((element: Element) => {
    if (observer) {
      observer.unobserve(element);
    }
  }, [observer]);

  useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return { entries, observe, unobserve };
}