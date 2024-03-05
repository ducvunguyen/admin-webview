import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    Row, Col, Card, Table, Button, Checkbox,
    Popconfirm, message, Input, Select,
    Popover, Typography, DatePicker, Tooltip,
} from 'antd';
import {
    DeleteOutlined, EditOutlined,
    AppstoreAddOutlined, SearchOutlined,
    RedoOutlined, FileProtectOutlined, EyeOutlined,
    CalendarOutlined, CloudDownloadOutlined,
    CopyOutlined, MessageOutlined, FilterOutlined,
    FilePdfOutlined, LinkOutlined, MobileOutlined
} from '@ant-design/icons';

import CardSort from 'components/CardSort';
import IconCommon from 'components/IconCommon';
import { countNotification } from 'services/notification';
import { canActivePermission } from 'utilities/permission';
import ExportOffer from './ExportOffer';
import AddOrEdit from './AddOrEdit';
import ViewByDay from './ViewByDay';
import AddressOffer from './AddressOffer';
import useCategory from 'hooks/useCategory';
import useCard from 'hooks/useCard';
import usePosition from 'hooks/usePosition';

import { getOffers, deleteOffer, activeOffer, offerCopy } from 'services/offer';
import { filterSelectAnt, makeId } from 'utilities/functionCommon';

import {
    ACTIVE_OFFER, FILTER_WHITE,
    LEADER_APPROVAL,
    LIST_STATUS_OFFER,
    LIST_STATUS_TASK
} from 'utilities/constants';

// import useUser from 'hooks/useUser';
import { getUsersByFilter } from 'services/user';
import TaskOffer from './TaskOffer/TaskOffer';
import useOfferId from 'hooks/useOfferId';
import DocumentOffer from './DocumentOffer';
import FilterHotDeal from './FilterHotDeal';
import { PATHS } from 'configs';


import EmulatorMobile from './EmulatorMobile';

import './style.scss';

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

function Offer() {
    const history = useHistory();

    const categories = useCategory();
    const cards = useCard();
    const positions = usePosition();

    const { offerId, clearOfferId } = useOfferId();

    const [loadingTable, setLoadingTable] = useState(true);
    const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isShowFrom, setIsShowForm] = useState(false);
    const [infoOffer, setInfoOffer] = useState(null);
    const [isCheckedAll, setIsCheckedAll] = useState(false);
    const [keyFilterSort, setKeyFilterSort] = useState({});
    const [isCopy, setIsCopy] = useState(false);
    const [isOpenModalAddress, setIsOpenModalAddress] = useState(false);
    const [visibleView, setVisibleView] = useState(false);
    const [count, setCount] = useState(0);
    const [isOpenEmulatorMobile, setIsOpenEmulatorMobile] = useState(false);
    const [isOpenExportExcel, setIsOpenExportExcel] = useState(false);
    const [isOpenComment, setIsOpenComment] = useState(false);
    const [isOpenFilterHotDeal, setIsOpenFilterHotDeal] = useState(false);
    const [isOpenDocument, setIsOpenDocument] = useState(false);
    const [users, setUsers] = useState([]);
    const [showAndHideColumn, setShowAndHideColumn] = useState(defaultShowAndHideColumn);

    let [filterSearch, setFilterSearch] = useState({});

    let [status, setStatus] = useState('');
    const hasPerActiveOffer = canActivePermission([ACTIVE_OFFER]);
    const hasPerLeaderApproval = canActivePermission([LEADER_APPROVAL]);
    // const perUserManagement = canActivePermission([USER_MANAGEMENT]);

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
    };

    useEffect(() => {
        fetchData();
    }, [pageSize, pageIndex, keyFilterSort, status, offerId]);

    useEffect(() => {
        getCountPending();
        fetchUserTeams('');
    }, []);

    const keyByStatus = LIST_STATUS_OFFER.reduce((obj, cur) => ({ ...obj, [cur.value]: cur.name }), {});

    const getCountPending = () => hasPerActiveOffer &&
        countNotification().then(({ data }) => setCount(data)).catch().finally();

    const fetchUserTeams = positionId =>
        getUsersByFilter(positionId).then(({ data: { users } }) => setUsers(users)).finally();

    const fetchData = async () => {
        setIsCheckedAll(false);
        try {
            setLoadingTable(true);
            let params = {
                page: pageIndex - 1,
                size: pageSize,
                status,
            };

            if (keyFilterSort && !offerId)
                params = { ...filterSearch, ...params, sorts: keyFilterSort };

            if (offerId) {
                params.id = offerId;
                params.status = '';
            }

            const res = await getOffers(params);
            const { totalSize, offers } = res.data;
            offers.forEach(item => item.checked = false);
            setData(offers || []);
            setTotal(totalSize);

        } finally {
            setLoadingTable(false);
        }
    };

    const handleFilterSelect = nameStatus => event => {
        if (nameStatus === 'status') {
            if (offerId) clearOfferId();
            setStatus(event);
        } else {
            if (nameStatus === 'positionId') {
                filterSearch['createdBy'] = '';
                fetchUserTeams(event);
            }

            filterSearch[nameStatus] = Array.isArray(event) ? event.join(',') : event;
            setFilterSearch({ ...filterSearch });
        }
    };

    const handleRemoveItem = async (record) => {
        try {
            deleteOffer(record.id).then((res) => {
                message.success('Xóa dữ liệu thành công');
                fetchData();
            });
        } finally {
        }
    };

    const handleChangeCheckAll = event => {
        const checked = event.target.checked, cloneOffer = data;
        setIsCheckedAll(checked);
        cloneOffer.forEach(item => item.checked = checked);
        setData([...cloneOffer]);
    };

    const handleChangeCheckedItem = index => event => {
        const checked = event.target.checked, cloneOffer = data;
        cloneOffer[index].checked = checked;
        setIsCheckedAll(cloneOffer.findIndex(item => item.checked === false) === -1 ?? false);
        setData([...cloneOffer]);
    };

    const submitActiveOffer = () => {
        if (status == 'PENDING' || status == 'LEADER_APPROVED') {
            let offerIds = [];
            data.forEach(item => item.checked ? offerIds.push(item.id) : null);
            if (offerIds.length === 0) return message.warn('Bạn chưa chọn ưu đãi nào cả');

            activeOffer(offerIds).then(() => {
                message.success('Phê duyệt thành công');
                fetchData();
            }).catch(err => console.log(err)).finally();
        } else
            message.warn('Ưu đãi phải là trạng thái chờ duyệt');
    };

    const handleSort = (params) => {
        const dataActive = { ...keyFilterSort };
        dataActive[params.keyName] = params.param;
        setKeyFilterSort({ ...dataActive });
    };

    const handleParamSearch = key => event => {
        const keyword = event.target.value;
        filterSearch[key] = keyword;
        setFilterSearch({ ...filterSearch });
    };

    const CustomCardHeader = ({ keyName, title }) => {
        return <>
            <CardSort keyName={keyName} title={title} onClose={handleSort} focus={keyFilterSort[keyName]} />
        </>;
    };

    const handleReset = () => window.location.reload();

    const handleCopyOffer = item =>
        offerCopy(item.id).then(() => {
            fetchData();
            message.success('Sao chép ưu đãi thành công');
        }).catch(() => message.error('Sao chép ưu đãi thất bại'));

    const tdAction = (cell, record) => {
        return (
            <div key={makeId(20)} className='flex justify-center items-center'>
                <Tooltip placement='topLeft' title='Quản lý địa chỉ ưu đãi'>
                    <Button
                        className='btn-location'
                        size='small'
                        onClick={() => {
                            if ((record.latitude && record.longitude) && (record.latitude != '' && record.longitude != ''))
                                return message.warn(
                                    <span style={{ background: 'rgb(251 191 36)', padding: '1rem' }}>
                                            Để thực hiện thao tác này vui lòng xóa bỏ tọa độ mặc định bằng cách chỉnh sửa
                                        </span>,
                                );

                            setIsOpenModalAddress(true);
                            setInfoOffer(record);
                        }}
                        icon={<IconCommon type={'icon-location'} />}
                    >
                    </Button>
                </Tooltip>
                <div className='ml-2' onClick={(event) => event.stopPropagation()}>
                    <Popconfirm
                        placement='topRight'
                        title={'Bạn có chắc chắn muốn sao chép ưu đãi này không?'}
                        onConfirm={() => handleCopyOffer(record)}
                        okText='Đồng ý'
                        cancelText='Hủy'
                    >
                        <Tooltip placement='topLeft' title='Sao chép bản ghi'>
                            <Button
                                size='small'
                                icon={<CopyOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
                <div className='ml-2'>
                    <Button
                        className='btn-location'
                        size='small'
                        style={{ background: 'red' }}
                        onClick={() => history.push(PATHS.VOUCHER + record.id)}
                        icon={<IconCommon
                            style={{ filter: FILTER_WHITE }}
                            type={'icon-discount-voucher'} />}
                    >
                    </Button>
                </div>

                <Tooltip className='ml-2' placement='topLeft' title='Quản lý task ưu đãi'>
                    <Button
                        icon={<MessageOutlined />}
                        size='small'
                        Primary
                        onClick={() => {
                            setIsOpenComment(true);
                            setInfoOffer(record);
                        }}
                    />
                </Tooltip>
                <div className='ml-2'>
                    <Tooltip placement='topLeft' title='Xem trước ưu đãi'>
                        <Button
                            icon={<MobileOutlined />}
                            size='small'
                            Primary
                            onClick={() => {
                                setIsOpenEmulatorMobile(true);
                                setInfoOffer(record);
                            }}
                        />
                    </Tooltip>
                </div>
                <div className='ml-2'>
                    <CopyToClipboard text={`https://miniapp.mbbank.com.vn/discovery/webview/offers/${record.id}?share=ok`}
                                     onCopy={() => message.success('Copy thành công')}>
                        <Button
                            icon={<LinkOutlined />}
                            size='small'
                            Primary
                            type='primary'
                        />
                    </CopyToClipboard>
                </div>
                <div className='ml-2'>
                    <Tooltip placement='topLeft' title='Chỉnh sửa ưu đãi'>
                        <Button
                            icon={<EditOutlined />}
                            size='small'
                            type='primary'
                            style={{ background: '#ffc107' }}
                            onClick={() => {
                                setIsShowForm(true);
                                setInfoOffer(record);
                            }}
                        />
                    </Tooltip>
                </div>

                <div className={'ml-2'} onClick={(event) => event.stopPropagation()}>
                    <Popconfirm
                        placement='topRight'
                        title={'Bạn có chắc chắn muốn xóa ưu đãi này?'}
                        onConfirm={() => handleRemoveItem(record)}
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
            </div>
        );
    };

    const columns = [
        {
            width: 60,
            title: <>
                {(((status === 'PENDING' || status === 'LEADER_APPROVED') &&
                    hasPerActiveOffer || (status === 'PENDING' && hasPerLeaderApproval))) ?
                    <Checkbox key={makeId(20)} checked={isCheckedAll}
                              onChange={handleChangeCheckAll} /> :
                    <span>#</span>
                }
            </>,
            dataIndex: '',
            align: 'center',
            fixed: 'left',
            render: (text, record, index) => <>
                {
                    (((status === 'PENDING' || status === 'LEADER_APPROVED') &&
                        hasPerActiveOffer || (status === 'PENDING' && hasPerLeaderApproval))) ?
                        <Checkbox key={makeId(20)} checked={record.checked}
                                  onChange={handleChangeCheckedItem(index)} /> :
                        <span>{pageSize * (pageIndex - 1) + index + 1}</span>
                }

            </>,
        },
        {
            width: showAndHideColumn?.task.isOpen ? 60 : 0,
            title: showAndHideColumn?.task.isOpen && showAndHideColumn?.task.title,
            align: 'center',
            fixed: 'left',
            render: (text, { commentTask }) =>
                (commentTask && showAndHideColumn?.task.isOpen) &&
                <div
                    style={{
                        background: LIST_STATUS_TASK[commentTask.commentTaskStatus].bgColor,
                        color: LIST_STATUS_TASK[commentTask.commentTaskStatus].textColor,
                    }}>
                    {commentTask.totalTask}
                </div>,
        },
        {
            width: showAndHideColumn?.title.isOpen ? 250 : 0,
            title: showAndHideColumn?.title.isOpen
                && <CustomCardHeader title={showAndHideColumn?.title.title} keyName='title' />,
            dataIndex: showAndHideColumn?.title.isOpen ? 'title' : '',
            visible: false,
            align: 'left',
            fixed: 'left',
        },
        {
            width: showAndHideColumn?.thumbnail.isOpen ? 150 : 0,
            title: showAndHideColumn?.thumbnail.isOpen && showAndHideColumn?.thumbnail.title,
            align: 'center',
            render: (text, record, index) => showAndHideColumn?.thumbnail.isOpen && (
                <img key={makeId(20)} src={record?.thumbnailUrl} alt='logo' width={50} />
            ),
        },
        {
            width: showAndHideColumn?.category.isOpen ? 100 : 0,
            title: showAndHideColumn?.category.isOpen && showAndHideColumn?.category.title,
            align: 'left',
            render: (text, record) => showAndHideColumn?.category.isOpen && <>
                <span dangerouslySetInnerHTML={{
                    __html:
                        record.categories ? record.categories.map(item => '- ' + item.name).join('<br /> ') : '',
                }}>
                </span>
            </>,
        },
        {
            width: showAndHideColumn?.ownerName.isOpen ? 200 : 0,
            title: showAndHideColumn?.ownerName.isOpen &&
                    <CustomCardHeader title={showAndHideColumn?.ownerName.title}
                                  keyName={'ownerName'} />,
            dataIndex: showAndHideColumn?.ownerName.isOpen ? 'ownerName' : '',
            align: 'center',
        },
        {
            width: showAndHideColumn?.startDate.isOpen ? 200 : 0,
            title: showAndHideColumn?.startDate.isOpen &&
                <CustomCardHeader title={showAndHideColumn?.startDate.title} keyName={'startDate'} />,
            align: 'center',
            render: (text, { startDate }) =>
                showAndHideColumn?.startDate.isOpen &&
                <span>{moment(startDate).format('DD/MM/YYYY')}</span>,
        },
        {
            width: showAndHideColumn?.expiredDate.isOpen ? 200 : 0,
            title: showAndHideColumn?.expiredDate.isOpen &&
                <CustomCardHeader title={showAndHideColumn?.expiredDate.title} keyName={'expiredDate'} />,
            align: 'center',
            render: (text, { expiredDate }) =>
                showAndHideColumn?.expiredDate.isOpen &&
                <span>
                    {moment(expiredDate).format('hh:mm:ss DD/MM/YYYY')}
                </span>,
        },
        {
            width: showAndHideColumn?.view.isOpen ? 100 : 0,
            title: showAndHideColumn?.view.isOpen
                    && <CardSort keyName='view'
                           title={showAndHideColumn?.view.title}
                           onClose={handleSort}
                           focus={keyFilterSort['view']} />,
            align: 'center',
            render: (text, record) => showAndHideColumn?.view.isOpen && <span>
                {record.view || 0}
                <Button className='ml-2' onClick={() => {
                    setInfoOffer(record);
                    setVisibleView(true);
                }}>
                    <CalendarOutlined className='cursor-pointer' />
                </Button>
            </span>,
        },
        {
            width: showAndHideColumn?.react.isOpen ? 100 : 0,
            title: showAndHideColumn?.react.isOpen &&
                     <CardSort keyName='react'
                        title={showAndHideColumn?.react.title}
                        onClose={handleSort}
                        focus={keyFilterSort['react']} />,
            align: 'center',
            render: (text, record) => showAndHideColumn.react.isOpen && <span>
                {record.react || 0}
            </span>,
        },
        {
            width: showAndHideColumn?.status.isOpen ? 150 : 0,
            title: showAndHideColumn?.status.isOpen && showAndHideColumn?.status.title,
            align: 'center',
            render: (text, record) => showAndHideColumn?.status.isOpen && (
                <>{keyByStatus[record?.status]}</>
            ),
        },
        {
            width: showAndHideColumn?.updatedByUserName.isOpen ? 250 : 0,
            title: showAndHideColumn?.updatedByUserName.isOpen &&
                <CardSort keyName='updatedByUserName' title={showAndHideColumn?.updatedByUserName.title}
                          onClose={handleSort}
                          focus={keyFilterSort['updatedByUserName']} />,
            align: 'center',
            render: (text, { updatedByUserName }) =>
                showAndHideColumn?.updatedByUserName.isOpen ?
                    <span>{updatedByUserName &&
                        <div>{updatedByUserName}</div>}
                </span> : '',
        },
        {
            width: showAndHideColumn?.updatedDate.isOpen ? 250 : 0,
            title: showAndHideColumn?.updatedDate.isOpen &&
                <CardSort keyName='updatedDate' title={showAndHideColumn?.updatedDate.title}
                          onClose={handleSort}
                          focus={keyFilterSort['updatedDate']} />,
            align: 'center',
            render: (text, { updatedDate }) =>
                showAndHideColumn?.updatedDate.isOpen &&
                    moment(updatedDate).format('hh:mm:ss DD/MM/YYYY'),
        },
        {
            width: showAndHideColumn?.createdByUserName.isOpen ? 200 : 0,
            title: showAndHideColumn?.createdByUserName.isOpen &&
                <CustomCardHeader title={showAndHideColumn?.createdByUserName.title}
                                  key={['createdByUserName']} />,
            align: 'center',
            render: (text, { createdByUserName }) =>
                (showAndHideColumn?.createdByUserName.isOpen && createdByUserName) &&
                    createdByUserName,
        },
        {
            width: showAndHideColumn?.createdDate.isOpen ? 200 : 0,
            title: showAndHideColumn?.createdDate.isOpen &&
                <CustomCardHeader title={showAndHideColumn?.createdDate.title} key={['createdDate']} />,
            align: 'center',
            render: (text, { createdDate }) =>
                showAndHideColumn?.createdDate.isOpen &&
                    moment(createdDate).format('DD/MM/YYYY'),
        },
        {
            title: '',
            dataIndex: '',
            align: 'center',
            width: 250,
            fixed: Object.values(showAndHideColumn).filter(item => item.isOpen).length > 5 && 'right',
            render: (cell, record) => tdAction(cell, record),
        },
    ];

    if (!hasPerActiveOffer && !hasPerLeaderApproval) columns.shift();

    const handleShowAndHideColumn = key => {
        const cloneShowAndHideColumn = { ...showAndHideColumn };
        cloneShowAndHideColumn[key].isOpen = !cloneShowAndHideColumn[key].isOpen;
        setShowAndHideColumn({ ...cloneShowAndHideColumn });
    };

    const content = (
        <div className='w-full'>
            {
                Object.keys(showAndHideColumn).map((key, index) => {
                    return (
                        <div className={'mt-2'} key={'showColumn' + key}>
                            <Checkbox onChange={() => handleShowAndHideColumn(key)}
                                      defaultChecked={showAndHideColumn[key].isOpen}>
                                {showAndHideColumn[key].title}
                            </Checkbox>
                        </div>
                    );
                })
            }
        </div>
    );

    const filterEnter = event => event.key === 'Enter' && fetchData();

    return (
        <div className='account p-4'>
            <Row justify='space-between'>
                <Col>
                    <Title level={4}>Quản lý ưu đãi </Title>
                    <div>
                        {
                            hasPerActiveOffer &&
                            <span style={{ marginTop: -7 }}>Chờ duyệt: {count}</span>
                        }
                    </div>
                </Col>
                <Col>
                    <Button
                        type='primary'
                        icon={<FilePdfOutlined />}
                        onClick={() => setIsOpenDocument(true)}
                    >
                        Tài liệu
                    </Button>
                    <Button
                        className='ml-2'
                        type='primary'
                        icon={<FilterOutlined />}
                        onClick={() => {
                            setIsOpenFilterHotDeal(true);
                            setInfoOffer(null);
                        }}
                    >
                        Lọc hot deal
                    </Button>
                    <Button
                        type='primary'
                        className='ml-2'
                        icon={<AppstoreAddOutlined />}
                        onClick={() => {
                            setIsShowForm(true);
                            setInfoOffer(null);
                        }}
                    >
                        Thêm mới
                    </Button>
                </Col>
            </Row>
            <Card className='content-table'>
                <Row gutter={16}>
                    <Col span={2}>
                        <lable>Trạng thái</lable>
                    </Col>
                    <Col span={6}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder='Lọc theo trạng thái'
                            onChange={handleFilterSelect('status')}
                            value={status}
                        >
                            <Option value=''>Tất cả</Option>
                            {LIST_STATUS_OFFER.map((item, index) =>
                                <Option key={makeId(20)}
                                        value={item.value}>{item.name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={2}>
                        <lable>Tiêu đề</lable>
                    </Col>
                    <Col span={6}>
                        <Input
                            onChange={handleParamSearch('title')}
                            value={filterSearch.title}
                            onKeyPress={filterEnter}
                            placeholder={'Tìm kiếm tiêu đề'} />
                    </Col>
                    <Col span={2}>
                        <lable>Danh mục</lable>
                    </Col>
                    <Col span={6}>
                        <Select
                            mode='multiple'
                            style={{ width: '100%' }}
                            placeholder='Lọc theo danh mục'
                            filterOption={(input, option) => filterSelectAnt({ input, option })}
                            onChange={handleFilterSelect('categoryIds')}
                        >
                            <Option value=''>Tất cả</Option>
                            {categories.map((item, index) =>
                                <Option key={makeId(20)}
                                        value={item.id}>{item.name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Thương hiệu</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Input
                            onChange={handleParamSearch('ownerName')}
                            value={filterSearch.ownerName}
                            onKeyPress={filterEnter}
                            placeholder={'Tìm kiếm thương hiệu'} />
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Mô tả</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Input
                            onChange={handleParamSearch('description')}
                            value={filterSearch.description}
                            onKeyPress={filterEnter}
                            placeholder={'Tìm kiếm mô tả'} />
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Điều kiện</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Input
                            onChange={handleParamSearch('conditions')}
                            onKeyPress={filterEnter}
                            value={filterSearch.conditions}
                            placeholder={'Tìm kiếm điều kiện'} />
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Hết hạn</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder='Lọc'
                            onChange={handleFilterSelect('expired')}
                        >
                            <Option key={makeId(20)}
                                    value={''}>Tất cả</Option>
                            <Option key={makeId(20)}
                                    value={'ACTIVE'}>Đang hoạt đông</Option>
                            <Option key={makeId(20)}
                                    value={'EXPIRED'}>Hết hạn</Option>
                            <Option key={makeId(20)}
                                    value={'COMING_SOON'}>Coming soon</Option>
                        </Select>
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Độ phủ</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Input
                            onChange={handleParamSearch('coverageDescription')}
                            value={filterSearch.coverageDescription}
                            onKeyPress={filterEnter}
                            placeholder={'Tìm kiếm độ phủ'} />
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Cách sử dụng</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Input
                            onChange={handleParamSearch('useMethod')}
                            onKeyPress={filterEnter}
                            value={filterSearch.useMethod}
                            placeholder={'Cách sử dụng'} />
                    </Col>
                    {
                        hasPerActiveOffer &&
                        <>
                            <Col span={2} className={'mt-3'}>
                                <lable>Teams</lable>
                            </Col>
                            <Col span={6} className={'mt-3'}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder='Chọn teams'
                                    showSearch
                                    allowClear
                                    optionFilterProp='children'
                                    onChange={handleFilterSelect('positionId')}
                                >
                                    {
                                        positions.map((item, index) =>
                                            <Option key={'position' + index} value={item.id}>
                                                <div className='demo-option-label-item'>
                                                    <span role='img' aria-label='China'>
                                                     {item.name}
                                                    </span>
                                                </div>
                                            </Option>)
                                    }
                                </Select>
                            </Col>
                        </>
                    }

                    {
                        (hasPerActiveOffer || hasPerLeaderApproval) &&
                        <>
                            <Col span={2} className={'mt-3'}>
                                <lable>Người dùng</lable>
                            </Col>
                            <Col span={6} className={'mt-3'}>
                                <Select
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder='Lọc theo email người dùng'
                                    onChange={handleFilterSelect('createdBy')}
                                    value={filterSearch['createdBy'] || null}
                                    allowClear
                                    filterOption={(input, option) =>
                                        filterSelectAnt({ input, option })}
                                >
                                    {
                                        users.map(item =>
                                            <Option key={makeId(20)}
                                                    value={item.id}>{item.email}
                                            </Option>,
                                        )
                                    }
                                </Select>
                            </Col>
                        </>
                    }

                    <Col span={2} className={'mt-3'}>
                        <lable>Ngày tạo</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <RangePicker
                            format='DD/MM/YYYY'
                            onChange={event => {
                                filterSearch['fromCreatedDate'] = event ? moment(event[0]).format().split('+')[0] : '';
                                filterSearch['toCreatedDate'] = event ? moment(event[1]).format().split('+')[0] : '';
                                setFilterSearch({ ...filterSearch });
                            }}
                        />
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Phương thức ưu đãi</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Select
                            mode='multiple'
                            style={{ width: '100%' }}
                            placeholder='Chọn thẻ ưu đãi'
                            allowClear
                            onChange={handleFilterSelect('cardId')}
                        >
                            {
                                cards.map((item, index) =>
                                    <Option key={'card' + index} value={item.id}>
                                        <div className='demo-option-label-item'>
                                            <span role='img' aria-label='China'>
                                                {item.name}
                                            </span>
                                        </div>
                                    </Option>)
                            }
                        </Select>
                    </Col>
                    <Col span={2} className={'mt-3'}>
                        <lable>Comment task</lable>
                    </Col>
                    <Col span={6} className={'mt-3'}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder='Task'
                            allowClear
                            onChange={handleFilterSelect('commentTaskStatus')}
                        >
                            <Option value=''>
                                Tất cả
                            </Option>
                            {
                                Object.keys(LIST_STATUS_TASK).map(key => (
                                    <>
                                        {
                                            (key != 'REOPEN' && key != 'PROCESSING') &&
                                            <Option value={key}>
                                                <div className='flex items-center'>
                                                    <div> {key === 'OPEN' ? 'Open & Reopen' :
                                                        key === 'PENDING' ? 'Pending & Processing' : key} &nbsp;&nbsp;</div>
                                                    <span className='w-2.5 h-2.5'
                                                          style={{ background: LIST_STATUS_TASK[key].bgColor }}></span>
                                                </div>
                                            </Option>
                                        }
                                    </>
                                ))
                            }
                        </Select>
                    </Col>

                </Row>
                <div className='flex justify-end'>
                    <Col className={'mt-2'}>
                        <Button type='primary'
                                icon={<SearchOutlined />}
                                onClick={() => {
                                    if (offerId)
                                        clearOfferId();
                                    else fetchData();
                                }}> Tìm kiếm </Button>
                    </Col>
                    <Col className={'mt-2 ml-2'}>
                        <Button type='primary'
                                icon={<RedoOutlined />}
                                onClick={() => handleReset()}>Làm mới</Button>
                    </Col>
                </div>
                <div className='mt-4 flex justify-between'>
                    {
                        (hasPerActiveOffer || hasPerLeaderApproval) &&
                        <Col className={'mt-2'}>
                            <Button key={makeId(20)}
                                    icon={<FileProtectOutlined />}
                                    type='primary'
                                    onClick={submitActiveOffer}>Phê duyệt</Button>
                        </Col>
                    }
                    <div className='flex'>
                        <Col className='mt-2'>
                            <Button key={makeId(20)}
                                    icon={<CloudDownloadOutlined />}
                                    type='primary'
                                    onClick={() => setIsOpenExportExcel(true)}>
                                Xuất báo cáo</Button>
                        </Col>
                        <Popover content={content} title='Chọn cột hiện thị' trigger='click'>
                            <Button className={'mt-2 ml-1'} icon={<EyeOutlined />} type='primary'>Hiển thị cột</Button>
                        </Popover>
                    </div>

                </div>
                <div className='mt-4'>
                    Tổng số bản ghi: <b>{total}</b>
                </div>
                <Table
                    scroll={{ x: Object.values(showAndHideColumn).filter(item =>
                            item.isOpen).length > 5 ? 1300 : '100%' }}
                    className='request-table '
                    columns={columns}
                    dataSource={data}
                    bordered
                    size='small'
                    loading={loadingTable}
                    pagination={{
                        current: pageIndex,
                        pageSize,
                        onChange: handleChangePaging,
                        total,
                    }}
                />
            </Card>
            <AddOrEdit
                offer={infoOffer}
                isOpen={isShowFrom}
                isCopy={isCopy}
                onClose={(confirm) => {
                    setIsShowForm(false);
                    setInfoOffer(null);
                    setIsCopy(false);
                    if (confirm) {
                        setStatus(confirm);
                        getCountPending();
                        fetchData();
                    }
                }}
            />

            <AddressOffer
                isOpen={isOpenModalAddress}
                offer={infoOffer} onClose={() => {
                setInfoOffer(null);
                setIsOpenModalAddress(false);
            }}
            />

            <ViewByDay
                isOpen={visibleView}
                onClose={() => {
                    setVisibleView(false);
                    setInfoOffer(null);
                }}
                offer={infoOffer} />

            <EmulatorMobile
                isOpen={isOpenEmulatorMobile}
                item={infoOffer}
                onClose={() => {
                    setIsOpenEmulatorMobile(false);
                    setInfoOffer(null);
                }} />

            <ExportOffer keySort={keyFilterSort}
                         filterSearch={{ ...filterSearch, status }}
                         isOpen={isOpenExportExcel}
                         onClose={() => setIsOpenExportExcel(false)} />

            <TaskOffer offer={infoOffer}
                       isOpen={isOpenComment}
                       onClose={confirm => {
                           setIsOpenComment(false);
                           if (confirm) fetchData();
                       }} />

            <FilterHotDeal
                isOpen={isOpenFilterHotDeal}
                onClose={() => {
                    setIsOpenFilterHotDeal(false);
                }} />

            <DocumentOffer
                isOpen={isOpenDocument}
                onClose={() => setIsOpenDocument(false)} />
        </div>
    );
}

export default Offer;

const defaultShowAndHideColumn = {
    task: { isOpen: true, title: 'Task' },
    title: { isOpen: true, title: 'Tiêu đề' },
    thumbnail: { isOpen: true, title: 'Thumbnail' },
    category: { isOpen: true, title: 'Danh mục' },
    ownerName: { isOpen: true, title: 'Thương hiệu' },
    startDate: { isOpen: true, title: 'Ngày bắt đầu' },
    expiredDate: { isOpen: true, title: 'Ngày kết thúc' },
    view: { isOpen: true, title: 'Lượt xem' },
    react: { isOpen: true, title: 'Lượt thích' },
    status: { isOpen: true, title: 'Trạng thái' },
    updatedByUserName: { isOpen: true, title: 'Người cập nhật lần cuối bởi' },
    updatedDate: { isOpen: true, title: 'Ngày cập nhật lần cuối bởi' },
    createdByUserName: { isOpen: true, title: 'Người tạo' },
    createdDate: { isOpen: true, title: 'Ngày tạo' },
};