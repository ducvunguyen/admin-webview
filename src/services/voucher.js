import AxiosService from 'utilities/axios';
const prevUrl = 'voucher-campaign';

export const getListVoucher = ({ page = 0, size = 10, offerId}) => {
    return AxiosService.get(`/${prevUrl}`, {
        params: {
            page,
            size,
            offerId,
            sort: 'createdTime,asc'
        },
    });
};

export const registerVoucher = params =>
    AxiosService.post(`${prevUrl}/register`, params);

export const importVoucher = file =>
    AxiosService.post(`${prevUrl}/read-voucher-template`, file);

export const updateVoucher = (id, params) =>
    AxiosService.put(`${prevUrl}/${id}`, params);

export const deleteVoucher = id =>
    AxiosService.delete(`${prevUrl}/${id}`);

export const getInfoVoucher = id =>
    AxiosService.get(`${prevUrl}/${id}`);

export const removerConditionVoucher = id =>
    AxiosService.delete(`${prevUrl}/${id}`);

export const voucherReport = campaignId =>
    AxiosService.get(`${prevUrl}/voucher-report/${campaignId}`, {responseType: 'blob'});
