import {PATHS} from "../configs";
import {
    AppstoreOutlined,
    CreditCardOutlined,
    GiftOutlined,
    UnorderedListOutlined,
    ApartmentOutlined,
    TeamOutlined,
    PicRightOutlined,
    BookOutlined } from "@ant-design/icons";
import {canActivePermission} from "../utilities/permission";
import {
    ACTIVE_OFFER, LEADER_APPROVAL,
    MB_ADMIN,
    ORGANIZE_OFFER,
    USER_MANAGEMENT,
} from '../utilities/constants';

export const MENUS = [
    {
        path: PATHS.DASHBOARD,
        icon: AppstoreOutlined,
        canActive: true,
        name: 'Dashboard',
    },
    {
        path: PATHS.USER,
        icon: TeamOutlined,
        canActive: canActivePermission([USER_MANAGEMENT]),
        name: 'Người dùng',
        children: [
            {
                path: PATHS.USER,
                icon: TeamOutlined,
                canActive: canActivePermission([USER_MANAGEMENT]),
                name: 'Quản lý người dùng',
            },
            {
                path: PATHS.POSITION,
                icon: ApartmentOutlined,
                canActive: canActivePermission([USER_MANAGEMENT]),
                name: 'Teams',
            },
        ]
    },
    {
        path: PATHS.CATEGORIES,
        icon: UnorderedListOutlined,
        canActive: canActivePermission([ACTIVE_OFFER, MB_ADMIN, ORGANIZE_OFFER]),
        name: 'Dữ liệu ưu đãi',
        children: [
            {

                path: PATHS.CATEGORIES,
                icon: UnorderedListOutlined,
                canActive: canActivePermission([ACTIVE_OFFER]),
                name: 'Danh mục',
            },
            {
                path: PATHS.CARD,
                icon: CreditCardOutlined,
                canActive: canActivePermission([ACTIVE_OFFER]),
                name: 'Phương thức ưu đãi',
            },
            {
                path: PATHS.OFFERS,
                icon: GiftOutlined,
                canActive: canActivePermission([MB_ADMIN, ACTIVE_OFFER]),
                name: 'Ưu đãi',
            },
            {
                path: PATHS.ORGANIZE,
                icon: BookOutlined,
                canActive: canActivePermission([ORGANIZE_OFFER]),
                name: 'Quản lý hiển thị',
            },
            {
                path: PATHS.COLLECT_KV,
                icon: PicRightOutlined,
                canActive: canActivePermission([ACTIVE_OFFER, LEADER_APPROVAL]),
                name: 'Quản lý KV',
            },
        ]
    },
];

export const TYPE_COMMENT_TASK = {
    'UPDATE_COMMENT_TASK' : 'comment được cập nhật bởi',
    'NEW_COMMENT_TASK' : 'comment đươc tạo bởi',
    'UPDATED' : 'cập nhật bởi',
    'REGISTER' : 'tạo bởi',
}