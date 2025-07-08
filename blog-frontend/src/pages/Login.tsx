import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Text,
  Link as ChakraLink, // Link ile çakışmaması için isim değişikliği
  useToast, // Bildirimler için useToast hook'u
  Flex, // Merkezleme ve tam ekran için Flex
} from "@chakra-ui/react";
import { login } from "../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // RouterLink için isim değişikliği

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state
  const navigate = useNavigate();
  const toast = useToast(); // useToast hook'unu başlat

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Yüklemeyi başlat
    try {
      const res = await login(form);
      localStorage.setItem("token", res.token);
      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/dashboard"); // veya homepage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // Hata tipini daha spesifik yakalayabiliriz
      toast({
        title: "Giriş Başarısız",
        description: err.response?.data?.message || "E-posta veya şifre hatalı.", // Backend'den gelen hatayı göster
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
      minH="100vh" // Tam ekran yüksekliği
      width="100%" // Tam ekran genişliği
      align="center" // Dikeyde ortala
      justify="center" // Yatayda ortala
      bgGradient="linear(to-br, teal.400, blue.600)" // Arkaplan gradyanı
      p={4} // Küçük ekranlarda boşluk
    >
      <Box
        maxW={{ base: "xs", sm: "md" }} // Küçük ekranlarda xs, orta ekranlarda md max genişlik
        w="full" // Kutunun içine sığması için tam genişlik
        bg="white"
        p={{ base: 6, md: 8 }} // İç boşlukları ayarlama
        borderRadius="lg" // Yuvarlak köşeler
        boxShadow="xl" // Daha belirgin gölge
        textAlign="center" // Metinleri ortala
      >
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
            type="email" // E-posta için doğru tip
            value={form.email}
            onChange={handleChange}
            size="lg" // Daha büyük inputlar
            variant="filled" // Dolgulu input stili
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }} // Odaklanma efekti
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
            size="lg" // Daha büyük buton
            width="full" // Tam genişlik
            onClick={handleSubmit}
            isLoading={isLoading} // Yükleme durumunu butona bağla
            _hover={{ bg: "teal.500" }} // Hover efekti
            _active={{ bg: "teal.600" }} // Tıklama efekti
          >
            Giriş Yap
          </Button>
        </VStack>
        <Text mt={6} color="gray.600" fontSize="sm">
          Hesabınız yok mu?{" "}
          <ChakraLink as={RouterLink} to="/register" color="teal.500" fontWeight="bold">
            Kayıt Olun
          </ChakraLink>
        </Text>
        <Text mt={2} color="gray.600" fontSize="sm">
          <ChakraLink as={RouterLink} to="/forgot-password" color="teal.500" fontWeight="bold">
            Şifremi Unuttum
          </ChakraLink>
        </Text>
      </Box>
    </Flex>
  );
}