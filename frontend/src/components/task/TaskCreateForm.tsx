import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Row,
  Col,
  Divider,
  Tag as AntTag,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Task, TaskPriority, TaskStatus } from '../../types/task';
import dictApi from '../../api/dict';
import type { Tag } from '../../types/dict';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskCreateFormProps {
  visible: boolean;
  task: Task | null;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  selectedDate?: string | null;
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({
  visible,
  task,
  onSubmit,
  onCancel,
  loading = false,
  selectedDate,
}) => {
  const [form] = Form.useForm();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // 加载标签列表
  const loadTags = async () => {
    try {
      const tags = await dictApi.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  // 初始化表单数据
  React.useEffect(() => {
    if (visible) {
      loadTags();
    }
  }, [visible]);

  // 初始化表单字段值
  React.useEffect(() => {
    if (visible) {
      if (task && task.id) {
        // 编辑模式 - 将标签字符串转换为标签ID数组
        const selectedTagIds = task.tags ?
          task.tags.split(',')
            .map(tagName => tagName.trim())
            .filter(tagName => {
              const tag = availableTags.find(t => t.name === tagName);
              return tag ? tag.id : null;
            })
            .filter(id => id !== null) : [];

        form.setFieldsValue({
          title: task.title,
          description: task.description,
          summary: task.summary,
          priority: task.priority,
          status: task.status,
          estimatedDuration: task.estimatedDuration,
          dueDate: task.dueDate ? dayjs(task.dueDate) : null,
          startTime: task.startTime ? dayjs(task.startTime) : null,
          endTime: task.endTime ? dayjs(task.endTime) : null,
          sortOrder: task.sortOrder,
          tagIds: selectedTagIds,
        });
      } else {
        // 创建模式 - 重置表单为初始值
        form.resetFields();
        form.setFieldsValue({
          priority: 'medium',
          status: 'pending',
          sortOrder: 1,
          tagIds: [],
          // 如果有选择的日期，设置开始时间和结束时间
          startTime: selectedDate ? dayjs(selectedDate).hour(9).minute(0).second(0) : dayjs().hour(9).minute(0).second(0),
          endTime: selectedDate ? dayjs(selectedDate).hour(10).minute(0).second(0) : dayjs().hour(10).minute(0).second(0),
          duration: 60, // 默认1小时
          // 如果有选择的日期，设置为截止日期，默认设置为选择日期的 18:00
          dueDate: selectedDate ? dayjs(selectedDate).hour(18).minute(0).second(0) : dayjs().hour(18).minute(0).second(0),
        });
      }
    }
  }, [visible, task, form, availableTags, selectedDate]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      console.log('Form submit values:', values);
      console.log('Selected tagIds:', values.tagIds);

      // 将选中的标签ID转换为标签名称字符串，以便与后端兼容
      const selectedTagNames = values.tagIds && values.tagIds.length > 0
        ? values.tagIds.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? tag.name : '';
          }).filter(name => name.trim()).join(',')
        : null;

      const formData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        startTime: values.startTime ? values.startTime.toISOString() : null,
        endTime: values.endTime ? values.endTime.toISOString() : null,
        estimatedDuration: values.duration || 25,
        // 将标签名称字符串传给后端，保持现有的数据格式
        tags: selectedTagNames,
        userId: 1, // 暂时写死，后续从用户信息中获取
      };

      console.log('Final formData to send:', formData);

      await onSubmit(formData);
      form.resetFields();
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  
  return (
    <Modal
      key={task?.id || 'new'}
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
          sortOrder: 1,
          tagIds: [],
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

          <Col span={24}>
            <Form.Item
              label="总结"
              name="summary"
              rules={[{ max: 1000, message: '总结最多1000个字符' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入任务完成后的总结（可选）"
                showCount
                maxLength={1000}
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
              label="开始时间"
              name="startTime"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker
                showTime
                placeholder="选择开始时间"
                style={{ width: '100%' }}
                onChange={(startTime) => {
                  const formValues = form.getFieldsValue();
                  if (startTime && formValues.endTime) {
                    const duration = dayjs(formValues.endTime).diff(startTime, 'minute');
                    if (duration > 0) {
                      form.setFieldValue('duration', duration);
                    }
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="结束时间"
              name="endTime"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker
                showTime
                placeholder="选择结束时间"
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  const startTime = form.getFieldValue('startTime');
                  return startTime ? (current && current < startTime.startOf('day')) : (current && current < dayjs().startOf('day'));
                }}
                onChange={(endTime) => {
                  const startTime = form.getFieldValue('startTime');
                  if (startTime && endTime) {
                    const duration = dayjs(endTime).diff(startTime, 'minute');
                    if (duration > 0) {
                      form.setFieldValue('duration', duration);
                    }
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="任务时长（分钟）"
              name="duration"
            >
              <InputNumber
                min={1}
                max={480}
                placeholder="自动计算"
                style={{ width: '100%' }}
                readOnly
                addonAfter="分钟"
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

  
          {/* 标签选择 */}
          <Col span={24}>
            <Form.Item
              label="标签"
              name="tagIds"
              help="选择任务的标签，可以选择多个标签"
            >
              <Select
                mode="multiple"
                placeholder="请选择标签"
                allowClear
                style={{ width: '100%' }}
                optionLabelProp="label"
              >
                {availableTags.map(tag => (
                  <Option key={tag.id} value={tag.id} label={tag.name}>
                    <Space>
                      <AntTag color={tag.color || '#1890ff'}>
                        {tag.name}
                      </AntTag>
                      <span>{tag.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
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