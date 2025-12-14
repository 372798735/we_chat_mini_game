const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检测Node.js安装路径
function getNodePath() {
  try {
    // Windows系统
    if (process.platform === 'win32') {
      const nodePath = execSync('where node', { encoding: 'utf8' }).trim();
      return nodePath;
    } else {
      // Linux/Mac系统
      const nodePath = execSync('which node', { encoding: 'utf8' }).trim();
      return nodePath;
    }
  } catch (error) {
    console.error('无法找到Node.js安装路径:', error.message);
    return null;
  }
}

// 设置Node.js环境变量
function setupNodeEnvironment() {
  const nodePath = getNodePath();

  if (nodePath) {
    const nodeDir = path.dirname(nodePath);

    // 设置NODE_PATH环境变量
    process.env.NODE_PATH = nodeDir;

    // Windows特殊处理
    if (process.platform === 'win32') {
      process.env.NODE_INSTALL_PATH = nodeDir;
    }

    console.log('Node.js路径检测成功:', nodeDir);
    return true;
  }

  console.error('Node.js路径检测失败');
  return false;
}

// 修复electron-builder配置
function fixElectronBuilderConfig() {
  const packageJsonPath = path.join(__dirname, '../package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 添加Node.js路径配置到build配置中
    if (!packageJson.build.npmRebuild) {
      packageJson.build.npmRebuild = true;
    }

    // 添加Node.js环境变量配置
    if (!packageJson.build.env) {
      packageJson.build.env = {};
    }

    packageJson.build.env.NODE_PATH = process.env.NODE_PATH || '';

    // Windows特殊配置
    if (process.platform === 'win32') {
      packageJson.build.win.NODE_INSTALL_PATH = process.env.NODE_INSTALL_PATH || '';
    }

    // 写入更新后的package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('Electron Builder配置更新成功');
    return true;
  } catch (error) {
    console.error('更新Electron Builder配置失败:', error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始修复Node.js路径问题...');

  if (setupNodeEnvironment()) {
    fixElectronBuilderConfig();
    console.log('Node.js路径修复完成');
    process.exit(0);
  } else {
    console.log('Node.js路径修复失败');
    process.exit(1);
  }
}

main();