/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Container,
  Flex,
  Badge,
  Button,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import NewPostForm from "./NewPostForm";

interface Post {
  id: number;
  title: string;
  content: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "dark-lg");
  const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 2, lg: 3 });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/posts")
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

  const handleCreatePost = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
    } else {
      onOpen();
    }
  };

  return (
    <Box minH="100vh" minW="99vw" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Hero Section */}
      <Box
        as="section"
        w="100vw"
        minH={{ base: "30vh", md: "40vh" }}
        py={{ base: 10, md: 16 }}
        px={0}
        textAlign="center"
        bgGradient="linear(to-r, teal.400, blue.400)"
        color="white"
        mb={10}
        position="relative"
        left="50%"
        right="50%"
        marginLeft="-50vw"
        marginRight="-50vw"
        maxW="100vw"
      >
        <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 0 }}>
          <Heading
            fontWeight="extrabold"
            fontSize={{ base: "3xl", md: "5xl" }}
            mb={4}
          >
            Welcome to the Modern Blog
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
            Discover, create, and share your thoughts with the world. Start by
            reading the latest posts or add your own!
          </Text>
        </Box>
      </Box>

      <Box w="100vw" px={0}>
        <Container maxW="container.xl" px={{ base: 2, md: 4 }} minW="100vw">
          {/* Loading State */}
          {loading ? (
            <Flex justify="center" mt={20} minH="40vh">
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.8s"
                color="teal.400"
              />
            </Flex>
          ) : posts.length === 0 ? (
            <Flex direction="column" align="center" mt={16} minH="40vh">
              <Text fontSize="2xl" color="gray.500" mb={4}>
                No posts available. Be the first to share your story!
              </Text>
              <Button
                colorScheme="teal"
                leftIcon={<AddIcon />}
                onClick={handleCreatePost}
              >
                Create Post
              </Button>
            </Flex>
          ) : (
            <SimpleGrid
              columns={gridCols}
              spacing={8}
              w="100%"
              minChildWidth="280px"
            >
              {posts.map((post) => (
                <Box
                  key={post.id}
                  p={6}
                  bg={bg}
                  boxShadow={boxShadow}
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: "xl",
                    transform: "translateY(-6px) scale(1.02)",
                    cursor: "pointer",
                  }}
                  display="flex"
                  flexDirection="column"
                  minH="260px"
                  w="100%"
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Heading fontSize={{ base: "lg", md: "xl" }} noOfLines={1}>
                      {post.title}
                    </Heading>
                    <Badge
                      colorScheme="teal"
                      fontSize="0.8em"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      New
                    </Badge>
                  </Flex>
                  <Text
                    noOfLines={4}
                    color={useColorModeValue("gray.700", "gray.300")}
                    mb={4}
                  >
                    {post.content}
                  </Text>
                  <Button
                    as={Link}
                    to={`/posts/${post.id}`}
                    mt="auto"
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    aria-label={`Read more about ${post.title}`}
                    fontWeight="semibold"
                  >
                    Read More
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* Floating Action Button for New Post */}
      <Tooltip label="Create New Post" hasArrow placement="left">
        <IconButton
          icon={<AddIcon />}
          colorScheme="teal"
          size="lg"
          position="fixed"
          bottom={8}
          right={8}
          borderRadius="full"
          boxShadow="lg"
          zIndex={100}
          aria-label="Create New Post"
          display={{ base: "flex", md: "none" }}
          onClick={handleCreatePost}
        />
      </Tooltip>

      {/* Modal for New Post Form */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <NewPostForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;
