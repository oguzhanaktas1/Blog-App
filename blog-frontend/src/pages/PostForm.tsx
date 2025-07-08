import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Container,
  Center,
  Icon,
  VStack,
  useColorModeValue,
  HStack,
  Avatar,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { MdArticle } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  date?: string;
}

const PostForm = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          setPosts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPosts([]);
        setLoading(false);
      });
  }, []);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");
  const cardTitleColor = useColorModeValue("blue.700", "blue.300");
  const cardTextColor = useColorModeValue("gray.600", "gray.300");
  const cardBorderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
      <Heading mb={10} textAlign="center" fontWeight="bold" fontSize={{ base: "2xl", md: "4xl" }}>
        Blog Posts
      </Heading>

      {loading ? (
        <Center minH="40vh">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text fontSize="lg" color="gray.500">Loading posts...</Text>
          </VStack>
        </Center>
      ) : posts.length === 0 ? (
        <Center minH="40vh">
          <VStack spacing={4}>
            <Icon as={MdArticle} boxSize={16} color="gray.300" />
            <Text fontSize="xl" color="gray.500">No posts found. Be the first to write one!</Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 6, md: 8 }}>
          {posts.map((post) => (
            <Box
              key={post.id}
              p={6}
              bg={cardBg}
              boxShadow={cardShadow}
              borderRadius="2xl"
              transition="all 0.3s ease"
              _hover={{ boxShadow: "xl", transform: "translateY(-6px)" }}
              borderWidth="1px"
              borderColor={cardBorderColor}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              {/* Author Section */}
              <HStack spacing={3} mb={4}>
                <Avatar size="sm" icon={<FaUserCircle />} />
                <VStack spacing={0} align="start">
                  <Text fontWeight="bold" fontSize="sm">
                    {post.author ?? "Anonymous"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {post.date ?? "Just now"}
                  </Text>
                </VStack>
              </HStack>

              {/* Title & Content */}
              <Heading size="md" mb={2} color={cardTitleColor}>
                {post.title}
              </Heading>
              <Text noOfLines={5} fontSize="sm" color={cardTextColor}>
                {post.content}
              </Text>

              {/* Footer Badge */}
              <Flex mt={4} justify="flex-end">
                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                  #blog
                </Badge>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default PostForm;
