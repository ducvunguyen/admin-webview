import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { updateStore } from 'store/reducers/storeSlice';

const useQuery = ({queryFn, actionReducer, nameStore}) => {
    const dispatch = useDispatch();
    const dataSource = useSelector((state) => state?.storeSlice[nameStore]);

    useEffect(() => {
        // if (dataSource.length === 0)
            queryFn().then(({data}) =>
                dispatch(updateStore({nameStore, data: data[nameStore]})))
    }, []);

    return dataSource;
}

export default useQuery;