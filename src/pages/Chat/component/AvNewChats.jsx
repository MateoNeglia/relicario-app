import React,{ useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import { Avatar } from "@mui/material";


const AvNewChats = ({handleToggleModal}) => {
  const { user } = useContext(AuthContext);
  const { availableNewChats, createChat } = useContext(ChatContext);

  const handleCreateChat = async (userId) => {
    try {
      await createChat(user._id, userId);
        handleToggleModal();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="available-new-chats">
      {availableNewChats && availableNewChats.map((chatUser) => (
        <div key={chatUser._id} className="chat-user" onClick={() => handleCreateChat(chatUser._id)}>
            <div className="status"></div>
            <Avatar src={chatUser.profilePicture || '/default-avatar.png'} alt={chatUser.name} />

          <span>{chatUser.name}</span>
        </div>
      ))}
    </div>
  );
}

export default AvNewChats;