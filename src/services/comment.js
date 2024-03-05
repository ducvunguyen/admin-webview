import AxiosService from 'utilities/axios';

const prevUrl = 'comment-task';

export const getComments = ({id, page, size, sort = 'createdDate,desc'}) =>
    AxiosService.get(`${prevUrl}/${id}`, {params: { page, size, sort }});

export const registerComments = ({offerId, description, status}) =>
    AxiosService.post(`${prevUrl}/register`, {offerId, description, status});

export const updateComments = (id, {status, description}) =>
    AxiosService.put(`${prevUrl}/${id}`, {status, description});

export const deleteComment = id =>
    AxiosService.delete(`${prevUrl}/${id}`);