import useQuery from './useQuery';
import { getCategories } from '../services/category';

const useCategory = () => {
    const params = {
        page: 0,
        pageSize: 99999,
    };

    const data = useQuery({
        queryFn: () => getCategories(params),
        nameStore: 'categories',
    })
    return data;
}

export default useCategory;