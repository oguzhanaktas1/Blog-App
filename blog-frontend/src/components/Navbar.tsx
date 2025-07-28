import {
  Flex,
  Box,
  Button,
  Spacer,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";
import { getUserInfo } from "../utils/getUserInfo";
import { FaUserCircle } from "react-icons/fa";
import React, { useCallback } from "react";
import axios from "axios";
import socket from "../utils/socket";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profilePhoto: string | null;
  role: string;
}

type NavbarProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
};

const Navbar = React.memo(function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const userRole = getUserRole();

  // Profil fotoğrafı ve kullanıcı bilgisi için state
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  // Profil bilgisini backend'den çek
  React.useEffect(() => {
    if (!isLoggedIn) {
      setProfilePhotoUrl(null);
      setUserProfile(null);
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");
        const res = await axios.get<UserProfile>(`${BACKEND_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(res.data);
        if (res.data.profilePhoto) {
          setProfilePhotoUrl(`${BACKEND_URL}${res.data.profilePhoto}`);
        } else {
          setProfilePhotoUrl(null);
        }
      } catch {
        setUserProfile(null);
        setProfilePhotoUrl(null);
      }
    };
    fetchUserProfile();
  }, [isLoggedIn]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  
    socket.disconnect(); // 💥 Socket bağlantısını kapat
    socket.connect();    // 🔁 Gerekirse yeniden bağlan ama register edilmeyecek
  
    setIsLoggedIn(false);
    setProfilePhotoUrl(null);
    setUserProfile(null);
    navigate("/");
  }, [setIsLoggedIn, setProfilePhotoUrl, setUserProfile, navigate]);
  
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

        {isLoggedIn && userRole === "admin" && (
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
        <Button
          as={Link}
          to="/create-post"
          variant="ghost"
          color="white"
          fontWeight="bold"
          px={2}
          ml={4}
          _hover={{ bg: "teal.500" }}
        >
          Create Post
        </Button>
      </Box>

      <Spacer />

      <Box>
        {!isLoggedIn ? (
          <>
            <Button onClick={handleLogout}>
              logout
            </Button>
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
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              p={0}
              minW={0}
              _hover={{}}
              _active={{}}
              _focus={{ boxShadow: "none" }}
            >
              <Avatar
                icon={!profilePhotoUrl ? <FaUserCircle style={{ width: "70%", height: "70%" }} /> : undefined}
                name={userProfile?.name || userInfo.name || undefined}
                src={profilePhotoUrl || undefined}
                size="md"
                bg="gray.200"
                color="teal.600"
                overflow="hidden"
              />
            </MenuButton>
            <MenuList color="gray.800" minW="220px">
              <Box px={4} py={3} textAlign="center">
                <Text fontWeight="bold">{userProfile?.name || userInfo.name || "Kullanıcı"}</Text>
                <Text fontSize="sm" color="gray.500">{userProfile?.email || userInfo.email || "-"}</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Role: <b>{userRole}</b>
                </Text>
              </Box>
              <MenuDivider />
              <MenuItem onClick={() => navigate("/profile")} justifyContent="center">
                Profile
              </MenuItem>
              <MenuItem color="red.500" onClick={handleLogout} justifyContent="center">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
    </Flex>
  );
});

export default Navbar;
