import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, message, Popconfirm, Row, Spin, Table, Tooltip } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';

import { getInfoOfferById } from 'services/offer';
import { deleteVoucher, getListVoucher, voucherReport } from 'services/voucher';

import AddOrEdit from './AddOrEdit';
import { handleDownLoad } from 'utilities/functionCommon';

const Voucher = () => {
    const { id } = useParams();

    const [infoOffer, setInfoOffer] = useState({});
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [isShowForm, setIsShowForm] = useState(false);
    const [infoVoucher, setInfoVoucher] = useState(null);

    useEffect(() => {
        loadDataItems();
        getInfoOffer();
    }, []);

    const loadDataItems = () => {
        const params = {page, size, offerId: id}
        setLoading(true);
        getListVoucher(params).then(({data: {voucherCampaigns, totalSize}}) => {
            setDataSource(voucherCampaigns);
            setTotal(totalSize);
        }).finally(() => setLoading(false))
    }

    const getInfoOffer = () => {
        getInfoOfferById(id).then(({data}) =>
            setInfoOffer(data)
        ).finally();
    }

    const handleDeleteItem = (record) => {
        setLoading(true);
        deleteVoucher(record.id)
            .then((res) => {
                message.success('Xóa thành công');
                loadDataItems();
            }).finally(() => setLoading(false));
    };

    const handleVoucherReport = ({id}) => {
        setLoading(true);
        voucherReport(id).then(res => {
            const outputFilename = res?.headers['content-disposition']?.split(';')[1]?.split('=')[1]?.trim() || `Voucher_list_${moment().format('YYYY-MM-DD_HH_mm_ss')}.xlsx`;
            handleDownLoad(outputFilename, res.data);
        }).finally(() => setLoading(false));
    }

    const columns = [
        {
            title: '#',
            render : (_, record, index) => <span>
                { size*page  + index + 1}
            </span>
        },
        {
            title: 'Tên chiến dịch',
            dataIndex: 'campaignName'
        },
        {
            title: 'Thời gian bắt đầu',
            render: (_, {startTime}) => <span>{moment(startTime).format('HH:mm DD/MM/YYYY')}</span>
        },
        {
            title: 'Thời gian kết thúc',
            render: (_, {endTime}) => <span>{moment(endTime).format('HH:mm DD/MM/YYYY')}</span>
        },
        {
            title: 'Tạo bởi',
            render: (_, {createdBy, createdTime}) => <span>
                {moment(createdTime).format('HH:mm DD/MM/YYYY')},
                <br/>
                {createdBy}
            </span>
        },
        {
            title: 'Cập nhật lần cuối',
            render: (_, {updatedBy, updatedTime}) =>
                <span>
                    {updatedTime && moment(updatedTime).format('HH:mm DD/MM/YYYY')},
                    <br/>
                    {updatedBy && `${updatedBy}`}
                </span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
        },
        {
            title: '',
            dataIndex: '',
            align: 'center',
            width: 150,
            render: (text, record, index) => (
                <div key={'action' + index}
                     className='flex justify-center items-center'>
                    <Button
                        size="small"
                        onClick={() => handleVoucherReport(record)}
                        icon={<FileExcelOutlined />}
                    />
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        className='ml-2'
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setInfoVoucher(record);
                            setIsShowForm(true);
                        }}
                        icon={<EditOutlined />}
                    />
                    <div className='ml-2' onClick={(event) => event.stopPropagation()}>
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

    const handleChangePaging = (pageIndex, pageSize) => {
        setPage(pageIndex);
        setSize(pageSize);
        loadDataItems();
    };


    return <div className='voucher p-4'>
        <Spin spinning={loading}>
            <Row justify='space-between'>
                <Col className="w-4/5">
                    <Tooltip title={`Quản lý chiến dịch ưu đãi của ${infoOffer.title}`}>
                        <h2 className="text-xl text-1-row">Quản lý chiến dịch ưu đãi của {infoOffer.title}</h2>
                    </Tooltip>
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
            <div className="w-full mt-7">
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={total > size && {
                        current: page,
                        pageSize: size,
                        onChange: handleChangePaging,
                        total,
                    }}
                />
            </div>
        </Spin>
        <AddOrEdit
            isOpen={isShowForm}
            item={infoVoucher}
            onClose={confirm => {
                setIsShowForm(false);
                setInfoVoucher(null);
                confirm && loadDataItems();
            }}
        />
    </div>
}

export default Voucher;