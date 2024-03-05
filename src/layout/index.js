import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Avatar, Dropdown, Menu, Space, Layout, Row, Col } from 'antd';

import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined,
    DownOutlined,
    KeyOutlined,
} from '@ant-design/icons';

import { PATHS } from 'configs';
import {clearToken, getCurrentUser, setCurrentUser} from 'utilities/storage';
import { getToken } from 'utilities/storage';
import {getInfoUser} from "../services/auth";
import ModalChangePassword from "../components/ModalChangePassword";
import SideBar from './components/sidebar';
import ContentLayout from './components/content';
import Notification from './components/notification';

import './style.scss';

const { Header } = Layout;


export default function AppLayout({ children, isOpen }) {
    const history = useHistory();
    const location = useLocation();
    // useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [infoUser, setInfoUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const toggle = () => {
        setCollapsed((prevState) => !prevState);
    };

    const handleLogout = () => {
        clearToken();
        history.push(PATHS.LOGIN);
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span style={{cursor: "pointer"}}
                                 onClick={() => setIsModalVisible(true)}>
                        <Avatar><KeyOutlined /></Avatar>&nbsp; &nbsp;  Đổi mật khẩu</span>,
                    key: '0',
                },
                {
                    label: <span style={{cursor: "pointer"}}
                                 onClick={handleLogout}> <Avatar><LogoutOutlined className="trigger"
                                                           /></Avatar>&nbsp; &nbsp;  Đăng xuất</span>,
                    key: '1',
                },
            ]}
        />
    );

    useEffect(() => {
        if (!getToken())
            return history.push(PATHS.LOGIN);

        if (getCurrentUser()) setInfoUser(getCurrentUser());
        else {
            getInfoUser().then(({data}) => {
                setInfoUser(data);
                setCurrentUser(data);
            }).catch(err => {
                console.log(err);
            }).finally();
        }
    }, [location.pathname]);

    return (
        <div className="navbar-container">
            <Layout className="navbar-content">
                <SideBar collapsed={collapsed} />
                <Layout className="site-layout">
                    <Header
                        className="site-layout-background"
                        style={{ padding: 0 }}
                    >
                        <Row justify="space-between">
                            <Col>
                                {React.createElement(
                                    collapsed
                                        ? MenuUnfoldOutlined
                                        : MenuFoldOutlined,
                                    {
                                        className: 'trigger',
                                        onClick: toggle,
                                    },
                                )}
                            </Col>
                            <Col>
                                <Row>
                                    <Notification />
                                    <Col style={{paddingRight: '1rem'}}>
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <span onClick={e => e.preventDefault()}>
                                                <Space>
                                                    <span style={{cursor: "pointer"}}>{infoUser?.email}</span>
                                                    <DownOutlined />
                                                </Space>
                                            </span>
                                        </Dropdown>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Header>
                    <ContentLayout />
                </Layout>
            </Layout>

            <ModalChangePassword
                isOpen={isModalVisible}
                onClose={() => setIsModalVisible(false)}/>

        </div>
    );
}
