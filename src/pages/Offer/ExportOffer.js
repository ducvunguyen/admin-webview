import { Button, Spin, Modal, DatePicker  } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import { exportExcel } from 'services/offer';
import { handleDownLoad } from 'utilities/functionCommon';

const { RangePicker } = DatePicker;

const ExportOffer = ({onClose, filterSearch, keySort, isOpen}) => {
    const [loading, setLoading] = useState(false);
    const dateFormat = 'DD/MM/YYYY';
    const [startDate, setStartDate] = useState(moment().subtract(1, 'months'));
    const [toDate, setToDate] = useState(moment());
    const handleOk = () => {
        const params = {
            ...filterSearch,
            startDate : new Date(startDate),
            toDate: new Date(toDate),
            page: 0,
            size: 9999999,
        };

        if (keySort) params.sorts = keySort;

        setLoading(true);
        exportExcel(params).then(res => {
            const outputFilename = res?.headers['content-disposition']?.split(';')[1]?.split('=')[1]?.trim() || `BaoCao_UuDai_${moment(startDate).format('YYYY-MM-DD_HH_mm_ss')}.xlsx`;
            handleDownLoad(outputFilename, res.data);
        }).catch().finally(()=> setLoading(false));
    }

    const onChange = (dates, dateStrings) => {
        if (dates) {
            setStartDate(dates[0]);
            setToDate(dates[1]);
        } else {
            console.log('Clear');
        }
    };
    
    return (
        <>
            <Modal
                title="Tải báo cáo"
                visible={isOpen}
                onOk={handleOk}
                onCancel={onClose}
                footer={[
                    <Button key="back" onClick={onClose}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading} onClick={handleOk}>
                        Tải xuống
                    </Button>,
                ]}
            >
                <Spin spinning={loading}>
                    <span>Lọc theo ngày: </span>
                    <RangePicker
                        defaultValue={[startDate, toDate]}
                        format={dateFormat}
                        onChange={onChange}
                    />
                </Spin>
            </Modal>
        </>
    );
}

export default ExportOffer;