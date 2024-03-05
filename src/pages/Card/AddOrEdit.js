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
} from 'antd';
import './style.scss'
import { DEFAULT_OBJECT_FILE, LIST_STATUS, REGEX_PHONE, VALIDATE_REQUIRED } from 'utilities/constants';
import {cardRegister, updateCard} from "services/card";
import CardUploadFileImage from 'components/CardUploadFileImage';

const { Option } = Select;
const { Text } = Typography;
const listStatus = LIST_STATUS;

function AddOrEdit({ isOpen, onClose, infoCard }) {
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [iconFile, setIconFile ] = useState(DEFAULT_OBJECT_FILE);

    useEffect(() => {
        initForm();
        if (infoCard) {
            setIsEdit(true);
            setIconFile({ ...iconFile, url: infoCard.iconUrl });
        } else setIsEdit(false);
    }, [isOpen]);

    const initForm = () => {
        setIconFile(DEFAULT_OBJECT_FILE);
        form.resetFields();
        form.setFieldsValue({
            name: infoCard ? infoCard.name : '',
            status: infoCard ? infoCard.status: 'ACTIVE',
            type: infoCard ? infoCard.type: 'ALL',
            issuer: infoCard ? infoCard.issuer: 'ALL',
            kind: infoCard ? infoCard.kind: 'CARD',
        });
    }

    const handleClose = () => {
        setIconFile({
            file: null,
            url: null,
            isValidate: false,
        });
        onClose(false);
    };

    const handleSubmit = async (values) => {
        if (!iconFile.file && !isEdit)
            return setIconFile({ ...iconFile, isValidate: true });

        try {
            setLoading(true);
            const dataUpload = new FormData();
            if (iconFile.file) dataUpload.append('iconFile', iconFile.file);

            for (let key in values)
                dataUpload.append(key, values[key]);

            isEdit
                ? await updateCard(infoCard.id, dataUpload)
                : await cardRegister(dataUpload);

            setLoading(false);
            message.success(
                `${
                    isEdit
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            onClose(values.status);
        }finally {
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
                        {isEdit ? 'Cập nhật phương thức ưu đãi' : 'Thêm mới phương thức ưu đãi'}
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
                id={'form-card'}
            >
                <Row gutter={16}>
                    <Col span={16}>
                        <CardUploadFileImage
                            required={true}
                            dataFile={iconFile}
                            pzTitle={'Icon'}
                            onChange={dataFile => setIconFile({...dataFile})}
                        />
                    </Col>
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Tên phương thức ưu đãi"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Input
                                placeholder="Nhập tên phương thức ưu đãi"
                                disabled={loading}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="issuer"
                            label="Tổ chức phát hành"
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                            >
                                <Option value={'ALL'}>Tất cả</Option>
                                <Option value={'VISA'}>VISA</Option>
                                <Option value={'JCB'}>JCB</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Loại"
                        >
                            <Select
                                placeholder="Chọn loại"
                                name="type"
                                label="Loại thẻ"
                                // mode="multiple"
                            >
                                <Option value={'ALL'}>Tất cả</Option>
                                <Option value={'CLASSIC'}>CLASSIC</Option>
                                <Option value={'GOLD'}>GOLD</Option>
                                <Option value={'PLATINUM'}>PLATINUM</Option>
                                <Option value={'INFINITE'}>INFINITE</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="kind"
                            label="Hạng"
                        >
                            <Select placeholder="Chọn hạng">
                                <Option value={'CARD'}>Card</Option>
                                <Option value={'APP'}>App</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                        >
                            <Select placeholder="Chọn trạng thái">
                                {
                                    listStatus.map(
                                        (item, index) =>
                                    <Option key={'status' + index}
                                            value={item.value}>{item.name}
                                    </Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;
