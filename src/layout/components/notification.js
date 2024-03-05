import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Col, Popover, Tooltip } from 'antd';
import { NotificationOutlined, CheckOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment';
import {
    notificationList,
    unvisitedNotification,
    visitedNotification,
} from 'services/notification';

import { makeId } from 'utilities/functionCommon';
import { PATHS } from 'configs';
import '../style.scss';
import { TYPE_COMMENT_TASK } from '../constans';
import useOfferId from 'hooks/useOfferId';

const Notification = () => {
    let history = useHistory();
    const {updateOfferId} = useOfferId();

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [dataSource, setDataSource] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        countNotificationOffer();
        loadDataItem(page);
    }, []);

    const countNotificationOffer = () => {
        unvisitedNotification().then(({data}) => setCount(data)).catch().finally();
    }

    const loadDataItem = pageIndex => {
        const params = {page: pageIndex, size};
        notificationList(params).then(({data}) => {
            let cloneDataSource = [...dataSource];
            cloneDataSource = cloneDataSource.concat(data?.notifications);
            setDataSource([...cloneDataSource]);
            setTotal(data.totalSize)
        }).catch().finally();
    };
    
    const handleViewNotification = index => {
        const notification =  dataSource[index];
        // if (notification.visited) return;
        visitedNotification(notification.id).then(({}) => {
            countNotificationOffer();
            const cloneDataSource = [...dataSource];
            cloneDataSource[index].visited = true;
            setDataSource([...cloneDataSource]);

            history.push(PATHS.OFFERS);
            updateOfferId(notification.offerId);
        });
    }

    const content = (
        <div  className='custom-content-notification'>
            <InfiniteScroll
                pageStart={0}
                loadMore={event => loadDataItem(event)}
                hasMore={total > dataSource.length ?? false}
                loader={<h4 key={0}>Loading...</h4>}
                useWindow={false}
            >
                    {
                        dataSource.map((item, index) =>
                            <div className={'mt-1 flex custom-item-notification justify-center' + (item.visited && 'custom-item-notification-active') }
                                 onClick={() => handleViewNotification(index)}
                                 key={makeId(300)}>
                                <div className="flex items-center">
                                    <div>
                                        <Avatar shape='square' size={64} src={item.thumbnail} />
                                    </div>
                                    <div className="ml-1">
                                        <Tooltip title={<span dangerouslySetInnerHTML={{__html: item.title}}></span>}>
                                            <span className="break-word text-base font-bold line-clamp ellipse-2-line"
                                                  dangerouslySetInnerHTML={{__html: item.title}}>
                                            </span>
                                        </Tooltip>
                                        <i className="flex text-xs break-word mt-2">
                                            <span style={{fontSize: '0.8rem'}}>
                                                <b>
                                                    {moment(item?.createdDate).format('DD/MM/YYYY')}
                                                </b>
                                                &nbsp; {TYPE_COMMENT_TASK[item.type]} &nbsp;
                                                <b>{item?.createdUser}</b>
                                            </span>
                                        </i>
                                    </div>
                                </div>
                                {item.visited && <CheckOutlined />}
                            </div>
                        )
                    }
                    {
                        dataSource.length === 0 &&
                        <b>Bạn hiện đang không có thông báo nào!</b>
                    }
            </InfiniteScroll>
        </div>
    );

  return  (
      <Col style={{paddingRight: '1rem'}}>
          <div className='w-full notification' >
              <Popover content={content}
                       title="Thông báo ưu đãi chưa được duyệt"
                       trigger="click">
                  <Badge size="default"
                         count={count}
                         className="cursor-pointer">
                      <Avatar icon={<NotificationOutlined/>} shape="square" />
                      <br/>
                  </Badge>
              </Popover>
          </div>
      </Col>
  )
}

export default Notification;