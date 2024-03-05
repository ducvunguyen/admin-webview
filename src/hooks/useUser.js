import useQuery from './useQuery';
import { getUsersByFilter } from '../services/user';

const useUsers = () => {
    const params = {
        page: 0,
        pageSize: 99999,
    };

    const data = useQuery({
        nameStore: 'users',
        queryFn: () => getUsersByFilter(params),
    });

    return data;
};

export default useUsers;