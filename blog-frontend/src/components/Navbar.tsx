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
  InputRightElement,
  VStack,
  useOutsideClick,
  Spinner,
  useColorModeValue,
  IconButton,
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

// Navbar'daki arama sonuçları için basitleştirilmiş arayüz
interface NavbarSearchPostResult {
  id: number;
  title: string;
  author?: {
    name?: string | null;
    username?: string | null;
  };
}

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

  // useRef tanımlamaları doğrudan bileşen gövdesinin en üst seviyesinde olmalı
  const searchBoxRef = React.useRef<HTMLDivElement>(null);
  const delayDebounceFnRef = React.useRef<NodeJS.Timeout>(null); // null başlangıç değeri eklendi

  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(
    null
  );
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [searchResults, setSearchResults] = React.useState<NavbarSearchPostResult[]>([]);
  const [loadingSearch, setLoadingSearch] = React.useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = React.useState<boolean>(false);
  const [showMinCharWarning, setShowMinCharWarning] = React.useState<boolean>(false); // Minimum karakter uyarısı için yeni state

  // Chakra UI teması için renkler (mevcut renk tanımlarına ek olarak)
  const bgResultBox = useColorModeValue("white", "gray.700");
  const hoverBgResultBox = useColorModeValue("gray.100", "gray.600");
  const textColorResultBox = useColorModeValue("gray.800", "white");
  const spinnerColor = useColorModeValue("teal.500", "blue.300");
  const infoTextColor = useColorModeValue("gray.500", "gray.400");

  // Yeni uyarı mesajı renkleri
  const warningBg = useColorModeValue("white", "gray.800"); // Beyaz arka plan (aydınlık mod) / Koyu gri (karanlık mod)
  const warningTextColor = useColorModeValue("gray.800", "white"); // Siyah yazı (aydınlık mod) / Beyaz (karanlık mod)


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

  React.useEffect(() => {
    // 1 karakter kontrolü
    if (searchQuery.length === 1) {
      setShowMinCharWarning(true);
      setShowSearchResults(false); // Sonuçları gizle
      setSearchResults([]); // Önceki sonuçları temizle
      if (delayDebounceFnRef.current) {
        clearTimeout(delayDebounceFnRef.current); // Önceki debounce'ı iptal et
      }
      return; // Daha fazla işlem yapma
    } else {
      setShowMinCharWarning(false); // Uyarıyı gizle
    }

    // 2+ karakter kontrolü ve debounce
    if (searchQuery.length > 1) {
      setLoadingSearch(true);
      if (delayDebounceFnRef.current) {
        clearTimeout(delayDebounceFnRef.current); // Önceki debounce'ı iptal et
      }
      delayDebounceFnRef.current = setTimeout(async () => {
        try {
          const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
          const response = await axios.get<NavbarSearchPostResult[]>(`${BACKEND_URL}/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data);
          setShowSearchResults(true); // Sonuçlar geldiğinde göster
        } catch (error) {
          console.error("Arama hatası:", error);
          setSearchResults([]);
        } finally {
          setLoadingSearch(false);
        }
      }, 500); // 500ms bekleme süresi
    } else {
      setSearchResults([]); // Arama sorgusu boşsa sonuçları temizle
      setShowSearchResults(false); // Sonuç kutusunu gizle
    }

    // Component unmount edildiğinde veya query değiştiğinde timeout'u temizle
    return () => {
      if (delayDebounceFnRef.current) {
        clearTimeout(delayDebounceFnRef.current);
      }
    };
  }, [searchQuery]);

  // Arama kutusunun dışına tıklandığında sonuçları gizle
  useOutsideClick({
    ref: searchBoxRef,
    handler: () => {
      // Dışarı tıklandığında sadece arama sonuçlarını gizle, uyarıyı değil.
      setShowSearchResults(false);
    },
  });

  // Bu handleSearch fonksiyonu, Enter'a basıldığında veya arama ikonuna basıldığında
  // tam arama sayfası navigasyonu için kullanılacak.
  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault(); // Varsayılan form gönderimini engelle
    if (searchQuery.trim().length > 1) { // En az 2 karakter kontrolü
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Arama sayfasına gittikten sonra arama kutusunu temizle
      setSearchResults([]); // Sonuçları temizle
      setShowSearchResults(false); // Sonuçları gizle
      setShowMinCharWarning(false); // Uyarıyı gizle
    } else if (searchQuery.trim().length === 1) {
      setShowMinCharWarning(true); // Eğer 1 karakterse uyarıyı göster
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
          onSubmit={handleSearch}
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
                // Eğer arama sorgusu 1 karakterse uyarıyı göster
                if (searchQuery.length === 1) {
                  setShowMinCharWarning(true);
                  setShowSearchResults(false); // Sonuçları gizle
                } else if (searchResults.length > 0 && searchQuery.length > 1) { // Eğer sonuçlar varsa ve query > 1 ise göster
                  setShowSearchResults(true);
                }
              }}
            />
            <InputRightElement width="4.5rem">
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                onClick={() => handleSearch()}
                size="sm"
                colorScheme="whiteAlpha"
                variant="ghost"
                _hover={{ bg: "whiteAlpha.300" }}
                mr={1}
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
                        setShowMinCharWarning(false); // Uyarıyı da kapat
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

          {/* Minimum Karakter Uyarısı - Güncellenen Stil */}
          {showMinCharWarning && (
            <Box
              position="absolute"
              top="100%" // Input'un hemen altına konumlandır
              left="0"
              right="0"
              mt={2} // Input ile arasında boşluk
              px={3} // Yatay dolgu
              py={2} // Dikey dolgu
              bg={warningBg} // Arkaplan rengi
              color={warningTextColor} // Yazı rengi
              borderRadius="md" // Köşe yuvarlaklığı
              boxShadow="md" // Hafif gölge
              zIndex={100} // Diğer elementlerin üzerinde kalması için
              textAlign="center" // Metni ortala
              whiteSpace="nowrap" // Metni tek satırda tut
            >
              <Text fontWeight="semibold" fontSize="sm">
                Arama yapmak için en az 2 karakter giriniz.
              </Text>
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