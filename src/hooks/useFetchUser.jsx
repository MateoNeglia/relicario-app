import { useEffect, useState } from "react";
import axios from "axios";

export const useFetchUser = (userId) => {
    const [user, setUser] = useState(null);
    const [ error, setError ] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/auth/users/${userId}`);
                setUser(response.data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err.response?.data?.message || 'Error fetching user');
            }
        };
        if (userId) {
            fetchUser();
        }
    }, [userId]);
    return { user, error };
};