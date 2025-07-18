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
import axios from "../utils/axios";
import type { Post } from "../services/post";

interface NewPostFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const NewPostForm = ({ onSuccess, onClose }: NewPostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // 1. Postu oluştur
      const res = await axios.post<Post>(
        "/posts",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const postId = res.data.id;
      // 2. Fotoğraflar seçildiyse yükle
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((file) => formData.append("images", file));
        await axios.post(
          `/posts/${postId}/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      toast({
        title: "Post created.",
        description: "Your post was successfully created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTitle("");
      setContent("");
      setSelectedImages([]);
      setImagePreviews([]);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      navigate("/");
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
          {/* Fotoğraf yükleme alanı */}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSelectedImages(files);
              setImagePreviews(files.map((file) => URL.createObjectURL(file)));
            }}
            mb={4}
          />
          {imagePreviews.length > 0 && (
            <Box mb={4} display="flex" gap={2} flexWrap="wrap">
              {imagePreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  style={{ maxWidth: 120, borderRadius: 8 }}
                />
              ))}
            </Box>
          )}
          <Button type="submit" colorScheme="teal" width="full">
            Publish
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default NewPostForm;
