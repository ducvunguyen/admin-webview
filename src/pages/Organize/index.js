import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    Card,
    Table,
    Button,
    Popconfirm,
    message,
} from 'antd';
import {AppstoreAddOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';
import AddOrEdit from './AddOrEdit';

import './style.scss';
import { deleteOrganizeOffer, getOrganizeOffer } from 'services/organize';
import { makeId } from 'utilities/functionCommon';

const { Title } = Typography;

function Organize() {
    const [loadingTable, setLoadingTable] = useState(true);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState(null);
    const [isShowFrom, setIsShowForm] = useState(false);

    const fetchData = async () => {
        try {
            setLoadingTable(true);

            const {data} = await getOrganizeOffer();
            setData(data);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleDeleteItem = (record) => {
        deleteOrganizeOffer(record.id)
            .then(() => {
                message.success('Xóa thành công');
                fetchData();
            })
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: '#',
            align: 'center',
            render: (text, record, index) => <>{index + 1}</>
        },

        {
            title: 'Cột',
            // dataIndex: 'columnAlias',
            align: 'left',
            render: (text, {sortConditionDTOs}, index) => <>{
                sortConditionDTOs.map(item =>
                    <>
                        - <span>{item.columnAlias}&nbsp;
                        <b>({item.sort === 'asc' ? 'Tăng dần' : 'Giảm dần'})</b></span> <br/>
                    </>
                )
            }</>,
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            align: 'left',
        },
        {
            title: '',
            align: 'center',
            width: 150,
            render: (text, record) => (
                <div className='flex justify-center	items-center'>
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setFormData(record);
                            setIsShowForm(true);
                        }}
                        icon={<EditOutlined />}
                    />&nbsp;&nbsp;
                    <div onClick={(event) => event.stopPropagation()}>
                        <Popconfirm
                            placement="topRight"
                            title={'Bạn có chắc chắn muốn xóa hiển thị này?'}
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
                    <Title level={4}>Quản lý hiển thị</Title>
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
                <Table
                    className="request-table mt-4"
                    columns={columns}
                    dataSource={data}
                    bordered
                    size="small"
                    loading={loadingTable}
                    pagination={false}
                />
            </Card>

            <AddOrEdit
                key={makeId(60)}
                isOpen={isShowFrom}
                onClose={(confirm) => {
                    setIsShowForm(false);
                    setFormData(null);
                    if (confirm) fetchData();
                }}
                item={formData}
            />
        </div>
    );
}

export default Organize;
