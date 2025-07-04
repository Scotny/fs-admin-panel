import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Upload,
  Collapse,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Courses() {
  const [categories, setCategories] = useState([]);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [form] = Form.useForm();

  const token = localStorage.getItem("admin_token");

  const fetchCategories = async () => {
    if (!token) {
      message.error("Unauthorized: Please login again.");
      return;
    }
    try {
      const res = await fetch(
        "https://fastapi-course-app.onrender.com/categories/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load categories.");
    }
  };

  const fetchCoursesForCategories = async (categoryList) => {
    if (!token) return;
    try {
      const result = {};
      await Promise.all(
        categoryList.map(async (category) => {
          const res = await fetch(
            `https://fastapi-course-app.onrender.com/categories/${category.id}/courses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.ok) {
            const data = await res.json();
            result[category.id] = data.map((item) => ({
              key: item.id,
              ...item,
            }));
          } else {
            result[category.id] = [];
          }
        })
      );
      setCoursesByCategory(result);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch courses.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length) {
      fetchCoursesForCategories(categories);
    }
  }, [categories]);

  const handleAddCourse = async (values) => {
    if (!token) {
      message.error("Unauthorized: Please login again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category_id", values.category_id);
      if (values.video_url) formData.append("video_url", values.video_url);
      if (videoFile) formData.append("video_file", videoFile);

      const res = await fetch(
        "https://fastapi-course-app.onrender.com/courses/create_course",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        message.success("Course added successfully.");
        form.resetFields();
        setVideoFile(null);
        fetchCoursesForCategories(categories);
      } else {
        const error = await res.json();
        message.error(error.detail || "Failed to add course.");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while adding course.");
    }
  };

  const handleFileUpload = (file) => {
    setVideoFile(file);
    return false;
  };

  const isYouTube = (url) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Title", dataIndex: "title", width: 150 },
    {
      title: "Description",
      dataIndex: "description",
      width: 250,
      ellipsis: true,
    },
    { title: "Category ID", dataIndex: "category_id", width: 100 },
    {
      title: "Video",
      dataIndex: "video_url",
      width: 250,
      render: (text) =>
        text ? (
          isYouTube(text) ? (
            <iframe
              width="220"
              height="124"
              src={text.replace("watch?v=", "embed/")}
              title="Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video
              src={`https://fastapi-course-app.onrender.com/${text}`}
              controls
              style={{ width: "220px", height: "124px" }}
            />
          )
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <Title level={4}>Add New Course</Title>

      <Form layout="vertical" onFinish={handleAddCourse} form={form}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter course title" }]}
        >
          <Input placeholder="Course title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input placeholder="Course description" />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
          rules={[{ required: true, message: "Please select category" }]}
        >
          <Select placeholder="Select category">
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Video URL input — disable if file is selected */}
        <Form.Item shouldUpdate>
          {() => (
            <Form.Item name="video_url" label="Video URL (optional)">
              <Input
                placeholder="YouTube or server video path"
                disabled={!!videoFile}
                onChange={(e) => {
                  if (e.target.value) {
                    setVideoFile(null);
                  }
                }}
              />
            </Form.Item>
          )}
        </Form.Item>

        {/* Video File Upload — disable if video_url is filled */}
        <Form.Item shouldUpdate>
          {() => (
            <Form.Item label="Upload Video File (optional)">
              <Upload
                beforeUpload={(file) => {
                  setVideoFile(file);
                  if (form.getFieldValue("video_url")) {
                    form.setFieldsValue({ video_url: "" });
                  }
                  return false;
                }}
                maxCount={1}
                accept="video/*"
                fileList={videoFile ? [videoFile] : []}
                onRemove={() => setVideoFile(null)}
                disabled={!!form.getFieldValue("video_url")}
              >
                <Button
                  icon={<UploadOutlined />}
                  disabled={!!form.getFieldValue("video_url")}
                >
                  Select Video
                </Button>
              </Upload>
            </Form.Item>
          )}
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Add Course
        </Button>
      </Form>

      <Title level={4} style={{ marginTop: 32 }}>
        Existing Courses by Category
      </Title>

      <Collapse
        accordion
        items={categories.map((category) => ({
          key: category.id,
          label: category.name,
          children:
            coursesByCategory[category.id] &&
            coursesByCategory[category.id].length > 0 ? (
              <Table
                columns={columns}
                dataSource={coursesByCategory[category.id]}
                style={{ marginTop: 24 }}
                pagination={false}
                bordered
                tableLayout="fixed"
                scroll={{ x: "max-content" }}
              />
            ) : (
              <p style={{ margin: 0 }}>No courses in this category.</p>
            ),
        }))}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
}
