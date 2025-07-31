import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import UsersList from "./pages/admin/UsersList";
import UserDetail from "./pages/admin/UserDetail";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetail from "./pages/PostDetail";
import NotFoundPage from "./pages/404";
import Profile from "./pages/Profile";
import socket from "./utils/socket";
import NotificationListener from "./components/NotificationListener";
import SocketMentionHandler from "./components/SocketMentionHandler";
import NotificationsPage from "./pages/NotificationsPage";
import SocketNotificationHandler from "./components/SocketNotificationHandler";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
  
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    
    if (token && userData) {
      const user = JSON.parse(userData);
      socket.emit("register", user.id);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  

  return (
    <ChakraProvider>
      <Router>
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        {/* Bildirim listener */}
        <NotificationListener />
        <SocketMentionHandler />
        <SocketNotificationHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/users/:id" element={<UserDetail />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* 404 fallback route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
