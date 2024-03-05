import React, {useState, useEffect} from 'react';
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


import './style.scss';
import {deleteCard, getCards} from "services/card";
import {LIST_STATUS} from "utilities/constants";
import { makeId } from 'utilities/functionCommon';

const {Title} = Typography;
const listStatus = LIST_STATUS;
const {Option} = Select;

function CardComponent() {
    const [loadingTable, setLoadingTable] = useState(true);
    const [data, setData] = useState([]);
    const [infoCard, setInForCard] = useState(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    let [status, setStatus] = useState('ACTIVE');
    const [isShowFrom, setIsShowForm] = useState(false);

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
        fetchData();
    };

    const fetchData = async () => {
        try {
            setLoadingTable(true);
            const params = {
                page: pageIndex - 1,
                pageSize,
                status
            };
            const res = await getCards(params);
            const {cards, totalSize} = res.data;
            setData(cards ?? []);
            setTotal(totalSize);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleDeleteItem = (record) => {
        deleteCard(record.id)
            .then((res) => {
                message.success('Xóa thành công');
                fetchData();
            })
            .catch((error) => message.error('Có lỗi xảy ra'));
    };

    useEffect(() => fetchData(),
        [pageSize, pageIndex]);

    const columns = [
        {
            width: 80,
            title: '#',
            dataIndex: '',
            align: 'center',
            render: (text, record, index) =>
                (pageIndex - 1) * pageSize + index + 1,
        }
        , {
            title: 'Icon',
            render: (text, record, index) => <>
                <img style={{width: '50px', height: '50px', objectFit: 'cover'}}
                     src={record.iconUrl} alt=""/>
            </>
        },
        {
            title: 'Thẻ tín dụng',
            dataIndex: 'name',
            render: (_, record) =>
                <>
                    {record.name}
                </>
        }, {
            title: 'Tổ chức thẻ',
            dataIndex: 'issuer',
            render: (_, record) =>
                <>
                    {record.issuer}
                </>
        }, {
            title: 'Loại thẻ',
            dataIndex: 'type',
            key: 'issuer',
            render: (_, record) =>
                <>
                    {record.type}
                </>
        }, {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status'
        },
        {
            title: '',
            render: (_, record) =>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setInForCard(record);
                            setIsShowForm(true);
                        }}
                        icon={<EditOutlined/>}
                    />&nbsp;&nbsp;
                    <div onClick={(event) => event.stopPropagation()}>
                        <Popconfirm
                            placement="topRight"
                            title={'Bạn có chắc chắn muốn xóa phương thức ưu đãi này?'}
                            onConfirm={() => handleDeleteItem(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                size="small"
                                type="primary"
                                danger
                                icon={<DeleteOutlined/>}
                            />
                        </Popconfirm>
                    </div>
                </div>
        }
    ];

    const handleFilterStatus = event => {
        status = event;
        setStatus(event);
        fetchData();
    }

    return (
        <div className="account p-4">
            <Row justify="space-between">
                <Col>
                    <Title level={4}>Quản lý phương thức ưu đãi</Title>
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
                    rowKey={makeId(70)}
                    loading={loadingTable}
                    pagination={total > pageSize && {
                        current: pageIndex,
                        pageSize,
                        onChange: handleChangePaging,
                        total,
                    }}
                    onRow={() => {
                        return {
                            onClick: () => {
                            },
                        };
                    }}
                />
            </Card>
            {isShowFrom ? (
                <AddOrEdit
                    isOpen={isShowFrom}
                    onClose={(confirm) => {
                        setIsShowForm(false);
                        setInForCard(null);
                        if (confirm) {
                            setStatus(confirm);
                            status = confirm;
                            fetchData();
                        }
                    }}
                    infoCard={infoCard}
                />
            ) : null}
        </div>
    );
}

export default CardComponent;
