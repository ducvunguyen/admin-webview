import { useEffect, useRef, useState } from 'react';

import {
    Button, Form, Input, Spin, Modal, message, InputNumber, Select,
} from 'antd';

import {
    MinusCircleOutlined, PlusOutlined, CloudUploadOutlined, CloudDownloadOutlined,
} from '@ant-design/icons';

import { downloadFileLocal, makeId, filterSelectAnt } from 'utilities/functionCommon';
import {
    getListAddressById,
    readFileExcelTemplateAddress,
    updateAddress,
    getDistrict
} from 'services/offer';

import { ExcelTemplateAddress } from 'resources/files';

import './style.scss';

const AddressOffer = ({ offer, onClose, isOpen }) => {
    const [form] = Form.useForm();

    const uploadFileRef = useRef();

    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);

    const onFinish = ({ listAddress }) => {
        const cloneData = [...listAddress];
        let rowsEmptyLatLng = [],
            rowsEnterLatLng = [];
        const latitudeSouth = 8.3,
            latitudeNorth = 23.22;
        const longitudeWest = 102.1,
            longitudeEast = 109.3;
        cloneData.forEach((item, index) => {
            if (
                (item.latitude && !item.longitude) ||
                (!item.latitude && item.longitude)
            )
                rowsEmptyLatLng.push(index + 1);

            if (item.latitude && item.longitude) {
                //Check toa do cua viet nam
                if (
                    latitudeSouth > item.latitude ||
                    item.latitude > latitudeNorth
                )
                    return rowsEnterLatLng.push(++index);

                if (
                    longitudeWest > item.longitude ||
                    item.longitude > longitudeEast
                )
                    return rowsEnterLatLng.push(++index);
            }

            item.merchantIds = item?.merchantIds?.split(',');
            item.terminalIds = item?.terminalIds?.split(',');
            item.merchantAccounts = item?.merchantAccounts?.split(',');
        });

        //kiem tra toa do kinh do va vi do co phai cua VN
        if (rowsEnterLatLng.length > 0)
            return message.warn(`${
                rowsEnterLatLng.length > 1 ? 'Các dòng' : 'Dòng'
            } 
            ${rowsEnterLatLng.join(', ')} 
            đang nằm ngoài Vĩ tuyến: 8.30 - 23.22 
            Bắc và Kinh tuyến: 102.10 - 109.30 Ðông`);

        //kiem tra cac dong dien day du kinh do va vi do
        if (rowsEmptyLatLng.length > 0)
            return message.warn(`${
                rowsEmptyLatLng.length > 1 ? 'Các dòng' : 'Dòng'
            } 
            ${rowsEmptyLatLng.join(
                ', ',
            )} cần điền đầy đủ cả tọa độ, vĩ độ hoặc để trống`);

        setLoading(true);
        updateAddress(offer?.id, cloneData)
            .then(() => {
                message.success('Cập nhật tài liệu thành công');
                onClose(true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setLoading(true);
        form.resetFields();
        if (offer){
            getListAddressById(offer?.id)
                .then(({ data }) => handleInitForm(data))
                .catch()
                .finally(() => setLoading(false));

            getDataDistrict();
        }

    }, [isOpen]);

    const getDataDistrict = (districtType = 'PROVINCE', parentCode = null, indexArr) => {
        getDistrict({districtType, parentCode}).then(({data}) => {
            if (districtType === 'PROVINCE')
                setCities(data);
            else {
                const arrForm = form.getFieldValue('listAddress');
                arrForm[indexArr].districts = data;
                form.setFieldValue('listAddress', arrForm);
            }
        });
    }

    const handleUploadFileExcel = (event) => {
        const file = event.target?.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('templateFile', file);

            readFileExcelTemplateAddress(formData)
                .then(({ data }) => handleInitForm(data))
                .catch((err) => {
                    message.error(
                        'File bạn upload không đúng định dạng. Vui lòng kiểm tra lại ',
                    );
                })
                .finally();
        }
    };

    const handleInitForm = (data) => {
        data.forEach((item) => {
            item.merchantIds = item?.merchantIds?.join(',');
            item.terminalIds = item?.terminalIds?.join(',');
            item.merchantAccounts = item?.merchantAccounts?.join(',');
        });

        const listAddress = form.getFieldValue('listAddress');

        form.setFieldsValue({
            listAddress: !listAddress
                ? data
                : form.getFieldValue('listAddress').concat(data),
        });

    };

    const downloadFileTemplate = () => downloadFileLocal(ExcelTemplateAddress);

    return (
        <Modal
            title={'Danh sách địa chỉ cửa hàng ' + offer?.ownerName}
            centered
            visible={isOpen}
            onOk={() => onClose(false)}
            onCancel={() => onClose(false)}
            footer={null}
            bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
            width={'95vw'}
        >
            <div className="d-flex flex-end">
                <Button
                    type="primary"
                    onClick={() => uploadFileRef.current?.click()}
                    icon={<CloudUploadOutlined />}
                >
                    Tải lên
                </Button>

                <Button
                    className='ml-2'
                    type="primary"
                    icon={<CloudDownloadOutlined />}
                    onClick={() => downloadFileTemplate()}
                >
                    Tải file mẫu
                </Button>
            </div>
            <input
                type="file"
                hidden
                ref={uploadFileRef}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleUploadFileExcel}
            />
            <div className="w-full">
                <small className="float-right text-red-600">
                    {' '}
                    Note: Vĩ độ từ 8.30 đến 23.22 Bắc, Kinh độ từ 102.10 đến
                    109.30 Ðông
                </small>
            </div>
            <Spin spinning={loading} delay={500}>
                <Form
                    name="dynamic_form_nest_item"
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                >
                    <table className="mt-1 table-custom">
                        <thead>
                            <tr>
                                {
                                    headers.map((header, index) => (
                                        <th key={'header' + index}>{header}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            <Form.List name="listAddress">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(
                                            ({ key, name, ...restField }) => (
                                                <tr key={'action_t' + name}>
                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'storeBranch',
                                                            ]}
                                                            validateTrigger={[
                                                                'onChange',
                                                                'onBlur',
                                                            ]}
                                                            // rules={VALIDATE}
                                                        >
                                                            <Input
                                                                placeholder="Nhập chi nhánh cửa hàng"
                                                                disabled={
                                                                    loading
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'phoneNumber',
                                                            ]}
                                                            validateTrigger={[
                                                                'onChange',
                                                                'onBlur',
                                                            ]}
                                                            // rules={VALIDATE_PHONE}
                                                        >
                                                            <Input
                                                                placeholder="Nhập số điện thoại"
                                                                disabled={
                                                                    loading
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </td>

                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'address',
                                                            ]}
                                                        >
                                                            <Input
                                                                placeholder="Địa chỉ"
                                                                disabled={
                                                                    loading
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    
                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'provinceCode',
                                                            ]}
                                                        >
                                                            <Select
                                                                showSearch
                                                                filterOption={(
                                                                    input,
                                                                    option,
                                                                ) =>
                                                                    filterSelectAnt(
                                                                        {
                                                                            input,
                                                                            option,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Tỉnh/Tp"
                                                            >
                                                                {cities.map(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) => (
                                                                        <Select.Option
                                                                            key={
                                                                                'leader' +
                                                                                index
                                                                            }
                                                                            value={
                                                                                item.code
                                                                            }
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </Select.Option>
                                                                    ),
                                                                )}
                                                            </Select>
                                                        </Form.Item>
                                                    </td>

                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'latitude',
                                                            ]}
                                                            validateTrigger={[
                                                                'onChange',
                                                                'onBlur',
                                                            ]}
                                                            // rules={VALIDATE}
                                                        >
                                                            <InputNumber
                                                                controls={false}
                                                                placeholder="Vĩ độ"
                                                                disabled={
                                                                    loading
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[
                                                                name,
                                                                'longitude',
                                                            ]}
                                                            // rules={VALIDATE}
                                                        >
                                                            <InputNumber controls={false}
                                                                         placeholder="Kinh độ" disabled={loading}/>
                                                        </Form.Item>
                                                    </td>
                                                    <td className="pt-2.5">
                                                        <Form.Item{...restField} name={[name, 'merchantIds']}>
                                                            <Input placeholder=""
                                                                disabled={loading}
                                                            />
                                                        </Form.Item>
                                                    </td>

                                                    <td className="pt-2.5">
                                                        <Form.Item{...restField}
                                                            name={[name, 'terminalIds']}>
                                                            <Input placeholder="" disabled={loading}/>
                                                        </Form.Item>
                                                    </td>

                                                    <td className="pt-2.5">
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'merchantAccounts']}>
                                                            <Input placeholder="" disabled={loading}/>
                                                        </Form.Item>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="relative bottom-3 ">
                                                            <MinusCircleOutlined
                                                                onClick={() =>
                                                                    remove(name)
                                                                }
                                                            />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}

                                        {fields.length === 0 && (
                                            <tr key={makeId(60)}>
                                                <td colSpan={8}
                                                    className="text-align-center p-7">
                                                    Chưa có dữ liệu
                                                </td>
                                            </tr>
                                        )}

                                        <tr>
                                            <td colSpan={8}
                                                className="pt-1 border-none">
                                                <Form.Item>
                                                    <Button
                                                        type="dashed"
                                                        onClick={() => add()}
                                                        block
                                                        icon={<PlusOutlined />}
                                                    >
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
                    <Form.Item>
                        <div className="d-flex flex-end">
                            <Button htmlType="button" onClick={() => onClose(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" className="ml-1">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

const headers = [
    'Chi nhánh cửa hàng',
    'Số điện thoại',
    'Địa chỉ',
    'Tỉnh/Tp',
    'Vĩ độ',
    'Kinh độ',
    'Merchant ID (MID)',
    'Terminal ID (TID)',
    'Merchant account',
    '',
];

export default AddressOffer;
