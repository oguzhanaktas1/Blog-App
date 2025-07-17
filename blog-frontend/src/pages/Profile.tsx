import React from "react";
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
} from "@chakra-ui/react";
import { getLikedPosts, type Post } from "../services/post";
import PostContentBox from "../components/PostContentBox";
import { getUserInfo } from "../utils/getUserInfo";

const Profile: React.FC = () => {
  const [likedPosts, setLikedPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const userInfo = getUserInfo();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  React.useEffect(() => {
    getLikedPosts()
      .then((posts) => setLikedPosts(posts))
      .catch(() => setError("Beğenilen postlar alınamadı."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box minH="100vh" minW="100vw" bg={bg}>
      <Container maxW="container.xl" px={{ base: 4, md: "20%" }} py={10}>
        <Flex direction={{ base: "column", md: "row" }} align={{ md: "flex-start" }} gap={10}>
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
              name={userInfo.name || undefined}
              size="2xl"
              mb={4}
              bg="teal.500"
              color="white"
              mx="auto"
            />
            <Heading size="md" mb={2}>{userInfo.name}</Heading>
            <Text fontSize="sm" color="gray.500" mb={1}>{userInfo.email}</Text>
            <Divider my={4} />
            <Text fontSize="sm" color="gray.400">Beğenilen Postlar: <b>{likedPosts.length}</b></Text>
          </Box>

          {/* Liked Posts List */}
          <Box flex={1}>
            <Heading size="lg" mb={6} textAlign={{ base: "center", md: "left" }}>
              Beğendiğim Postlar
            </Heading>
            {loading ? (
              <Flex justify="center" align="center" minH="40vh">
                <Spinner size="xl" thickness="4px" color="teal.400" />
              </Flex>
            ) : error ? (
              <Alert status="error"><AlertIcon />{error}</Alert>
            ) : likedPosts.length === 0 ? (
              <Text color="gray.500" fontSize="lg" textAlign="center">
                Henüz hiç post beğenmediniz.
              </Text>
            ) : (
              <VStack spacing={8} align="stretch" py={2}>
                {likedPosts.map((post) => (
                  <PostContentBox key={post.id} post={post} userEmail={userInfo.email} />
                ))}
              </VStack>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Profile; 