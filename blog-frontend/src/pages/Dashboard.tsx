import { useEffect } from "react";
import { Box, Heading, Text, Button, Center, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";

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
    <Flex minH="100vh" minW="99vw" width="100vw" align="center" justify="center" bg={"gray.50"} p={{ base: 4, md: 8 }}>
      <Box w="100vw" minW="100vw" maxW="100vw" bg="white" p={{ base: 6, md: 10 }} borderRadius="none" boxShadow="none" textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Box maxW={{ base: "xs", sm: "md", md: "lg", xl: "2xl" }} w="100%">
          <NewPostForm />
        </Box>
      </Box>
    </Flex>
  );
};

export default Dashboard; 