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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { addPostThunk } from "../store/slices/postsSlice";

interface NewPostFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const NewPostForm = ({ onSuccess, onClose }: NewPostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(addPostThunk({ title, content }));

      if (addPostThunk.fulfilled.match(result)) {
        toast({
          title: "Post created.",
          description: "Your post was successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTitle("");
        setContent("");

        if (onSuccess) onSuccess();
        if (onClose) onClose();

        navigate("/");
      } else {
        throw new Error("Creation failed");
      }
    } catch {
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
