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
    DatePicker,
} from 'antd';
import { ACTIVE_OFFER, DEFAULT_OBJECT_FILE, LEADER_APPROVAL, VALIDATE_REQUIRED } from 'utilities/constants';
import { makeId } from 'utilities/functionCommon';
import CardUploadFileIcon from 'components/CardUploadFileIcon';
import { offerList } from 'services/offer';
import { registerKv, updateKv } from 'services/collectkv';
import moment from 'moment';
import { canActivePermission } from 'utilities/permission';

const { Option } = Select;
const { Text } = Typography;
const listStatus = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Chờ duyệt', value: 'PENDING'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'}
];

function AddOrEdit({ isOpen, onClose, infoKv }) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [thumbnail, seThumbnail] = useState(DEFAULT_OBJECT_FILE);
    const [imgPopup, setImgPopup] = useState(DEFAULT_OBJECT_FILE);
    const [offers, setOffers] = useState([]);
    const [type, setType] = useState('GALLERY_KV');
    const [showSearch, setShowSearch] = useState(false);
    const [popupShow, setPopupShow] = useState(false);

    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);
    const perLeaderApproval = canActivePermission([LEADER_APPROVAL]);

    useEffect(() => {
        if (isOpen){
            form.resetFields();
            seThumbnail(DEFAULT_OBJECT_FILE);
            setImgPopup(DEFAULT_OBJECT_FILE);
            form.setFieldsValue({
                name: infoKv?.name || '',
                offerIds: infoKv?.offerIds || [],
                searchShow: infoKv?.searchShow || false,
                popupShow: infoKv?.popupShow || false,
                type: infoKv?.type || 'GALLERY_KV',
                status: infoKv?.status || (perActiveOffer ? 'ACTIVE' : 'PENDING'),
                startDate: infoKv?.startDate ? moment(infoKv?.startDate) : null,
                expiredDate: infoKv?.expiredDate ? moment(infoKv?.expiredDate) : null,
            });

            setShowSearch(infoKv?.searchShow || false);
            setPopupShow(infoKv?.popupShow || false);
            if (infoKv) {
                setType(infoKv?.type);
                seThumbnail({ ...thumbnail, url: infoKv?.thumbnailUrl });
                setImgPopup({ ...imgPopup, url: infoKv?.popupUrl });
            }
        }
    }, [infoKv, isOpen]);

    useEffect(() => {
        getALlOffers();
    }, [])

    const getALlOffers = () => {
        const params = {
            page: 0,
            size: 9999,
            expired: 'ACTIVE_COMING_SOON',
            status: 'ACTIVE'
        };

        if (infoKv){
            delete params.status;
            delete params.expired;
        }
        offerList(params).then(({data: {offers, totalPage}}) => {
            setOffers(data => data.concat(offers.map(item => {
                return {
                    value: item?.id,
                    // disabled: handleCheckExpireOffer(item),
                    isExpired: handleCheckExpireOffer(item),
                    label: `${item?.title} ${handleCheckExpireOffer(item) ? '(Đã hết hạn hoặc chưa kích hoạt)': ''}`
                }
            })))
        });
    };


    const handleSubmit = async values => {
        if (!values?.startDate || !values?.expiredDate)
            return message.warn('Từ ngày đến ngày bạn đang để trống');

        const startDate = moment(values?.startDate), expiredDate = moment(values?.expiredDate);
        if (startDate.format('X') > expiredDate.format('X'))
            return message.warn('Từ ngày tới ngày đang không đúng mời chọn lại');

        let isValidateFile = false;
        if (type === 'POPUP_OFFER') {
            const offer = offers.find(item => item.value === values?.offerIds);
            if (offer && offer.isExpired)
                return message.warn('Ưu đãi đã hết hạn!')
        }

        if (type === 'GALLERY_KV' && !thumbnail.file && !infoKv){
            isValidateFile = true;
            seThumbnail({ ...thumbnail, isValidate: true });
        }

        if (!imgPopup.file && !infoKv){
            isValidateFile = true;
            setImgPopup({ ...imgPopup, isValidate: true });
        }

        if (isValidateFile) return;

        try {
            setLoading(true);
            const dataUpload = new FormData();
            if (thumbnail.file) dataUpload.append('thumbnailFile', thumbnail.file);
            if (imgPopup.file) dataUpload.append('popupFile ', imgPopup.file);

            Object.keys(values).map(key => {
                if (key == 'startDate' || key == 'expiredDate')
                    dataUpload.append(key, moment(values[key]).format());
                else
                    dataUpload.append(key, values[key])
            });

            infoKv
                ? await updateKv(infoKv.id, dataUpload)
                : await registerKv(dataUpload);
            setLoading(false);
            message.success(
                `${
                    infoKv
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

    const handleChangeTpe = value => {
        setType(value);
        if (value === 'GALLERY_KV')
            form.setFieldsValue({ offerIds: [] });
        else {
            setShowSearch(false);
            setPopupShow(false);
            form.setFieldsValue({offerIds: null, searchShow: false});
        }
    }

    const handleCheckExpireOffer = item => {
      const currentTime = moment().format('X');
      const expireOffer = moment(item.expiredDate).format('X');
      return expireOffer < currentTime || item.status != 'ACTIVE';
    }

    const handleClose= () => onClose(false);

    if(!isOpen)
        return null;

    return (
        <Drawer
            closable={false}
            visible={isOpen}
            onClose={handleClose}
            width={'65vw'}
            bodyStyle={{ paddingBottom: 80 }}
            title={
                <Space className='justify-between w-full'>
                    <Text strong>
                        {infoKv ? 'Cập nhật bộ sưu tập KV' : 'Thêm mới bộ sưu tập KV'}
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
                            {infoKv ? 'Lưu' : 'Tạo'}
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
                    <Col span={14}>
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

                        <Form.Item
                            label='Phân loại'
                            name="type"
                        >
                            <Select placeholder="Chọn KV" onChange={handleChangeTpe}>
                                <Option key={makeId(60)} value='GALLERY_KV'>KV</Option>
                                <Option key={makeId(60)} value='POPUP_OFFER'>Ưu đãi</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="offerIds"
                            label="Danh sách ưu đãi"
                            rules={[
                                {
                                    required: true,
                                    message: 'Mục này là bắt buộc',
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                mode={type === 'GALLERY_KV' ? 'multiple' : ''}
                                placeholder="Chọn danh mục"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '')?.toLowerCase().includes(input?.toLowerCase())
                                }
                                options={offers}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <div className='pl-7'>
                            <CardUploadFileIcon
                                width='100px'
                                height='auto'
                                required={type === 'GALLERY_KV'}
                                pzTitle='Ảnh thumbnail (1200x600)'
                                dataFile={thumbnail}
                                onChangeFile={dataFile => seThumbnail({...dataFile})}
                            />
                        </div>

                        <div className='pl-7 mt-4'>
                            <CardUploadFileIcon
                                width='100px'
                                height='auto'
                                required={true}
                                pzTitle='Ảnh popup (900x900)'
                                dataFile={imgPopup}
                                onChangeFile={dataFile => setImgPopup({...dataFile})}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={12} className='pr-2'>
                        <Form.Item
                            name="startDate"
                            label="Từ ngày"
                        >
                            <DatePicker format='DD/MM/YYYY' className='w-full'  />
                        </Form.Item>
                    </Col>
                    <Col span={12} className='pl-2'>
                        <Form.Item
                            name="expiredDate"
                            label="Đến ngày"
                        >
                            <DatePicker format='DD/MM/YYYY' className='w-full' />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={14}>
                        <div className='flex'>
                            <span className='relative top-1.5'>Hiển thị popup</span>
                            &nbsp;
                            &nbsp;

                            <Form.Item
                                name="popupShow"
                            >
                                <Switch
                                    checked={popupShow}
                                    onChange={() => setPopupShow(!popupShow)}
                                    defaultChecked={infoKv?.popupShow || false}
                                    disabled={!infoKv || !perActiveOffer}/>
                            </Form.Item>
                        </div>

                        <div className='flex'>
                            <span className='relative top-1.5'>Hiện thị thanh tìm kiếm</span>
                            &nbsp;
                            &nbsp;

                            <Form.Item
                                name="searchShow"
                                label=""
                            >
                                <Switch checked={showSearch}
                                        onChange={() => setShowSearch(!showSearch)}
                                        disabled={!infoKv || type === 'POPUP_OFFER' || !perActiveOffer}/>
                            </Form.Item>
                        </div>

                        <div className='flex'>
                            <span className='relative top-1.5'>Trạng thái</span>
                            &nbsp;
                            &nbsp;
                            <Form.Item
                                name="status"
                            >
                                <Select placeholder="BST KV" disabled={!perActiveOffer && perLeaderApproval}>
                                    { listStatus.map((item, index) =>
                                        <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;
