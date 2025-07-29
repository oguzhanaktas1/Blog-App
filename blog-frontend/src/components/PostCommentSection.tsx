/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCommentsThunk, addCommentThunk, deleteCommentThunk, addCommentFromSocket } from "../store/slices/commentsSlice";
import type { RootState } from "../store";
import { Box, Button, Textarea, VStack, HStack, Text, Spinner, IconButton, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { getUserEmail } from "../utils/getUserEmail";
import { getUserRole } from "../utils/getUserRole";
import socket from "../utils/socket"; // socket import
import type { Comment } from "../types/Comment";
import Reactions from "./Reactions";
import { getUserInfo } from "../utils/getUserInfo";

interface PostCommentSectionProps {
  postId: number;
}

const PostCommentSection = React.memo(({ postId }: PostCommentSectionProps) => {
  const dispatch = useDispatch();
  const commentsState = useSelector((state: RootState) => state.comments);
  const comments = commentsState.items[postId] || [];
  const loading = commentsState.loading;
  const error = commentsState.error;
  const [text, setText] = useState("");
  const toast = useToast();
  const userEmail = getUserEmail();
  const userRole = getUserRole();
  const isLoggedIn = !!userEmail;
  const currentUser = getUserInfo();
  
  // Yorumları yükle + socket dinleyicilerini ayarla
  useEffect(() => {
    dispatch(fetchCommentsThunk(postId) as any)
      .unwrap()
      .catch((error: any) => {
        console.log("Yorumlar alınamadı:", error);
      });

    // Kullanıcı ilgili post sayfasına girince odaya katılır
    socket.emit("join_post", postId);

    // Canlı yorumları dinle
    socket.on("receive_comment", (comment: Comment) => {
      dispatch(addCommentFromSocket({ postId, comment }));
    });

    return () => {
      socket.off("receive_comment");
    };
  }, [dispatch, postId]);

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      const result = await dispatch(addCommentThunk({ postId, text }) as any);
      if (addCommentThunk.fulfilled.match(result)) {
        const addedComment = result.payload;

        // Yorumu diğer kullanıcılara gönder
        socket.emit("new_comment", { postId, comment: addedComment });

        setText("");
        toast({ title: "Yorum eklendi", status: "success", duration: 2000 });
      } else {
        toast({ title: "Yorum eklenemedi", status: "error", duration: 2000 });
      }
    } catch (error) {
      toast({ title: "Yorum eklenemedi", status: "error", duration: 2000 });
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const result = await dispatch(deleteCommentThunk(commentId) as any);
      if (deleteCommentThunk.fulfilled.match(result)) {
        toast({ title: "Yorum silindi", status: "info", duration: 2000 });
      } else {
        toast({ title: "Yorum silinemedi", status: "error", duration: 2000 });
      }
    } catch (error) {
      toast({ title: "Yorum silinemedi", status: "error", duration: 2000 });
    }
  };

  return (
    <Box mt={8} p={4} bg="gray.50" borderRadius="md" boxShadow="sm">
      <VStack align="stretch" spacing={4}>
        {isLoggedIn ? (
          <Box as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleAddComment(); }}>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              mb={2}
              minH="60px"
            />
            <Button type="submit" colorScheme="teal" isDisabled={!text.trim()}>
              Yorum Ekle
            </Button>
          </Box>
        ) : (
          <Alert status="info">
            <AlertIcon />
            Yorum eklemek için giriş yapmalısınız.
          </Alert>
        )}
        <Text fontWeight="bold" fontSize="lg">Yorumlar</Text>
        {loading ? (
          <Spinner />
        ) : comments.length === 0 ? (
          <Text>Henüz yorum yok.</Text>
        ) : (
          comments.slice().reverse().map((comment: Comment) => (
            <Box key={comment.id} p={3} bg="white" borderRadius="md" boxShadow="xs">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">{comment.author?.name || "Anonim"}</Text>
                  <Text fontSize="sm" color="gray.500">{new Date(comment.createdAt).toLocaleString()}</Text>
                  <Text mt={2} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>{comment.text}</Text>
                  <Reactions commentId={comment.id} userId={currentUser.userId!} />
                </Box>
                {(userRole === "admin" || userEmail === comment.author?.email) && (
                  <IconButton
                    aria-label="Yorumu sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(comment.id)}
                  />
                )}
              </HStack>
            </Box>
          ))
        )}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </VStack>
    </Box>
  );
});

export default PostCommentSection;
