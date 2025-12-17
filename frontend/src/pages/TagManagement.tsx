import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  message,
  Modal,
  Form,
  Input,
  ColorPicker,
  Tag as AntTag,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dictApi from '../api/dict';
import type { Tag, TagCreateRequest } from '../types/dict';

const { Title } = Typography;

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();

  // 加载标签列表
  const loadTags = async () => {
    try {
      setLoading(true);
      console.log('开始加载标签...');
      const data = await dictApi.getTags();
      console.log('获取到的标签数据:', data);
      setTags(data);
      console.log('标签设置完成');
    } catch (error) {
      console.error('加载标签失败:', error);
      message.error('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // 打开标签表单
  const openTagModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue({
        name: tag.name,
        color: tag.color || '#1890ff',
      });
    } else {
      setEditingTag(null);
      form.resetFields();
      form.setFieldsValue({
        color: '#1890ff',
      });
    }
    setIsModalVisible(true);
  };

  // 保存标签
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await dictApi.updateTag(editingTag.id, values);
        message.success('更新标签成功');
      } else {
        await dictApi.createTag(values);
        message.success('创建标签成功');
      }
      setIsModalVisible(false);
      loadTags();
    } catch (error) {
      console.error('保存标签失败:', error);
      message.error('保存标签失败');
    }
  };

  // 删除标签
  const handleDelete = async (id: number) => {
    try {
      await dictApi.deleteTag(id);
      message.success('删除标签成功');
      loadTags();
    } catch (error) {
      console.error('删除标签失败:', error);
      message.error('删除标签失败');
    }
  };

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => (
        <span style={{ color: record.color }}>{text}</span>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              marginRight: 8,
              backgroundColor: color,
            }}
          />
          {color}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: any) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openTagModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>标签管理</Title>
      </div>

      <Card>
        <div className="mb-4 flex justify-between">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openTagModal()}
          >
            新建标签
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 标签表单弹窗 */}
      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="标签名称"
            name="name"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 20, message: '标签名称最多20个字符' },
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            label="标签颜色"
            name="color"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker
              showText
              format="hex"
              onChange={(color) => form.setFieldsValue({ color: color.toHexString() })}
            />
          </Form.Item>

          <div className="flex justify-end">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManagement;