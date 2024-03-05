import AxiosService from 'utilities/axios';

const prevUrl = 'category';

export const getCategories = ({ page = 0, pageSize = 10, status= 'ACTIVE'}) => {
    return AxiosService.get(`/${prevUrl}`, {
        params: {
            page,
            pageSize,
            status
        },
    });
};

export const createCategory = ({ id, status, services }) => {
    return AxiosService.post(`/${prevUrl}`, { id, status, services });
};

export const checkExistServiceCode = (code) => {
    return AxiosService.get(`/${prevUrl}/service-code/${code}`);
};

export const categoryRegister = params => {
    return AxiosService.post(`/${prevUrl}/register`, params);
}

export const deleteCategory = id => {
    return AxiosService.delete(`${prevUrl}/${id}`, {});
}

export const updateCategory = (id, params) => {
    return AxiosService.put(`${prevUrl}/${id}`, params);
}
