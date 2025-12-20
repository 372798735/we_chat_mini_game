# Vue开发者快速入门：React + Electron 项目

## 🎯 专为Vue开发者设计

如果你有Vue开发经验，这份指南将帮助你快速理解React + Electron项目结构和开发模式。

---

## 🔄 Vue vs React 概念对比

### 基本语法对比

#### 组件定义
```vue
<!-- Vue -->
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Hello Vue')
const handleClick = () => {
  console.log('Button clicked')
}
</script>
```

```tsx
// React
import React, { useState } from 'react'

interface CardProps {
  title: string
}

const Card: React.FC<CardProps> = ({ title }) => {
  const handleClick = () => {
    console.log('Button clicked')
  }

  return (
    <div className="card">
      <h2>{title}</h2>
      <button onClick={handleClick}>点击</button>
    </div>
  )
}
```

### 关键差异

| 特性 | Vue | React |
|-----|------|-------|
| **模板语法** | 模板语法 (`{{ }}`) | JSX (`{}`) |
| **事件处理** | `@click` | `onClick` |
| **双向绑定** | `v-model` | `value + onChange` |
| **条件渲染** | `v-if/v-show` | `{condition && <Component>}` |
| **列表渲染** | `v-for` | `{array.map(item => ...)}` |
| **插槽** | `<slot>` | `{children}` 或 props传递 |

---

## 🏗️ 项目结构对比

### Vue项目结构
```
vue-project/
├── src/
│   ├── components/     # 组件
│   ├── views/         # 页面
│   ├── store/         # Pinia/Vuex
│   ├── router/        # Vue Router
│   └── api/           # API调用
```

### React项目结构 (本项目)
```
react-electron-project/
├── src/
│   ├── components/     # 组件 (相同)
│   ├── pages/         # 页面 (类似views)
│   ├── store/         # Redux Toolkit (类似Pinia)
│   ├── api/           # API调用 (相同)
│   ├── hooks/         # 自定义Hooks (类似Composables)
│   └── types/         # TypeScript类型定义
```

---

## 🔧 状态管理对比

### Vue 3 + Pinia
```typescript
// store/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  const increment = () => {
    count.value++
  }

  return { count, increment }
})

// 在组件中使用
const { count, increment } = useCounterStore()
```

### React + Redux Toolkit (本项目)
```typescript
// store/slices/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  count: number
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1
    }
  }
})

export const { increment } = counterSlice.actions

// 在组件中使用
const count = useAppSelector(state => state.counter.count)
const dispatch = useAppDispatch()
dispatch(increment())
```

---

## 🎨 UI组件库对比

### Vue + Element Plus
```vue
<template>
  <el-button type="primary" @click="submitForm">
    提交
  </el-button>
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名" />
  </el-table>
</template>
```

### React + Ant Design (本项目)
```tsx
import { Button, Table } from 'antd'

const MyComponent = () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    }
  ]

  return (
    <>
      <Button type="primary" onClick={submitForm}>
        提交
      </Button>
      <Table columns={columns} dataSource={tableData} />
    </>
  )
}
```

---

## ⚡ 路由对比

### Vue Router
```typescript
// router/index.ts
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

// 在组件中
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/dashboard')
```

### React Router (本项目)
```typescript
// App.tsx
<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>

// 在组件中
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')
```

---

## 🔌 API调用对比

### Vue 3
```typescript
// composables/useApi.ts
import { ref } from 'vue'

export function useApi() {
  const data = ref(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await api.get('/data')
      data.value = response.data
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, fetchData }
}
```

### React + Custom Hooks (本项目)
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react'

export const useApi = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/data')
      setData(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, fetchData }
}
```

---

## 🎯 Electron集成

### Vue + Electron
- `vue-cli-plugin-electron-builder`
- 主进程文件在 `background.js`
- 渲染进程就是Vue应用

### React + Electron (本项目)
- 手动配置Electron
- 主进程文件在 `public/electron.js` 和 `public/electron-prod.js`
- 渲染进程是React应用
- 更灵活的配置控制

---

## 🛠️ 开发命令对比

### Vue项目
```bash
npm run dev        # 开发服务器
npm run build      # 构建
npm run electron:build  # Electron打包
```

### React + Electron项目 (本项目)
```bash
npm run dev        # 同时启动Vite和Electron
npm run build      # 构建React应用
npm run build:electron  # 打包Electron应用
```

---

## 📝 实战练习

### 1. 创建一个简单组件

**Vue版本:**
```vue
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <button @click="$emit('edit', user.id)">编辑</button>
  </div>
</template>

<script setup>
defineProps(['user'])
defineEmits(['edit'])
</script>
```

**React版本 (本项目):**
```tsx
interface UserCardProps {
  user: {
    id: number
    name: string
    email: string
  }
  onEdit: (id: number) => void
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>编辑</button>
    </div>
  )
}
```

### 2. 条件渲染

**Vue版本:**
```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <p v-for="item in items" :key="item.id">{{ item.name }}</p>
    </div>
  </div>
</template>
```

**React版本:**
```tsx
const MyComponent = () => {
  if (loading) return <div>加载中...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {items.map(item => (
        <p key={item.id}>{item.name}</p>
      ))}
    </div>
  )
}
```

### 3. 表单处理

**Vue版本:**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="姓名" />
    <input v-model="form.email" placeholder="邮箱" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  email: ''
})

const handleSubmit = () => {
  console.log(form)
}
</script>
```

**React版本:**
```tsx
const MyForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: ''
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onChange={handleChange('name')}
        placeholder="姓名"
      />
      <input
        value={form.email}
        onChange={handleChange('email')}
        placeholder="邮箱"
      />
      <button type="submit">提交</button>
    </form>
  )
}
```

---

## 🎨 样式处理

### Vue + Scoped CSS
```vue
<template>
  <div class="card">
    <h2 class="title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.card {
  padding: 16px;
  border: 1px solid #ddd;
}

.title {
  color: #333;
}
</style>
```

### React + CSS Modules (本项目)
```tsx
import styles from './Card.module.css'

const Card = () => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  )
}
```

```css
/* Card.module.css */
.card {
  padding: 16px;
  border: 1px solid #ddd;
}

.title {
  color: #333;
}
```

---

## 🔧 开发工具对比

| 功能 | Vue DevTools | React DevTools |
|------|-------------|----------------|
| **组件检查** | ✅ | ✅ |
| **状态管理** | Pinia/Vuex | Redux |
| **性能分析** | ✅ | ✅ |
| **时间旅行** | ✅ | ✅ |

---

## 💡 迁移建议

### 1. 从Vue 3到React的心态调整

1. **模板 vs JSX**: 从声明式模板转向编程式UI
2. **响应式**: 从`ref/reactive`转向`useState/useEffect`
3. **组合式**: Composition API → Custom Hooks
4. **指令**: Vue指令 → React组件/属性

### 2. 渐进式学习路径

1. **基础语法**: 先熟悉JSX语法
2. **Hooks学习**: 重点掌握useState, useEffect
3. **状态管理**: 理解Redux Toolkit模式
4. **组件设计**: 学习函数组件模式

### 3. 项目中的学习资源

在本项目中，你可以找到以下学习资料：
- `src/components/` - 各种组件实现示例
- `src/store/slices/` - Redux Toolkit状态管理示例
- `src/api/` - API调用封装示例
- `src/hooks/` - 自定义Hooks示例

---

## 🚀 快速开始你的第一个React组件

基于本项目的模式，这里是一个完整的组件模板：

```tsx
import React, { useState, useEffect } from 'react'
import { Card, Button, message } from 'antd'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

interface MyComponentProps {
  title: string
}

/**
 * 我的组件 - Vue开发者友好模板
 * @param props 组件属性
 * @returns JSX.Element
 */
export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  // 类似 ref()
  const [localState, setLocalState] = useState('')

  // 类似 computed() + watch()
  const globalState = useAppSelector(state => state.someSlice.data)
  const dispatch = useAppDispatch()

  // 类似 mounted() + watch()
  useEffect(() => {
    console.log('组件挂载')
    return () => {
      console.log('组件卸载')
    }
  }, [])

  // 事件处理方法
  const handleClick = () => {
    setLocalState('updated')
    message.success('操作成功')
  }

  // 渲染逻辑 (类似template)
  return (
    <Card title={title}>
      <p>本地状态: {localState}</p>
      <p>全局状态: {globalState}</p>
      <Button type="primary" onClick={handleClick}>
        点击我
      </Button>
    </Card>
  )
}

export default MyComponent
```

---

## 🎉 总结

作为Vue开发者，你已经具备了很多React开发需要的概念：

✅ **组件化思维** - Vue组件 → React组件
✅ **状态管理** - Pinia/Vuex → Redux Toolkit
✅ **路由导航** - Vue Router → React Router
✅ **API调用** - 相同的模式
✅ **响应式数据** - ref/reactive → useState

主要差异在于语法和实现细节，但核心概念是相通的。通过参考本项目的实际代码，你会很快适应React的开发模式。

祝你学习愉快！🚀