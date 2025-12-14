import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  build: {
    // 生产环境构建优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除指定函数
      },
      mangle: {
        safari10: true, // 兼容 Safari 10
      },
    },
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          // 将 React 相关库打包到 vendor
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // 将 UI 库打包到 antd
          antd: ['antd', '@ant-design/icons'],
          // 将图表库打包到 echarts
          echarts: ['echarts'],
          // 将工具库打包到 utils
          utils: ['dayjs', 'lodash-es'],
          // 将状态管理库打包到 state
          state: ['@reduxjs/toolkit', 'react-redux'],
        },
        // 文件命名优化
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(ext)) {
            return `assets/media/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(ext)) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      external: [],
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 构建目标
    target: 'es2015',
  },
  optimizeDeps: {
    // 预构建依赖
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'dayjs',
      'echarts',
      'lodash-es',
    ],
    exclude: ['electron'],
  },
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // Ant Design 主题定制
          '@primary-color': '#1890ff',
          '@border-radius-base': '6px',
          '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        require('autoprefixer')({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not ie 11',
          ],
        }),
        // CSS 压缩
        require('cssnano')({
          preset: 'default',
        }),
      ],
    },
  },
  // 开发服务器配置
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // 预览服务器配置
  preview: {
    host: true,
    port: 4173,
  },
  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});