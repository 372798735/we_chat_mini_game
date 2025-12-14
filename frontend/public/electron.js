const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// 保持对窗口对象的全局引用，如果不这样做，当JavaScript对象被垃圾回收时，窗口将自动关闭
let mainWindow = null
let tray = null

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.ico'),
    show: false,
    titleBarStyle: 'default'
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理窗口状态
  mainWindow.on('minimize', () => {
    // 在生产环境中，最小化到托盘
    if (!isDev && tray) {
      mainWindow.hide()
    }
  })

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// 创建系统托盘
function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.ico'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '关于番茄闹钟',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('open-about')
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('番茄闹钟')
  tray.setContextMenu(contextMenu)

  // 双击托盘图标显示主窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus()
      } else {
        mainWindow.show()
      }
    }
  })
}

// 这段程序将会在Electron结束初始化和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()
  if (!isDev) {
    createTray()
  }

  // 创建菜单
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建任务',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-task')
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-about')
            }
          }
        },
        {
          label: '快捷键',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-shortcuts')
            }
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，通常会重新创建一个窗口。
    if (BrowserWindow.getAll().length === 0) {
      createWindow()
    }
  })
})

// 当全部窗口关闭时退出应用。
app.on('window-all-closed', () => {
  // 在macOS上，应用程序及其菜单栏通常会保持活动状态，直到用户使用Cmd + Q明确退出。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-message-box', async (event, options) => {
  const { message, type = 'info', buttons = ['确定'] } = options
  const result = await require('electron').dialog.showMessageBox(mainWindow, {
    type,
    message,
    buttons
  })
  return result
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await require('electron').dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await require('electron').dialog.showOpenDialog(mainWindow, options)
  return result
})

// 通知处理
ipcMain.handle('show-notification', (event, options) => {
  const { title, body } = options
  const notification = new require('electron').Notification({
    title,
    body,
    icon: path.join(__dirname, 'icon.ico')
  })
  notification.show()
})

// 系统托盘处理
ipcMain.handle('set-tray-bubble', (event, title) => {
  if (tray) {
    tray.setToolTip(title)
  }
})