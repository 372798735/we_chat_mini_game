package com.tomato.todo.backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * 性能优化配置
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Configuration
public class PerformanceConfig {

    /**
     * 线程池配置
     * 暂时注释掉，使用Spring Boot默认的异步配置
     */
    // @Bean(name = "taskExecutor")
    // public java.util.concurrent.Executor taskExecutor() {
    //     return new java.util.concurrent.ThreadPoolExecutor(
    //         10, // 核心线程数
    //         50, // 最大线程数
    //         60L, // 空闲时间
    //         java.util.concurrent.TimeUnit.SECONDS,
    //         new java.util.concurrent.LinkedBlockingQueue<>(1000), // 队列容量
    //         new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
    //     );
    // }

    /**
     * 异步任务执行器
     * 暂时注释掉，使用Spring Boot默认的异步配置
     */
    // @Bean(name = "asyncExecutor")
    // public java.util.concurrent.Executor asyncExecutor() {
    //     return new java.util.concurrent.ThreadPoolExecutor(
    //         5, // 核心线程数
    //         20, // 最大线程数
    //         30L, // 空闲时间
    //         java.util.concurrent.TimeUnit.SECONDS,
    //         new java.util.concurrent.LinkedBlockingQueue<>(500), // 队列容量
    //         new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
    //     );
    // }

    /**
     * 内存缓存管理器
     * 暂时注释掉，避免Spring Boot配置冲突
     */
    // @Bean
    // public MemoryCacheManager memoryCacheManager() {
    //     return new MemoryCacheManager();
    // }

    /**
     * 内存缓存管理器类
     */
    public static class MemoryCacheManager {
        private final java.util.concurrent.ConcurrentHashMap<String, CacheEntry> cache = new java.util.concurrent.ConcurrentHashMap<>();
        private final java.util.concurrent.ScheduledExecutorService cleanupExecutor =
                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();

        public MemoryCacheManager() {
            // 定期清理过期缓存
            cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredEntries, 1, 1, java.util.concurrent.TimeUnit.MINUTES);
        }

        public void put(String key, Object value, long ttlMillis) {
            long expiryTime = System.currentTimeMillis() + ttlMillis;
            cache.put(key, new CacheEntry(value, expiryTime));
        }

        public Object get(String key) {
            CacheEntry entry = cache.get(key);
            if (entry == null) {
                return null;
            }

            if (entry.isExpired()) {
                cache.remove(key);
                return null;
            }

            return entry.getValue();
        }

        public void remove(String key) {
            cache.remove(key);
        }

        public void clear() {
            cache.clear();
        }

        private void cleanupExpiredEntries() {
            long currentTime = System.currentTimeMillis();
            cache.entrySet().removeIf(entry -> entry.getValue().isExpired(currentTime));
        }

        private static class CacheEntry {
            private final Object value;
            private final long expiryTime;

            public CacheEntry(Object value, long expiryTime) {
                this.value = value;
                this.expiryTime = expiryTime;
            }

            public Object getValue() {
                return value;
            }

            public boolean isExpired() {
                return isExpired(System.currentTimeMillis());
            }

            public boolean isExpired(long currentTime) {
                return currentTime > expiryTime;
            }
        }
    }

    /**
     * Caffeine缓存配置（如果项目中有Caffeine依赖）
     * 注意：当前项目中未添加Caffeine依赖，暂时注释掉此Bean配置
     */
    /*
    @Bean
    public com.github.benmanes.caffeine.cache.Cache<String, Object> caffeineCache() {
        return com.github.benmanes.caffeine.cache.Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(java.time.Duration.ofMinutes(30))
                .recordStats()
                .build();
    }
    */

    /**
     * 性能监控拦截器
     * 暂时注释掉，避免Spring配置冲突
     */
    // @Bean
    // public PerformanceInterceptor performanceInterceptor() {
    //     return new PerformanceInterceptor();
    // }

    /**
     * 数据库连接池优化配置
     * 暂时注释掉，使用Spring Boot默认的HikariCP配置
     */
    // @Bean
    // public com.zaxxer.hikari.HikariConfig hikariConfig() {
    //     com.zaxxer.hikari.HikariConfig config = new com.zaxxer.hikari.HikariConfig();
    //     config.setMaximumPoolSize(20);
    //     config.setMinimumIdle(5);
    //     config.setIdleTimeout(300000);
    //     config.setConnectionTimeout(20000);
    //     config.setMaxLifetime(1200000);

    //     // 性能优化设置
    //     config.addDataSourceProperty("cachePrepStmts", "true");
    //     config.addDataSourceProperty("prepStmtCacheSize", "250");
    //     config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
    //     config.addDataSourceProperty("useServerPrepStmts", "true");

    //     return config;
    // }
}