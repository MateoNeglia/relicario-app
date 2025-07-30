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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InputEmoji from 'react-input-emoji';
import './ChatPage.scss';
import { Chat } from '@mui/icons-material';
import { formatDateToSpanishShort } from '../../utils/dateUtils';
import { getProfilePictureUrl } from '../../utils/imageUtils';
import dayjs from 'dayjs';

const ChatPage = ({ user, chatId, onNavigate }) => {
  const [chatUser, setChatUser] = useState({});
  const [chatList, setChatList] = useState([]);
  const { createChat, 
    updateCurrentchat,    
    sendTextMessage, 
    messages, 
    onlineUsers
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
  
  useEffect(() => {
    createChat(user._id, sanitizedChatId);

    const findChat = async () => {
      const accessToken = Cookies.get('accessToken');
      console.log("findChat", user._id, sanitizedChatId);
      const response = await axios.get(`/api/chats/${user._id}/${sanitizedChatId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("response", response.data);
      updateCurrentchat(response.data._id);
      
    }

    const fetchProfileUser = async () => {
      if (sanitizedChatId && sanitizedChatId !== user._id.toString()) {
        try {
          
          const accessToken = Cookies.get('accessToken');
          const response = await axios.get(`/api/auth/users/${sanitizedChatId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setChatUser(response.data);
        } catch (err) {
          console.error(err.response?.data?.message || 'Error fetching user profile');
        } finally {
          
        }
      } else {
        setChatUser(user);
      }
    };
    
    const fetchChatList = async () => {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.get(`/api/chats/${user._id}`, {
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
    navigate('/chat/ ' + userId);   
    updateCurrentchat(chatId);
  }

  const handleOnlineStatus = (userId) => {
    const isOnline = onlineUsers.some(user => user.userId === userId);    
    return isOnline;
  }

  return (
    <Box className="chat-page">
      <Card className="chat-list">
        {chatList.map((chat) => (
          <Box key={chat._id} className="chat-list-item" onClick={() => handleChatNavigation(chat.members[0].id, chat._id)}>
            <Avatar
              className="profile-avatar"
              alt={chat.members[0].username || 'User'}
              src={getProfilePictureUrl(chat.members[0].profilePicture) || '/static/images/avatar/1.jpg'}
              sx={{ width: 40, height: 40, marginRight: 2 }}
            />
            <Typography variant="h6" className="chat-list-item-title">{chat.members[0].username}</Typography>
            <Box
                 sx={{
                   width: 10,
                   height: 10,
                   borderRadius: '50%',
                   backgroundColor: handleOnlineStatus(chat.members[0].id) ? '#4CAF50' : '#9E9E9E',
                   marginLeft: 1
                 }}
               />
            <Typography variant="body1" className="chat-list-item-time">{formatDateToSpanishShort(chat.updatedAt)}</Typography>          
          </Box>
        ))}
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
              <Avatar src={getProfilePictureUrl(chatUser.profilePicture) || '/static/images/avatar/1.jpg'} 
              alt={chatUser.username} sx={{ width: 40, height: 40, marginRight: 2 }}  />
                <Typography variant="h5" className="chat-header-title">{chatUser.username}</Typography>
               
            </Box>
            <Box className="chat-messages">
              {
                messages.length <= 0 ? (
                  <Typography variant="body1" className="chat-messages-empty">Aún no hay mensajes en esta conversación.</Typography>
                ) : (
                  messages.map((message, index) => (
                    <Box ref={scrollRef} key={`${message._id}-${index}`} className={`chat-message ${message.senderId === user._id ? 'chat-message-sent' : 'chat-message-received'}`}>
                      <Typography variant="body1" className="chat-message-text">{message.text}</Typography>
                      <Typography variant="body1" className="chat-message-time">{dayjs(message.createdAt).format('HH:mm')}</Typography>
                    </Box>
                  ))
                )
              }
            </Box>
            <Box className="chat-input">
              <InputEmoji
                value={textMessage}
                onChange={setTextMessage}
                cleanOnEnter
                onEnter={handleSendMessage}
                placeholder="Type a message"
              />
              <IconButton color="primary" onClick={handleSendMessage}>
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