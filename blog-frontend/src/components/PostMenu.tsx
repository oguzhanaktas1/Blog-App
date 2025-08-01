import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    useToast,
  } from "@chakra-ui/react";
  import { FiMoreVertical } from "react-icons/fi";
  import React from "react";
  
  interface PostMenuProps {
    postId: number;
    postTitle: string;
    onEdit?: () => void;
    onDelete?: () => void;
    canModify: boolean;
  }
  
  const PostMenu = React.memo(
    ({ postId, postTitle, onEdit, onDelete, canModify }: PostMenuProps) => {
      const toast = useToast();
  
      const handleShare = () => {
        const url = `${window.location.origin}/posts/${postId}`;
        navigator.clipboard.writeText(url);
        toast({
          title: "Bağlantı kopyalandı!",
          description: `"${postTitle}" gönderisi bağlantısı panoya kopyalandı.`,
          status: "info",
          duration: 2500,
          isClosable: true,
        });
      };
  
      return (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical />}
            variant="ghost"
            size="sm"
            aria-label="Post options"
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList>
            {canModify && onEdit && <MenuItem onClick={onEdit}>Güncelle</MenuItem>}
            <MenuItem onClick={handleShare}>Paylaş</MenuItem>
            {canModify && onDelete && (
              <MenuItem color="red.500" onClick={onDelete}>
                Sil
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      );
    }
  );
  
  export default PostMenu;