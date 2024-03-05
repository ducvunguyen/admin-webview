import AxiosService from 'utilities/axios';

const prevUrl = 'data';

export const categoryViewChart = () =>
    AxiosService.get(`${prevUrl}/category-view`);

export const offerViewChart = type =>
    AxiosService.get(`${prevUrl}/offer-view`, {params: {type}});

export const totalActiveReactListChart = type =>
    AxiosService.get(`${prevUrl}/total-active-react-list`, {params: {type}});

export const dataView = () =>
    AxiosService.get(`${prevUrl}/view`);

export const totalOfferActive = () =>
    AxiosService.get(`${prevUrl}/total-offer-active`);

export const totalActiveReact = () =>
    AxiosService.get(`${prevUrl}/total-active-react`);

export const teamOffer = () =>
    AxiosService.get(`${prevUrl}/team-offer`);