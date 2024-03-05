import React, {useState, useEffect} from 'react';
import {message, Input, Button, Col, Row, Table, Typography, Switch, Modal, Form, Select} from "antd";
import {getUsers, resetPassword, userActiveById, userDeActiveById} from "services/user";
import {AppstoreAddOutlined, EditOutlined, KeyOutlined} from "@ant-design/icons";

import AddOrEdit from "./AddOrEdit";
import {makeId} from "utilities/functionCommon";

const {Title} = Typography;

const UserComponent = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    let [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [isShowForm, setIsShowForm] = useState(false);
    const [infoData, setInfoData] = useState(null);
    let [status, setStatus] = useState('ACTIVE');
    const [isModalVisible, setIsModalVisible] = useState(false);
    useEffect(() => loadDataItems(), []);

    const loadDataItems = () => {
        const dataFilter = {
            page: page - 1,
            pageSize,
            status
        };

        setIsShowForm(false);
        setIsLoading(true);
        getUsers(dataFilter).then(({data}) => {
            const {users, totalSize} = data;
            users.forEach(item => item.checked = item.status === 'ACTIVE' ?? false);
            setTotal(totalSize);
            setDataSource(users);
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            setIsLoading(false);
        })
    }

    const handleOk = () => {
        setIsLoading(true);
        resetPassword(infoData.id, form.getFieldValue('password')).then(() =>
            message.success('Cài lại mật khẩu thành công'))
            .finally(() => setIsLoading(false));
        setIsModalVisible(false);
    };

    const handleCancel = () => setIsModalVisible(false);

    const handleChangeStatus = index => checked => {
        const id = dataSource[index].id;
        dataSource[index].checked = checked;

        setDataSource([...dataSource]);
        setIsLoading(true);
        const apiStatus = checked ? userActiveById(id) : userDeActiveById(id);
        apiStatus.then(() => {
            message.success('Cập nhật trạng thái thành công');
            if (status !== 'ALL') loadDataItems();
        }).catch(() => {
            dataSource[index].checked = !checked;
        }).finally(() => setIsLoading(false));
    }

    const handleFilterStatus = event => {
        status = event;
        setStatus(event);
        page = 1;
        setPage(1);
        loadDataItems();
    }

    const columns = [
        {
            title: '#',
            render: (_, record, index) => <span>{(page - 1) * pageSize + 1 + index}</span>
        },
        {
            title: 'Tên tài khoản',
            dataIndex: 'email'
        },
        {
            title: 'Danh sách quyền',
            render: (_, {scopes}, index) => <>
                {scopes.map(item => <p>- {item}</p>)}
            </>
        },
        {
            title: 'Trạng thái',
            align: 'center',
            render: (_, {checked}, index) =>
                <Switch onChange={handleChangeStatus(index)} checked={checked}/>
        },
        {
            title: 'Hành động',
            align: 'center',
            render: record => <div className='flex justify-center items-center'>
                <Button
                    icon={<EditOutlined/>}
                    size="small"
                    type="primary"
                    style={{background: "#ffc107"}}
                    Primary
                    onClick={() => {
                        setIsShowForm(true);
                        setInfoData(record);
                    }}
                />
                <Button
                     className='ml-2'
                    icon={<KeyOutlined/>}
                    size="small"
                    type="primary"
                    Primary
                    onClick={() => {
                        setIsModalVisible(true);
                        setInfoData(record);
                    }}
                />
            </div>
        }];

    const handleChangePaging = (currentPage, pageSize) => {
        page = currentPage;
        setPage(page);
        setPageSize(pageSize);
        loadDataItems();
    };

    return <div className='p-4'>
        <Row justify="space-between ">
            <Col>
                <Title level={4}>
                    Quản lý người dùng
                </Title>
            </Col>
            <Col>
                <Button
                    type="primary"
                    icon={<AppstoreAddOutlined />}
                    onClick={() => {
                        setIsShowForm(true);
                        setInfoData(null)
                    }}
                >
                    Thêm mới
                </Button>
            </Col>
        </Row>
        <Row gutter={16} style={{marginBottom: '10px'}}>
            <Col span={8}>
                <Select
                    style={{width: '100%'}}
                    placeholder="Lọc theo trạng thái"
                    onChange={handleFilterStatus}
                    value={status}
                    allowClear
                >
                    <Select.Option key={makeId(20)} value={'ALL'}>
                        Tất cả
                    </Select.Option>
                    <Select.Option key={makeId(20)} value={'ACTIVE'}>
                        Hoạt Động
                    </Select.Option>
                    <Select.Option key={makeId(20)} value={'DEACTIVE'}>
                        Không Hoạt Động
                    </Select.Option>
                </Select>
            </Col>
        </Row>
        <Table columns={columns}
               dataSource={dataSource}
               pagination={{
                   current: page,
                   pageSize,
                   onChange: handleChangePaging,
                   total,
               }}
               loading={isLoading}
               bordered/>

        <AddOrEdit
            item={infoData}
            isOpen={isShowForm}
            onClose={confirm => confirm ? loadDataItems() : setIsShowForm(false)}/>

        <Modal title="Cài lại mật khẩu"
               visible={isModalVisible}
               onOk={handleOk}
               onCancel={handleCancel}>
            <Form form={form}>
                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default UserComponent;