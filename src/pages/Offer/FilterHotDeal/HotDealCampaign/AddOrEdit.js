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
    DatePicker,
} from 'antd';
import moment from 'moment';
import { makeId } from 'utilities/functionCommon';
import { VALIDATE_REQUIRED } from 'utilities/constants';
import { offerList } from 'services/offer';
import { registerHotDealCampaigns, updateHotDealCampaigns } from 'services/collectkv';

const { Option } = Select;
const { Text } = Typography;
const listStatus = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'},
];

function AddOrEdit({ isOpen, onClose, infoData }) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        form.setFieldsValue({
            name: infoData?.name || '',
            offerIds: infoData?.offerIds || [],
            status: infoData?.status || 'DEACTIVE',
            startDate: infoData?.startDate ? moment(infoData?.startDate) : null,
            expiredDate: infoData?.expiredDate ? moment(infoData?.expiredDate) : null,
        });
        getALlOffers();

    }, [infoData]);

    const getALlOffers = () => {
        const params = {
            page: 0,
            size: 9999,
            expired: 'ACTIVE_COMING_SOON',
            status: 'ACTIVE'
        };

        offerList(params).then(({data: {offers}}) => {
            setOffers(offers.map(item => {
                return {
                    value: item?.id,
                    // disabled: handleCheckExpireOffer(item),
                    isExpired: handleCheckExpireOffer(item),
                    label: `${item?.title} ${handleCheckExpireOffer(item) ? '(Đã hết hạn hoặc chưa kích hoạt)': ''}`
                }
            }))
        });
    };


    const handleSubmit = async values => {
        if (!values?.startDate || !values?.expiredDate)
            return message.warn('Từ ngày đến ngày bạn đang để trống');

        const startDate = moment(values?.startDate), expiredDate = moment(values?.expiredDate);
        if (startDate.format('X') > expiredDate.format('X'))
            return message.warn('Từ ngày tới ngày đang không đúng mời chọn lại');

        try {
            setLoading(true);
            infoData
                ? await updateHotDealCampaigns(infoData.id, values)
                : await registerHotDealCampaigns(values);
            setLoading(false);
            message.success(
                `${
                    infoData
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            form.resetFields();
            onClose(values.status);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckExpireOffer = item => {
      const currentTime = moment().format('X');
      const expireOffer = moment(item.expiredDate).format('X');
      return expireOffer < currentTime || item.status != 'ACTIVE';
    }

    return (
        <Drawer
            closable={false}
            visible={isOpen}
            onClose={() => onClose(false)}
            width={'65vw'}
            bodyStyle={{ paddingBottom: 80 }}
            title={
                <Space
                    style={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Text strong>
                        {infoData ? 'Cập nhật chiến dịch Hot Deal' : 'Thêm mới chiến Hot Deal'}
                    </Text>
                    <Space>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button
                            onClick={() => {
                                form.submit();
                            }}
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {infoData ? 'Lưu' : 'Tạo'}
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
                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên danh mục"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Input
                                placeholder="Nhập tiêu đề"
                                disabled={loading}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <Form.Item
                            name="offerIds"
                            label="Danh sách ưu đãi"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Select
                                showSearch
                                mode="multiple"
                                placeholder="Chọn danh mục"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')?.toLowerCase().includes(input?.toLowerCase())
                                }
                                options={offers}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12} className='pr-2'>
                        <Form.Item
                            name="startDate"
                            label="Từ ngày"
                        >
                            <DatePicker format='DD/MM/YYYY' style={{width: '100%'}}  />
                        </Form.Item>
                    </Col>
                    <Col span={12} className='pl-2'>
                        <Form.Item
                            name="expiredDate"
                            label="Đến ngày"
                        >
                            <DatePicker format='DD/MM/YYYY' style={{width: '100%'}} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={14}>
                        <Form.Item
                            label="Trạng thái"
                            name="status"
                        >
                            <Select  placeholder="BST KV" disabled={true}>
                                { listStatus.map((item, index) =>
                                    <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;
