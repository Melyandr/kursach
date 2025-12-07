//import React from "react";
//import {
//  BrowserRouter as Router,
//  Routes,
//  Route,
//} from "react-router-dom";
//
//import SavedPage from "./pages/SavedPage";
//import Navbar from "./pages/Navbar";
//import Home from "./pages/Home";
//import ArticlesPage from "./pages/ArticlesPage";
//import LoginPage from "./pages/LoginPage";
//import CreateArticlePage from "./pages/CreateArticlePage";
//import EditArticlePage from "./pages/EditArticlePage";
//import Subscriptions from './pages/Subscriptions';
//import CreateArticleChannelPage from './pages/CreateArticleChannelPage';
//
//function App() {
//const token = localStorage.getItem("token");
//  return (
//    <Router>
//      <Navbar />
//      <Routes>
//        <Route path="/" element={<Home />} />
//        <Route path="/category/:category" element={<ArticlesPage />} />
//        <Route path="/login" element={<LoginPage />} />
//        <Route path="/create-article" element={<CreateArticlePage />} />
//        <Route path="/edit-article/:id" element={<EditArticlePage />} />
//        <Route path="/subscriptions" element={<Subscriptions />} />
//        <Route path="/saved" element={<SavedPage token={token} />} />
//        <Route path="/channels/:id/create" element={<CreateArticleChannelPage />} />
//      </Routes>
//    </Router>
//  );
//}
//
//export default App;
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import CreatePollPage from "./pages/CreatePollPage";
import SavedPage from "./pages/SavedPage";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import ArticlesPage from "./pages/ArticlesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import Subscriptions from './pages/Subscriptions';
import CreateArticleChannelPage from './pages/CreateArticleChannelPage';
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import ChannelContentPage from "./pages/ChannelContentPage";
import Notifications from "./pages/Notifications"

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
const token = localStorage.getItem("token");
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return setCurrentUser(null);

  fetch("http://127.0.0.1:8000/api/user/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("token invalid");
      }
      return res.json();
    })
    .then((data) => {
      setCurrentUser(data);
      setIsAdmin(data.is_staff);
    })
    .catch((err) => {
      console.warn("current_user fetch failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      setCurrentUser(null);
    });
}, []);

console.log(currentUser, isAdmin);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<ArticlesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-article" element={<CreateArticlePage />} />
        <Route path="/edit-article/:id" element={<EditArticlePage />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/saved" element={<SavedPage token={token} />} />
        <Route path="/channels/:id/create" element={<CreateArticleChannelPage />} />
        <Route path="/create-poll" element={<CreatePollPage />} />
        <Route path="/channels/:id" element={<ChannelContentPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;


