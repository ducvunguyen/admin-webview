import {Spin, message, Button, Input, Form, Modal} from 'antd';
import {changePassword} from "../services/user";
import { useEffect, useState } from 'react';

export const ModalChangePassword = ({onClose, isOpen}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.resetFields();
    }, [isOpen])

    const onFinish = data => {
        if (data.password.trim() !== data.confirmPassword.trim())
            return message.warn('Nhập lại mật khẩu không khớp')

        setLoading(true);
        changePassword(data).then(res => {
            message.success('Đổi mật khẩu thành công');
            onClose(true);
        }).catch(({response}) =>
            message.error(response.data.message)
        ).finally(() => setLoading(false));
    }

    const onFinishFailed = () => {}

    return <Modal title="Đổi mật khẩu"
                  footer={null}
                  visible={isOpen}
                  onOk={() => onClose(false)}
                  onCancel={() => onClose(false)}>
        <Form
            form={form}
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Spin spinning={loading}>
                <Form.Item
                    label="Mật khẩu cũ"
                    name="oldPassword"
                    validateTrigger={['onChange']}
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mật khẩu',
                        }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu cũ" />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu mới"
                    name="password"
                    validateTrigger={['onChange']}
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mật khẩu mới',
                        },
                        {
                            min: 6,
                            message: 'Mật khẩu ít nhất 6 ký tự',
                        },
                        {
                            max: 32,
                            message: 'Mật khẩu không nhiều hơn 32 ký tự',
                        },
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới"/>
                </Form.Item>

                <Form.Item
                    label="Nhập lại mật khẩu"
                    name="confirmPassword"
                    validateTrigger={['onChange']}
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập lại mật khẩu',
                        },
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu"/>
                </Form.Item>


                <Form.Item
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Spin>
        </Form>
    </Modal>
}

export default ModalChangePassword;