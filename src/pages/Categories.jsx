import {
  Card,
  Button,
  Table,
  Typography,
  message,
  Upload,
  Modal,
  Form,
  Input,
} from "antd";
import {
  PlusOutlined,
  FolderOpenOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Title } = Typography;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem("admin_token");

  // Fetch existing categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://fastapi-course-app.onrender.com/categories/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const tableData = data.map((item, idx) => ({
        key: idx + 1,
        ...item,
      }));
      setCategories(tableData);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setCategoryImageFile(file);
    return false;
  };

  const handleAddCategory = async (values) => {
    try {
      if (!categoryImageFile) {
        message.error("Please select an image!");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("image", categoryImageFile); // actual file object

      const res = await fetch(
        "https://fastapi-course-app.onrender.com/categories/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        message.success("Category added!");
        fetchCategories();
        form.resetFields();
        setCategoryImageFile(null);
        setModalOpen(false);
      } else {
        const error = await res.json();
        message.error(error.detail || "Failed to add category.");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error. Please try again.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = [
    { title: "№", dataIndex: "key", width: 60 },
    {
      title: "Image",
      dataIndex: "image",
      render: (text) =>
        text ? (
          <img
            src={`https://fastapi-course-app.onrender.com${text}`}
            alt="Category"
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          "No image"
        ),
    },
    { title: "Name", dataIndex: "name" },
    { title: "Description", dataIndex: "description" },
  ];

  return (
    <Card
      style={{ borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>
          <FolderOpenOutlined style={{ marginRight: 8 }} />
          Category Dashboard
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={false}
      />

      <Modal
        open={modalOpen}
        title="Add Category"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={handleAddCategory} form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Category name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input placeholder="Category description" />
          </Form.Item>
          <Form.Item label="Category Image" required>
            <Upload
              beforeUpload={handleImageUpload}
              maxCount={1}
              accept="image/*"
              fileList={categoryImageFile ? [categoryImageFile] : []}
              onRemove={() => setCategoryImageFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Add
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
