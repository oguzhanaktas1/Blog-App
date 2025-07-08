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
import { signup } from "../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Yüklemeyi başlat
    try {
      const res = await signup(form); // 'res' tipini auth.ts'de tanımlamayı unutmayın!
      localStorage.setItem("token", res.token);
      toast({
        title: "Kayıt Başarılı",
        description: "Giriş sayfasına yönlendiriliyorsunuz...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Kayıt Başarısız",
        description: err.response?.data?.message || "Kayıt olma işlemi başarısız.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Yüklemeyi bitir
    }
  };

  return (
    <Flex
      minH="100vh"
      width="100%"
      align="center"
      justify="center"
      bgGradient="linear(to-br, teal.400, blue.600)" // Login sayfasıyla aynı gradyan
      p={4}
    >
      <Box
        maxW={{ base: "xs", sm: "md" }}
        w="full"
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="xl"
        textAlign="center"
      >
        <Heading mb={6} fontSize={{ base: "2xl", md: "3xl" }} color="gray.800">
          Kayıt Ol
        </Heading>
        <Text mb={4} color="gray.600">
          Yeni bir hesap oluşturmak için bilgilerinizi girin.
        </Text>
        <VStack spacing={4}>
          <Input
            placeholder="Adınız Soyadınız"
            name="name"
            value={form.name}
            onChange={handleChange}
            size="lg"
            variant="filled"
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
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
            Kayıt Ol
          </Button>
        </VStack>
        <Text mt={6} color="gray.600" fontSize="sm">
          Zaten hesabınız var mı?{" "}
          <ChakraLink as={RouterLink} to="/login" color="teal.500" fontWeight="bold">
            Giriş Yapın
          </ChakraLink>
        </Text>
      </Box>
    </Flex>
  );
}