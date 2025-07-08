import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <nav style={{ padding: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>Home</Link>
          <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
          <Link to="/signup" style={{ marginRight: 10 }}>Sign Up</Link>
          <Link to="/login">Login</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
