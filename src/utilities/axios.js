import axios from 'axios';
import { message } from 'antd';
import { USER_TOKEN, API_ENDPOINT, PATHS } from 'configs';
import {clearToken, getRefeshToken, setRefreshToken, setToken} from 'utilities/storage';
import {refreshToken} from "../services/auth";

class AxiosService {
    cancel = {};

    constructor() {
        const service = axios.create({
            baseURL: API_ENDPOINT,
            headers: {
                Accept: 'application/json',
            },
        });
        service.interceptors.request.use(this.handleCancelRequest);
        service.interceptors.request.use(this.handleInterceptRequest);
        service.interceptors.response.use(this.handleSuccess, this.handleError);

        this.service = service;
    }

    setHeader(name, value) {
        this.service.defaults.headers.common[name] = value;
    }

    removeHeader(name) {
        delete this.service.defaults.headers.common[name];
    }

    handleCancelRequest(config){
        let cancelToken = axios.CancelToken.source();
        config.cancelToken = cancelToken.token;
        return config;
    }

    handleInterceptRequest(config) {
        const headerPayload = localStorage.getItem(USER_TOKEN);
        config.headers.Authorization = headerPayload
            ? `Bearer ${headerPayload}`
            : '';
        return config;
    }

    handleSuccess(response) {
        return response;
    }

    handleClearToken(error){
        clearToken();
        // refreshToken()
        message.warn('Phiên đăng nhập đã hết');
        setTimeout(() => {
            window.location = PATHS.LOGIN;
        }, 500);
        return Promise.reject(error);
    }

    handleError = (error) => {
        try {
            if (error?.response?.data?.message)
                message.error(error?.response?.data?.message);

            switch (error.response.status) {
                case 401:
                    if (getRefeshToken()){
                        refreshToken(getRefeshToken()).then(({data}) => {
                            if (data && data.token) {
                                setToken(data.token);
                                setRefreshToken(data.refreshToken);
                                return window.location.reload();
                            }
                        }).catch(err => this.handleClearToken(err));
                    }else this.handleClearToken(error);
                default:
                    return Promise.reject(error);
            }
        } catch (e) {
            return Promise.reject(error);
        }
    };

    async get(endpoint, options) {
        return this.service.get(endpoint, options);
    }

    async post(endpoint, payload, options) {
        return this.service.post(endpoint, payload, options);
    }

    async put(endpoint, payload, options) {
        return this.service.put(endpoint, payload, options);
    }

    async delete(endpoint, options) {
        return this.service.delete(endpoint, options);
    }
}

export default new AxiosService();
