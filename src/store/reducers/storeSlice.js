import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    cards: [],
    categories: [],
    users: [],
    positions: [],
    offerId: null
}

const storeSlice = createSlice({
    name: 'storeSlice',
    initialState,
    reducers: {
        updateStore(state, action) {
            state[action.payload.nameStore] = action.payload.data;
        },
    },
})

export const { updateStore } = storeSlice.actions
export default storeSlice.reducer