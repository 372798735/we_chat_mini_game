import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Rate,
  Select,
  Button,
  Space,
  message,
  Divider,
} from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { Button as CustomButton } from '../common';
import type { TaskSummary } from '../../types/summary';

const { TextArea } = Input;
const { Option } = Select;

interface TaskSummaryFormProps {
  visible: boolean;
  task: any;
  summary?: TaskSummary;
  onSubmit: (summary: Partial<TaskSummary>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 任务总结表单组件
 *
 * @param props - 表单属性
 * @returns JSX.Element
 */
export const TaskSummaryForm: React.FC<TaskSummaryFormProps> = ({
  visible,
  task,
  summary,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>(summary?.tags?.split(',') || []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        tags: tags.join(','),
      });
      form.resetFields();
      setTags([]);
      message.success('任务总结已保存');
    } catch (error) {
      console.error('保存总结失败:', error);
    }
  };

  const handleAddTag = (value: string) => {
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return '优秀';
      case 4: return '良好';
      case 3: return '一般';
      case 2: return '较差';
      case 1: return '很差';
      default: return '';
    }
  };

  return (
    <Modal
      title={
        <div className="summary-form-title">
          <StarOutlined style={{ marginRight: 8, color: '#faad14' }} />
          任务总结 - {task?.title}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="task-summary-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          rating: summary?.rating ? getRatingValue(summary.rating) : 3,
          mood: summary?.mood,
          difficulty: summary?.difficulty,
          focusLevel: summary?.focusLevel,
          summary: summary?.summary,
        }}
      >
        <Form.Item
          label="完成度评价"
          name="rating"
          rules={[{ required: true, message: '请选择完成度评价' }]}
        >
          <Rate
            character={<StarOutlined />}
            tooltips={['很差', '较差', '一般', '良好', '优秀']}
          />
        </Form.Item>

        <div className="summary-form-row">
          <Form.Item
            label="任务心情"
            name="mood"
            className="summary-form-col"
          >
            <Select placeholder="选择当时的心情">
              <Option value="VERY_HAPPY">😊 非常愉快</Option>
              <Option value="HAPPY">🙂 愉快</Option>
              <Option value="NEUTRAL">😐 一般</Option>
              <Option value="UNHAPPY">😕 不愉快</Option>
              <Option value="VERY_UNHAPPY">😞 很不愉快</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="难度感受"
            name="difficulty"
            className="summary-form-col"
          >
            <Select placeholder="选择任务的难度感受">
              <Option value="VERY_EASY">⭐ 很容易</Option>
              <Option value="EASY">⭐⭐ 容易</Option>
              <Option value="MEDIUM">⭐⭐⭐ 适中</Option>
              <Option value="HARD">⭐⭐⭐⭐ 困难</Option>
              <Option value="VERY_HARD">⭐⭐⭐⭐⭐ 很困难</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="专注度"
          name="focusLevel"
        >
          <Select placeholder="选择任务时的专注程度">
            <Option value="VERY_FOCUSED">🎯 非常专注</Option>
            <Option value="FOCUSED">💡 专注</Option>
            <Option value="NORMAL">👀 一般</Option>
            <Option value="DISTRACTED">📱 容易分心</Option>
            <Option value="VERY_DISTRACTED">🚫 很分心</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="总结描述"
          name="summary"
          rules={[
            { required: true, message: '请输入任务总结' },
            { max: 500, message: '总结不能超过500个字符' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="描述一下这个任务的完成过程、遇到的困难、学到的经验等..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="标签">
          <div className="summary-tags-section">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="添加标签，按回车确认"
              onSelect={handleAddTag}
              dropdownStyle={{ display: 'none' }}
            />

            <div className="summary-tags-list">
              {tags.map(tag => (
                <span key={tag} className="summary-tag">
                  {tag}
                  <button
                    type="button"
                    className="summary-tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Form.Item>

        <Divider />

        <div className="summary-form-actions">
          <Space>
            <CustomButton
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              保存总结
            </CustomButton>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

// 获取评价值
const getRatingValue = (rating: string): number => {
  switch (rating) {
    case 'EXCELLENT': return 5;
    case 'GOOD': return 4;
    case 'AVERAGE': return 3;
    case 'POOR': return 2;
    default: return 3;
  }
};

// 获取评价字符串
const getRatingString = (rating: number): string => {
  switch (rating) {
    case 5: return 'EXCELLENT';
    case 4: return 'GOOD';
    case 3: return 'AVERAGE';
    case 2: return 'POOR';
    case 1: return 'POOR';
    default: return 'AVERAGE';
  }
};

export default TaskSummaryForm;