import {
  Flex,
  Box,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Badge,
  HStack, // Yeni: Öğeleri yatayda düzenlemek için
  Image, // Yeni: Logo için
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";
import { getUserInfo } from "../utils/getUserInfo";
import { FaUserCircle } from "react-icons/fa";
import React, { useCallback } from "react";
import axios from "axios";
import socket from "../utils/socket";
import { useSelector } from "react-redux";
import type { RootState } from "../store/index";

import AppLogo from "../assets/react.svg";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  role: string;
}

type NavbarProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
};

const Navbar = React.memo(function Navbar({
  isLoggedIn,
  setIsLoggedIn,
}: NavbarProps) {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const userRole = getUserRole();
  const unreadCount = useSelector(
    (state: RootState) =>
      state.notifications.notifications.filter((n) => !n.isRead).length
  );

  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(
    null
  );
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );

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

    socket.disconnect();
    socket.connect();

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
      px={{ base: 4, md: 8 }}
      py={4}
      bgGradient="linear(to-r, teal.400, blue.500)"
      color="white"
      boxShadow="md"
      mb={8}
    >
      {/* Logo ve Uygulama Adı */}
      <HStack spacing={2} align="center">
        <Image src={AppLogo} alt="App Logo" boxSize="40px" /> {/* Logo */}
        <Text
          as={Link}
          to="/"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="extrabold"
          letterSpacing="wide"
          _hover={{ textDecoration: "none", color: "whiteAlpha.800" }}
        >
          My Awesome Blog
        </Text>
      </HStack>

      {/* Navigasyon Linkleri */}
      <HStack spacing={{ base: 2, md: 4 }} flex={1} justify="center">
        <Button
          as={Link}
          to="/create-post"
          variant="ghost"
          color="white"
          fontWeight="bold"
          px={2}
          _hover={{ bg: "teal.500" }}
        >
          Create Post
        </Button>
        <Button
          as={Link}
          to="/about-us" // Yeni About Us sayfası
          variant="ghost"
          color="white"
          fontWeight="bold"
          px={2}
          _hover={{ bg: "teal.500" }}
        >
          About Us
        </Button>
      </HStack>

      {/*Auth Butonları / Kullanıcı Menüsü */}
      <Box>
        {!isLoggedIn ? (
          <HStack spacing={3}>
            <Button
              as={Link}
              to="/signup"
              colorScheme="whiteAlpha"
              variant="outline"
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
          </HStack>
        ) : (
          <HStack spacing={4}> {/* Admin paneli ve Avatarı yan yana */}
            {userRole === "admin" && (
              <Button
                as={Link}
                to="/admin"
                variant="ghost"
                color="white"
                fontWeight="bold"
                px={2}
                _hover={{ bg: "teal.500" }}
              >
                Admin Panel
              </Button>
            )}

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
                <Box position="relative" display="inline-block">
                  <Avatar
                    icon={
                      !profilePhotoUrl ? (
                        <FaUserCircle style={{ width: "70%", height: "70%" }} />
                      ) : undefined
                    }
                    name={userProfile?.name || userInfo.name || undefined}
                    src={profilePhotoUrl || undefined}
                    size="md"
                    bg="gray.200"
                    color="teal.600"
                    overflow="hidden"
                  />
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="0"
                      right="0"
                      transform="translate(25%, -25%)"
                      borderRadius="full"
                      bg="red.500"
                      color="white"
                      fontSize="0.7rem"
                      fontWeight="bold"
                      px={2}
                      height="18px"
                      minWidth="18px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      pointerEvents="none"
                      zIndex={1}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Box>
              </MenuButton>
              <MenuList color="gray.800" minW="220px">
                <Box px={4} py={3} textAlign="center">
                  <Text fontWeight="bold">
                    {userProfile?.name || userInfo.name || "Kullanıcı"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {userProfile?.email || userInfo.email || "-"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    @{userProfile?.username || userInfo.username || "username"}
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Role: <b>{userRole}</b>
                  </Text>
                </Box>
                <MenuDivider />
                <MenuItem
                  onClick={() => navigate("/profile")}
                  justifyContent="center"
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => navigate("/notifications")}
                  justifyContent="center"
                >
                  Notifications
                </MenuItem>
                <MenuItem
                  color="red.500"
                  onClick={handleLogout}
                  justifyContent="center"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        )}
      </Box>
    </Flex>
  );
});

export default Navbar;