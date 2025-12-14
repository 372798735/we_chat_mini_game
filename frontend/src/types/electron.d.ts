/**
 * Electron API 类型声明
 */
export interface ElectronAPI {
  // 窗口控制
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void
  removeListener: (channel: string) => void

  // 系统通知
  showNotification: (title: string, body: string) => void

  // 文件操作
  openFile: () => Promise<string | null>
  saveFile: (content: string, filename: string) => Promise<boolean>

  // 系统信息
  getPlatform: () => Promise<string>
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}