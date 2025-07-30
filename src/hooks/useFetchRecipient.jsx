import { useEffect, useState } from "react";
import { useFetchUser } from "./useFetchUser";

export const useFetchRecipient = (chat, userId) => {
    const [user, setUser] = useState(null);
    const [ error, setError ] = useState(null);
    
    const recipientId = chat?.members?.find((id) => id !== userId);

    useEffect(() => {
        const fetchRecipient = async () => {
            if (!recipientId) return;
            try {
                useFetchUser(recipientId).then((response) => {
                    setUser(response.data);
                });
            } catch (err) {
                console.error('Error fetching recipient:', err);
                setError(err.response?.data?.message || 'Error fetching recipient');
            }
        };
        fetchRecipient();    
        
    }, [userId]);
    return { user, error };
};