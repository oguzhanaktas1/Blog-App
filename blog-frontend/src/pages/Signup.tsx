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
  InputGroup,
  InputRightElement,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { signup } from "../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Şifre gösterme durumu
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!emailValid) {
      setEmailTouched(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await signup(form);
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
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword((show) => !show);

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
            Kayıt Ol
          </Heading>
          <Text mb={4} color="gray.600">
            Yeni bir hesap oluşturmak için bilgilerinizi girin.
          </Text>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
          <VStack spacing={4}>
              <FormControl id="name" isRequired>
                <FormLabel>Adınız Soyadınız</FormLabel>
            <Input
              placeholder="Adınız Soyadınız"
              name="name"
              value={form.name}
              onChange={handleChange}
              size="lg"
              variant="filled"
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
            />
              </FormControl>
              <FormControl id="email" isRequired isInvalid={emailTouched && !emailValid}>
                <FormLabel>E-posta Adresiniz</FormLabel>
            <Input
              placeholder="E-posta Adresiniz"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
              size="lg"
              variant="filled"
              _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
                  autoComplete="username"
                  pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
                />
                <FormErrorMessage>Lütfen geçerli bir e-posta adresi girin.</FormErrorMessage>
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Şifreniz</FormLabel>
            <InputGroup size="lg" variant="filled" w="100%">
              <Input
                placeholder="Şifreniz"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
                    autoComplete="new-password"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                      icon={showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  onClick={toggleShowPassword}
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "transparent" }}
                  _active={{ bg: "transparent" }}
                />
              </InputRightElement>
            </InputGroup>
              </FormControl>
            <Button
              colorScheme="teal"
              size="lg"
              width="full"
                type="submit"
              isLoading={isLoading}
              _hover={{ bg: "teal.500" }}
              _active={{ bg: "teal.600" }}
            >
              Kayıt Ol
            </Button>
          </VStack>
          </form>
          <Text mt={6} color="gray.600" fontSize="sm">
            Zaten hesabınız var mı?{" "}
            <ChakraLink as={RouterLink} to="/login" color="teal.500" fontWeight="bold">
              Giriş Yapın
            </ChakraLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
