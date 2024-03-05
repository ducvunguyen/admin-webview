import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    Card,
    Table,
    Button,
    Popconfirm,
    message, Select,
} from 'antd';
import {AppstoreAddOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';
import AddOrEdit from './AddOrEdit';

import { getCategories, deleteCategory } from 'services/category';
import './style.scss';
import {LIST_STATUS} from "utilities/constants";
import { makeId } from 'utilities/functionCommon';

const { Title } = Typography;
const { Option } = Select;
const listStatus = LIST_STATUS;

function Category() {
    const [loadingTable, setLoadingTable] = useState(true);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState(undefined);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isShowFrom, setIsShowForm] = useState(false);
    let [status, setStatus] = useState('ACTIVE');

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
    };

    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const params = {
                page: pageIndex - 1,
                pageSize,
                status
            };
            const res = await getCategories(params);
            const { categories, totalSize} = res.data;
            setData(categories || []);
            setTotal(totalSize);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleFilterStatus = event => {
        status = event;
        setStatus(event);
        fetchData();
    }

    const handleDeleteItem = (record) => {
        deleteCategory(record.id)
            .then((res) => {
                message.success('Xóa thành công');
                fetchData();
            })
    };

    useEffect(() => {
        fetchData();
    }, [pageSize, pageIndex]);

    const columns = [
        {
            width: 80,
            title: '#',
            dataIndex: '',
            align: 'center',
            render: (text, record, index) =>
                (pageIndex - 1) * pageSize + index + 1,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            align: 'left',
        },
        {
            title: 'Logo',
            dataIndex: '',
            align: 'center',
            render: (text, record) => (
                <img key={makeId(60)} src={record.logoUrl} alt="logo" width={50} />
            ),
        },
        {
            title: 'Hiển thị',
            dataIndex: '',
            align: 'center',
            render: (text, {show}) => (
                show ? 'Hiện' : 'Ẩn'
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
        },
        {
            title: '',
            dataIndex: '',
            align: 'center',
            width: 150,
            render: (text, record, index) => (
                <div key={'action'+index}
                     className='flex items-center justify-center'>
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setCategory(record);
                            setIsShowForm(true);
                        }}
                        icon={<EditOutlined />}
                    />&nbsp;&nbsp;
                    <div onClick={(event) => event.stopPropagation()}>
                        <Popconfirm
                            placement="topRight"
                            title={'Bạn có chắc chắn muốn xóa danh mục này?'}
                            onConfirm={() => handleDeleteItem(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                size="small"
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="account p-4">
            <Row justify="space-between">
                <Col>
                    <Title level={4}>Quản lý danh mục</Title>
                </Col>
                <Col>
                    <Button
                        icon={<AppstoreAddOutlined />}
                        type="primary"
                        onClick={() => setIsShowForm(true)}>
                        Thêm mới
                    </Button>
                </Col>
            </Row>
            <Card className="content-table">
                {/* <div className="control">
                    <Search
                        placeholder="Nhập tên người dùng"
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                </div> */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Select
                            style={{width: '100%'}}
                            placeholder="Lọc theo trạng thái"
                            onChange={handleFilterStatus}
                            value={status}
                            allowClear
                        >
                            { listStatus.map((item, index) =>
                                <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                        </Select>
                    </Col>
                </Row>
                <Table
                    className="request-table mt-4"
                    columns={columns}
                    dataSource={data}
                    bordered
                    size="small"
                    loading={loadingTable}
                    pagination={total > pageSize && {
                        current: pageIndex,
                        pageSize,
                        onChange: handleChangePaging,
                        total,
                    }}
                />
            </Card>
            <AddOrEdit
                isOpen={isShowFrom}
                onClose={(confirm) => {
                    setIsShowForm(false);
                    setCategory(null);
                    if (confirm) {
                        setStatus(confirm);
                        status = confirm;
                        fetchData();
                    }
                }}
                category={category}
            />
        </div>
    );
}

export default Category;
