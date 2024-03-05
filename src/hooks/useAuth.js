import { useEffect, useCallback } from 'react';
import { fetchMe } from 'services/auth';

export default function useAuth() {
    const fetchInfo = useCallback(async () => {
        try {
            await fetchMe();
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchInfo();
    }, []);
}
