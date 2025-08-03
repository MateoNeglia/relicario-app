import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InputEmoji from 'react-input-emoji';
import './ChatPage.scss';
import { Chat } from '@mui/icons-material';
import { formatDateToSpanishShort } from '../../utils/dateUtils';
import { getProfilePictureUrl } from '../../utils/imageUtils';
import dayjs from 'dayjs';
import { config } from '../../environments/config';

const ChatPage = ({ user, chatId, onNavigate }) => {
  const [chatUser, setChatUser] = useState({});
  const [chatList, setChatList] = useState([]);
  const [isLoadingChatUser, setIsLoadingChatUser] = useState(false);
  const { createChat, 
    updateCurrentchat,    
    sendTextMessage, 
    messages, 
    onlineUsers,
    isCreatingChat
  } = useChat();
  const navigate = useNavigate();
  const sanitizedChatId = chatId?.trim();
  const [textMessage, setTextMessage] = useState('');
  const scrollRef = useRef(null);
  /* const [isOnline, setIsOnline] = useState(false);
  const [activeChat, setActiveChat] = useState(null); */

  

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fallback effect to set chat user if not set but we have a chatId
  useEffect(() => {
    if (sanitizedChatId && sanitizedChatId !== user._id.toString() && (!chatUser._id || chatUser._id === user._id)) {
      // Try to get user info from the chat list if available
      const chatFromList = chatList.find(chat => {
        const otherUser = chat.members?.find(member => member.id !== user._id);
        return otherUser && otherUser.id === sanitizedChatId;
      });
      
      if (chatFromList) {
        const otherUser = chatFromList.members.find(member => member.id !== user._id);
        if (otherUser) {
          setChatUser(otherUser);
        }
      }
    }
  }, [chatList, sanitizedChatId, user._id, chatUser._id]);
  
  useEffect(() => {
    const checkAndCreateChat = async () => {
      if (!user._id || !sanitizedChatId || sanitizedChatId === user._id.toString() || isCreatingChat) {
        return;
      }

      try {
        const accessToken = Cookies.get('accessToken');
        
        // First, try to find an existing chat between these two users
        const existingChatResponse = await axios.get(`${config.BACKEND_URL}/chats/${user._id}/${sanitizedChatId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        // If chat exists, just update the current chat
        if (existingChatResponse.data) {
          console.log("Existing chat found:", existingChatResponse.data);
          updateCurrentchat(existingChatResponse.data._id);
          
          // Extract the other user's information from the chat data
          if (existingChatResponse.data.members && existingChatResponse.data.members.length > 0) {
            const otherUser = existingChatResponse.data.members.find(member => member.id !== user._id);
            if (otherUser) {
              setChatUser(otherUser);
            }
          }
          return;
        }
      } catch (error) {
        // If the chat doesn't exist (404 error), create a new one
        if (error.response?.status === 404) {
          console.log("No existing chat found, creating new chat");
          createChat(user._id, sanitizedChatId);
        } else {
          console.error("Error checking for existing chat:", error);
        }
      }
    };

    checkAndCreateChat();

    const findChat = async () => {
      if (!sanitizedChatId || sanitizedChatId === user._id.toString()) {
        return;
      }
      
      try {
        const accessToken = Cookies.get('accessToken');
        console.log("findChat", user._id, sanitizedChatId);
        const response = await axios.get(`${config.BACKEND_URL}/chats/${user._id}/${sanitizedChatId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log("response", response.data);
        updateCurrentchat(response.data._id);
        
        // Extract the other user's information from the chat data
        if (response.data.members && response.data.members.length > 0) {
          const otherUser = response.data.members.find(member => member.id !== user._id);
          if (otherUser) {
            setChatUser(otherUser);
          }
        }
      } catch (error) {
        console.error("Error finding chat:", error);
      }
    }

    const fetchProfileUser = async () => {
      if (sanitizedChatId && sanitizedChatId !== user._id.toString()) {
        setIsLoadingChatUser(true);
        try {
          const accessToken = Cookies.get('accessToken');
          const response = await axios.get(`${config.BACKEND_URL}/auth/users/${sanitizedChatId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setChatUser(response.data);
        } catch (err) {
          console.error(err.response?.data?.message || 'Error fetching user profile');
          // If we can't fetch the user profile, we can try to get it from the chat data
          // This will be handled by the findChat function
        } finally {
          setIsLoadingChatUser(false);
        }
      } else {
        setChatUser(user);
      }
    };
    
    const fetchChatList = async () => {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.get(`${config.BACKEND_URL}/chats/${user._id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setChatList(response.data);
    };
    
    fetchProfileUser();
    fetchChatList(); 
    findChat();
    
    
  }, [ chatId, user ]);

  const handleSendMessage = async () => {    
    try {
      //createChat(user._id, chatUser._id); 
      sendTextMessage(textMessage, user, setTextMessage);

    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  const handleChatNavigation = (userId, chatId) => {    
    navigate('/chat/' + userId);   
    updateCurrentchat(chatId);
  }

  const handleOnlineStatus = (userId) => {
    const isOnline = onlineUsers.some(user => user.userId === userId);    
    return isOnline;
  }

  return (
    <Box className="chat-page">
      <Card className="chat-list">
        {chatList.map((chat) => {
          // Find the other user (not the logged-in user)
          const otherUser = chat.members?.find(member => member.id !== user._id) || chat.members?.[0];
          
          return (
            <Box key={chat._id} className="chat-list-item" onClick={() => handleChatNavigation(otherUser?.id, chat._id)}>
              <Avatar
                className="profile-avatar"
                alt={otherUser?.username || 'User'}
                src={getProfilePictureUrl(otherUser?.profilePicture) || '/static/images/avatar/1.jpg'}
                sx={{ width: 40, height: 40, marginRight: 2 }}
              />
              <Typography variant="h6" className="chat-list-item-title">{otherUser?.username}</Typography>
              <Box
                   sx={{
                     width: 10,
                     height: 10,
                     borderRadius: '50%',
                     backgroundColor: handleOnlineStatus(otherUser?.id) ? '#4CAF50' : '#9E9E9E',
                     marginLeft: 1
                   }}
                 />
              <Typography variant="body1" className="chat-list-item-time">{formatDateToSpanishShort(chat.updatedAt)}</Typography>          
            </Box>
          );
        })}
      </Card>
      {sanitizedChatId ? (
        sanitizedChatId === user._id.toString() ? (
          <Card className="chat-container">
            <Box className="chat-header">
              <Typography variant="h5" className="chat-header-title">Mi Bandeja de Mensajes</Typography>
            </Box>
            <Box className="chat-messages">
              <Typography variant="body1" className="chat-messages-empty">
                Esta es tu bandeja de mensajes. Aquí podrás ver todas las conversaciones que tengas con otros usuarios.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                Para iniciar una conversación, selecciona un chat de la lista o navega al perfil de otro usuario y haz clic en "Enviar Mensaje".
              </Typography>
            </Box>
          </Card>
        ) : (
          <Card className="chat-container">
            <Box className="chat-header">
              {isLoadingChatUser ? (
                <>
                  <CircularProgress size={40} sx={{ marginRight: 2 }} />
                  <Typography variant="h5" className="chat-header-title">Cargando usuario...</Typography>
                </>
              ) : (
                <>
                  <Avatar src={getProfilePictureUrl(chatUser.profilePicture) || '/static/images/avatar/1.jpg'} 
                  alt={chatUser.username} sx={{ width: 40, height: 40, marginRight: 2 }}  />
                  <Typography variant="h5" className="chat-header-title">{chatUser.username}</Typography>
                </>
              )}
            </Box>
            <Box className="chat-messages">
              {isCreatingChat ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>Creando conversación...</Typography>
                </Box>
              ) : messages.length <= 0 ? (
                <Typography variant="body1" className="chat-messages-empty">Aún no hay mensajes en esta conversación.</Typography>
              ) : (
                messages.map((message, index) => (
                  <Box ref={scrollRef} key={`${message._id}-${index}`} className={`chat-message ${message.senderId === user._id ? 'chat-message-sent' : 'chat-message-received'}`}>
                    <Typography variant="body1" className="chat-message-text">{message.text}</Typography>
                    <Typography variant="body1" className="chat-message-time">{dayjs(message.createdAt).format('HH:mm')}</Typography>
                  </Box>
                ))
              )}
            </Box>
            <Box className="chat-input">
              <InputEmoji
                value={textMessage}
                onChange={setTextMessage}
                cleanOnEnter
                onEnter={handleSendMessage}
                placeholder="Type a message"
                disabled={isCreatingChat}
              />
              <IconButton color="primary" onClick={handleSendMessage} disabled={isCreatingChat}>
                <SendIcon />
              </IconButton>
            </Box>
          </Card>
        )
      ) : (
        <Card className="chat-container">
          <Box className="chat-header">
            <Typography variant="h5" className="chat-header-title">Selecciona un chat para comenzar</Typography>
          </Box>
          <Box className="chat-messages">
            <Typography variant="body1" className="chat-messages-empty">
              Para comenzar una conversación, selecciona un chat de la lista o navega al perfil de otro usuario y haz clic en "Enviar Mensaje".
            </Typography>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default ChatPage;