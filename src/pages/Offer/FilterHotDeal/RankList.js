import { useEffect, useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import moment from 'moment';
import { getHotDealRank, updateHotDealRank, updateHotDealRankStatus } from 'services/offer';
import { Button, message, Spin, Switch } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER } from 'utilities/constants';

const RankList = () => {
    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDataItems();
    }, []);

    const loadDataItems = () => {
        setLoading(true);
        getHotDealRank().then(({data}) => {
            setList(data)
        }).finally(() => setLoading(false));
    }

    const handleChangeSort = () => {
        setLoading(true);
        updateHotDealRank(list).then(() => {
            message.success('Cập nhật thành công')
            const cloneList = [...list];
            cloneList.forEach((item, index) => item.sequence = index+1);
            setList(cloneList);
        }).finally(() => setLoading(false));
    }

    const changeStatus = item => event => {
        updateHotDealRankStatus(item.id).then(() => {
            message.success('Cập nhật thành công');
        }).catch(() => message.error('Có lỗi xảy ra')).
        finally(() => setLoading(false));
    }

    return (
        <Spin spinning={loading}>
            <Button
                className='mt-2'
                type="primary"
                onClick={loadDataItems} >
                Làm mới
            </Button>
            {/*header*/}
            <div className='w-full flex mt-3'>
                <div className='p-2.5 border border-solid flex justify-center items-center w-1/12'>#</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-1/12'>Thứ tự</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-2/12'>Tên hot deal</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-2/12'>Brand</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-2/12'>Kiểu</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-1/12'>Điểm</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-2/12'>Ngày tạo</div>
                <div className='p-2.5 border border-solid flex justify-center items-center w-1/12'>Trạng thái</div>
            </div>
            {/*header*/}

            {
                !loading &&
                <ReactSortable
                    filter=".addImageButtonContainer"
                    dragClass="sortableDrag"
                    list={list}
                    setList={setList}
                    onEnd={handleChangeSort}
                    animation="200"
                    easing="ease-out"
                    className='w-full'
                >
                    {list.map(item => (
                        <div className='draggableItem w-full flex'>
                            <div className='w-1/12 border border-solid flex justify-center items-center p-2.5 align-middle'>
                                <DragOutlined />
                            </div>
                            <div className='w-1/12 border border-solid flex justify-center items-center p-2.5 align-middle'>{item.sequence}</div>
                            <div className='w-2/12 border border-solid flex justify-center items-center p-2.5 align-middle'>{item.offerTitle}</div>
                            <div className='w-2/12 border border-solid flex justify-center items-center p-2.5 align-middle'>{item.offerOwnerName}</div>
                            <div className='w-2/12 border border-solid flex justify-center items-center p-2.5 align-middle'>{item.type}</div>
                            <div className='w-1/12 border border-solid flex justify-center items-center p-2.5 align-middle'>{item.point}</div>
                            <div className='w-2/12 border border-solid flex justify-center items-center p-2.5 align-middle'>
                                {item?.date ? moment(item.date).format('DD/MM/YYYY') : ''}
                            </div>
                            <div className='w-1/12 border border-solid flex justify-center items-center p-2.5 align-middle'>
                                <Switch disabled={!perActiveOffer}
                                        defaultChecked={item.status === 'ACTIVE'}
                                        onChange={changeStatus(item)} />
                            </div>
                        </div>
                    ))}
                </ReactSortable>
            }
        </Spin>
    )
}

export default RankList;

