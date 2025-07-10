import { Box, Container } from "@chakra-ui/react";
import NewPostForm from "../components/NewPostForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreatePostPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  return (
    <Container minH="100vh" minW="100vw" py={10}>
      <Box>
        <NewPostForm />
      </Box>
    </Container>
  );
};

export default CreatePostPage;
