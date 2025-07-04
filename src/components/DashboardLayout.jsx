import { Layout, Menu, Button } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_token");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  const menuItems = [
    {
      key: "categories",
      icon: <AppstoreOutlined />,
      label: "Categories",
      onClick: () => navigate("/dashboard/categories"),
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "Courses",
      onClick: () => navigate("/dashboard/courses"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        style={{
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            padding: "16px",
            fontWeight: "bold",
            fontSize: "20px",
            color: "#a000f0",
          }}
        >
          MyApp
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={["courses"]}
          items={menuItems}
          style={{ flexGrow: 1, borderRight: 0 }}
        />

        <div style={{ padding: "16px" }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            block
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/login");
            }}
            style={{ backgroundColor: "#a000f0", borderColor: "#a000f0" }}
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#a000f0",
          }}
        >
          Dashboard
        </Header>

        <Content
          style={{
            margin: "16px",
            background: "#f0f2f5",
            padding: "16px",
            minHeight: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
