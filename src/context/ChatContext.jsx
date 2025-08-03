import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { config } from '../environments/config';

export const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState([]);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    useEffect(() => {
        const getUserChats = async () => {
            if (!user) return;
            try {
                const accessToken = Cookies.get('accessToken');
                const response = await axios.get(`${config.BACKEND_URL}/chats/${user?._id}`, {
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
    if (!firstId || !secondId || isCreatingChat) return;
    
    setIsCreatingChat(true);
    
    try {
        // Check if chat already exists in local state
        const existingChat = userChats.find(chat => 
            chat.members && 
            chat.members.some(member => member.id === firstId) &&
            chat.members.some(member => member.id === secondId)
        );
        
        if (existingChat) {
            console.log("Chat already exists in local state:", existingChat);
            updateCurrentchat(existingChat._id);
            return;
        }
        
        let body = {
            firstId, 
            secondId,
        };
        
        const accessToken = Cookies.get('accessToken'); 
        const response = await axios.post(`${config.BACKEND_URL}/chats`, body, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserChats((prev) => [...prev, response.data]);
        updateCurrentchat(response.data._id);
      } catch (err) {
        // If the error is due to duplicate chat, try to find the existing chat
        if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
            console.log("Chat already exists on server, fetching existing chat");
            try {
                const existingChatResponse = await axios.get(`${config.BACKEND_URL}/chats/${firstId}/${secondId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (existingChatResponse.data) {
                    setUserChats((prev) => {
                        const chatExists = prev.some(chat => chat._id === existingChatResponse.data._id);
                        if (!chatExists) {
                            return [...prev, existingChatResponse.data];
                        }
                        return prev;
                    });
                    updateCurrentchat(existingChatResponse.data._id);
                }
            } catch (fetchError) {
                console.error('Failed to fetch existing chat:', fetchError);
            }
        } else {
            console.error('Failed to create chat:', err);
        }
      } finally {
        setIsCreatingChat(false);
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
            const response = await axios.get(`${config.BACKEND_URL}/messages/${currentChat}`, {
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
        const response = await axios.post(`${config.BACKEND_URL}/messages`, body, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        // Verificar si el mensaje ya existe antes de agregarlo
        setMessages((prev) => {
            const messageExists = prev.some(msg => msg._id === response.data._id);
            if (messageExists) {
                console.log('Mensaje enviado ya existe en el estado:', response.data._id);
                return prev;
            }
            console.log('Mensaje enviado agregado al estado:', response.data);
            return [...prev, response.data];
        });
        
        setNewMessage(response.data);
        setTextMessage('');

    } catch (err) {
        console.error('Failed to send text message:', err);
    }
};

const [socket, setSocket] = useState(null);
useEffect(() => {
    
    const newSocket = io(config.SOCKET_URL);
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
    
    if (!socket || !newMessage || !activeChat) return;
    console.log('activeChat desde new message', activeChat);
    
    // Buscar el recipient correcto en el array de members
    const recipient = activeChat.members?.find((member) => member.id !== user._id);
    console.log('recipient encontrado:', recipient);
    
    if (recipient && recipient.id) {
        console.log('recipientId', recipient.id);
        console.log('currentChat', activeChat);
        socket.emit('sendMessage', {
            ...newMessage,
            recipientId: recipient.id,
        });
    } else {
        console.warn('No se pudo encontrar el recipient para el mensaje');
    }

}, [newMessage, activeChat, socket]);



useEffect(() => {
    if (!socket) return;    
    socket.on('getMessage', (data) => {
        if (data.senderId !== user._id) { 
            const isChatOpen = activeChat?._id === data.chatId;
            if (isChatOpen) {
                setMessages((prev) => [...prev, data]);
            }
        }
    });
    return () => {
        socket.off('getMessage');
    };
}, [socket, activeChat, user]); 


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
        const response = await axios.get(`${config.BACKEND_URL}/chats/find/by-id/${currentChat}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Chat encontrado por ID:', response.data);
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
        onlineUsers,
        isCreatingChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);