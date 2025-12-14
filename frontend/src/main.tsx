import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import { store } from '@/store'
import App from './App'
import './index.css'

// 设置dayjs中文
dayjs.locale('zh-cn')

// 过滤掉第三方库的findDOMNode警告（这些警告不影响应用功能）
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('findDOMNode is deprecated')) return;
  originalWarn(...args);
};

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('findDOMNode is deprecated')) return;
  if (message.includes('Warning: findDOMNode is deprecated')) return;
  originalError(...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
      >
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AntdApp>
          <App />
        </AntdApp>
      </BrowserRouter>
    </ConfigProvider>
  </Provider>
)