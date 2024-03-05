import AxiosService from 'utilities/axios';

const prevUrl = 'organize-offer';

export const getOrganizeOffer = () => AxiosService.get(`${prevUrl}`);

export const columnSetting = () => AxiosService.get(`master/column-setting`);;

export const storeOrganizeOffer = ({column, sort, categoryId, categoryName, sortConditionDTOs}) => AxiosService.post(`${prevUrl}`,
    {column, sort, categoryId, categoryName, sortConditionDTOs});

export const updateOrganizeOffer = (id, {column, sort, categoryId, categoryName, sortConditionDTOs}) => AxiosService.put(`${prevUrl}/${id}`,
    {column, sort, categoryId, categoryName, sortConditionDTOs});

export const deleteOrganizeOffer = id => AxiosService.delete(`${prevUrl}/${id}`);