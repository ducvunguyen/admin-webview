import useQuery from './useQuery';
import { getCards } from 'services/card';

const useCard = () => {
  const params = {
    page: 0,
    pageSize: 99999,
  };

  const data = useQuery({
    queryFn: () => getCards(params),
    nameStore: 'cards',
  })
  return data;
}

export default useCard;