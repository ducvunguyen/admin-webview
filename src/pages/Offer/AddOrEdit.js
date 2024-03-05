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
    Spin, Collapse,
    InputNumber,
    Switch, Modal,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as PropTypes from 'prop-types';

import './style.scss';
import moment from 'moment';
import { masterCustomType, registerOffer, updateOffer } from 'services/offer';
import {
    CARD_OFFER,
    DEFAULT_OBJECT_FILE,
    LIST_STATUS_OFFER,
    TOOL_BAR,
    VALIDATE_LINK,
    VALIDATE_MAX_LENGTH_200,
    VALIDATE_NUMBER,
    VALIDATE_REQUIRED,
} from 'utilities/constants';
import { getScopes } from "utilities/storage";
import { filterSelectAnt, makeId } from 'utilities/functionCommon';
import useCard from 'hooks/useCard';
import useCategory from 'hooks/useCategory';

import CardUploadFileImage from 'components/CardUploadFileImage';
import CardUploadFileIcon from 'components/CardUploadFileIcon';

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

RangePicker.propTypes = { format: PropTypes.string };

function AddOrEdit({ isOpen, onClose, offer, isCopy }) {
    const [form] = Form.useForm();
    const cards = useCard();
    const categories = useCategory();

    const scopeActiveOffer = getScopes()['ACTIVE_OFFER'];

    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [thumbnailSrc, setThumbnailSrc] = useState(null);
    const [bannerSrc, setBannerSrc] = useState(null);
    const [myVoucherSrc, setMyVoucherSrc] = useState(null);
    const [logoSrc, setLogoSrc] = useState(null);
    const [hotDealSrc, setHotDealSrc] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [listMasterType, setListMasterType] = useState({});
    const [dataCardType, setDataCardType] = useState([]);
    const [dataCardClass, setDataCardClass] = useState([]);
    const [isUpdateFileMyVoucher, setIsUpdateFileMyVoucher] = useState(false);

    useEffect(() => {
        initForm(offer);

        if (offer) {
            setIsEdit(true);
        } else {
            setIsEdit(false);
        }
    }, [isOpen, offer]);

    useEffect(() => {
        getMasterType();
    }, [])

    const getMasterType = () =>
        masterCustomType().then(({data}) => setListMasterType({...data})).catch().finally();

    const initForm = (values) => {
        setThumbnailSrc(DEFAULT_OBJECT_FILE);
        setBannerSrc(DEFAULT_OBJECT_FILE);
        setLogoSrc(DEFAULT_OBJECT_FILE);
        setHotDealSrc(DEFAULT_OBJECT_FILE);
        setMyVoucherSrc(DEFAULT_OBJECT_FILE);
        form.resetFields();
        const customerType = values?.customerType ?
            values?.customerType.map(item => String(item)) : ['3'];

        form.setFieldsValue({
            title: values?.title || '',
            ownerName: values?.ownerName || '',
            description: values?.description || '',
            priority: values ? values.priority : false,
            conditions: values ? values.conditions : [''],
            time: [
                values ? moment(values.startDate) : '',
                values ? moment(values.expiredDate) : '',
            ],
            categoryId: values?.categories?.map(item => item.id) || [],
            address: values?.address || '',
            cardId: values?.cardId || [],
            status: values?.status || 'PENDING',
            longitude: values?.longitude || '',
            latitude: values?.latitude || '',
            phoneNumber: values?.phoneNumber || '',
            // addressList: values ? values.addressList : '',
            totalAddress: values?.totalAddress || '',
            coverageDescription: values?.coverageDescription || '',
            maxOffer: values?.maxOffer || '',
            linkWeb: values?.linkWeb || '',
            addressLink: values?.addressLink || '',
            detailLink: values?.detailLink || '',
            sequence: values?.sequence,
            useMethod: values?.useMethod || '',
            // hotline: values?.hotline || '',
            customerType,
            shortDescription: values?.shortDescription || '',
            cardRatings: values?.cardRatings || [{}]
        });

        if (values) {
            setLogoSrc({...logoSrc, url: values?.logoUrl});
            setBannerSrc({...bannerSrc, url: values?.bannerUrl});
            setThumbnailSrc({...thumbnailSrc, url: values?.thumbnailUrl});
            setHotDealSrc({...hotDealSrc, url: values?.hotDealUrl});
            setMyVoucherSrc({...myVoucherSrc, url: values?.myVoucherUrl});
            const dataType = [], dataClass = [];
            values?.cardRatings?.map(item => {
                dataType.push(item?.issuers ? CARD_OFFER[item.issuers]: {});
                dataClass.push(item.cardType ? CARD_OFFER[item.issuers][item.cardType] : []);
            });
            setDataCardClass(dataClass);
            setDataCardType(dataType);
        }
    };

    const handleClose = () => onClose(false);

    const handleSaveData = async values => {

        setIsModalVisible(false);
        if (!values.conditions || values.conditions.length === 0)
            return message.warning('Bạn Cần Có Điều Kiện Áp Dụng');

        if (checkIssetFile())
            return ;

        setLoading(true);
        try {
            const dataUpload = new FormData();
            for (let key in values) {
                switch (key) {
                    case 'time':
                        dataUpload.append('startDate', moment(values.time[0]).format());
                        dataUpload.append('expiredDate', moment(values.time[1]).format());
                        break;
                    case 'cardRatings':
                        values.cardRatings.forEach(item =>
                            dataUpload.append(key, encodeURIComponent(JSON.stringify(item)))
                        );
                        break;
                    case 'maxOffer':
                        dataUpload.append(key, values[key] || '')
                        break;
                    default:
                        if (values[key] instanceof  Array)
                            values[key].map((item) => dataUpload.append(key, encodeURIComponent(item)));
                        else if (key !== 'sequence')
                            dataUpload.append(key, values[key]);
                        else dataUpload.append(key, values[key] || 99999);
                        break;
                }
            }

            if (logoSrc.file)
                dataUpload.append('logoFile ', logoSrc.file);

            if (bannerSrc.file)
                dataUpload.append('bannerFile  ', bannerSrc.file);

            if (thumbnailSrc.file)
                dataUpload.append('thumbnailFile  ', thumbnailSrc.file);

            if (hotDealSrc.file)
                dataUpload.append('hotDealFile', hotDealSrc.file);

            if (myVoucherSrc.file)
                dataUpload.append('myVoucherFile', myVoucherSrc.file || '');


            dataUpload.append('myVoucherUrlEmpty', isUpdateFileMyVoucher);


            (isEdit && !isCopy)
                ? await updateOffer(offer.id, dataUpload)
                : await registerOffer(dataUpload);

            message.success(
                `${
                    isCopy ? 'Sao chép thành công' : isEdit
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            onClose(values.status);
        } finally {
            setLoading(false);
        }
    }

    const onFinishFailed = errorInfo => {
        if (errorInfo.errorFields && errorInfo.errorFields.length > 0)
            message.warning(`Có ${errorInfo.errorFields.length} trường bạn cần bắt buộc cần nhập lại hoăc không đúng định dạng yêu cầu`);

        checkIssetFile();
    }

    const checkIssetFile = () => {
        if (
            !offer &&
            (!logoSrc.file || !bannerSrc.file || !thumbnailSrc.file || !myVoucherSrc.file || !hotDealSrc.file)
        ) {
            setLogoSrc({ ...logoSrc, isValidate: true });
            setBannerSrc({ ...bannerSrc, isValidate: true });
            setThumbnailSrc({ ...thumbnailSrc, isValidate: true });
            setHotDealSrc({ ...thumbnailSrc, isValidate: true });
            setMyVoucherSrc({ ...thumbnailSrc, isValidate: true });
            return true;
        }

        return false;
    }

    const handleChangeRankCard = (name, index) => value => {
        const cloneDataType = [...dataCardType];
        const cloneDataClass = [...dataCardClass];

        const cardRatings = form.getFieldValue('cardRatings');
        if(name == 'issuers'){
            cloneDataType[index] = CARD_OFFER[value];
            cloneDataClass[index] = [];
            setDataCardType(cloneDataType);
            setDataCardClass(cloneDataClass);
            cardRatings[index].cardType = null;
            cardRatings[index].cardClass = null;
            form.setFieldsValue({ cardRatings });
        }

        if (name === 'cardType'){
            cloneDataClass[index] = CARD_OFFER[cardRatings[index].issuers][value];
            setDataCardClass(cloneDataClass);
            cardRatings[index].cardClass = null;
            form.setFieldsValue({ cardRatings })
        }
    }

    const openModal = () => setIsModalVisible(true);

    return (
        <>
            <Drawer
                closable={false}
                visible={isOpen}
                onClose={handleClose}
                width={'60vw'}
                bodyStyle={{ paddingBottom: 80 }}
                title={
                    <Space className='justify-between w-full'>
                        <Text strong>
                            { isCopy ? 'Sao chép ưu đãi' : isEdit ? 'Cập nhật ưu đãi' : 'Thêm mới ưu đãi'}
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
                                {isCopy ? 'Sao chép' : isEdit ? 'Lưu' : 'Tạo'}
                            </Button>
                        </Space>
                    </Space>
                }
            >
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinishFailed={onFinishFailed}
                        onFinish={scopeActiveOffer ? handleSaveData : openModal}
                        autoComplete="off"
                        id={'form-offer'}
                    >
                        <Row gutter={16}>
                            <Col span={16}>
                                <CardUploadFileImage
                                    required={true}
                                    onChange={file => setBannerSrc({...file})}
                                    dataFile={bannerSrc}
                                    maxSize={204800}
                                    pzTitle={'Ảnh banner (1920x1080)'}
                                />
                                <br/>
                                <CardUploadFileImage
                                    onChange={file => {
                                        setMyVoucherSrc({...file});
                                        setIsUpdateFileMyVoucher(file.file ? false : true)
                                    }}
                                    dataFile={myVoucherSrc}
                                    required={true}
                                    maxSize={204800}
                                    // isClear={true}
                                    pzTitle={'Ảnh banner cho My Voucher (1700*500)'}
                                />
                            </Col>
                            <Col span={8}>
                                {
                                    <>
                                        <CardUploadFileIcon
                                            required={true}
                                            pzTitle='Ảnh thumbnail (1284x1024)'
                                            dataFile={thumbnailSrc}
                                            maxSize={204800}
                                            onChangeFile={file => setThumbnailSrc({...file})}
                                        />
                                        <br />
                                        <div className={'mt-4'}>
                                            <CardUploadFileIcon
                                                required={true}
                                                pzTitle='Ảnh logo (900x900)'
                                                dataFile={logoSrc}
                                                maxSize={204800}
                                                onChangeFile={file => setLogoSrc({...file})}
                                            />
                                        </div>
                                        <br />
                                        <div className={'mt-4'}>
                                            <CardUploadFileIcon
                                                required={true}
                                                pzTitle='Hot deal thumbnail (1200x600)'
                                                dataFile={hotDealSrc}
                                                maxSize={204800}
                                                onChangeFile={file => setHotDealSrc({...file})}
                                            />
                                        </div>
                                    </>
                                }
                            </Col>
                        </Row>
                        <Row gutter={16} className={'mt-4'}>
                            <Col span={12}>
                                <Form.Item
                                    name="title"
                                    label="Tiêu đề"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED, VALIDATE_MAX_LENGTH_200]}
                                >
                                    <Input
                                        placeholder="Nhập tiêu đề"
                                        disabled={loading}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="categoryId"
                                    label="Danh mục"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <Select placeholder="Chọn danh mục"
                                            mode="multiple"
                                            filterOption={(input, option) =>
                                                filterSelectAnt({input, option})}
                                            allowClear>
                                        {categories.map((item, index) => (
                                            <Option key={'category'+index} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} className={'mt-4'}>
                            <Col span={12}>
                                <Form.Item
                                    name="ownerName"
                                    label="Thương hiệu"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <Input
                                        placeholder="Nhập thương hiệu"
                                        disabled={loading}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="time"
                                    label="Thời gian áp dụng"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <RangePicker format={'DD/MM/YYYY'} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16} className={'mt-4'}>
                            <Col span={12}>
                                <Form.Item
                                    name="cardId"
                                    label="Phương thức ưu đãi"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <Select
                                        mode="multiple"
                                        className='w-full'
                                        placeholder="Chọn thẻ ưu đãi"
                                        allowClear
                                    >
                                        {
                                            cards.map((item, index) =>
                                                <Option key={'card'+index} value={item.id} >
                                                    <div className="demo-option-label-item">
                                                    <span role="img" aria-label="China">
                                                     {item.name}
                                                    </span>
                                                    </div>
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="customerType"
                                    label="Tệp khách hàng"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <Select
                                        mode="multiple"
                                        className='w-full'
                                        placeholder="Chọn tệp khách hàng"
                                        allowClear
                                    >
                                        {
                                            Object.keys(listMasterType).map(keyIndex =>
                                                <Option key={keyIndex + '-master-type'} value={keyIndex} >
                                                    <div className="demo-option-label-item">
                                                    <span role="img" >
                                                     {listMasterType[keyIndex]}
                                                    </span>
                                                    </div>
                                                </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <table className='mt-1 table-custom'>
                                <thead>
                                <tr>
                                    <th >Tổ chức phát hành</th>
                                    <th >Loại thẻ</th>
                                    <th >Hạng thẻ</th>
                                </tr>
                                </thead>
                                <tbody>
                                <Form.List name='cardRatings'>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {
                                                fields.map(({ key, name, ...restField }) => (
                                                    <tr key={'cardRatings'  + name}>
                                                        <td className='pt-2.5'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'issuers']}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                            >
                                                                <Select
                                                                    onChange={handleChangeRankCard('issuers', name)}
                                                                    className='w-full'
                                                                    placeholder="Tổ chức phát hành"
                                                                    allowClear
                                                                    options={Object.keys(CARD_OFFER).map(item => {
                                                                        return {value: item, label: item}
                                                                    })}

                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        <td className='pt-2.5'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'cardType']}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                            >
                                                                <Select
                                                                    onChange={handleChangeRankCard('cardType', name)}
                                                                    className='w-full'
                                                                    placeholder="Loại thẻ"
                                                                    allowClear
                                                                    options={ dataCardType[name] &&
                                                                        Object.keys(dataCardType[name]).map(item => {
                                                                        return {value: item, label: item}
                                                                    })}
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        <td className='pt-2.5'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'cardClass']}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                            >
                                                                <Select
                                                                    className='w-full'
                                                                    placeholder="Hạng thẻ"
                                                                    allowClear
                                                                    options={
                                                                        dataCardClass[name] && dataCardClass[name].map(item => {
                                                                        return {value: item, label: item}
                                                                    })}
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        {
                                                            fields.length > 1 &&
                                                            <td className="text-center">
                                                                <span className='relative bottom-3 '>
                                                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                                                </span>
                                                            </td>
                                                        }

                                                    </tr>
                                                ))
                                            }

                                            {fields.length === 0 &&
                                                <tr key={makeId(60)}>
                                                    <td colSpan={8}
                                                        className='text-align-center p-7'>
                                                        Chưa có dữ liệu
                                                    </td>
                                                </tr>
                                            }

                                            <tr>
                                                <td colSpan={8} className='pt-1 border-none'>
                                                    <Form.Item>
                                                        <Button disabled={fields.length > 1} type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                                            Thêm
                                                        </Button>
                                                    </Form.Item>
                                                </td>
                                            </tr>
                                        </>

                                    )}
                                </Form.List>
                                </tbody>
                            </table>

                        </Row>
                        <Row gutter={16} className="mt-4">
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="Mô tả (Chi tiết Ưu đãi)"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <CKEditor
                                        editor={ ClassicEditor }
                                        onChange={ ( event, editor ) => {
                                            const description = editor.getData();
                                            form.setFieldsValue({ description });
                                        } }
                                        data={offer?.description || ''}
                                        config={ TOOL_BAR }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} className="mt-4">
                            <Col span={24}>
                                <Form.Item
                                    name="shortDescription"
                                    label="Mô tả ngắn"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_REQUIRED]}
                                >
                                    <CKEditor
                                        editor={ ClassicEditor }
                                        onChange={ ( event, editor ) => {
                                            const shortDescription = editor.getData();
                                            form.setFieldsValue({ shortDescription });
                                        } }
                                        data={offer?.shortDescription || ''}
                                        config={ TOOL_BAR }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <div>
                                    <Form.Item
                                        name="useMethod"
                                        label="Hướng dẫn sử dụng"
                                    >
                                        <CKEditor
                                            editor={ ClassicEditor }
                                            onChange={ ( event, editor ) => {
                                                const useMethod = editor.getData();
                                                form.setFieldsValue({ useMethod });
                                            } }
                                            data={offer?.useMethod || ''}
                                            config={ TOOL_BAR  }
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </Row>


                        <Row gutter={16}>
                            <Col span={24}>
                                <Collapse defaultActiveKey={['1']} >
                                    <Collapse.Panel header={
                                        <span >
                                            {
                                                !isEdit ? <>
                                                    <span className="text-danger">*</span>
                                                    &nbsp;
                                                </> : null
                                            }
                                            Điều kiện áp dụng
                                        </span>
                                    } key="1">
                                        <Form.List name="conditions">
                                            {(fields, { add, remove }, { errors }) => (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <Form.Item
                                                            required={!isEdit}
                                                            key={field.key}
                                                        >
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={[
                                                                    'onChange',
                                                                    'onBlur',
                                                                ]}
                                                                rules={[VALIDATE_REQUIRED]}
                                                                noStyle
                                                            >
                                                                <div className="flex items-center w-11/12" data-id={index}>
                                                                    <CKEditor
                                                                        editor={ ClassicEditor }
                                                                        data={offer?.conditions[field.key] || ''}
                                                                        config={ TOOL_BAR  }
                                                                        onChange={ ( event, editor ) => {
                                                                            const data = editor.getData();
                                                                            let conditions = form.getFieldValue('conditions');
                                                                            conditions[index] = data;
                                                                            form.setFieldsValue({ ...conditions });
                                                                        } }
                                                                    />

                                                                    {fields.length > 1  &&
                                                                        <Button
                                                                            htmlType='button'
                                                                            type='primary'
                                                                            className='ml-2'
                                                                            danger
                                                                            onClick={() => remove(field.name)}>
                                                                            <MinusCircleOutlined/>
                                                                        </Button>
                                                                    }
                                                                </div>
                                                            </Form.Item>
                                                        </Form.Item>

                                                    ))}
                                                    <Form.Item>
                                                        <Button
                                                            type="dashed"
                                                            onClick={() => add()}
                                                            icon={<PlusOutlined />}
                                                        >
                                                            Thêm điều kiện
                                                        </Button>
                                                        <Form.ErrorList errors={errors} />
                                                    </Form.Item>
                                                </>
                                            )}
                                        </Form.List>
                                    </Collapse.Panel>
                                </Collapse>
                            </Col>
                        </Row>

                        {/*<Row gutter={16} className={'mt-4'}>*/}
                        {/*    <Col span={24}>*/}
                        {/*        <Form.Item*/}
                        {/*            name="phoneNumber"*/}
                        {/*            label="Hotline"*/}
                        {/*            validateTrigger={['onChange', 'onBlur']}*/}
                        {/*            rules={VALIDATE_PHONE}*/}
                        {/*        >*/}
                        {/*            <Input*/}
                        {/*                placeholder="Nhập số hotline"*/}
                        {/*                disabled={loading}*/}
                        {/*            />*/}
                        {/*        </Form.Item>*/}
                        {/*    </Col>*/}
                        {/*</Row>*/}

                        <Row gutter={16} className={'mt-4'}>
                            <Col span={24}>
                                <Form.Item
                                    name="totalAddress"
                                    label="Số lượng cơ sở"
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[VALIDATE_NUMBER]}
                                >
                                    <InputNumber
                                        max={9999}
                                        placeholder="Nhập số lượng cơ sở"
                                        disabled={loading}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16} className={'mt-4'}>
                            <Col span={24}>
                                <Form.Item
                                    name="coverageDescription"
                                    label="Mô tả độ phủ"
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <TextArea
                                        allowClear={true}
                                        placeholder="Nhập mô tả độ phủ"
                                        autoSize={{ minRows: 2 }}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <div>
                                    <Form.Item
                                        name="maxOffer"
                                        label="Mức độ ưu đãi cao nhất"
                                        >
                                        <InputNumber
                                            placeholder="Nhập Mức độ ưu đãi cao nhất"
                                            min={0}
                                            max={100}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <div>
                                    <Form.Item
                                        name="linkWeb"
                                        label="Link chi tiết ưu đãi"
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[VALIDATE_LINK]}
                                    >
                                        <Input
                                            placeholder="Nhập url"
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div>
                                    <Form.Item
                                        name="sequence"
                                        label="Thứ tự hiển thị"
                                    >
                                        <InputNumber
                                            placeholder="Nhập thứ tự hiển thị"
                                            min={0}
                                            max={99999999999}
                                            disabled={loading || !scopeActiveOffer}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="status" label="Trạng thái">
                                    <Select
                                        disabled={!scopeActiveOffer}
                                        placeholder="Chọn trạng thái"
                                    >
                                        {
                                            LIST_STATUS_OFFER.map((item, index) =>
                                            <Option key={'status'+index} value={item.value}>
                                                {item.name}
                                            </Option>)
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div className='flex'>
                                    <span className='mr-2'>Ưu tiên</span>
                                    <Form.Item
                                        style={{ marginTop: '-3px' }}
                                        className={'ml-2'}
                                        name="priority"
                                        label=""
                                    >
                                        <Switch
                                            defaultChecked={offer?.priority || false}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>

            <Modal title="Thông báo"
                   visible={isModalVisible}
                   footer={null}
                   onCancel={() => setIsModalVisible(false)}>
                <p style={{color: 'red'}}>
                    Nếu bạn chỉnh sửa ưu đãi này thì ữu đãi sẽ chuyển về trạng thái chờ duyệt
                </p>
                <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                <Button className='ml-2' type="primary" onClick={() => handleSaveData(form.getFieldValue())}>Lưu thay đổi</Button>
            </Modal>
        </>
    );
}

export default AddOrEdit;
