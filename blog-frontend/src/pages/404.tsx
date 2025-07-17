import { Box, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Box
      minH="100vh"
      minW="100vw"
      bg={useColorModeValue("gray.50", "gray.900")}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        textAlign="center"
        py={{ base: 10, md: 16 }}
        px={0}
        bgGradient="linear(to-r, teal.400, blue.400)"
        color="white"
        borderRadius="xl"
        boxShadow="lg"
        w={{ base: "100%", md: "lg" }}
        maxW="lg"
        mx="auto"
      >
        <Text fontWeight="extrabold" fontSize={{ base: "5xl", md: "7xl" }} mb={2}>
          404
        </Text>
        <Text fontSize={{ base: "xl", md: "2xl" }} mb={4}>
          Page Not Found
        </Text>
        <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.800" mb={8}>
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button as={Link} to="/" colorScheme="teal" variant="solid" size="lg">
          Go to Home
        </Button>
      </Box>
    </Box>
  );
} 