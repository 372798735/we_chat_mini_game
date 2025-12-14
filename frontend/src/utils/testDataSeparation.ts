/**
 * 用户数据隔离测试工具
 * 用于验证不同用户的数据是否正确隔离
 */

export interface TestDataSeparationResult {
  testName: string;
  passed: boolean;
  details: string;
  expected: any;
  actual: any;
}

export class TestDataSeparation {
  private static testResults: TestDataSeparationResult[] = [];

  /**
   * 测试用户ID是否正确传递
   */
  static testUserIdHeader(): TestDataSeparationResult {
    const storedUserId = localStorage.getItem('userId');
    const hasToken = !!localStorage.getItem('token');

    const result: TestDataSeparationResult = {
      testName: '用户ID头部传递测试',
      passed: true,
      details: '',
      expected: '用户ID应该存在于localStorage中',
      actual: `userId: ${storedUserId}, hasToken: ${hasToken}`
    };

    if (!storedUserId && hasToken) {
      result.passed = false;
      result.details = '用户已登录但localStorage中没有userId';
    }

    this.testResults.push(result);
    return result;
  }

  /**
   * 测试不同用户的任务数据隔离
   */
  static testTaskDataSeparation(userTasks1: any[], userTasks2: any[]): TestDataSeparationResult {
    const result: TestDataSeparationResult = {
      testName: '任务数据隔离测试',
      passed: true,
      details: '',
      expected: '两个用户的任务数据应该完全不同',
      actual: `用户1任务数: ${userTasks1.length}, 用户2任务数: ${userTasks2.length}`
    };

    // 检查是否有重叠的任务ID
    const taskIds1 = new Set(userTasks1.map(task => task.id));
    const taskIds2 = new Set(userTasks2.map(task => task.id));
    const overlap = [...taskIds1].filter(id => taskIds2.has(id));

    if (overlap.length > 0) {
      result.passed = false;
      result.details = `发现重叠的任务ID: ${overlap.join(', ')}`;
    }

    this.testResults.push(result);
    return result;
  }

  /**
   * 测试API响应中是否包含正确的用户数据
   */
  static testApiResponseUserData(apiResponse: any, currentUserId: string): TestDataSeparationResult {
    const result: TestDataSeparationResult = {
      testName: 'API响应用户数据测试',
      passed: true,
      details: '',
      expected: 'API响应中的数据应该属于当前用户',
      actual: `当前用户ID: ${currentUserId}, 数据条数: ${Array.isArray(apiResponse) ? apiResponse.length : 'N/A'}`
    };

    if (Array.isArray(apiResponse)) {
      // 检查数组中的每条数据是否属于当前用户
      const invalidData = apiResponse.filter(item =>
        item.userId && item.userId.toString() !== currentUserId
      );

      if (invalidData.length > 0) {
        result.passed = false;
        result.details = `发现 ${invalidData.length} 条不属于当前用户的数据`;
      }
    }

    this.testResults.push(result);
    return result;
  }

  /**
   * 运行所有测试
   */
  static async runAllTests(): Promise<TestDataSeparationResult[]> {
    console.log('🧪 开始运行用户数据隔离测试...');

    // 清除之前的测试结果
    this.testResults = [];

    // 测试1: 用户ID头部传递
    this.testUserIdHeader();

    // 测试2: 模拟创建两个不同用户的任务数据
    const user1Tasks = [
      { id: 1, userId: 1, title: '用户1的任务1' },
      { id: 2, userId: 1, title: '用户1的任务2' }
    ];

    const user2Tasks = [
      { id: 3, userId: 2, title: '用户2的任务1' },
      { id: 4, userId: 2, title: '用户2的任务2' }
    ];

    this.testTaskDataSeparation(user1Tasks, user2Tasks);

    // 输出测试结果
    console.log('📊 测试结果汇总:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.testName}: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
      if (!result.passed) {
        console.log(`   详情: ${result.details}`);
      }
      console.log(`   期望: ${result.expected}`);
      console.log(`   实际: ${result.actual}`);
      console.log('');
    });

    const passedCount = this.testResults.filter(r => r.passed).length;
    const totalCount = this.testResults.length;

    console.log(`🎯 总体结果: ${passedCount}/${totalCount} 项测试通过`);

    return this.testResults;
  }

  /**
   * 在浏览器控制台中显示数据分离状态
   */
  static showDataSeparationStatus() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    let user = null;
    // 安全地解析用户数据
    try {
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (error) {
      console.warn('用户数据解析失败:', error);
    }

    console.group('🔐 用户数据隔离状态');
    console.log('用户ID:', userId);
    console.log('Token存在:', !!token);
    console.log('用户信息:', user);

    if (!userId && token) {
      console.warn('⚠️ 检测到登录状态但缺少用户ID，可能存在数据隔离问题！');
    } else if (userId && token) {
      console.log('✅ 用户认证状态正常，数据隔离应该工作正常');
    } else {
      console.log('ℹ️ 用户未登录');
    }
    console.groupEnd();
  }

  /**
   * 创建测试用户数据
   */
  static createTestUser(username: string, userId: number) {
    return {
      id: userId,
      username: username,
      email: `${username}@test.com`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 创建测试任务数据
   */
  static createTestTask(title: string, userId: number, taskId: number) {
    return {
      id: taskId,
      userId: userId,
      title: title,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
  }
}

// 自动在页面加载时显示状态
if (typeof window !== 'undefined') {
  TestDataSeparation.showDataSeparationStatus();
}

export default TestDataSeparation;