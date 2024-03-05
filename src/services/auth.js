import AxiosService from 'utilities/axios';

const url = '';

export const login = ({ email, password }) => {
    return AxiosService.post(`/authentication/login`, {
        email,
        password,
    });
};

export const fetchMe = () => {
    return AxiosService.get(`/${url}/info`);
};

export const refreshToken = token => AxiosService.get(`/authentication/login`, {
    params: {token}
});

export const getInfoUser = () => AxiosService.get(`/authentication/info`);