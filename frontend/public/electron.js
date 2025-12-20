console.log('Starting Electron app...');

try {
  const { app, BrowserWindow } = require('electron');
  const path = require('path');

  console.log('Electron imported successfully');
  console.log('App object:', typeof app);

  let mainWindow;

  function createWindow() {
    console.log('Creating window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // 在开发模式下加载本地服务器
    mainWindow.loadURL('http://localhost:3003').catch(err => {
      console.error('Failed to load URL:', err);
      mainWindow.loadURL(
        'data:text/html,<h1>Development server not found</h1><p>Please run npm run dev first</p>'
      );
    });

    mainWindow.webContents.openDevTools();
  }

  app
    .whenReady()
    .then(() => {
      console.log('App is ready');
      createWindow();
    })
    .catch(err => {
      console.error('App ready failed:', err);
    });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAll().length === 0) {
      createWindow();
    }
  });
} catch (error) {
  console.error('Error in Electron app:', error);
  process.exit(1);
}
