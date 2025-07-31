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
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement, // Yeni: Sağ tarafa eleman eklemek için
  VStack,
  useOutsideClick,
  Spinner,
  useColorModeValue,
  IconButton, // Yeni: Buton ikon için
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/getUserRole";
import { getUserInfo } from "../utils/getUserInfo";
import { FaUserCircle } from "react-icons/fa";
import React, { useCallback } from "react";
import axios from "axios";
import socket from "../utils/socket";
import { useSelector } from "react-redux";
import type { RootState } from "../store/index";
import type { PostContentBoxPost } from '../types/post';

import AppLogo from "../assets/react.svg";

// It's better to import this from PostContentBox.tsx if it's exported,
// or from a shared types file (e.g., src/types/post.ts)
// For now, keeping it here as per your original code.

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
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [searchResults, setSearchResults] = React.useState<PostContentBoxPost[]>([]);
  const [loadingSearch, setLoadingSearch] = React.useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = React.useState<boolean>(false);

  const searchBoxRef = React.useRef<HTMLDivElement>(null); // Arama sonuçları kutusu için ref

  const bgResultBox = useColorModeValue("white", "gray.700");
  const hoverBgResultBox = useColorModeValue("gray.100", "gray.600");
  const textColorResultBox = useColorModeValue("gray.800", "white");
  const spinnerColor = useColorModeValue("teal.500", "blue.300");
  const infoTextColor = useColorModeValue("gray.500", "gray.400");


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

  // Yeni: Arama sorgusu değiştikçe backend'e istek atma (Debounce ile)
  React.useEffect(() => {
    if (searchQuery.length > 1) { // En az 2 karakter girildiğinde aramayı başlat
      setLoadingSearch(true);
      const delayDebounceFn = setTimeout(async () => {
        try {
          const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
          const response = await axios.get<PostContentBoxPost[]>(`${BACKEND_URL}/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data);
          setShowSearchResults(true); // Sonuçlar geldiğinde göster
        } catch (error) {
          console.error("Arama hatası:", error);
          setSearchResults([]);
        } finally {
          setLoadingSearch(false);
        }
      }, 500); // 500ms bekleme süresi

      return () => clearTimeout(delayDebounceFn); // Component unmount edildiğinde veya query değiştiğinde timeout'u temizle
    } else {
      setSearchResults([]); // Arama sorgusu boşsa sonuçları temizle
      setShowSearchResults(false); // Sonuç kutusunu gizle
    }
  }, [searchQuery]);

  // Arama kutusunun dışına tıklandığında sonuçları gizle
  useOutsideClick({
    ref: searchBoxRef,
    handler: () => setShowSearchResults(false),
  });

  // Bu handleSearch fonksiyonu, Enter'a basıldığında veya arama ikonuna basıldığında
  // tam arama sayfası navigasyonu için kullanılacak.
  const handleSearch = (event?: React.FormEvent) => { // Make event optional
    event?.preventDefault(); // Prevent default form submission if event exists
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Arama sayfasına gittikten sonra arama kutusunu temizle
      setSearchResults([]); // Sonuçları temizle
      setShowSearchResults(false); // Sonuçları gizle
    }
  };

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
        <Image src={AppLogo} alt="App Logo" boxSize="40px" />
        <Text
          as={Link}
          to="/"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="extrabold"
          letterSpacing="wide"
          _hover={{ textDecoration: "none", color: "whiteAlpha.800" }}
        >
          My Blog
        </Text>
      </HStack>

      {/* Navigasyon Linkleri ve Arama Çubuğu */}
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

        {/* Arama Çubuğu ve Dinamik Sonuçlar */}
        <Box
          ref={searchBoxRef}
          position="relative"
          flex={1}
          maxW="400px"
          mx={4}
          as="form"
          onSubmit={handleSearch} // Form submit olduğunda (Enter'a basıldığında) handleSearch'i çağır
        >
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.400"
              color="white"
              _placeholder={{ color: "whiteAlpha.700" }}
              _hover={{ borderColor: "whiteAlpha.600" }}
              _focus={{ borderColor: "whiteAlpha.800", boxShadow: "outline" }}
              onFocus={() => {
                // Eğer zaten arama sonuçları varsa inputa odaklanınca göster
                if (searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            {/* Yeni: Arama İkon Butonu */}
            <InputRightElement width="4.5rem">
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                onClick={() => handleSearch()} // İkona tıklandığında handleSearch'i çağır
                size="sm"
                colorScheme="whiteAlpha"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
                mr={1} // Sağdan biraz boşluk
              />
            </InputRightElement>
          </InputGroup>

          {/* Dinamik Arama Sonuçları Kutusu */}
          {showSearchResults && searchQuery.length > 1 && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              mt={2}
              bg={bgResultBox}
              borderRadius="md"
              boxShadow="lg"
              zIndex={100}
              py={2}
              maxH="300px"
              overflowY="auto"
            >
              {loadingSearch ? (
                <Flex justify="center" align="center" py={4}>
                  <Spinner size="sm" color={spinnerColor} mr={2} />
                  <Text color={infoTextColor}>Aranıyor...</Text>
                </Flex>
              ) : searchResults.length > 0 ? (
                <VStack spacing={0} align="stretch">
                  {searchResults.map((post) => (
                    <Box
                      key={post.id}
                      p={3}
                      _hover={{ bg: hoverBgResultBox, cursor: "pointer" }}
                      onClick={() => {
                        navigate(`/posts/${post.id}`);
                        setSearchQuery("");
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                    >
                      <Text fontWeight="semibold" color={textColorResultBox} noOfLines={1}>
                        {post.title}
                      </Text>
                      <Text fontSize="sm" color={infoTextColor}>
                        by {post.author?.name || "Bilinmiyor"}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text p={3} color={infoTextColor} textAlign="center">
                  Sonuç bulunamadı.
                </Text>
              )}
            </Box>
          )}
        </Box>

        <Button
          as={Link}
          to="/about-us"
          variant="ghost"
          color="white"
          fontWeight="bold"
          px={2}
          _hover={{ bg: "teal.500" }}
        >
          About Us
        </Button>
      </HStack>

      {/* Auth Butonları / Kullanıcı Menüsü */}
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
          <HStack spacing={4}>
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