import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../environments/config";
export const useFetchUser = (userId) => {
    const [user, setUser] = useState(null);
    const [ error, setError ] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${config.BACKEND_URL}/auth/users/${userId}`);
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