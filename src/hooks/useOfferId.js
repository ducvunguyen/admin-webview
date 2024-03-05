import { useDispatch, useSelector } from 'react-redux';
import { updateStore } from 'store/reducers/storeSlice';

const useOfferId = () => {
    const dispatch = useDispatch();

    const offerId = useSelector((state) => state?.storeSlice.offerId);

    const updateOfferId = offerId =>
        dispatch(updateStore({nameStore: 'offerId', data: offerId}));

    const clearOfferId = () =>
        dispatch(updateStore({nameStore: 'offerId', data: null}));

    return {
        offerId,
        updateOfferId,
        clearOfferId
    };
};

export default useOfferId;