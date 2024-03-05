import { useEffect, useState } from 'react';
import { Modal, Button, Tooltip, Table, Popconfirm, message } from 'antd';
import {
    AppstoreAddOutlined, DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';

import { makeId } from 'utilities/functionCommon';
import { deleteComment, getComments } from 'services/comment';
import FormTask from './FormTask';
import moment from 'moment';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER, LEADER_APPROVAL, LIST_STATUS_TASK } from 'utilities/constants';
import { getCurrentUser } from 'utilities/storage';

const TaskOffer = ({ offer, onClose, isOpen }) => {
    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);
    const perLeaderApproval = canActivePermission([LEADER_APPROVAL]);

    const [dataSource, setDataSource] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [task, setTask] = useState(null);
    const [isChangeForm, setIsChangeForm] = useState(false);
    const columns = [
        {
            width: 80,
            title: '#',
            dataIndex: '',
            align: 'center',
            render: (text, record, index) =>
                page * size + index + 1,
        }
        , {
            title: 'Mô tả',
            dataIndex: '',
            render: (_, record) =>
                <div
                className={`${record.status === 'DONE' ? 'line-through' : ''}`}
                    dangerouslySetInnerHTML={{__html: record.description.replaceAll('\n', '<br/>')}}></div>
        },
        {
            title: 'Người tạo',
            render: (_, record) =>
                <span className={`${record.status === 'DONE' ? 'line-through' : ''}`}>
                     {moment(record.createdDate).format('HH:mm DD/MM/YYYY')}
                    <br/>
                    {record.createdUser}
                </span>
        },
        {
            title: 'Người cập nhật',
            render: (_, record) =>
                <span className={`${record.status === 'DONE' ? 'line-through' : ''}`}>
                     {moment(record.updatedDate).format('HH:mm DD/MM/YYYY')}
                    <br/>
                    {record.updatedUser}
                </span>
        },
        {
            title: 'Trạng thái',
            render: (_, {status} ) =>
                <div
                    style={{background: LIST_STATUS_TASK[status].bgColor,
                        color: LIST_STATUS_TASK[status].textColor}}
                    className={`${status === 'DONE' ? 'line-through' : ''} flex justify-center`}>
                {status}
            </div>
        },
        {
            title: '',
            render: (_, record) =>
                <div className='flex justify-center'>
                    <Button
                        size="small"
                        type="primary"
                        Primary
                        style={{background: "#ffc107"}}
                        onClick={() => {
                            setTask(record);
                            setIsOpenForm(true);
                        }}
                        icon={<EditOutlined/>}
                    />
                    <Popconfirm
                        className='ml-2'
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
        }
    ];

    useEffect(() => {
        if (isOpen) loadDataItems();
        else {
            setPage(0);
            setIsChangeForm(false);
        }
    }, [page, size, isOpen]);

    const loadDataItems = () => {
        const params = { page, size, id: offer.id };
        setLoading(true);
        getComments(params).then(({data}) => {
            const {commentTasks, totalSize} = data;
            setDataSource(commentTasks);
            setTotalItems(totalSize)
        }).finally(() => setLoading(false));
    }

    const handleDeleteItem = (record) => {
        if (getCurrentUser()?.id != record?.createdBy) //check quyen nguoi dung
            return message.warn('Chỉ có người tạo mới có quyền được xóa!');

        setLoading(true);
        deleteComment(record.id)
            .then((res) => {
                message.success('Xóa thành công');
                setIsChangeForm(true);
                loadDataItems();
            }).finally(() => setLoading(false));
    };

    const handleChangePaging = (page, pageSize) => {
        setPage(page - 1);
        setSize(pageSize);
    };

    const handleClose = () => onClose(isChangeForm);

    const handleAfterSubscribeForm = confirm => {
        setIsOpenForm(false);

        if (confirm){
            setIsChangeForm(true);
            loadDataItems();
        }
    }

    if (!isOpen)
        return null;

    return (
        <>
            <Modal
                visible={isOpen}
                title={<span className='font-bold'>{offer.title + ' - ' + offer.ownerName}</span>}
                onOk={handleClose}
                footer={null}
                width={1000}
                onCancel={handleClose}
            >
                {
                    (perActiveOffer || perLeaderApproval) &&
                    <Tooltip placement="topLeft" title="Thêm task">
                        <Button type="primary"
                                onClick={() => setIsOpenForm(true)}
                                icon={<AppstoreAddOutlined />} >
                            Thêm mới
                        </Button>
                    </Tooltip>
                }

                <Table
                    className="request-table mt-4"
                    columns={columns}
                    dataSource={dataSource}
                    bordered
                    size="small"
                    rowKey={makeId(70)}
                    loading={loading}
                    pagination={totalItems > size && {
                        current: page + 1,
                        size,
                        onChange: handleChangePaging,
                        total: totalItems,
                    }}
                />
                <FormTask offer={offer}
                          isOpen={isOpenForm}
                          task={task}
                          onClose={handleAfterSubscribeForm}/>
            </Modal>
        </>
    );
};

export default TaskOffer;