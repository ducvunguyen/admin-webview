import {getScopes} from "../utilities/storage";

export const canActivePermission = data => {
    let isPermission = false;
    data.forEach(permission => getScopes()[permission] ? isPermission = true : null);
    return isPermission;
}
