import AxiosService from 'utilities/axios';

const prevUrl = 'offer';

export const getOffers = ({ page = 0, size = 10, status = '', sorts, ...rest}) => {
    let paramUrl = `?page=${page}&size=${size}&status=${status}`;
    for (let key in rest)
        if (rest[key]) paramUrl += encodeURI(`&${key}=${rest[key]}`);

    if (sorts)
        Object.keys(sorts).forEach(key => {
            if (sorts[key])
                paramUrl += `&sort=${key},${sorts[key]}`;
        });

    return AxiosService.get(`/${prevUrl}${paramUrl}`);
};

export const createCategory = ({ id, status, services }) => {
    return AxiosService.post(`/${prevUrl}`, { id, status, services });
};

export const offerList = ({ page, size, expired, status }) => {
    return AxiosService.get(`/${prevUrl}/list`, {params: { page, size, expired, status }});
};

export const checkExistServiceCode = (code) => {
    return AxiosService.get(`/${prevUrl}/service-code/${code}`);
};

export const deleteOffer = id => {
    return AxiosService.delete(`/${prevUrl}/${id}`);
};

export const getInfoOfferById = id => {
    return AxiosService.get(`/${prevUrl}/${id}`);
}

export const updateOffer = (id, params) => {
    return AxiosService.put(`/${prevUrl}/${id}`, params);
}

export const registerOffer = params => {
    return AxiosService.post(`/${prevUrl}/register`, params);
}

export const activeOffer = arrayOfferIds =>
    AxiosService.post(`/${prevUrl}/active-offer`, arrayOfferIds);

export const readFileExcelTemplateAddress = formData  =>
    AxiosService.post(`/${prevUrl}/read-address-template`, formData);

export const getListAddressById = id  =>
    AxiosService.get(`/${prevUrl}/address-info/${id}`);

export const updateAddress = (id, listAddress) =>
    AxiosService.put(`/${prevUrl}/update-address/${id}`, listAddress);

export const viewByDay = (id, { page = 0, size = 10}) =>
    AxiosService.get(`/${prevUrl}/view-by-day/${id}`, {params: {page, size}});

export const exportExcel = ({startDate, toDate, page, size, sorts, ...rest}) => {
    let paramUrl = `?page=${page}&size=${size}`;
    for (let key in rest)
        if (rest[key]) paramUrl += encodeURI(`&${key}=${rest[key]}`);

    if (sorts)
        Object.keys(sorts).forEach(key => {
            if (sorts[key])
                paramUrl += `&sort=${key},${sorts[key]}`;
        });
    return AxiosService.get(`/${prevUrl}/offer-report/${paramUrl}`, {params: {
            toDate, startDate,
        }, responseType: 'blob'});
}

export const masterCustomType = () =>
    AxiosService.get(`/master/customer-type`);

export const offerCopy = id =>
    AxiosService.post(`/${prevUrl}/copy/${id}`, {});

export const documentRegister = dataUpload =>
    AxiosService.post(`/offer/document/save-or-update`, dataUpload);

export const documentInfo = () =>
    AxiosService.get(`/${prevUrl}/document`);

export const removeDocument = () =>
    AxiosService.delete(`/${prevUrl}/document`);

export const getHotDealFilter = params =>
    AxiosService.get(`/${prevUrl}/hot-deal-filter`, {params});

export const changePriority = id =>
    AxiosService.put(`/${prevUrl}/change-priority/${id}`);

export const hotDealFilterCondition = () =>
    AxiosService.get(`/${prevUrl}/hot-deal-filter/conditions`);

export const hotDealFilterList = () =>
    AxiosService.get(`/${prevUrl}/hot-deal-filter/list`);

export const deleteHotDealFilter = id =>
    AxiosService.delete(`/${prevUrl}/hot-deal-filter/${id}`);

export const getHotDealRank = () =>
    AxiosService.get(`/${prevUrl}/hot-deal-rank`);

export const updateHotDealRank = dataUpload =>
    AxiosService.put(`/${prevUrl}/hot-deal-rank`, dataUpload);

export const updateHotDealRankStatus = id =>
    AxiosService.put(`/${prevUrl}/hot-deal-rank/change-status/${id}`);

export const hotDealFilterOrUpdate = ({id, dataType, fieldName, fromVal, toVal, operator, type}) =>
    AxiosService.post(`/${prevUrl}/hot-deal-filter`, {id, dataType, fieldName, fromVal, toVal, operator, type});
    
export const getDistrict = ({districtType, parentCode }) =>
    AxiosService.get(`/district`, {params: {districtType, parentCode}});
