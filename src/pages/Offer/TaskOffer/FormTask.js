import { useEffect, useState } from 'react';
import { Modal, Button, Select, Form } from 'antd';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { registerComments, updateComments } from 'services/comment';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER, LEADER_APPROVAL, LIST_STATUS_TASK, TOOL_BAR } from 'utilities/constants';

const FormTask = ({ offer, task, onClose, isOpen }) => {
    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);
    const perLeaderApproval = canActivePermission([LEADER_APPROVAL]);
    const [formGroup] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        formGroup.setFieldsValue({
            status: task?.status || 'OPEN',
            description: task?.description || ''
        });

    }, [task, isOpen])

    const handleClose = () => onClose(false);

    const handleSubmit = () => {
        const dataUpload = {...formGroup.getFieldsValue(), offerId: offer.id};
        setLoading(true);

        const api = task ? updateComments(task.id, dataUpload) : registerComments(dataUpload);
        api.then(() => onClose(true)).finally(() => setLoading(false));
    }

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
                <Form form={formGroup} className='w-full'>
                    <Form.Item
                        label="Mô tả task"
                        name="description"
                    >
                        <CKEditor
                            disabled={!perActiveOffer && !perLeaderApproval}
                            editor={ ClassicEditor }
                            onChange={ ( event, editor ) => {
                                const description = editor.getData();
                                formGroup.setFieldsValue({ description });
                            } }
                            data={task?.description || ''}
                            config={ TOOL_BAR }
                        />
                    </Form.Item>
                    <div className='w-full flex'>
                        <div className='w-6/12'>
                            <Form.Item
                                label="Trạng thái"
                                name="status"
                            >
                                <Select placeholder='Trạng thái'
                                        options={Object.keys(LIST_STATUS_TASK).map(item => ({
                                            label: item,
                                            value: item,
                                        }))}>
                                </Select>
                            </Form.Item>
                        </div>
                        <div className='w-6/12 pl-4'>
                            <Button type="primary" onClick={ handleSubmit }>Lưu</Button>
                            <Button className='ml-2' onClick={ handleClose }>Hủy</Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default FormTask;