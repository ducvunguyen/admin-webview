import { useState, useEffect } from 'react';
import {
    Drawer,
    Form,
    Button,
    Col,
    Row,
    Input,
    Typography,
    Space,
    Select,
    message,
} from 'antd';
import { LIST_STATUS, VALIDATE_REQUIRED } from 'utilities/constants';
import { filterSelectAnt, makeId } from 'utilities/functionCommon';
import { registerPosition, updatePosition } from 'services/position';
import { getUsersActive } from 'services/user';

const { Option } = Select;
const { Text } = Typography;
const listStatus = LIST_STATUS;

function AddOrEdit({ isOpen, onClose, position }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userNumbers, setUserMembers] = useState([]);
    const [userLeaders, setUserLeaders] = useState([]);

    useEffect(() => {
        if(isOpen){
            form.resetFields();
            form.setFieldsValue({
                name: position?.name,
                leaders: position?.leaders ? position?.leaders[0] :  null,
                members: position?.members || [],
                status: position?.status || 'ACTIVE',
            });

            userActive('MEMBER');
            userActive('LEADER');
        }

    }, [position, isOpen]);

    const userActive = type => {
        const params = { type };

        if (position) params.positionId = position.id
        getUsersActive(params).then(({data: {users}}) => {
                if (type === 'MEMBER')
                    setUserMembers(users);
                else setUserLeaders(users);
        })
    }

    const handleClose = () => onClose(false);

    const handleChangeTeams = () => {
        const valueMembers = form.getFieldValue('members')
        const leaderId = form.getFieldValue('leaders')
        if (valueMembers && valueMembers.length > 0){
            const members = [];
            valueMembers.forEach(memberId => {
                if (memberId != leaderId)
                    members.push(memberId);
            });
            // valueLeaders.map(item => {
            //     if (keyById[item]) {
            //         delete keyById[item];
            //     }
            // });

            form.setFieldsValue({ members })
        }
    }

    const handleSubmit = async (values) => {
        const cloneValues = {...values};
        cloneValues['leaders'] = [values.leaders];
        setLoading(true);

        try {
            position
                ? await updatePosition(position.id, cloneValues)
                : await registerPosition(cloneValues);
            setLoading(false);
            message.success(
                `${
                    position
                        ? 'Sửa tài liệu thành công'
                        : 'Tạo tài liệu thành công'
                }`,
            );
            onClose(values.status);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            closable={false}
            visible={isOpen}
            onClose={handleClose}
            width={720}
            bodyStyle={{ paddingBottom: 80 }}
            title={
                <Space
                    style={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Text strong>
                        {position ? 'Cập nhật teams' : 'Thêm mới teams'}
                    </Text>
                    <Space>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button
                            onClick={() => {
                                form.submit();
                            }}
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {position ? 'Lưu' : 'Tạo'}
                        </Button>
                    </Space>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                id={'form-category'}
            >
                <Row gutter={16} className={'mt-4'}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên nhóm"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Input
                                placeholder="Nhập tên nhóm"
                                disabled={loading}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="leaders"
                            label="Leader"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Select
                                onChange={handleChangeTeams}
                                // mode="multiple"
                                showSearch
                                filterOption={(input, option) => filterSelectAnt({input, option})}
                                placeholder="Chọn leaders"
                            >
                                { userLeaders.map((item, index) =>
                                    <Option key={'leader' + index} value={item.id}>{item.email}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="members"
                            label="Members"
                            rules={[VALIDATE_REQUIRED]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Chọn member"
                                onChange={handleChangeTeams}
                                filterOption={(input, option) =>
                                    filterSelectAnt({input, option})}
                            >
                                {
                                    userNumbers.map((item, index) =>
                                    <Option key={'member' + index} value={item.id}>
                                        {item.email}
                                    </Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                            >
                                { listStatus.map((item, index) =>
                                    <Option key={makeId(60)} value={item.value}>{item.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
}

export default AddOrEdit;