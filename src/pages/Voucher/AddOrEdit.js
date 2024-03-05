import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    Typography,
    message,
    DatePicker,
    Select,
    Collapse,
    Pagination,
    Spin,
    Alert
} from 'antd';
import {
    PlusOutlined,
    MinusCircleOutlined,
    CloudDownloadOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';

import { downloadFileLocal, makeId } from 'utilities/functionCommon';
import { VALIDATE_REQUIRED } from 'utilities/constants';
import CardUploadFileImage from 'components/CardUploadFileImage';
import {
    getInfoVoucher,
    importVoucher,
    registerVoucher,
    removerConditionVoucher,
    updateVoucher,
} from 'services/voucher';
import { DownloadFileTemplateVoucher } from 'resources/files';

import './style.scss';
import { useParams } from 'react-router-dom';

const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;
const listStatus = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'},
    {name: 'Chờ Duyệt', value: 'PENDING'},
];

const AddOrEdit = ({ item, onClose, isOpen }) => {
    const [form] = Form.useForm();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(1);
    const [voucherFile, setVoucherFile] = useState({
        url: null,
        file: null,
    });
    const [codeVoucherLimited, setCodeVoucherLimited] = useState([]);
    const [codeVoucherUnLimited, setCodeVoucherUnLimited] = useState([]);
    const [infoVoucher, setInfoVoucher] = useState(null);

    useEffect(() => {
        if (item){
            setLoading(true);
            getInfoVoucher(item.id).then(({data}) => {
                data.vouchers = data.vouchers.map(({id, voucherCode, status}) => {
                    return {id, voucherCode, status};
                });
                setInfoVoucher(data);
                initForm(data);
            }).finally(() => setLoading(false));
        }
        else initForm();
    }, [isOpen]);
    const initForm = data => {
        setVoucherFile({
            ...voucherFile,
            file: null,
            url: data?.voucherImg,
        });

        const formControls = [{voucherCode:'', status: ''}];
        setCodeVoucherUnLimited([...formControls]);
        setCodeVoucherLimited([...formControls]);

        if (data?.campaignType && data?.campaignType === 'UNLIMITED')
            setCodeVoucherUnLimited(data?.vouchers || [...formControls])
        else setCodeVoucherLimited(data?.vouchers || [...formControls])
        form.setFieldsValue({
            campaignName: data?.campaignName,
            voucherTitle: data?.voucherTitle,
            voucherExpiredDate: data?.voucherExpiredDate && moment(data?.voucherExpiredDate),
            time: data?.startTime && [moment(data?.startTime), moment(data?.endTime)],
            vouchers: data?.vouchers || [...formControls],
            voucherDesc: data?.voucherDesc,
            campaignType: data?.campaignType || 'UNLIMITED',
            status: data?.status || 'ACTIVE',
        });
    };
    const getVoucherCodes = () => form.getFieldValue('vouchers');
    const handleSubmit = data => {
        const vouchers = [];
        data.vouchers.forEach((item, index) => {
            const voucher = Object.getPrototypeOf(item);
            if (voucher?.voucherCode){
                vouchers.push(voucher)
            }else vouchers.push(item)

        });

        const formData = new FormData();

        Object.keys(data).map(key => {
            if (key === 'time') {
                formData.append('startTime', moment(data[key][0]).format());
                formData.append('endTime', moment(data[key][1]).format());
            } else if (key === 'voucherExpiredDate')
                formData.append(key,data[key] ? moment(data[key]).format() : '');
            else if (data[key] instanceof Array)
                formData.append(key, JSON.stringify(key === 'vouchers' ? vouchers :data[key]));
            else
                formData.append(key, data[key] || '');

        });

        formData.append('offerId', id);

        if (voucherFile.file)
            formData.append('voucherFile', voucherFile.file);

        const api = item ? updateVoucher(item.id, formData) :  registerVoucher(formData);
        setLoading(true);
        api.then(() => {
            message.success(item ? 'Sửa thành công' : 'Tạo mới thành công');
            onClose(true);
        }).finally(() => setLoading(false));
    };
    const handleClose = () => {
        form.resetFields();
        // setIconFile({
        //     file: null,
        //     url: null,
        //     isValidate: false,
        // });
        setPageIndex(1);
        setPageSize(10);
        onClose(false);
    };
    const disabledDate = current => null;
    const downloadFileVoucher = () =>
        downloadFileLocal(DownloadFileTemplateVoucher);
    const importFileTemplate = event => {
        if (event.target.files){
            const file = event.target.files[0], formData = new FormData();
            formData.append('templateFile', file);
            setLoading(true);
            const listVouchers =  form.getFieldValue('vouchers').filter(item => item && item.voucherCode != '' );

            importVoucher(formData).then(({data}) => {
                    const vouchers = data.map(({voucherCode, status}) => Object.create({
                        voucherCode,
                        status
                    })).concat(listVouchers);

                    form.setFieldsValue({ vouchers });
                }
            ).finally(() =>
                setLoading(false));
        }
    }
    const onChangeLimitedOfVoucher = type => {
        const vouchers = form.getFieldValue('vouchers');
        form.setFieldsValue({vouchers: type === 'LIMITED' ? [...codeVoucherLimited] : [...codeVoucherUnLimited]});
        if (type !== 'LIMITED')
            setCodeVoucherLimited([...vouchers]);
        else setCodeVoucherUnLimited([...vouchers]);
    }
    const getItems = () => form.getFieldValue('vouchers');
    const checkCampaignType = type => form.getFieldValue('campaignType') === type;
    const handleRemoveVoucher = ({item, name, remove}) => {
        if (item?.status === OWN)
            return message.warn('Mã này đã có người sử dụng');

        if (!item?.id) {
            remove(name);
        }
        setLoading(true);
        removerConditionVoucher(item.id).then(() => remove(name))
            .finally(() => setLoading(false));
    }
    const handleChangePage = (page, size) => {
        setPageSize(size)
        setPageIndex(page)
    }

    return (
        <Drawer
            closable={false}
            visible={isOpen}
            onClose={handleClose}
            width='70vw'
            bodyStyle={{ paddingBottom: 80 }}
            title={
                <Space
                    style={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Text strong>
                        {item ? 'Chỉnh sửa voucher' : 'Thêm voucher'}
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
            <Spin spinning={loading}>
            <Form
                form={form}
                layout='vertical'
                onFinish={handleSubmit}
                autoComplete='off'
                id={'form-user'}
            >
                <Row gutter={16} className={'mt-4'}>
                    <CardUploadFileImage
                        dataFile={voucherFile}
                        pzTitle={'Ảnh voucher (375x210)'}
                        onChange={dataFile => setVoucherFile({ ...dataFile })}
                    />
                </Row>
                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name='campaignName'
                            label='Tên chiến dịch'
                            disabled={loading}
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Input placeholder='Nhập tên chiến dịch' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Tên voucher'
                            name='voucherTitle'
                            rules={[VALIDATE_REQUIRED]}
                            disabled={loading}
                        >
                            <Input placeholder='Nhập tên vourcher' />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name='voucherExpiredDate'
                            label='Ngày hết hạn'
                            rules={[VALIDATE_REQUIRED]}
                            disabled={loading}>
                            <DatePicker showTime={true} format='HH:mm DD/MM/YYYY' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Thời gian hiển thị'
                            name='time'
                            rules={[VALIDATE_REQUIRED]}
                            disabled={loading}
                        >
                            <RangePicker
                                format='HH:mm DD/MM/YYYY'
                                disabledDate={disabledDate}
                                showTime={true} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <div className='mb-3'></div>
                        {
                            checkCampaignType('LIMITED') &&
                            <Alert
                                message="Import tệp có số lượng bản ghi lớn thời gian lưu có thể lâu hơn vài giây!!!!"
                                type="warning"
                            />
                        }

                        <Collapse defaultActiveKey={['1']}>
                            <Panel header='Điều kiện voucher' key='1'>
                                {
                                    checkCampaignType('LIMITED') &&
                                    <>
                                        <Button
                                            className='mb-3'
                                            icon={<CloudDownloadOutlined />}
                                            type='primary'
                                            onClick={downloadFileVoucher}>
                                            Tải file mẫu
                                        </Button>

                                        <Button
                                            className='mb-3 ml-2'
                                            icon={<CloudUploadOutlined />}
                                            type='primary'
                                            onClick={() => document.getElementById('import-file').click()}>
                                            Import file mẫu
                                        </Button>
                                        <input type='file' hidden id='import-file'
                                               onChange={importFileTemplate}
                                               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
                                    </>
                                }

                                <Form.List name='vouchers'>
                                    {(fields, { add, remove }, { errors }) => (
                                        <div className='w-full' key={makeId(60)}>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <>
                                                    {
                                                        (checkCampaignType('UNLIMITED') || (pageIndex - 1)*pageSize <= name && name < (pageIndex*pageSize)) &&
                                                        <div className="w-full flex" key={name + 'voucher'}>
                                                            <div className="w-4/5">
                                                                <>
                                                                    <Row gutter={16}>
                                                                        {
                                                                            checkCampaignType('LIMITED') &&
                                                                            <Col span={2}>
                                                                                <div className='text-center w-full' >{name + 1}</div>
                                                                            </Col>
                                                                        }
                                                                        <Col span={!item ? 22 : 10}>
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[name, 'voucherCode']}
                                                                                rules={[VALIDATE_REQUIRED]}
                                                                            >
                                                                                <Input placeholder='Nhập mã voucher' />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        {item &&
                                                                            <Col span={12}>
                                                                                <Form.Item
                                                                                    {...restField}
                                                                                    name={[name, 'status']}
                                                                                >
                                                                                    <Select disabled={getItems()[key]?.status === OWN} placeholder='Chọn trạng thái'>
                                                                                        {listStatus.map((item, index) =>
                                                                                            <Option key={makeId(60)} value={item?.value}>{item?.name}</Option>)}
                                                                                        {
                                                                                            getItems()[key]?.status === OWN &&
                                                                                            <Option key={makeId(60)} value={OWN}>Đang sử dùng</Option>
                                                                                        }
                                                                                    </Select>
                                                                                </Form.Item>
                                                                            </Col>
                                                                        }

                                                                    </Row>

                                                                </>
                                                            </div>
                                                            {
                                                                (checkCampaignType('LIMITED') && getVoucherCodes().length > 1) &&
                                                                <div className="1/5 pl-2">
                                                                    <MinusCircleOutlined onClick={() =>
                                                                        handleRemoveVoucher({remove, name, item: getItems()[key]})} />
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </>

                                            ))}
                                            {
                                                checkCampaignType('LIMITED') &&
                                                <>
                                                    <Form.Item>
                                                        <Button
                                                            type='dashed'
                                                            onClick={() => add()}
                                                            style={{
                                                                width: '60%',
                                                            }}
                                                            icon={<PlusOutlined />}
                                                        >
                                                            Thêm
                                                        </Button>
                                                        <Form.ErrorList errors={errors} />
                                                    </Form.Item>
                                                    <br/>
                                                    <Pagination
                                                        showSizeChanger
                                                        pageSizeOptions={[5, 10, 20, 50, 100]}
                                                        showQuickJumper
                                                        showTotal={(total) => `Tổ số ${total} bản`}
                                                        onChange={handleChangePage}
                                                        defaultCurrent={pageIndex}
                                                        pageSize={pageSize} total={getVoucherCodes().length} />
                                                </>
                                            }
                                        </div>
                                    )}
                                </Form.List>
                            </Panel>
                        </Collapse>
                    </Col>

                </Row>

                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <Form.Item
                            name='voucherDesc'
                            label='Mô tả'
                            disabled={loading}
                        >
                            <TextArea placeholder='Nhập mô tả voucher' autoSize/>
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16} className={'mt-4'}>
                    <Col span={12}>
                        <Form.Item
                            name='campaignType'
                            label='Giới hạn'
                            disabled={loading}
                            rules={[VALIDATE_REQUIRED]}
                        >
                            
                            <Select
                                disabled={item || infoVoucher?.vouchers?.filter(item => item.status === OWN).length > 0}
                                onChange={onChangeLimitedOfVoucher} placeholder='Chọn giới hạn'>
                                <Option value='LIMITED'>LIMITED</Option>
                                <Option value='UNLIMITED'>UNLIMITED</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name='status' label='Trạng thái'>
                            <Select placeholder='Chọn trạng thái'>
                                {listStatus.map((status, index) =>
                                    <Option key={'status' + index} value={status.value}>{status.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            </Spin>
        </Drawer>
    );
};

AddOrEdit.propTypes = {
    item: PropTypes.object,
    isOpen: PropTypes.bool,
};

export default AddOrEdit;

const OWN = 'OWN';