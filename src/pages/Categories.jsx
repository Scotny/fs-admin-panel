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
  Popconfirm,
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
  const [isEdit, setIsEdit] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem("admin_token");

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
      formData.append("image", categoryImageFile);

      const res = await fetch(
        "https://fastapi-course-app.onrender.com/categories/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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

  const handleEditCategory = (record) => {
    setIsEdit(true);
    setEditingCategory(record);
    setModalOpen(true);
  };

  const handleUpdateCategory = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (categoryImageFile) {
        formData.append("image", categoryImageFile);
      }

      const res = await fetch(
        `https://fastapi-course-app.onrender.com/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        message.success("Category updated!");
        fetchCategories();
        form.resetFields();
        setCategoryImageFile(null);
        setModalOpen(false);
        setIsEdit(false);
      } else {
        const error = await res.json();
        message.error(error.detail || "Failed to update category.");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error. Please try again.");
    }
  };

  const handleDeleteCategory = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "All courses under this category will also be deleted.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // 1️⃣ Fetch courses in this category
          const coursesRes = await fetch(
            `https://fastapi-course-app.onrender.com/categories/${id}/courses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!coursesRes.ok) throw new Error("Failed to fetch courses");

          const courses = await coursesRes.json();

          // 2️⃣ Delete each course
          await Promise.all(
            courses.map(async (course) => {
              await fetch(
                `https://fastapi-course-app.onrender.com/courses/delete_course/${course.id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
            })
          );

          // 3️⃣ Delete the category itself
          const deleteRes = await fetch(
            `https://fastapi-course-app.onrender.com/categories/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (deleteRes.ok) {
            message.success("Category and its courses deleted successfully.");
            fetchCategories();
          } else {
            const error = await deleteRes.json();
            message.error(error.detail || "Failed to delete category.");
          }
        } catch (err) {
          console.error(err);
          message.error("Error deleting category and courses.");
        }
      },
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (!isEdit) {
        form.resetFields();
        setCategoryImageFile(null);
      } else if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          description: editingCategory.description,
        });
      }
    }
  }, [modalOpen, isEdit, editingCategory, form]);

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
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEditCategory(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteCategory(record.id)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>
          <FolderOpenOutlined style={{ marginRight: 8 }} /> Category Dashboard
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsEdit(false);
            setModalOpen(true);
          }}
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
        title={isEdit ? "Edit Category" : "Add Category"}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEdit ? handleUpdateCategory : handleAddCategory}
        >
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

          <Form.Item label="Category Image">
            <Upload
              beforeUpload={handleImageUpload}
              maxCount={1}
              accept="image/*"
              onRemove={() => setCategoryImageFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            {isEdit ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
