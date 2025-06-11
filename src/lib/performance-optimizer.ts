export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private cache = new Map<string, any>()
  private observers = new Map<string, IntersectionObserver>()
  private performanceMetrics: PerformanceMetric[] = []
  private memoryThreshold = 100 * 1024 * 1024 // 100MB
  private cacheMaxSize = 50

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Lazy loading for images and components
  public setupLazyLoading(
    selector: string = 'img[data-lazy]',
    options: IntersectionObserverInit = {}
  ): void {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          this.loadElement(element)
          observer.unobserve(element)
        }
      })
    }, defaultOptions)

    this.observers.set(selector, observer)

    // Observe existing elements
    document.querySelectorAll(selector).forEach((element) => {
      observer.observe(element)
    })
  }

  private loadElement(element: HTMLElement): void {
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement
      const src = img.dataset.lazy
      if (src) {
        img.src = src
        img.removeAttribute('data-lazy')
        img.classList.add('loaded')
      }
    } else if (element.dataset.component) {
      // Load lazy components
      this.loadLazyComponent(element)
    }
  }

    private async loadLazyComponent(element: HTMLElement): Promise<void> {
    const componentName = element.dataset.component
    if (!componentName) return

    try {
       const component = await import(`@/components/${componentName}` as string)
       // Component loading logic would go here
       element.classList.add('component-loaded')
     } catch (error) {
       console.error(`Failed to load component: ${componentName}`, error)
     }
  }

  // Caching system
  public setCache(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    // Implement LRU cache
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  public getCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.value
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern)
      const keys = Array.from(this.cache.keys())
      for (const key of keys) {
        if (regex.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Memory management
  public monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }

      if (usage.used > this.memoryThreshold) {
        this.performMemoryCleanup()
      }

      this.recordMetric('memory', usage.used)
    }
  }

  private performMemoryCleanup(): void {
    // Clear old cache entries
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl / 2) {
        this.cache.delete(key)
      }
    }

    // Cleanup old performance metrics
    this.performanceMetrics = this.performanceMetrics.slice(-100)

    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
  }

  // Performance monitoring
  public recordMetric(name: string, value: number, metadata?: any): void {
    this.performanceMetrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    })

    // Keep only recent metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-500)
    }
  }

  public getMetrics(name?: string, timeRange?: number): PerformanceMetric[] {
    let metrics = this.performanceMetrics

    if (name) {
      metrics = metrics.filter(m => m.name === name)
    }

    if (timeRange) {
      const cutoff = Date.now() - timeRange
      metrics = metrics.filter(m => m.timestamp > cutoff)
    }

    return metrics
  }

  public getAverageMetric(name: string, timeRange?: number): number {
    const metrics = this.getMetrics(name, timeRange)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  // Resource preloading
  public preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font' = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      switch (type) {
        case 'image':
          link.as = 'image'
          break
        case 'script':
          link.as = 'script'
          break
        case 'style':
          link.as = 'style'
          break
        case 'font':
          link.as = 'font'
          link.crossOrigin = 'anonymous'
          break
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload ${url}`))

      document.head.appendChild(link)
    })
  }

  // Bundle optimization
  public async loadChunk(chunkName: string): Promise<any> {
    const cacheKey = `chunk:${chunkName}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    try {
      const startTime = performance.now()
      const chunk = await import(`@/chunks/${chunkName}`)
      const loadTime = performance.now() - startTime

      this.recordMetric('chunk_load_time', loadTime, { chunkName })
      this.setCache(cacheKey, chunk, 600000) // 10 minutes

      return chunk
    } catch (error) {
      console.error(`Failed to load chunk: ${chunkName}`, error)
      throw error
    }
  }

  // Image optimization
  public optimizeImage(
    src: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fallback = 'jpg'
    } = options

    // Check if browser supports WebP
    const supportsWebP = this.supportsWebP()
    const targetFormat = supportsWebP ? format : fallback

    // Build optimized URL (assuming a service like Cloudinary or similar)
    let optimizedUrl = src

    if (width || height) {
      optimizedUrl += `?w=${width || 'auto'}&h=${height || 'auto'}`
    }

    optimizedUrl += `&q=${quality}&f=${targetFormat}`

    return optimizedUrl
  }

  private supportsWebP(): boolean {
    const cached = this.getCache('supports_webp')
    if (cached !== null) return cached

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const supports = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

    this.setCache('supports_webp', supports, 86400000) // 24 hours
    return supports
  }

  // Network optimization
  public async fetchWithCache(
    url: string,
    options: RequestInit = {},
    cacheTime: number = 300000
  ): Promise<Response> {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    const response = await fetch(url, options)
    const fetchTime = performance.now() - startTime

    this.recordMetric('fetch_time', fetchTime, { url })

    if (response.ok) {
      this.setCache(cacheKey, response.clone(), cacheTime)
    }

    return response
  }

  // Performance reporting
  public generatePerformanceReport(): PerformanceReport {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    return {
      timestamp: now,
      metrics: {
        averageLoadTime: this.getAverageMetric('chunk_load_time', oneHour),
        averageFetchTime: this.getAverageMetric('fetch_time', oneHour),
        memoryUsage: this.getAverageMetric('memory', oneHour),
        cacheHitRate: this.calculateCacheHitRate(),
        totalRequests: this.getMetrics('fetch_time', oneHour).length
      },
      recommendations: this.generateRecommendations()
    }
  }

  private calculateCacheHitRate(): number {
    const hits = this.getMetrics('cache_hit', 3600000).length
    const misses = this.getMetrics('cache_miss', 3600000).length
    const total = hits + misses
    return total > 0 ? hits / total : 0
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const report = this.generatePerformanceReport()

    if (report.metrics.averageLoadTime > 1000) {
      recommendations.push('Consider code splitting to reduce bundle size')
    }

    if (report.metrics.cacheHitRate < 0.7) {
      recommendations.push('Increase cache TTL for frequently accessed resources')
    }

    if (report.metrics.memoryUsage > this.memoryThreshold) {
      recommendations.push('Implement more aggressive memory cleanup')
    }

    return recommendations
  }

  // Cleanup
  public dispose(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.cache.clear()
    this.performanceMetrics = []
  }
}

// Types
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: any
}

interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
  fallback?: 'jpg' | 'png'
}

interface PerformanceReport {
  timestamp: number
  metrics: {
    averageLoadTime: number
    averageFetchTime: number
    memoryUsage: number
    cacheHitRate: number
    totalRequests: number
  }
  recommendations: string[]
}

// Utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function measurePerformance<T>(
  name: string,
  func: () => T | Promise<T>
): T | Promise<T> {
  const optimizer = PerformanceOptimizer.getInstance()
  const startTime = performance.now()

  const result = func()

  if (result instanceof Promise) {
    return result.finally(() => {
      const endTime = performance.now()
      optimizer.recordMetric(name, endTime - startTime)
    })
  } else {
    const endTime = performance.now()
    optimizer.recordMetric(name, endTime - startTime)
    return result
  }
} 