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
} from "@chakra-ui/react";
import { login } from "../services/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import socket from "../utils/socket";

export default function LoginPage({
  setIsLoggedIn,
}: {
  setIsLoggedIn: (val: boolean) => void;
}) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setIsLoggedIn(true);
      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/");
      socket.connect();
      socket.emit("register", res.user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message === "Email already exists"
          ? "Bu e-posta adresiyle zaten bir hesap var."
          : err.response?.data?.message || "E-posta veya şifre hatalı.";

      toast({
        title: "Giriş Başarısız",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

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
          <Heading
            mb={6}
            fontSize={{ base: "2xl", md: "3xl" }}
            color="gray.800"
          >
            Giriş Yap
          </Heading>
          <Text mb={4} color="gray.600">
            Hesabınıza giriş yapmak için bilgilerinizi girin.
          </Text>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>E-posta Adresiniz</FormLabel>
                <Input
                  placeholder="E-posta Adresiniz"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  size="lg"
                  variant="filled"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px teal.500",
                  }}
                  autoComplete="username"
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Şifreniz</FormLabel>
                <InputGroup size="lg" variant="filled">
                  <Input
                    placeholder="Şifreniz"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal.500",
                    }}
                    autoComplete="current-password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                      }
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
                Giriş Yap
              </Button>
            </VStack>
          </form>
          <Text mt={6} color="gray.600" fontSize="sm">
            Hesabınız yok mu?{" "}
            <ChakraLink
              as={RouterLink}
              to="/signup"
              color="teal.500"
              fontWeight="bold"
            >
              Kayıt Olun
            </ChakraLink>
          </Text>
          <Text mt={2} color="gray.600" fontSize="sm">
            <ChakraLink
              as={RouterLink}
              to="/forgot-password"
              color="teal.500"
              fontWeight="bold"
            >
              Şifremi Unuttum
            </ChakraLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
