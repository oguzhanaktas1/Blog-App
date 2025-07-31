/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Container,
  Flex,
  useColorModeValue,
  Avatar,
  Divider,
  Input,
  useToast,
} from "@chakra-ui/react";
import { getLikedPosts, type Post } from "../services/post";
import PostContentBox from "../components/PostContentBox";
import { getUserInfo } from "../utils/getUserInfo";
import axios from "axios";

interface UploadResponse {
  imageUrl: string;
}

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  role: string;
}

const Profile: React.FC = React.memo(() => {
  const [likedPosts, setLikedPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  const userInfo = getUserInfo();
  const toast = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Kullanıcı profilini backend'den çek
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
    } catch (err) {
      setUserProfile(null);
      setProfilePhotoUrl(null);
    }
  };

  React.useEffect(() => {
    getLikedPosts()
      .then((posts) => setLikedPosts(posts))
      .catch(() => setError("Beğenilen postlar alınamadı."))
      .finally(() => setLoading(false));
    fetchUserProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("userId", String(userInfo.userId));

    try {
      setUploading(true);

      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      await axios.post<UploadResponse>(
        `${BACKEND_URL}/api/upload-profile-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fotoğraf yüklendikten sonra güncel profil bilgisini tekrar çek
      await fetchUserProfile();

      toast({
        title: "Profil fotoğrafı başarıyla yüklendi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Yükleme başarısız.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const sortedLikedPosts = useMemo(() => {
    return likedPosts.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [likedPosts]);

  return (
    <Box minH="100vh" minW="100vw" bg={bg}>
      <Container maxW="container.xl" px={{ base: 4, md: "20%" }} py={10}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ md: "flex-start" }}
          gap={10}
        >
          {/* Profile Card */}
          <Box
            flexShrink={0}
            w={{ base: "100%", md: 72 }}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="md"
            p={8}
            mb={{ base: 8, md: 0 }}
            textAlign="center"
          >
            <Avatar
              name={userProfile?.name || userInfo.name || undefined}
              src={profilePhotoUrl || undefined}
              size="2xl"
              mb={4}
              bg="teal.500"
              color="white"
              mx="auto"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
            />

            <Input
              type="file"
              ref={fileInputRef}
              display="none"
              accept="image/*"
              onChange={handlePhotoUpload}
            />

            <Heading size="md" mb={2}>
              {userProfile?.name || userInfo.name}
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={1}>
              {userProfile?.username || userInfo.username}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={1}>
              {userProfile?.email || userInfo.email}
            </Text>

            {uploading && (
              <Text fontSize="sm" color="teal.400" mt={2}>
                Yükleniyor...
              </Text>
            )}

            <Divider my={4} />
            <Text fontSize="sm" color="gray.400">
              Beğenilen Postlar: <b>{likedPosts.length}</b>
            </Text>
          </Box>

          {/* Liked Posts List */}
          <Box flex={1}>
            <Heading
              size="lg"
              mb={6}
              textAlign={{ base: "center", md: "left" }}
            >
              Beğendiğim Postlar
            </Heading>

            {loading ? (
              <Flex justify="center" align="center" minH="40vh">
                <Spinner size="xl" thickness="4px" color="teal.400" />
              </Flex>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            ) : sortedLikedPosts.length === 0 ? (
              <Text color="gray.500" fontSize="lg" textAlign="center">
                Henüz hiç post beğenmediniz.
              </Text>
            ) : (
              <VStack spacing={8} align="stretch" py={2}>
                {sortedLikedPosts.map((post) => (
                  <PostContentBox
                    key={post.id}
                    post={post}
                    userEmail={userInfo.email}
                  />
                ))}
              </VStack>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
});

export default Profile;
