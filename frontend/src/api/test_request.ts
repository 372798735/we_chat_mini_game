// 测试修复后的 Request 类
import { Request } from './request';

// 定义测试类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 测试 GET 请求
async function testGet() {
  try {
    // 测试标准 ApiResponse 格式
    const user: User = await Request.get<User>('/api/users/1');
    console.log('User:', user);
    console.log('User id:', user.id); // 类型安全，可访问 id 属性
    console.log('User name:', user.name); // 类型安全，可访问 name 属性
    
    // 测试数组响应
    const users: User[] = await Request.get<User[]>('/api/users');
    console.log('Users:', users);
    console.log('First user name:', users[0]?.name); // 类型安全
  } catch (error) {
    console.error('GET error:', error);
  }
}

// 测试 POST 请求
async function testPost() {
  try {
    const newUser: User = await Request.post<User>('/api/users', {
      name: 'Test User',
      email: 'test@example.com'
    });
    console.log('New user:', newUser);
    console.log('New user id:', newUser.id); // 类型安全
  } catch (error) {
    console.error('POST error:', error);
  }
}

// 测试 PUT 请求
async function testPut() {
  try {
    const updatedUser: User = await Request.put<User>('/api/users/1', {
      name: 'Updated User'
    });
    console.log('Updated user:', updatedUser);
  } catch (error) {
    console.error('PUT error:', error);
  }
}

// 测试 DELETE 请求
async function testDelete() {
  try {
    const result: { success: boolean } = await Request.delete<{ success: boolean }>('/api/users/1');
    console.log('Delete result:', result);
    console.log('Delete success:', result.success); // 类型安全
  } catch (error) {
    console.error('DELETE error:', error);
  }
}

// 运行测试
// testGet();
// testPost();
// testPut();
// testDelete();

console.log('TypeScript 类型检查通过！');