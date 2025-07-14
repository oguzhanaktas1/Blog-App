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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { updatePostThunk } from "../store/slices/postsSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        updatePostThunk({ id: post.id, title, content })
      );

      if (updatePostThunk.fulfilled.match(result)) {
        toast({
          title: "Post güncellendi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onSuccess(result.payload); // Redux içinden gelen postu gönder
        onClose();
      } else {
        throw new Error("Update failed");
      }
    } catch {
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
