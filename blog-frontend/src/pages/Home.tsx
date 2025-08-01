/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo } from 'react';
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
  ModalBody,
  VStack,
  useToast,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";
import PostCommentSection from "../components/PostCommentSection";
import PostContentBox from "../components/PostContentBox";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchPostsThunk,
  deletePostThunk,
  updatePostThunk,
} from "../store/slices/postsSlice";
import type { RootState, AppDispatch } from "../store";

const Home = React.memo(() => {
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

  const sortedPosts = useMemo(
    () =>
      posts
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [posts]
  );

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
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
         
          bgRepeat="repeat"
          opacity="0.1"
          zIndex="0"
        />
        <Box
          maxW="container.xl"
          mx="auto"
          px={{ base: 4, md: 0 }}
          position="relative"
          zIndex="1"
        >
          <Text
            fontWeight="extrabold"
            fontSize={{ base: "3xl", md: "5xl" }}
            mb={4}
          >
            Modern Blog'a Hoş Geldiniz
          </Text>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
            Keşfedin, yaratın ve düşüncelerinizi dünyayla paylaşın. En son
            gönderileri okuyarak başlayın veya kendinizinkini ekleyin!
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
              <Button
                colorScheme="teal"
                size="lg"
                mt={4}
                onClick={handleCreatePost}
              >
                İlk Gönderiyi Sen Oluştur!
              </Button>
            </Flex>
          ) : (
            <VStack spacing={8} w="100%" align="stretch" py={8}>
              {sortedPosts.map((post) => (
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
                        title: "Gönderi silindi.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                    showBadge={true}
                    headingSize="xl"
                    showReadMoreButton={true}
                    p={6}
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s ease-in-out"
                  >
                    <Box
                      mt={6}
                      pt={4}
                      borderTop="1px solid"
                      borderColor={useColorModeValue("gray.200", "gray.700")}
                    >
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
      <Tooltip label="Yeni Gönderi Oluştur" hasArrow placement="left">
        <IconButton
          icon={<AddIcon />}
          colorScheme="teal"
          size="lg"
          position="fixed"
          bottom={8}
          right={8}
          borderRadius="full"
          boxShadow="xl"
          zIndex={100}
          aria-label="Yeni Gönderi Oluştur"
          onClick={handleCreatePost}
          _hover={{ transform: "scale(1.05)" }}
          transition="transform 0.2s ease-in-out"
        />
      </Tooltip>

      {/* Modal for New Post Form */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          
          <ModalBody>
            <NewPostForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default Home;