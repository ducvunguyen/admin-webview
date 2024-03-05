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

import './style.scss';
import { makeId } from 'utilities/functionCommon';
import { getKvs, removerKv } from 'services/collectkv';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const listStatus = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Chờ duyệt', value: 'PENDING'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'}
];

function CollectKV() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [infoKv, setInfoKv] = useState(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isShowFrom, setIsShowForm] = useState(false);
    let [status, setStatus] = useState(null);

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                page: pageIndex - 1,
                size: pageSize,
                status,
                expired: 'ACTIVE'
            };
            const res = await getKvs(params);
            const { galleries, totalSize} = res.data;
            setData(galleries || []);
            setTotal(totalSize);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterStatus = event => setStatus(event)

    const handleDeleteItem = (record) => {
        removerKv(record.id)
            .then(() => {
                message.success('Xóa thành công');
                fetchData();
            })
            .catch(() => message.error('Có lỗi xảy ra'));
    };

    useEffect(() => {
        fetchData();
    }, [pageSize, pageIndex, status]);

    const tdAction = (text, record) => {
      return (
          <div key={makeId(60)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <Button
                  size="small"
                  type="primary"
                  Primary
                  style={{background: "#ffc107"}}
                  onClick={() => {
                      setInfoKv(record);
                      setIsShowForm(true);
                  }}
                  icon={<EditOutlined />}
              />&nbsp;&nbsp;
              <div onClick={(event) => event.stopPropagation()}>
                  <Popconfirm
                      placement="topRight"
                      title={'Bạn có chắc chắn muốn xóa bản ghi này không?'}
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
      )
    }

    const columns = [
        {
            width: 40,
            title: '#',
            align: 'center',
            fixed: 'left',
            render: (text, record, index) =>
                (pageIndex - 1) * pageSize + index + 1,
        },
        {
            title: 'Tên',
            fixed: 'left',
            width: 300,
            dataIndex: 'name',
            align: 'left',
        },
        {
            title: 'Ảnh Thumbnail',
            align: 'center',
            render: (text, record) => (
                record.thumbnailUrl &&
                <img key={makeId(60)} src={record.thumbnailUrl} alt="logo" width={50} />
            ),
        },
        {
            title: 'Ảnh Popup',
            align: 'center',
            render: (text, record) => (
                <img key={makeId(60)} src={record.popupUrl} alt="logo" width={50} />
            ),
        },
        {
            title: 'Popup',
            align: 'center',
            render: (text, record) => (
                record.popupShow ? 'Hiện' : 'Ẩn'
            ),
        },
        {
            title: 'Thanh tìm kiếm',
            align: 'center',
            render: (text, record) => (
                record.searchShow ? 'Hiện' : 'Ẩn'
            ),
        },
        {
            title: 'Tạo bởi',
            width: 250,
            align: 'center',
            render: (text, record) => (
               <>
                   <span>{record.createdByUser}</span><br/>
                   <span>{moment(record.createdDate).format('HH:mm DD/MM/YYYY')}</span>
               </>
            ),
        },
        {
            title: 'Cập nhật bởi',
            width: 250,
            align: 'center',
            render: (text, record) => (
               <>
                   <span>{record.updatedByUser}</span><br/>
                   <span>{moment(record.updatedDate).format('HH:mm DD/MM/YYYY')}</span>
               </>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
        },
        {
            title: '',
            fixed: 'right',
            align: 'center',
            width: 150,
            render: (text, record) => tdAction(text, record),
        },
    ];

    return (
        <div className="account p-4">
            <Row justify="space-between">
                <Col>
                    <Title level={4}>Quản lý KV</Title>
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
                        >
                            <Option key={makeId(60)} value={null}>Tất cả</Option>
                            { listStatus.map((item, index) =>
                                <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                        </Select>
                    </Col>
                </Row>
                <Table
                    className="request-table mt-4"
                    columns={columns}
                    dataSource={data}
                    scroll={{ x: 1600 }}
                    bordered
                    size="small"
                    loading={loading}
                    pagination={total > pageSize && {
                        current: pageIndex,
                        pageSize,
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
                    setInfoKv(null);
                    if (confirm) {
                        if (status != null) setStatus(null)
                        else fetchData();
                    }
                }}
                infoKv={infoKv}
            />
        </div>
    );
}

export default CollectKV;
