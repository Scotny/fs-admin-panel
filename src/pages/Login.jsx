import { Card, Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await fetch(
        "https://fastapi-course-app.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_token", result.access_token || "yes");
        message.success("Login successful!");
        navigate("/dashboard/courses");
      } else {
        message.error(result.detail || "Invalid credentials!");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 350, borderRadius: "12px" }}>
        <Title level={3} style={{ textAlign: "center", color: "#a000f0" }}>
          Admin Login
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input placeholder="Enter admin username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "#a000f0", borderColor: "#a000f0" }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
