import { useEffect, useRef, useState } from 'react';
import { Modal, Radio } from 'antd';
import FilterOffer from './FilterOffer';
import ListOffer from './ListOffer';
import RankList from './RankList';
import HotDealCampaign from './HotDealCampaign/';

const FilterHotDeal = ({onClose, isOpen}) => {
  let idFilter = useRef(null);
  let idTableHotDealList = useRef(null);
  let idTableHotDealShow = useRef(null);
  let idHotDealCampaign = useRef(null);

  const [active, setActive] = useState('0');

  useEffect(() => {
    handleElement(active);
  }, [isOpen]);

  const handleChangeTab = e => {
    const key = e.target.value;
    setActive(key)
    handleElement(key);
  }

  const handleElement = activeTab => {
    const arrElement = [idFilter, idTableHotDealList, idTableHotDealShow, idHotDealCampaign];

    if (!arrElement.every(item => item.current))
      return;

    arrElement.forEach((element, index) => {
      if (index === Number(activeTab))
        element.current.style.display = "block";
      else element.current.style.display = "none"
    })
  }

  return (
      <>
        <Modal title="Lọc theo hot deal" width={'90vw'} visible={isOpen} onCancel={onClose} footer={null}>
          <Radio.Group defaultValue={active} onChange={handleChangeTab}>
            <Radio.Button value="0">Lọc hot deal</Radio.Button>
            <Radio.Button value="1">Danh sách hot deal</Radio.Button>
            <Radio.Button value="2">Danh sách hot deal hiển thị</Radio.Button>
            <Radio.Button value="3">Chiến dịch hot deal</Radio.Button>
          </Radio.Group>

          <div className='mt-3' ref={idFilter}>
            <FilterOffer />
          </div>
          <div className='mt-3' ref={idTableHotDealList}>
            <ListOffer />
          </div>
          <div className='mt-3' ref={idTableHotDealShow}>
            <RankList />
          </div>
          <div className='mt-3' ref={idHotDealCampaign}>
            <HotDealCampaign />
          </div>
        </Modal>
      </>
  );
}

export default FilterHotDeal