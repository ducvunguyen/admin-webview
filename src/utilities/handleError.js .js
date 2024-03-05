import { notification, message } from 'antd';

const FILE_ERROR = 415;
const SERVER_ERROR = 500;

export const handleErrorUpload = (error) => {
    try {
        const { status, data } = error.response;
        switch (status) {
            case FILE_ERROR: {
                notification.error({
                    duration: 0,
                    message: 'Có vấn đề với nội dung file',
                    description: data?.message || '',
                });
                break;
            }
            case SERVER_ERROR: {
                notification.error({
                    duration: 0,
                    message: 'Lỗi',
                    description:
                        'Có lỗi xảy ra với nội dung file, vui lòng kiểm tra lại file và thử lại',
                });
                break;
            }

            default:
                message.error('Có lỗi xảy ra, vui lòng thử lại sau');
                break;
        }
    } catch (e) {}
};
