import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PostForm from "./pages/PostForm";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <nav style={{ padding: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>Home</Link>
          <Link to="/new">New Post</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<PostForm />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
