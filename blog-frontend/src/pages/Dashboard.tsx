import { useEffect } from "react";
import { Box, Heading, Text, Button, Center } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import NewPostForm from "./NewPostForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <Center minH="60vh">
        <Box textAlign="center">
          <Heading size="md" mb={4}>Giriş yapmalısınız</Heading>
          <Text mb={4}>Post oluşturmak için önce giriş yapın.</Text>
          <Button colorScheme="teal" onClick={() => navigate("/login")}>Giriş Yap</Button>
        </Box>
      </Center>
    );
  }

  return (
    <Box>
      <NewPostForm />
    </Box>
  );
};

export default Dashboard; 