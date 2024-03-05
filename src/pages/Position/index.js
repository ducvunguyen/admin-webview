import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    Card,
    Table,
    Button,
    Popconfirm,
    Input, Form,
    message, Select,
} from 'antd';
import {AppstoreAddOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';
import moment from 'moment';

import AddOrEdit from './AddOrEdit';

import {LIST_STATUS} from "utilities/constants";
import { makeId } from 'utilities/functionCommon';
import { deletePosition, getPositions } from 'services/position';
import CardSort from 'components/CardSort';

import './style.scss';

const { Title } = Typography;
const { Option } = Select;
const listStatus = LIST_STATUS;

function Position() {
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState([]);
    const [infoData, setInfoData] = useState(undefined);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isShowFrom, setIsShowForm] = useState(false);
    let [status, setStatus] = useState('ACTIVE');
    const [keyFilterSort, setKeyFilterSort] = useState({});

    const handleChangePaging = (page, pageSize) => {
        setPage(page);
        setSize(pageSize);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                page: page - 1,
                size,
                status,
                ...form.getFieldsValue()
            };

            if (keyFilterSort)
                params.sorts = keyFilterSort;

            const res = await getPositions(params);
            const { positions, totalSize} = res.data;
            setDataSource(positions || []);
            setTotal(totalSize);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = record => {
        setLoading(true);
        deletePosition(record.id)
            .then((res) => {
                message.success('Xóa thành công');
                fetchData();
            }).finally(() => setLoading(false));
    };

    useEffect(() => fetchData(),
        [page, size, keyFilterSort]);

    const handleSort = (params) => {
        let dataActive = {...keyFilterSort};
        dataActive[params.keyName] = params.param;
        setKeyFilterSort({ ...dataActive });
    };

    const onSearch = () => fetchData();

    const columns = [
        {
            width: 80,
            title: '#',
            dataIndex: '',
            align: 'center',
            fixed: 'left',
            render: (text, record, index) =>
                (page - 1) * size + index + 1,
        },
        {
            width: 300,
            fixed: 'left',
            title: <CardSort
                keyName='name' title={'Tên'}
                onClose={handleSort}
                focus={keyFilterSort['name']} />,
            dataIndex: 'name',
            align: 'left',
        },
        {
            title: 'leaders',
            dataIndex: '',
            width: 300,
            align: 'center',
            render: (text, {leaderDTOs}) => (
                leaderDTOs &&
                <>
                    {
                        leaderDTOs.map(item =>
                            <>
                                <span>- {item.email}</span>
                                <br/>
                            </>)
                    }
                </>
            ),
        },
        {
            title: 'Members',
            width: 300,
            render: (text, {memberDTOs}) => (
                memberDTOs &&
                <>
                    {
                        memberDTOs.map(item =>
                            <>
                                <span>- {item.email}</span>
                                <br/>
                            </>)
                    }
                </>
            ),
        },
        {
            title: <CardSort
                keyName='createdByUsername'
                title={'Tạo bởi'}
                onClose={handleSort}
                focus={keyFilterSort['createdByUsername']} />,
            dataIndex: 'createdByUsername',
            width: 300,
        },
        {
            title: <CardSort
                keyName='createdDate'
                title={'Thời gian cập nhật'}
                onClose={handleSort}
                focus={keyFilterSort['createdDate']} />,
            width: 200,
            render: (text, {createdDate}) => (
                <span>{moment(createdDate).format('HH:mm DD/MM/YYYY')}</span>
            )
        },
        {
            title: <CardSort
                keyName='updatedByUsername'
                title={'Cập nhật bởi'}
                onClose={handleSort}
                focus={keyFilterSort['updatedByUsername']} />,
            width: 300,
            dataIndex: 'updatedByUsername',
        },
        {
            title: <CardSort
                keyName='updatedDate'
                title={'Ngày cập nhật'}
                onClose={handleSort}
                focus={keyFilterSort['updatedDate']} />,
            width: 200,
            render: (text, {updatedDate}) => (
                <span>{moment(updatedDate).format('HH:mm DD/MM/YYYY')}</span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 150,
        },
        {
            title: '',
            fixed: 'right',
            dataIndex: '',
            width: 150,
            render: (text, record, index) => (
                <div key={'action'+index}
                     className='flex justify-center items-center'>
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setInfoData(record);
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
                    <Title level={4}>Quản lý đội nhóm</Title>
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
                <Form  form={form} name="control-hooks" onFinish={onSearch}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="status"
                            >
                                <Select
                                    className='w-full'
                                    placeholder="Lọc theo trạng thái"
                                    value={status}
                                >
                                    <Option key={makeId(60)} value=''>Tất cả</Option>
                                    { listStatus.map((item, index) =>
                                        <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                                </Select>
                            </Form.Item>

                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="name"
                            >
                                <Input  placeholder="Tìm kiếm teams"/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Tìm kiếm
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
                <Table
                    className="request-table mt-4"
                    columns={columns}
                    dataSource={dataSource}
                    bordered
                    scroll={{ x: 1300 }}
                    size="small"
                    loading={loading}
                    pagination={total > size && {
                        current: page,
                        size,
                        onChange: handleChangePaging,
                        total,
                    }}
                    onRow={() => {
                        return {
                            onClick: () => {},
                        };
                    }}
                />
            </Card>
            <AddOrEdit
                isOpen={isShowFrom}
                onClose={(confirm) => {
                    setIsShowForm(false);
                    setInfoData(null);
                    if (confirm) {
                        setStatus(confirm);
                        status = confirm;
                        fetchData();
                    }
                }}
                position={infoData}
            />
            )
        </div>
    );
}

export default Position;
