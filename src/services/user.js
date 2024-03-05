import AxiosService from 'utilities/axios';
const prevUrl = 'user';

export const getUsers = ({ page = 0, pageSize = 10, status = 'ALL'}) => {
    return AxiosService.get(`/${prevUrl}/list`, {
        params: {
            page,
            pageSize,
            status
        },
    });
};

export const getUsersByFilter = positionId => {
    return AxiosService.get(`user/users`, {
        params: {
            page: 0,
            pageSize: 99999,
            positionId
        },
    });
};

export const getUsersActive = ({type, positionId}) => {
    return AxiosService.get(`user/user-active`, {
        params: {
            page: 0,
            pageSize: 99999,
            type,
            positionId
        },
    });
};

export const userRegister = ({email, password, role}) =>
    AxiosService.post(`/user/register`, {email, password, role});

export const master = () => AxiosService.get(`/master/user-scope`);

export const getInfoUser = id => AxiosService.get(`/user/${id}`);

export const resetPassword = (id, password) => AxiosService.put(`/user/reset-password/${id}`, {password});

export const userActiveById = id => AxiosService.put(`/user/active/${id}`);

export const userDeActiveById = id => AxiosService.put(`/user/deactive/${id}`);

export const changePassword = ({ oldPassword, password }) =>
    AxiosService.put(`/user/change-password`, {oldPassword, password});

export const userUpdate = (id, {role}) =>
    AxiosService.put(`/user/update`, {scopes: role, id});