import AxiosService from 'utilities/axios';
const prevUrl = 'notification';

export const notificationList = ({ page = 0, size = 5}) => {
    return AxiosService.get(`/${prevUrl}`, {
        params: {
            page,
            size,
            sort: 'createdDate,desc',
            visited: false
        },
    });
};

export const countNotification = () =>
    AxiosService.get(`/${prevUrl}/count-offer-pending`);

export const visitedNotification = id =>
    AxiosService.put(`/${prevUrl}/visited/${id}`);

export const unvisitedNotification = () =>
    AxiosService.get(`/${prevUrl}/count-notification-unvisited`);