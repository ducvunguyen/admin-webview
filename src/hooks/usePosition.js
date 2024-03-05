import useQuery from './useQuery';
import { getPositions } from '../services/position';

const usePosition = () => {
    const params = {
        page: 0,
        size: 9999,
        status: 'ACTIVE',
    };

    return useQuery({
        nameStore: 'positions',
        queryFn: () => getPositions(params),
    });
};

export default usePosition;