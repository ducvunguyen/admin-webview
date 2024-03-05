import { PATHS } from 'configs';
import Login from 'pages/Login';
import Dashboard from 'pages/Dashboard';
import Category from 'pages/Category';
import Offer from 'pages/Offer';

import NotFound from 'pages/404';
import CardComponent from "pages/Card";
import UserComponent from "../pages/User";
import {canActivePermission} from "../utilities/permission";
import { ACTIVE_OFFER, LEADER_APPROVAL, MB_ADMIN, ORGANIZE_OFFER, USER_MANAGEMENT } from '../utilities/constants';
import Organize from '../pages/Organize';
import Voucher from '../pages/Voucher';
import Position from '../pages/Position';
import CollectKV from '../pages/CollectKV';
import Blank from '../pages/Blank';

export let privateRoutes;
privateRoutes = [
    {path: PATHS.DASHBOARD, exact: true, main: Dashboard, canActive: true},
    {path: PATHS.CATEGORIES, exact: true, main: Category, canActive: canActivePermission([ACTIVE_OFFER])},
    {path: PATHS.OFFERS, exact: true, main: Offer, canActive: canActivePermission([MB_ADMIN, ACTIVE_OFFER])},
    {path: PATHS.VOUCHER + ':id', exact: true, main: Voucher, canActive: canActivePermission([MB_ADMIN, ACTIVE_OFFER])},
    {path: PATHS.CARD, exact: true, main: CardComponent, canActive: canActivePermission([ACTIVE_OFFER])},
    {path: PATHS.USER, exact: true, main: UserComponent, canActive: canActivePermission([USER_MANAGEMENT])},
    {path: PATHS.ORGANIZE, exact: true, main: Organize, canActive: canActivePermission([ORGANIZE_OFFER])},
    {path: PATHS.POSITION, exact: true, main: Position, canActive: canActivePermission([USER_MANAGEMENT])},
    {path: PATHS.COLLECT_KV, exact: true, main: CollectKV, canActive: canActivePermission([ACTIVE_OFFER, LEADER_APPROVAL])},
    {path: PATHS.BLANK, exact: true, main: Blank, canActive: true},
];

export const publicRoutes = [
    { path: PATHS.LOGIN, exact: true, main: Login },
    { path: PATHS.NOTFOUND, exact: true, main: NotFound },
];