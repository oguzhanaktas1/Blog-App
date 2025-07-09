import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Text,
  Link as ChakraLink,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { login } from "../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function LoginPage({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.token);
      setIsLoggedIn(true);
      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Giriş Başarısız",
        description: err.response?.data?.message || "E-posta veya şifre hatalı.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      minW="99vw"
      width="100vw"
      align="center"
      justify="center"
      bgGradient="linear(to-br, teal.400, blue.600)"
      p={{ base: 4, md: 8 }}
    >
      <Box
        w="100vw"
        minW="100vw"
        maxW="100vw"
        bg="white"
        p={{ base: 6, md: 10 }}
        borderRadius="none"
        boxShadow="none"
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box maxW={{ base: "xs", sm: "md", md: "lg", xl: "2xl" }} w="100%">
          <Heading mb={6} fontSize={{ base: "2xl", md: "3xl" }} color="gray.800">
            Giriş Yap
          </Heading>
          <Text mb={4} color="gray.600">
            Hesabınıza giriş yapmak için bilgilerinizi girin.
          </Text>
          <VStack spacing={4}>
            <Input
              placeholder="E-posta Adresiniz"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              size="lg"
              variant="filled"
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
            />
            <Input
              placeholder="Şifreniz"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              size="lg"
              variant="filled"
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
            />
            <Button
              colorScheme="teal"
              size="lg"
              width="full"
              onClick={handleSubmit}
              isLoading={isLoading}
              _hover={{ bg: "teal.500" }}
              _active={{ bg: "teal.600" }}
            >
              Giriş Yap
            </Button>
          </VStack>
          <Text mt={6} color="gray.600" fontSize="sm">
            Hesabınız yok mu?{" "}
            <ChakraLink as={RouterLink} to="/signup" color="teal.500" fontWeight="bold">
              Kayıt Olun
            </ChakraLink>
          </Text>
          <Text mt={2} color="gray.600" fontSize="sm">
            <ChakraLink as={RouterLink} to="/forgot-password" color="teal.500" fontWeight="bold">
              Şifremi Unuttum
            </ChakraLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}