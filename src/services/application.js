import AxiosService from 'utilities/axios';

const prevUrl = 'app';

export const getPaging = ({ pageIndex = 0, pageSize = 10, search = '' }) => {
    return AxiosService.get(`/${prevUrl}`, {
        params: {
            pageIndex,
            pageSize,
            search,
        },
    });
};

export const updateStatus = ({ id, status, services }) => {
    return AxiosService.put(`/${prevUrl}`, { id, status, services });
};

export const checkExistServiceCode = (code) => {
    return AxiosService.get(`/${prevUrl}/service-code/${code}`);
};
