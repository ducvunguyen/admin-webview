import React, { useState, useEffect } from 'react';
import {
    Table,
    Modal
} from 'antd';
import moment from 'moment';
import { viewByDay } from 'services/offer';

const ViewByDay = ({onClose, offer, isOpen}) => {
    const [dataViewByDay, setDataViewByDay] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen){
            setPageIndex(1);
            loadDataItems();
        }

    }, [isOpen])

    useEffect(() => {
        if (!isOpen)
            setPageIndex(1);
        else
            loadDataItems()
        },
        [pageSize, pageIndex, isOpen, offer]);

    const loadDataItems = () => {
        setLoading(true);
        viewByDay(offer?.id, {page: pageIndex-1, pageSize}).then(({data}) =>{
            const {content, totalElements} = data;
            setDataViewByDay(content);
            setTotal(totalElements);
        }).catch().finally(() => setLoading(false));
    }

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
    };

    const columns = [
        {
            title: '#',
            align: 'center',
            render: (_, {date}, index) => <span>{(pageIndex - 1)*pageSize + index + 1}</span>
        },
        {
            title: 'Ngày',
            align: 'center',
            render: (_, {date}, index) => <span>{moment(date).format('DD/MM/YYYY')}</span>
        },
        {
            title: 'Lượt xem',
            dataIndex: 'view',
            align: 'center',
        },
    ];

    if (!isOpen)
        return null;

  return <Modal
      title={offer.title}
      visible={true}
      onOk={() => onClose(false)}
      onCancel={() =>onClose(false)}
      width={1000}
      footer={null}
  >
      <Table loading={loading}
             dataSource={dataViewByDay}
             pagination={total > pageSize && {
                 current: pageIndex,
                 pageSize,
                 onChange: handleChangePaging,
                 total,
             }}
             columns={columns} />
  </Modal>
}

export default ViewByDay;