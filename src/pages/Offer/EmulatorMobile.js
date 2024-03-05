import { useMemo, useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import { Modal } from 'antd';

import IconCommon from 'components/IconCommon';
import Description from 'components/Description';


import './style.scss';
import RenderRemainTime from './RemainTime';
import { height } from 'tailwindcss/lib/plugins';

const EmulatorMobile = ({ onClose, item, isOpen }) => {
    const expiredOffer = useMemo(() => moment(item?.expiredDate).isBefore() < 0, []);

    const [tab, setTab] = useState('tab-detail');
    const handleChangeTab = nameTab => event => {
        event.preventDefault();
        setTab(nameTab)
    }

    if (!isOpen)
        return null;

    const handleCondition = () => {
        let conditionHtml = '';
        item.conditions?.map(condition => conditionHtml += `<div>${condition}</div>`)
        return conditionHtml;
    }

    return (
        <>
            <Modal
                visible={isOpen}
                title=''
                onOk={onClose}
                footer={null}
                onCancel={onClose}
            >
                <div className='flex justify-center'>
                    <div className='emulator-mobile bg-background'>
                        <div className='header'>
                            <div className='background-banner' style={{ backgroundImage: `url(${item.bannerUrl})` }}>
                                <div className='header-mobile flex flex-col justify-between'>
                                    <div className='flex justify-between'>
                                        <IconCommon type='icon-back' />
                                        <IconCommon type='icon-heart' />
                                    </div>
                                    <div className='avatar-brand'
                                         style={{ backgroundImage: `url(${item.logoUrl})` }}>
                                    </div>
                                </div>
                            </div>

                            <div className='mx-6 text-base font-semibold mt-14 '>
                                {item.title}
                            </div>

                            <div className='px-6 text-xs font-normal '>
                                {expiredOffer ? ('Đã hết hạn') : (
                                    <div className='pb-3  border-0 border-dashed border-b'>
                                        <div className='flex justify-between '>
                                            <div className=' font-normal flex items-center'>
                                               <span>
                                                 Hiệu lực:&nbsp;
                                                   {moment(item.startDate).format('DD/MM/YYYY')}
                                                </span>&nbsp;-&nbsp;<span className='pl-1 '>
                                                  {moment(item.expiredDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                            {
                                                item?.comingSoon ?
                                                <span className='pb-1 pl-2 pr-2 text-base text-red-400 bg-white border border-red-400 rounded-full'>
                                                    Coming soon
                                                </span> : <RenderRemainTime offer={item}  />
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mx-6 text-txt-30">
                            <div className="flex items-center justify-center py-4">
                                <div
                                    style={{background: tab === 'tab-detail' && '#52DDDD'}}
                                    onClick={handleChangeTab('tab-detail')}
                                    className={classNames('w-6/12 text-xs flex justify-center items-center p-2', {
                                        'text-slate-500 font-normal': !(tab === 'tab-detail'),
                                        'border rounded-full text-current font-semibold' : tab === 'tab-detail'
                                    })}>
                                    Chi tiết ưu đãi
                                </div>
                                <div
                                    onClick={handleChangeTab('tab-guides')}
                                    style={{background: tab === 'tab-guides' && '#52DDDD'}}
                                    className={classNames('w-6/12 text-xs flex justify-center items-center p-2', {
                                        'text-slate-500 font-normal': !(tab === 'tab-guides'),
                                        'border rounded-full text-current font-semibold' : tab === 'tab-guides'
                                    })}>
                                    Hướng dẫn sử dụng
                                </div>
                            </div>

                            {
                                (item.useMethod || item.description) &&
                                <div className="mb-6 bg-white">
                                    <Description description={tab === 'tab-detail' ? item?.description : item?.useMethod} />
                                </div>
                            }

                            {
                                item?.conditions &&
                                <div className="mt-4 mb-6">
                                    <Description title='Điều kiện áp dụng' description={handleCondition()} />
                                </div>
                            }

                        </div>

                        {
                            (item.linkWeb || ( item.addressList && item.addressList.length > 0 )) &&
                            <div className="flex items-center justify-center px-6 pb-6 bg-white">
                                {
                                    item.linkWeb &&
                                    <button
                                        style={{height: '41.5px'}}
                                        className={classNames('flex justify-center items-center text-xs bg-transparent bg-white text-blue-700 font-semibold px-4 py-2 border border-blue-500 rounded', {
                                            'w-full': !item.addressList,
                                            'w-6/12': item.addressList
                                        })}>
                                        <IconCommon type="icon-shape" className="w-5 mr-3" />
                                        <span>Website</span>
                                    </button>
                                }
                                {
                                    (item.addressList && item.addressList.length > 0) &&
                                    <button
                                        style={{height: '41.5px'}}
                                        className={classNames('flex items-center justify-center bg-blue-500 text-xs font-semibold text-white px-4 py-2 border rounded', {
                                            'w-full': !item?.linkWeb,
                                            'ml-5 w-6/12': item?.linkWeb
                                        })}>
                                        <IconCommon type="icon-store-solid" className="w-5 mr-3" />
                                        <span>Cửa hàng</span>
                                    </button>
                                }
                            </div>
                        }
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EmulatorMobile;