/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    useToast,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import api from "../api/axios";
  
  interface Props {
    post: {
      id: number;
      title: string;
      content: string;
    };
    onClose: () => void;
    onSuccess: (updatedPost: { id: number; title: string; content: string }) => void;
  }
  
  const UpdatePostForm = ({ post, onClose, onSuccess }: Props) => {
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const toast = useToast();
  
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        const response = await api.put(
          `/posts/${post.id}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        const updatedPost = response.data as { id: number; title: string; content: string };
    
        toast({
          title: "Post güncellendi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
    
        onSuccess(updatedPost); // ✅ burada gönder
        onClose();
      } catch (error) {
        toast({
          title: "Hata",
          description: "Post güncellenemedi.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
  
    return (
      <Box as="form" onSubmit={handleUpdate}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Başlık</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>İçerik</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full">
            Güncelle
          </Button>
        </VStack>
      </Box>
    );
  };
  
  export default UpdatePostForm;
  