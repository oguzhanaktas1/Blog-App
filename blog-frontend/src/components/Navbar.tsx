import { Flex, Box, Button, Spacer } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";

type NavbarProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
};

export default function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      px={8}
      py={4}
      bgGradient="linear(to-r, teal.400, blue.500)"
      color="white"
      boxShadow="md"
      mb={8}
    >
      <Box>
        <Button
          as={Link}
          to="/"
          variant="ghost"
          color="white"
          fontWeight="bold"
          fontSize="xl"
          _hover={{ bg: "teal.500", color: "white" }}
          px={2}
        >
          Home
        </Button>

        {isLoggedIn && getUserRole() === "admin" && (
          <Button
            as={Link}
            to="/admin"
            variant="ghost"
            color="white"
            fontWeight="bold"
            px={2}
            ml={4}
            _hover={{ bg: "teal.500" }}
          >
            Admin Panel
          </Button>
        )}
      </Box>

      <Spacer />

      <Box>
        {!isLoggedIn ? (
          <>
            <Button
              as={Link}
              to="/signup"
              colorScheme="whiteAlpha"
              variant="outline"
              mr={3}
              _hover={{ bg: "whiteAlpha.300" }}
            >
              Sign Up
            </Button>
            <Button
              as={Link}
              to="/login"
              colorScheme="whiteAlpha"
              variant="solid"
              _hover={{ bg: "whiteAlpha.400" }}
            >
              Login
            </Button>
          </>
        ) : (
          <Button
            colorScheme="whiteAlpha"
            variant="solid"
            _hover={{ bg: "whiteAlpha.400" }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </Box>
    </Flex>
  );
}
