import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Row,
  Col,
  Divider,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Task, TaskPriority, TaskStatus } from '../../types/task';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskCreateFormProps {
  visible: boolean;
  task: Task | null;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({
  visible,
  task,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isRecurring, setIsRecurring] = useState(false);

  // 初始化表单数据
  React.useEffect(() => {
    if (visible) {
      if (task) {
        // 编辑模式
        const tagsArray = task.tags ? (typeof task.tags === 'string' ? task.tags.split(',').filter(t => t.trim()) : task.tags) : [];
        form.setFieldsValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          estimatedDuration: task.estimatedDuration,
          dueDate: task.dueDate ? dayjs(task.dueDate) : null,
          isRecurring: task.isRecurring,
          sortOrder: task.sortOrder,
          tags: tagsArray,
        });
        setTags(tagsArray); // Also update the local tags state
        setIsRecurring(task.isRecurring || false);
      } else {
        // 创建模式
        form.setFieldsValue({
          priority: 'medium',
          status: 'pending',
          estimatedDuration: 25,
          isRecurring: false,
          sortOrder: 1,
          tags: undefined, // 明确设置为 undefined
        });
        setTags([]); // Reset tags state
        setIsRecurring(false);
      }
    }
  }, [visible, task, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      console.log('Form submit values:', values);
      console.log('Tags value type:', typeof values.tags, 'Tags value:', values.tags);

      const formData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        estimatedDuration: values.estimatedDuration || 25,
        // Convert tags array to comma-separated string for backend compatibility
        tags: values.tags && values.tags.length > 0 ? values.tags.join(',') : null,
        userId: 1, // 暂时写死，后续从用户信息中获取
      };

      console.log('Final formData to send:', formData);

      await onSubmit(formData);
      form.resetFields();
      setTags([]); // Reset tags state
      setIsRecurring(false);
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  // 添加标签
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      const newTags = [...tags, inputTag];
      setTags(newTags);
      form.setFieldsValue({ tags: newTags });
      setInputTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setFieldsValue({ tags: newTags });
  };

  return (
    <Modal
      title={task ? '编辑任务' : '创建任务'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'medium',
          status: 'pending',
          estimatedDuration: 25,
          isRecurring: false,
          sortOrder: 1,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="任务标题"
              name="title"
              rules={[
                { required: true, message: '请输入任务标题' },
                { max: 100, message: '标题最多100个字符' },
              ]}
            >
              <Input placeholder="请输入任务标题" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="任务描述"
              name="description"
              rules={[{ max: 500, message: '描述最多500个字符' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入任务描述（可选）"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="优先级"
              name="priority"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="选择优先级">
                <Option value="low">低</Option>
                <Option value="medium">中</Option>
                <Option value="high">高</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="选择状态">
                <Option value="pending">待处理</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
                <Option value="paused">已暂停</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="预计时长（分钟）"
              name="estimatedDuration"
              rules={[{ required: true, message: '请输入预计时长' }]}
            >
              <InputNumber
                min={1}
                max={480}
                placeholder="25"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="截止日期"
              name="dueDate"
            >
              <DatePicker
                showTime
                placeholder="选择截止日期"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="排序"
              name="sortOrder"
            >
              <InputNumber
                min={1}
                max={9999}
                placeholder="1"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="是否循环任务"
              name="isRecurring"
              valuePropName="checked"
            >
              <Switch
                onChange={setIsRecurring}
              />
            </Form.Item>
          </Col>

          {/* 标签管理 */}
          <Col span={24}>
            <Form.Item label="标签" name="tags">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="输入标签名称"
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onPressEnter={handleAddTag}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddTag}
                    disabled={!inputTag.trim()}
                  />
                </Space.Compact>

                {tags.length > 0 && (
                  <div>
                    {tags.map((tag, index) => (
                      <Button
                        key={index}
                        size="small"
                        style={{ margin: '4px 4px 0 0' }}
                        onClose={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <MinusOutlined style={{ marginLeft: 4 }} />
                      </Button>
                    ))}
                  </div>
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* 表单操作按钮 */}
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={onCancel}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<PlusOutlined />}
              >
                {task ? '更新任务' : '创建任务'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaskCreateForm;