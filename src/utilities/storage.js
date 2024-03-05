import {REFRESH_TOKEN, USER_TOKEN} from 'configs';

export const setItem = (key, value) => {
    window.localStorage.setItem(key, value);
};

export const getItem = (key) => {
    const value = window.localStorage.getItem(key);
    return value === null ? '' : value;
};

export const setToken = (value) => setItem(USER_TOKEN, value);

// export const clearToken = () => window.localStorage.removeItem(USER_TOKEN);
export const clearToken = () => window.localStorage.clear();

export const getToken = () => getItem(USER_TOKEN);

export const setRefreshToken = refeshToken => window.localStorage.setItem(REFRESH_TOKEN, refeshToken);

export const getRefeshToken = () => localStorage.getItem(REFRESH_TOKEN);

export const setScopes = scopes => localStorage.setItem('USER_SCOPES', JSON.stringify(scopes));

export const getScopes = () => {
    const getItem = localStorage.getItem('USER_SCOPES'),
        scopes = getItem ? JSON.parse(localStorage.getItem('USER_SCOPES')) : [];
    return scopes.reduce((a,v) => ({...a, [v]: v}), {});
}

export const getCurrentUser = () => {
    const getItem = localStorage.getItem('CURRENT_USER');
    return getItem ? JSON.parse(getItem) : null;
}

export const setCurrentUser = infoUser => localStorage.setItem('CURRENT_USER', JSON.stringify(infoUser));