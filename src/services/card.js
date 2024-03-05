import AxiosService from 'utilities/axios';
const prevUrl = 'card';

// export const cardService = {
//     getCards: ({page, pageSize, status}) => AxiosService.get(prevUrl, {
//         params: {
//             page,
//             pageSize,
//             status
//         }
//     })
// }

export const getCards = ({ page = 0, pageSize = 10, status = 'ACTIVE'}) => {
    return AxiosService.get(`/${prevUrl}`, {
        params: {
            page,
            pageSize,
            status
        },
    });
};

export const deleteCard = id => AxiosService.delete(`/${prevUrl}/${id}`);

export const cardRegister = params => AxiosService.post(`/${prevUrl}/register`, params);

export const updateCard = (id, params) => AxiosService.put(`${prevUrl}/${id}`, params);