 
import { useEffect } from "react";
import {
  Box,
  Text,
  Spinner,
  Container,
  Flex,
  useColorModeValue,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  VStack,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";
import PostCommentSection from "../components/PostCommentSection";
import PostContentBox from "../components/PostContentBox";
import Profile from "./Profile";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPostsThunk,
  deletePostThunk,
  updatePostThunk,
} from "../store/slices/postsSlice";
import type { RootState, AppDispatch } from "../store";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const toast = useToast();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const loading = useSelector((state: RootState) => state.posts.loading);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    dispatch(fetchPostsThunk());
  }, [dispatch]);

  const handleCreatePost = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
    } else {
      onOpen();
    }
  };

  const userEmail = getUserEmail();
  const userRole = getUserRole();

  return (
    <Box
      minH="100vh"
      minW="100vw"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
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
          <Text
            fontWeight="extrabold"
            fontSize={{ base: "3xl", md: "5xl" }}
            mb={4}
          >
            Welcome to the Modern Blog
          </Text>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
            Discover, create, and share your thoughts with the world. Start by
            reading the latest posts or add your own!
          </Text>
        </Box>
      </Box>

      {/* Create Posts and Showing Posts */}
      <Box w="100vw" p={0}>
        <Container maxW="container.xl" px={{ base: 4, md: "20%" }}>
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
                Henüz hiç gönderi yok.
              </Text>
            </Flex>
          ) : (
            <VStack spacing={8} w="100%" align="stretch" py={8}>
              {posts
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((post) => (
                  <Box key={post.id}>
                    <PostContentBox
                      post={post}
                      userEmail={userEmail}
                      userRole={userRole}
                      onUpdate={(updatedPost) => {
                        dispatch(updatePostThunk(updatedPost));
                      }}
                      onDelete={(postId) => {
                        dispatch(deletePostThunk(postId));
                        toast({
                          title: "Post silindi.",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                      }}
                      showBadge={true}
                      headingSize="lg"
                      contentLines={4}
                      showReadMore={true}
                    >
                      {/* Add comment section under each post */}
                      <Box mt={6}>
                        <PostCommentSection postId={post.id} />
                      </Box>
                    </PostContentBox>
                  </Box>
                ))}
            </VStack>
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
