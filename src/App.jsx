import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import Login from "./pages/Login";

const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const Categories = lazy(() => import("./pages/Categories"));
const Courses = lazy(() => import("./pages/Courses"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="courses" element={<Courses />} />
          <Route path="categories" element={<Categories />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
