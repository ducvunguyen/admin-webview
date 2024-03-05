import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Drawer, Form, Input, Row, Space, Typography, message, Select } from 'antd';
import { master, userRegister, userUpdate } from 'services/user';

import { VALIDATE_EMAIL, VALIDATE_REQUIRED } from 'utilities/constants';
import './style.scss';

const { Text } = Typography;

const AddOrEdit = ({ item, onClose, isOpen }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [masters, setMasters] = useState([]);

    useEffect(() => {
        if (isOpen){
            form.resetFields();
            if (item) {
                const { email, scopes } = item;
                form.setFieldsValue({
                    email,
                    role: scopes,
                });
            }
            initForm();
            getMaster();
        }

    }, [isOpen]);

    const getMaster = () => {
        setLoading(true);
        master().then(({ data }) => setMasters(data)).catch(err =>
            console.log(err)).finally(() => setLoading(false));
    };

    const initForm = () => {
        form.setFieldsValue({
            email: item?.email || '',
            password: item?.password || '',
        });
    };

    const handleSubmit = data => {
        const apiUser = item ? userUpdate(item.id, data) : userRegister(data);
        setLoading(true);
        apiUser.then(() => {
            message.success('Tạo mới người dùng thành công');
            onClose(true);
        }).finally(() => setLoading(false));
    };

    const handleClose = () => onClose(false);

    return (
        <Drawer
            closable={false}
            visible={isOpen}
            onClose={handleClose}
            width={720}
            bodyStyle={{ paddingBottom: 80 }}
            title={
                <Space
                    style={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Text strong>
                        {item ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                    </Text>
                    <Space>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button
                            onClick={() => {
                                form.submit();
                            }}
                            type='primary'
                            htmlType='submit'
                            loading={loading}
                        >
                            {item ? 'Lưu' : 'Tạo'}
                        </Button>
                    </Space>
                </Space>
            }
        >
            <Form
                form={form}
                layout='vertical'
                onFinish={handleSubmit}
                autoComplete='off'
                id={'form-user'}
            >
                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name='email'
                            label='Email'
                            disabled={loading}
                            rules={[VALIDATE_REQUIRED, VALIDATE_EMAIL]}
                        >
                            <Input disabled={item ? true : false} placeholder='Nhập email' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Mật khẩu'
                            name='password'
                            rules={item ? null : [VALIDATE_REQUIRED]}
                            disabled={loading}
                        >
                            <Input.Password disabled={item ? true : false} placeholder='Nhập password' />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name='role'
                            label='Phân quyền'
                            disabled={loading}
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Select
                                mode='multiple'
                                allowClear
                                style={{ width: '100%' }}
                                placeholder='Vui lòng chọn quyền'
                            >
                                {
                                    masters.map((item, index) =>
                                        <Select.Option
                                            key={'role' + index}
                                            value={item}>
                                            {item}
                                        </Select.Option>,
                                    )
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

AddOrEdit.propTypes = {
    item: PropTypes.object,
};

export default AddOrEdit;