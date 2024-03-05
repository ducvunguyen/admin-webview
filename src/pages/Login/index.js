import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authActions } from 'store/reducers/authSlice';
import { Form, Input, Button, Card, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { PATHS } from 'configs';
import {setToken, getToken, setRefreshToken, getRefeshToken, setScopes, getScopes} from 'utilities/storage';
import {login, refreshToken} from 'services/auth';

import './index.scss';
import { useAuth } from "hooks/useAuth";

const { Content } = Layout;

const Login = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const [] = useState(() => {
    });

    useEffect(() => {
        if (getToken()) return history.push(PATHS.BLANK);

        if (getRefeshToken()){
            refreshToken(getRefeshToken()).then(({data}) => {
                setToken(data.token);
                setRefreshToken(data.refreshToken);
                setScopes(data.scopes);
                history.push(PATHS.DASHBOARD);
            });
        }
        // }
    }, []);

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const {data} = await login(values);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            setScopes(data.scopes);
            document.cookie = `Authorization=Bearer ${data.token}`;

            dispatch(authActions.setUser({ name: 'admin' }));
            // history.push(PATHS.DASHBOARD);
            window.location.href = PATHS.BLANK;
        }  finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="wrap-login">
            <Content className="container-login">
                <Card title="Đăng nhập">
                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email',
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined className="site-form-item-icon" />
                                }
                                autoComplete="off"
                                placeholder="Nhập email"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <LockOutlined className="site-form-item-icon" />
                                }
                                autoComplete="off"
                                type="password"
                                placeholder="Nhập mật khẩu"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="login-form-button"
                                loading={loading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;
