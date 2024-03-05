import { useEffect, useState } from 'react';
import { Button, message, Select, Table, Popconfirm, Switch } from 'antd';
import { AppstoreAddOutlined, EditOutlined, KeyOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import { makeId } from 'utilities/functionCommon';
import { changeStatusHotDealCampaigns, deleteHotDealCampaigns, hotDealCampaigns } from 'services/collectkv';
import AddOrEdit from './AddOrEdit';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER } from 'utilities/constants';

const HotDealCampaign = () => {
    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);

    const [dataSource, setDataSource] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModal, setOpenModal] = useState(false);
    const [hotDeal, setHotDeal] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadDataItems();
    }, [page, status]);
    const loadDataItems = () => {
        const dataFilter = {
            page: page - 1,
            size: pageSize,
            status,
        };

        setIsLoading(true);
        hotDealCampaigns(dataFilter).then(({ data: { hotDealCampaignDTOs, totalSize } }) => {
            setTotal(totalSize);
            setDataSource(hotDealCampaignDTOs);
        }).finally(() => setIsLoading(false));
    };


    const handleChangePaging = (currentPage, pageSize) => {
        setPage(page);
        setPageSize(pageSize);
    };

    const handleDeleteItem = (record) => {
        deleteHotDealCampaigns(record.id)
            .then(() => {
                message.success('Xóa thành công');
                loadDataItems();
            })
            .catch(() => message.error('Có lỗi xảy ra'));
    };

    const changeStatus = item => isTurnOff => {
        setIsLoading(true);
        changeStatusHotDealCampaigns(item.id, isTurnOff ? 'ACTIVE' : 'DEACTIVE').then(() => {
            message.success('Cập nhật thành công');
            loadDataItems();
        }).finally(() => setIsLoading(false));
    };

    const columns = [
        {
            title: '#',
            align: 'center',
            render: (_, record, index) => <span>{(page - 1) * pageSize + 1 + index}</span>,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
        },
        {
            title: 'Thời gian chiến dịch',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <>
                    <span>Từ ngày: </span><span>{moment(record.startDate).format('DD/MM/YYYY')}</span> <br />
                    Đến ngày: <span>{moment(record.expiredDate).format('DD/MM/YYYY')}</span>
                </>
            ),
        },
        {
            title: 'Tạo bởi',
            width: 250,
            align: 'center',
            render: (text, record) => (
                <>
                    <span>{record.createdByUser}</span><br />
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
                    <span>{record.updatedByUser}</span><br />
                    <span>{moment(record.updatedDate).format('HH:mm DD/MM/YYYY')}</span>
                </>
            ),
        },
        {
            title: 'Trạng thái',
            align: 'center',
            render: (text, record) => (
                <div className='flex justify-center	items-center'>
                    <Switch disabled={!perActiveOffer}
                            defaultChecked={record.status === 'ACTIVE'}
                            onChange={changeStatus(record)} />
                </div>
            ),
        },
        {
            title: 'Hành động',
            align: 'center',
            render: record => <div className={'flex items-center justify-center'}>
                <div>
                    <Button
                        disabled={!perActiveOffer}
                        icon={<EditOutlined />}
                        size='small'
                        type='primary'
                        style={{ background: '#ffc107' }}
                        Primary
                        onClick={() => {
                            setOpenModal(true);
                            setHotDeal(record);
                        }}
                    />
                </div>
                <div className={'ml-2'}
                     onClick={(event) => event.stopPropagation()}>
                    <Popconfirm
                        disabled={!perActiveOffer}
                        placement='topRight'
                        title={'Bạn có chắc chắn muốn xóa bản ghi này không?'}
                        onConfirm={() => handleDeleteItem(record)}
                        okText='Đồng ý'
                        cancelText='Hủy'
                    >
                        <Button
                            size='small'
                            type='primary'
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </div>
            </div>,
        }];


    return (
        <>
            <div className='flex justify-between'>
                <div>
                    <Select
                        className='w-full'
                        placeholder='Lọc theo trạng thái'
                        allowClear
                        onChange={setStatus}
                        defaultValue={status}
                    >
                        <Select.Option key={makeId(20)} value={''}>
                            Tất cả
                        </Select.Option>
                        <Select.Option key={makeId(20)} value={'ACTIVE'}>
                            Hoạt Động
                        </Select.Option>
                        <Select.Option key={makeId(20)} value={'DEACTIVE'}>
                            Không Hoạt Động
                        </Select.Option>
                    </Select>
                </div>
                <div className='items-center'>
                    <Button
                        disabled={!perActiveOffer}
                        type='primary'
                        icon={<AppstoreAddOutlined />}
                        onClick={() => {
                            setOpenModal(true);
                        }}
                    >
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Table columns={columns}
                   className='mt-3'
                   dataSource={dataSource}
                   pagination={{
                       current: page,
                       pageSize,
                       onChange: handleChangePaging,
                       total,
                   }}
                   loading={isLoading}
                   bordered />

            <AddOrEdit infoData={hotDeal}
                       isOpen={isOpenModal}
                       onClose={confirmChange => {
                           if (confirmChange)
                               loadDataItems();

                           setOpenModal(false);
                           setHotDeal(null);
                       }} />
        </>
    );
};

export default HotDealCampaign;