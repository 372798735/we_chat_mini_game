const builder = require('electron-builder');
const path = require('path');

async function build() {
  try {
    console.log('开始打包 Electron 应用...');

    // 清理输出目录
    const fs = require('fs');
    const outDir = path.join(__dirname, '..', 'dist-electron');
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
    }

    await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(['dir'], builder.Arch.x64),
      config: {
        appId: 'com.tomato.todo',
        productName: '番茄闹钟',
        directories: {
          output: 'dist-electron'
        },
        files: [
          'dist/**/*',
          'public/electron.js',
          'node_modules/**/*'
        ],
        win: {
          target: 'dir',
          icon: 'public/icon.ico',
          requestedExecutionLevel: 'asInvoker'
        },
        publish: null,
        // 完全禁用代码签名
        forceCodeSigning: false
      }
    });

    console.log('✅ 打包完成！');
    console.log(`📁 输出目录: ${outDir}`);
    console.log(`🚀 可执行文件: ${path.join(outDir, 'win-unpacked', '番茄闹钟.exe')}`);

  } catch (error) {
    console.error('❌ 打包失败:', error);
    process.exit(1);
  }
}

build();