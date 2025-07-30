import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

export const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState([]);

    useEffect(() => {
        const getUserChats = async () => {
            if (!user) return;
            try {
                const accessToken = Cookies.get('accessToken');
                const response = await axios.get(`/api/chats/${user?._id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setUserChats(response.data);
            } catch (err) {
                console.error('Failed to load user chats:', err);
            }
        };
        getUserChats();
    }, [user]);     

//const  [ allUsers, setAllUsers ] = useState([]);

const [currentChat, setCurrentChat] = useState(null);
const updateCurrentchat = (chat) => {
    console.log("updateCurrentchat", chat);
    setCurrentChat(chat);
}	

const createChat = async (firstId, secondId) => {
    if (!firstId || !secondId) return;
    let body = {
        firstId, 
        secondId,
    };
    try {
        const accessToken = Cookies.get('accessToken'); 
        const response = await axios.post(`/api/chats`, body, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserChats((prev) => [...prev, response.data]);
      } catch (err) {
        console.error('Failed to create chat:', err);
      }
};

const [messages, setMessages] = useState([]);
useEffect(() => {
    const getMessages = async () => {
        if (!currentChat) {
            setMessages([]);
            return;
        }
        
        try {
            const accessToken = Cookies.get('accessToken');
            const response = await axios.get(`/api/messages/${currentChat}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setMessages([]);
        }
    }
    getMessages();
}, [currentChat]);

const [newMessage, setNewMessage] = useState('');

const sendTextMessage = async (textMessage, user, setTextMessage) => {
    console.log('sendTextMessage', textMessage, user, currentChat);
    if (!textMessage || !user || !currentChat) return;
    let body = {
      chatId: currentChat,
      senderId: user._id,
      text: textMessage,      
    };
    try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.post(`/api/messages`, body, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        setMessages((prev) => [...prev, response.data]);
        setNewMessage(response.data);
        setTextMessage('');

    } catch (err) {
        console.error('Failed to send text message:', err);
    }
};

const [socket, setSocket] = useState(null);
useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);
    return () => {
        newSocket.disconnect();
    }
}, [user]);

const [onlineUsers, setOnlineUsers] = useState([]);

useEffect(() => {
    if (!user) return;
    if (socket) {
        socket.emit('addNewUser', user._id);
        socket.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });
    }

}, [user, socket]);

const [activeChat, setActiveChat] = useState(null);

useEffect(() => {
    if (!socket) return;
    const recipientId = activeChat?.members?.find((member) => member !== user._id);
    console.log('recipientId', recipientId);
    console.log('currentChat', activeChat);
    if (recipientId) {
        socket.emit('sendMessage', {
            ...newMessage,
            recipientId,
        });
    }

}, [newMessage]);

useEffect(() => {
    if (!socket) return;
    socket.on('getMessage', (data) => {
        const isChatOpen = activeChat?._id === data.chatId;
        if (isChatOpen) {
            setMessages((prev) => [...prev, data]);
        }
    });

    return () => {
        socket.off('getMessage');
    }

}, [newMessage, currentChat, user]);

useEffect(() => {
    if (!currentChat) return;
    findChatById(currentChat).then((chat) => {
        setActiveChat(chat);
    });
}, [currentChat]);

const findChatById = async (currentChat) => {
    if (!currentChat) return;
    try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`/api/chats/by-id/${currentChat}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (err) {
        console.error('Failed to find chat by id:', err);
        return null;
    }
}

return (
    <ChatContext.Provider
      value={{ 
        userChats,         
        createChat,
        currentChat,
        updateCurrentchat,        
        messages, 
        sendTextMessage, 
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);