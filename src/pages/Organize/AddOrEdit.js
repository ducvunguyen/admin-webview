import { useState, useEffect } from 'react';
import {
    Drawer,
    Form,
    Button,
    Col,
    Row,
    Typography,
    Space,
    Select,
    message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { columnSetting, storeOrganizeOffer, updateOrganizeOffer } from 'services/organize';
import { makeId } from 'utilities/functionCommon';
import { VALIDATE_REQUIRED } from 'utilities/constants';

import useCategory from 'hooks/useCategory';

const { Text } = Typography;

function AddOrEdit({ isOpen, onClose, item }) {
    const [form] = Form.useForm();
    const categories = useCategory();

    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState({});
    const [conditions, setConditions] = useState([{}]);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue({
            column: item?.column,
            sort: item?.sort,
            categoryId: item?.categoryId || null,
            sortConditionDTOs: item?.sortConditionDTOs || [{column: null, sort: null}]
        });
    }, [item, isOpen]);

    useEffect(() => {
        getColumnSetting();
    }, [])

    const getColumnSetting = () =>
        columnSetting().then(({data}) => {
            setColumns(data)
        }).catch().finally();

    const handleClose = () =>  onClose(false);

    const handleSubmit = async values => {
        const cloneDataUpload = values;

        const checkedCondition = cloneDataUpload.sortConditionDTOs.every(item => {
            const valueDuplicate = cloneDataUpload.sortConditionDTOs.filter(element => element.column === item.column);
            if (valueDuplicate.length > 1)
                return true;
        })

        if (checkedCondition)
            return message.warn('Giá trị cột trong bảng có trùng lặp dữ liệu');

        if (values.categoryId)
            cloneDataUpload.categoryName = categories.find(item => item.id === values.categoryId).name;

        setLoading(true);
        try {
            await (item ? updateOrganizeOffer(item.id, cloneDataUpload) : storeOrganizeOffer(cloneDataUpload));
            message.success(
                `${
                    item
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            onClose(true);
        } finally {
            setLoading(false);
        }
    };

    const updateCondition = () => setConditions([...form.getFieldValue('sortConditionDTOs')]);

    const handleSelectColumn = key => event => {
        let checkIssetCondition = conditions.find(item => item?.column === event);

        if (!checkIssetCondition)
            updateCondition()
        else {
            message.warn('Giá trị này đã được chọn rồi mời bạn chọn cột khác');
            // sortConditionDTOs = conditions;
            // form.setFieldsValue({ sortConditionDTOs });
        }
    }

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
                        {item ? 'Cập nhật danh mục' : 'Thêm mới danh mục'}
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
                            {item ? 'Lưu' : 'Tạo'}
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
                        <div className='flex'>
                            <div className='w-2/12'><span>Danh mục</span></div>
                            <div className='w-10/12'>
                                <Form.Item
                                    name="categoryId"
                                    validateTrigger={['onChange', 'onBlur']}
                                >
                                    <Select placeholder="Chọn danh mục"
                                            allowClear>
                                        {categories.map((item, index) => (
                                            <Select.Option
                                                key={'category'+index}
                                                value={item.id}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>
                    </Col>
                </Row>

                <table className='table-custom'>
                    <thead>
                    <tr>
                        <th>Cột</th>
                        <th>Sắp sếp</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <Form.List name="sortConditionDTOs">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <tr key={key+name}>
                                        {/*<td className='pb-4'>*/}
                                        {/*    {key + 1}*/}
                                        {/*</td>*/}
                                        <td className='pt-2.5'>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'column']}
                                                rules={[VALIDATE_REQUIRED]}
                                            >
                                                <Select
                                                    onChange={handleSelectColumn(key)}
                                                    disabled={loading}
                                                    placeholder="Chọn cột hiển thị"
                                                >
                                                    {Object.keys(columns).map(keyValue =>
                                                        <Select.Option key={makeId(60)}
                                                                       value={keyValue}>
                                                            {columns[keyValue]}
                                                        </Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </td>

                                        <td className='pt-2.5'>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'sort']}
                                                rules={[VALIDATE_REQUIRED]}
                                            >
                                                <Select
                                                    disabled={loading}
                                                    placeholder="Chọn trạng thái"
                                                >
                                                    <Select.Option value='asc'>Tăng dần</Select.Option>
                                                    <Select.Option value='desc'>Giảm dần</Select.Option>
                                                </Select>

                                            </Form.Item>
                                        </td>

                                        <td className='pb-4'>
                                            {
                                                key !== 0 &&
                                                <div className='flex items-center h-full justify-center'>
                                                    <MinusCircleOutlined onClick={() => {
                                                        remove(name);
                                                        updateCondition();
                                                    }} />
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                   <td colSpan={4}>
                                       <div className='w-2/12 pt-3'>
                                           <Form.Item>
                                               <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                   Thêm
                                               </Button>
                                           </Form.Item>
                                       </div>
                                   </td>
                                </tr>
                            </>
                        )}
                    </Form.List>
                    </tbody>
                </table>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;
