/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  HStack,
  Tooltip,
  Text,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import {
  FaThumbsUp,
  FaHeart,
  FaLaugh,
  FaAngry,
  FaSadTear,
  FaThumbsDown,
} from "react-icons/fa";
import socket from "../utils/socket";

type PostReactionType = "like" | "love" | "haha" | "sad" | "angry";
type CommentReactionType = "like" | "dislike" | "laugh";

interface ReactionProps {
  postId?: number;
  commentId?: number;
  userId: number;
}

const postReactionTypes: PostReactionType[] = [
  "like",
  "love",
  "haha",
  "sad",
  "angry",
];

const commentReactionTypes: CommentReactionType[] = [
  "like",
  "dislike",
  "laugh",
];

const postReactionIcons: Record<PostReactionType, React.ElementType> = {
  like: FaThumbsUp,
  love: FaHeart,
  haha: FaLaugh,
  sad: FaSadTear,
  angry: FaAngry,
};

const commentReactionIcons: Record<CommentReactionType, React.ElementType> = {
  like: FaThumbsUp,
  dislike: FaThumbsDown,
  laugh: FaLaugh,
};

const Reactions = ({ postId, commentId, userId }: ReactionProps) => {
  // Reactions state tipi geniş tutuldu
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Post reaction fetch
  const fetchPostReactions = async () => {
    if (!postId) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/post-reactions/${postId}?userId=${userId}`
      );
      if (!res.ok) throw new Error("Post reactions fetch failed");
      const data = await res.json();

      const newReactions: Record<PostReactionType, number> = {
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        angry: 0,
      };

      for (const r of data.reactions) {
        newReactions[r.type as PostReactionType] = r.count;
      }

      setReactions(newReactions);
      setUserReaction(data.userReaction);
    } catch (err) {
      console.error("Post reactions fetch error:", err);
    }
  };

  const fetchCommentReactions = async () => {
    if (!commentId) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/comment-reactions/${commentId}?userId=${userId}`
      );
      if (!res.ok) throw new Error("Comment reactions fetch failed");
      const data = await res.json();

      const newReactions: Record<CommentReactionType, number> = {
        like: 0,
        dislike: 0,
        laugh: 0,
      };

      for (const r of data.reactions) {
        newReactions[r.type as CommentReactionType] = r.count;
      }

      setReactions(newReactions);
      setUserReaction(data.userReaction);
    } catch (err) {
      console.error("Comment reactions fetch error:", err);
    }
  };

  useEffect(() => {
    if (postId) {
      // Başlangıçta post reactionlar sıfırlanıyor
      setReactions({
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        angry: 0,
      });
      fetchPostReactions();
    } else if (commentId) {
      // Başlangıçta comment reactionlar sıfırlanıyor
      setReactions({
        like: 0,
        dislike: 0,
        laugh: 0,
      });
      fetchCommentReactions();
    }
  }, [postId, commentId, userId]);

  useEffect(() => {
    const handlePostUpdate = (data: any) => {
      if (data.postId === postId) {
        const newReactions: Record<PostReactionType, number> = {
          like: 0,
          love: 0,
          haha: 0,
          sad: 0,
          angry: 0,
        };

        for (const r of data.reactions || []) {
          newReactions[r.type as PostReactionType] = r._count;
        }

        setReactions(newReactions);
        setUserReaction(data.userReaction);
      }
    };

    const handleCommentUpdate = (data: any) => {
      if (data.commentId === commentId) {
        const newReactions: Record<CommentReactionType, number> = {
          like: 0,
          dislike: 0,
          laugh: 0,
        };

        for (const r of data.reactions || []) {
          newReactions[r.type as CommentReactionType] = r._count;
        }

        setReactions(newReactions);
        setUserReaction(data.userReaction);
      }
    };

    if (postId) {
      socket.on("post-reaction-update", handlePostUpdate);
    } else if (commentId) {
      socket.on("comment-reaction-update", handleCommentUpdate);
    }

    return () => {
      if (postId) {
        socket.off("post-reaction-update", handlePostUpdate);
      } else if (commentId) {
        socket.off("comment-reaction-update", handleCommentUpdate);
      }
    };
  }, [postId, commentId]);

  const handleReact = async (type: PostReactionType | CommentReactionType) => {
    const isSameReaction = userReaction === type;
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("Token bulunamadı");
      return;
    }
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  
    try {
      if (postId) {
        const url = `http://localhost:3000/api/post-reactions/${postId}`;
        if (isSameReaction) {
          await fetch(url, { method: "DELETE", headers });
          setUserReaction(null);
        } else {
          await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ reaction: type }),
          });
          setUserReaction(type);
        }
        await fetchPostReactions();
      } else if (commentId) {
        const url = `http://localhost:3000/api/comment-reactions/${commentId}`;
        if (isSameReaction) {
          await fetch(url, { method: "DELETE", headers });
          setUserReaction(null);
        } else {
          await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ reaction: type }),
          });
          setUserReaction(type);
        }
        await fetchCommentReactions();
      }
    } catch (error) {
      console.error("Tepki gönderilemedi:", error);
    }
  };
  

  const bg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const activeBg = useColorModeValue("blue.300", "blue.600");


  return (
    <HStack spacing={3} mt={2}>
      {postId
        ? postReactionTypes.map((type) => {
            const Icon = postReactionIcons[type];
            const count = reactions[type] ?? 0;
            const userReacted = userReaction === type;
  
            const tooltipLabel =
              userReacted && count > 1
                ? `Sen + ${count - 1} kişi`
                : userReacted
                ? "Sen"
                : `${count} kişi`;
  
            return (
              <Tooltip key={type} label={tooltipLabel} hasArrow>
                <Box
                  onClick={() => handleReact(type)}
                  cursor="pointer"
                  p={2}
                  bg={userReacted ? activeBg : bg}
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: userReacted ? activeBg : hoverBg }}
                  transition="all 0.2s"
                >
                  <Icon size={18} />
                  <Text fontSize="sm" ml={1}>
                    {count}
                  </Text>
                </Box>
              </Tooltip>
            );
          })
        : commentReactionTypes.map((type) => {
            const Icon = commentReactionIcons[type];
            const count = reactions[type] ?? 0;
            const userReacted = userReaction === type;
  
            const tooltipLabel =
              userReacted && count > 1
                ? `Sen + ${count - 1} kişi`
                : userReacted
                ? "Sen"
                : `${count} kişi`;
  
            return (
              <Tooltip key={type} label={tooltipLabel} hasArrow>
                <Box
                  onClick={() => handleReact(type)}
                  cursor="pointer"
                  p={2}
                  bg={userReacted ? activeBg : bg}
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: userReacted ? activeBg : hoverBg }}
                  transition="all 0.2s"
                >
                  <Icon size={18} />
                  <Text fontSize="sm" ml={1}>
                    {count}
                  </Text>
                </Box>
              </Tooltip>
            );
          })}
    </HStack>
  );
  
};

export default Reactions;
