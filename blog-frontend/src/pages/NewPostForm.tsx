import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const NewPostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/posts",
        { title, content },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      toast({
        title: "Post created.",
        description: "Your post was successfully created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py={10}>
      <Heading mb={6}>Create New Post</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <Textarea
              placeholder="Write your post content..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" width="full">
            Publish
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default NewPostForm;
