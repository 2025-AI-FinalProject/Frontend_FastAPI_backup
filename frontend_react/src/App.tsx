import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import Mainpage from "./pages/Mainpage";
import NetworkTrafficMonitoring from "./pages/NetworkTrafficMonitoring";
import SystemNetworkMonitoring from "./pages/SystemNetworkMonitoring";
import TypeofNetworkTrafficAttack from "./pages/TypeofNetworkTrafficAttack";
import TypeofSystemLogAttack from "./pages/TypeofSystemLogAttack";
import MyPage from "./pages/MyPage";
import SignUpPage from "./pages/SignUpPage";
import ExternalAttackIPBlocking from "./pages/ExternalAttackIPBlocking";
import IsolateInternalInfectedPC from "./pages/IsolateInternalInfectedPC";
import Blockingcertainports from "./pages/Blockingcertainports";

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
        <Route path="traffic" element={<NetworkTrafficMonitoring />} />
        <Route path="network" element={<SystemNetworkMonitoring />} />
        <Route path="typeofNetworkTrafficAttack" element={<TypeofNetworkTrafficAttack />} />
        <Route path="typeofSystemLogAttack" element={<TypeofSystemLogAttack />} />
        <Route path="attackIPBlocking" element={<ExternalAttackIPBlocking />} />
        <Route path="isolateInternalInfectedPC" element={<IsolateInternalInfectedPC />} />
        <Route path="blockingcertainports" element={<Blockingcertainports />} />

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
