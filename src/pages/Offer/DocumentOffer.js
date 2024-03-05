import { useEffect, useState } from 'react';

import { Button, Spin, Modal, Upload, message, Popconfirm } from 'antd';
import { UploadOutlined, LinkOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';

import { documentInfo, documentRegister, removeDocument } from 'services/offer';

const DocumentOffer = ({ onClose, isOpen }) => {
    const [loading, setLoading] = useState(false);
    const [filePDF, setFilePDF] = useState(null);
    const [linkDocument, setLinkDocument] = useState(null);

    useEffect(() => {
        if (isOpen) loadInfoDocument();
        else setFilePDF(null);
    }, [isOpen]);

    const handleUpload = () => {
        if (!filePDF)
            return message.warn('Bạn chưa chọn tệp PDF nào cả');

        setLoading(true);
        const dataUpload = new FormData();
        dataUpload.append('documentFile', filePDF);
        setLoading(true);
        documentRegister(dataUpload).then(() => {
            message.success('Cập nhật thành công');
            loadInfoDocument();
        }).finally(() => setLoading(false));
    };

    const loadInfoDocument = () => {
        documentInfo().then(
            ({ data }) => setLinkDocument(data.documentUrl));
    };

    const handleChangeFile = event => {
        const file = event?.target?.files[0] || event?.file?.originFileObj;
        if (file)
            setFilePDF(file);
        else message.warn('Có lỗi xảy ra');
    };

    const handleOpenLinkDocument = () =>
        window.open(`http://docs.google.com/gview?url=${linkDocument}&embedded=true`);

    const handleRemoveFile = () => {
        setLoading(true);
        removeDocument().then(() => {
            message.success('Xóa tài liệu thành công');
            setLinkDocument(null);
        }).catch(() => message.error('Có lỗi xảy ra')).finally(() => setLoading(false));
    };

    if (!isOpen)
        return null;

    return (
        <>
            <Modal
                title='Tài liệu báo cáo'
                visible={isOpen}
                onOk={handleUpload}
                onCancel={onClose}
                footer={[
                    <Button key='back' onClick={onClose}>
                        Đóng
                    </Button>]}
            >
                <Spin spinning={loading}>
                    <div className='w-full '>
                        {
                            filePDF &&
                            <div className='mb-1'>
                                <span className='text-base '>File đã chọn: </span>
                                <PaperClipOutlined />
                                &nbsp;
                                <span className='italic'>{filePDF?.name}</span>
                            </div>
                        }
                        <div className='flex justify-start items-center'>
                            <Upload
                                accept='.pdf'
                                onChange={handleChangeFile} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                            </Upload>
                            <Button className='ml-2'
                                    type='primary'
                                    loading={loading} onClick={handleUpload}>
                                Tải lên
                            </Button>
                        </div>
                        {
                            linkDocument &&
                            <div className='mt-4'>
                                <Button icon={<LinkOutlined />}
                                        onClick={handleOpenLinkDocument}>
                                    Đường dẫn online
                                </Button>

                                <Popconfirm
                                    title='Bạn chắc chắn xóa tài liệu này không'
                                    okText='Có'
                                    onConfirm={handleRemoveFile}
                                    cancelText='Hủy'
                                >
                                    <Button danger icon={<DeleteOutlined />} />
                                </Popconfirm>

                            </div>
                        }
                    </div>
                </Spin>
            </Modal>
        </>
    );
};

export default DocumentOffer;