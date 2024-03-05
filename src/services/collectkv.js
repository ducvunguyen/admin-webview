import AxiosService from 'utilities/axios';

const prevUrl = 'gallery';

export const getKvs = ({id, page, size, status = 'ACTIVE'}) =>
    AxiosService.get(`${prevUrl}`, {params: { page, size, status }});

export const removerKv = id =>
    AxiosService.delete(`${prevUrl}/${id}`);

export const updateKv = (id, dataUpload) =>
    AxiosService.put(`${prevUrl}/${id}`, dataUpload);

export const registerKv = dataUpload =>
    AxiosService.post(`${prevUrl}/register`, dataUpload);

export const hotDealCampaigns = ({page, size, status}) =>
    AxiosService.get(`hot-deal-campaign`, {params: {page, size, status}});

export const registerHotDealCampaigns = dataUpload =>
    AxiosService.post(`hot-deal-campaign/register`, dataUpload);

export const updateHotDealCampaigns = (id, dataUpload) =>
    AxiosService.put(`hot-deal-campaign/${id}`, dataUpload);

export const deleteHotDealCampaigns = id =>
    AxiosService.delete(`hot-deal-campaign/${id}`);

export const changeStatusHotDealCampaigns = (id, status) =>
    AxiosService.put(`hot-deal-campaign/change-status/${id}?status=${status}`);