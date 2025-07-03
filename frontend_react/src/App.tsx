import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import Mainpage from "./pages/Mainpage";
import AttackStats from "./pages/AttackStats";
import AttackChart from "./pages/AttackChart";
import TrafficMonitoring from "./pages/TrafficMonitoring";
import SystemNetworkMonitoring from "./pages/SystemNetworkMonitoring";
import SQLInjection from "./pages/SQLInjection";
import CrossSiteScripting from "./pages/CrossSiteScripting";
import MyPage from "./pages/MyPage";
import SignUpPage from "./pages/SignUpPage";

const App = () => (
  <>
    <Routes>
      {/* 로그인 페이지 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 회원가입 페이지 <--- 경로와 컴포넌트 이름 변경 */}
      <Route path="/signup" element={<SignUpPage />} /> 

      {/* 보호된 대시보드 레이아웃 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* index route : /main 에서 기본으로 보여줄 컴포넌트 */}
        <Route index element={<Mainpage />} />
        
        {/* 여기서부터 <Outlet /> 내부에 렌더링됨 */}
        <Route path="preview" element={<AttackStats />} />
        <Route path="chart" element={<AttackChart />} />
        <Route path="traffic" element={<TrafficMonitoring />} />
        <Route path="network" element={<SystemNetworkMonitoring />} />
        <Route path="sql" element={<SQLInjection />} />
        <Route path="xss" element={<CrossSiteScripting />} />

        {/* 마이 페이지 */}
        <Route path="mypage" element={<MyPage />} />
      </Route>
    </Routes>

    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: { fontSize: "14px" },
      }}
    />
  </>
);

export default App;
