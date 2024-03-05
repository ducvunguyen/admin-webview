import { useEffect, useState } from 'react';
import moment from 'moment';
import { Select, Switch, Table, message, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { makeId } from 'utilities/functionCommon';
import { changePriority, getHotDealFilter } from 'services/offer';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER } from 'utilities/constants';

const ListOffer = () => {
    const [pageIndex, setPageIndex] = useState(1);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [isPriority, setIsPriority] = useState(null);
    const [isFilter, setIsFilter] = useState(true);

    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);

    useEffect(() => {
        loadDataItems();
    }, [pageSize, pageIndex, isPriority, isFilter]);

    const handleChangePaging = (page, pageSize) => {
        setPageIndex(page);
        setPageSize(pageSize);
    };

    const loadDataItems = () => {
        setLoading(true);
        const params = {
            page: pageIndex - 1,
            size: pageSize,
            useFilter: isFilter,
            priority: isPriority,
            sort: 'updatedDate,desc',
            status: 'ACTIVE'
        };
        getHotDealFilter(params).then(({data}) => {
            const { offers, totalSize} = data;
            setData(offers || []);
            setTotal(totalSize);
        }).catch(() => message.error('Có lỗi xảy ra')).finally(() => setLoading(false));
    }

    const handleChangeValue = value => {
        setIsPriority(value);
        setPageIndex(1);
    }

    const handleChanePriority = (item, index) => value => {
        const cloneData = [...data];
        cloneData[index].priority = value;
        setData(cloneData);
        changePriority(item.id).then(() => {
            message.success('Thay đổi trạng thái ưu tiên thành công');
        }).catch(err => {
            cloneData[index].priority = !value;
            setData(cloneData);
        });
    }

    const handleChangeFilter = event => setIsFilter(event);

    const columns = [
        {
            width: 80,
            title: '#',
            dataIndex: '',
            align: 'center',
            render: (text, record, index) =>
                (pageIndex - 1) * pageSize + index + 1,
        },
        {
            title: 'logo',
            dataIndex: 'title',
            align: 'center',
            render: (text, record) => (
                <img key={makeId(60)} src={record.logoUrl} alt="logo" width={50} />
            ),
        }, {
            title: 'Tên',
            dataIndex: 'title',
            align: 'left',
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'ownerName',
            align: 'center',
        },
        {
            title: 'Ưu tiên',
            dataIndex: '',
            align: 'center',
            render: (text, record, index) => (
                <>
                    <Switch disabled={!perActiveOffer} checked={record.priority} onChange={handleChanePriority(record, index)} />
                </>
            ),
        },
        {
            title: 'Ngày bắt đầu',
            align: 'center',
            render: (text, record, index) => (
                <span>
                    {moment(record.startDate).format('DD/MM/YYYY')}
                </span>
            ),
        }, {
            title: 'Ngày kết thúc',
            align: 'center',
            render: (text, record, index) => (
                <span>
                    {moment(record.expiredDate).format('DD/MM/YYYY')}
                </span>
            ),
        }, {
            title: 'Mức độ ưu đãi',
            dataIndex: 'maxOffer',
            align: 'center',
        },
    ];

    return (
      <>
          <span>
              Bộ lọc:&nbsp;&nbsp;
              <Switch checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      onChange={handleChangeFilter}
                      defaultChecked={isFilter} />

          </span>
          <span className='ml-8'>
              Ưu tiên:&nbsp;&nbsp;
              <Select
                  defaultValue={null}
                  onChange={handleChangeValue}
                  style={{width: 200}}
                  options={[
                      {
                          value: null,
                          label: 'Tất cả',
                      },{
                          value: true,
                          label: 'Ưu tiên',
                      },
                      {
                          value: false,
                          label: 'Không ưu tiên',
                      }]}
              />
          </span>
          <span className='ml-8'>
               <Button type="primary" icon={<RedoOutlined />} onClick={loadDataItems}/>
          </span>
          <Table
              className="request-table mt-4"
              columns={columns}
              dataSource={data}
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
      </>
  )
}

export default ListOffer;