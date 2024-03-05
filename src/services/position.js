import AxiosService from 'utilities/axios';
const prevUrl = 'position';
export const getPositions = ({page, size, sorts, status, ...rest}) => {
    let paramUrl = `?page=${page}&size=${size}&status=${status || ''}`;
    for (let key in rest)
        if (rest[key]) paramUrl += encodeURI(`&${key}=${rest[key]}`);

    if (sorts)
        Object.keys(sorts).forEach(key => {
            if (sorts[key])
                paramUrl += `&sort=${key},${sorts[key]}`;
        });

    return AxiosService.get(`/${prevUrl}${paramUrl}`);
}


export const registerPosition = ({ name, leaders, members, status }) => {
    return AxiosService.post(`/${prevUrl}/register`, { name, leaders, members, status });
};

export const getInfoPositionById = id => {
    return AxiosService.get(`/${prevUrl}/${id}`);
};

export const updatePosition = (id, { name, leaders, members, status }) => {
    return AxiosService.put(`/${prevUrl}/${id}`, { name, leaders, members, status });
};

export const deletePosition = id => {
    return AxiosService.delete(`/${prevUrl}/${id}`);
};
