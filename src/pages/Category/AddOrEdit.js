import { useState, useEffect } from 'react';
import {
    Drawer,
    Form,
    Button,
    Col,
    Row,
    Input,
    Typography,
    Space,
    Select,
    message,
    Switch,
    InputNumber,
} from 'antd';
import { categoryRegister, updateCategory } from 'services/category';
import {LIST_STATUS} from "utilities/constants";
import { makeId } from 'utilities/functionCommon';
import CardUploadFileImage from 'components/CardUploadFileImage';

const { Option } = Select;
const { Text } = Typography;
const listStatus = LIST_STATUS;

function AddOrEdit({ isOpen, onClose, category }) {
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [logoSrc, setLogoSrc] = useState({
        file: null,
        url: null,
        isValidate: false,
    });

    useEffect(() => {
        form.resetFields();
        if (category) {
            setIsEdit(true);
            form.setFieldsValue({
                name: category.name,
                status: category.status,
                sequence: category.sequence,
                show: category.show
            });
            setLogoSrc({ ...logoSrc, url: category.logoUrl });
        } else {
            form.setFieldsValue({
                status: 'ACTIVE',
            });
            setIsEdit(false);
        }
    }, [isOpen, category]);

    const handleClose = () => {
        form.resetFields();
        setLogoSrc({
            file: null,
            url: null,
            isValidate: false,
        });
        onClose(false);
    };

    const handleSubmit = async values => {
        if (!logoSrc.file && !isEdit)
            return setLogoSrc({ ...logoSrc, isValidate: true });
        try {
            setLoading(true);
            const dataUpload = new FormData();
            if (logoSrc.file) dataUpload.append('logoFile', logoSrc.file);

            Object.keys(values).map(key => dataUpload.append(key, values[key]));

            isEdit
                ? await updateCategory(category.id, dataUpload)
                : await categoryRegister(dataUpload);
            setLoading(false);
            message.success(
                `${
                    isEdit
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            onClose(values.status);
        } finally {
            setLoading(false);
        }
    };

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
                        {isEdit ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}
                    </Text>
                    <Space>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button
                            onClick={() => {
                                form.submit();
                            }}
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {isEdit ? 'Lưu' : 'Tạo'}
                        </Button>
                    </Space>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                id={'form-category'}
            >
                <Row gutter={16}>
                    <Col span={16}>
                        <CardUploadFileImage
                            required={true}
                            dataFile={logoSrc}
                            pzTitle={'Logo (48x48)'}
                            onChange={dataFile => setLogoSrc({...dataFile})}
                        />
                    </Col>
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên danh mục"
                            rules={[
                                {
                                    required: !isEdit,
                                    message: 'Mục này là bắt buộc',
                                },
                            ]}
                        >
                            <Input
                                placeholder="Nhập tiêu đề"
                                disabled={loading}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="sequence"
                            label="Thứ tự hiển thị"
                        >
                            <InputNumber
                                style={{width: '100%'}}
                                placeholder="Nhập thứ tự hiển thị"
                                disabled={loading}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                            >
                                { listStatus.map((item, index) =>
                                    <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12} >
                        <div className='flex'>
                            <span className='relative top-1.5'>Hiển thị</span>
                            &nbsp;
                            &nbsp;

                            <Form.Item
                                name="show"
                                label=""
                            >
                                <Switch defaultChecked={category?.show || false}/>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;
