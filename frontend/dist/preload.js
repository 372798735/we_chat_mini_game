const { contextBridge, ipcRenderer } = require('electron')

// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 消息框
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // 文件对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 通知
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // 系统托盘
  setTrayBubble: (title) => ipcRenderer.invoke('set-tray-bubble', title),

  // 监听主进程事件
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback)
  },

  // 移除监听器
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  },

  // 发送消息到主进程
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args)
  }
})

// 暴露环境变量
contextBridge.exposeInMainWorld('env', {
  isDev: process.env.NODE_ENV === 'development'
})