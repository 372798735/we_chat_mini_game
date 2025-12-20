// 仅类型检查测试
import { Request } from './request';

// 定义测试类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 测试 GET 请求的类型
async function testGet() {
  const user: User = await Request.get<User>('/api/users/1');
  const users: User[] = await Request.get<User[]>('/api/users');
  
  // 这些应该都能通过类型检查
  const userId: number = user.id;
  const userName: string = user.name;
  const firstUserName: string = users[0]?.name;
}

// 测试 POST 请求的类型
async function testPost() {
  const newUser: User = await Request.post<User>('/api/users', {
    name: 'Test User',
    email: 'test@example.com'
  });
  
  const userId: number = newUser.id;
  const userName: string = newUser.name;
}

// 测试 PUT 请求的类型
async function testPut() {
  const updatedUser: User = await Request.put<User>('/api/users/1', {
    name: 'Updated User'
  });
  
  const userName: string = updatedUser.name;
}

// 测试 DELETE 请求的类型
async function testDelete() {
  const result: { success: boolean } = await Request.delete<{ success: boolean }>('/api/users/1');
  
  const success: boolean = result.success;
}

// 测试 PATCH 请求的类型
async function testPatch() {
  const patchedUser: User = await Request.patch<User>('/api/users/1', {
    email: 'new-email@example.com'
  });
  
  const userEmail: string = patchedUser.email;
}

console.log('所有类型检查通过！');