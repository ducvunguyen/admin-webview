import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { MENUS } from '../constans';
import { useHistory } from 'react-router-dom';

import Logo from 'assets/logo.png';
import LogoFull from 'assets/logo-full.png';

const { Sider } = Layout;
const menus = MENUS;

const SideBar = ({collapsed}) => {
    const history = useHistory();
    const [menuActive, setMenuActive] = useState(null);

    const handleClickMenu = (path) => {
        history.push(path);
        setMenuActive(path);
    };

    return <>
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="logo">
                <img src={collapsed ? Logo : LogoFull} alt=""></img>
            </div>
            <Menu theme="dark" mode="inline"
                  defaultOpenKeys={['sub_1', 'sub_2']}
                  selectedKeys={menuActive}
            >
                {menus.map((menu, index) =>
                    menu.canActive && (
                        menu.children ?
                            <Menu.SubMenu
                                key={'sub_' + index}
                                icon={<menu.icon />}
                                title={menu.name}>
                                {
                                    menu.children.map(subMenu =>
                                        subMenu.canActive &&
                                        <Menu.Item
                                            icon={<subMenu.icon />}
                                            onClick={() => handleClickMenu(subMenu.path)}
                                            key={subMenu.path}>
                                            {subMenu.name}
                                        </Menu.Item>
                                    )
                                }

                            </Menu.SubMenu>:
                            <Menu.Item
                                icon={<menu.icon />}
                                onClick={() => handleClickMenu(menu.path)}
                                key={menu.path}>
                                {menu.name}
                            </Menu.Item>
                    )
                )}
            </Menu>
        </Sider>
    </>

}

export default SideBar;