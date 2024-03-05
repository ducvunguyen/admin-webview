import { message } from 'antd';
import { useRef } from 'react';
import PropTypes from 'prop-types';

import { CloseCircleOutlined } from '@ant-design/icons';
import IconCommon from './IconCommon';
import { DEFAULT_OBJECT_FILE } from 'utilities/constants';

const CardUploadFileIcon = ({
                                pzTitle,
                                dataFile,
                                required,
                                isClear,
                                onChangeFile,
                                width= '50px',
                                height = '50px',
                                maxSize = 5600000 }) => {

    const elementInputFile = useRef();
    const handleBase64 = pEvent => {
        const file = pEvent.target.files[0];
        const size = maxSize/1024,
            toastSize = size >= 1024 ? `${Math.round(size/1024)}MB` : `${size}KB`,
            fileSize = file.size/1024,
            currentSize = fileSize >= 1024 ? `${Math.round(fileSize/1024)}MB` : `${fileSize}KB`;

        if (file.size > maxSize)
            return message.warning(`Dung Lượng Ảnh Không Vượt Quá ${toastSize}. Dung lượng ảnh hiện tại của bạn là ${currentSize}`);

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const fileImage = {
                ...dataFile,
                file,
                url: e.target.result,
                isValidate: false,
            };
            onChangeFile({...fileImage});
        };
    };

    return (
        <div style={{ padding: '1rem', border: '1px dashed #5468ff' }} >
            <div className={'font-label-thumbnail'}>{pzTitle} { required && <span className="text-danger">*</span>} </div>
            <div className={'box-upload-file'}>
                {!dataFile.url ? (
                    <IconCommon type={'icon-image-default'} />
                ) : (
                    <div className='flex'>
                        <img
                            className={'custom-image cursor-pointer'}
                            style={{width, height}}
                            src={dataFile.url}
                            alt=""
                        />
                        {
                            !required &&
                            <div className='flex justify-center	items-center cursor-pointer text-white font-bold border rounded-full bg-pink-500 h-3.5 float-right relative bottom-2 right-2'
                                 onClick={() => {
                                     onChangeFile(DEFAULT_OBJECT_FILE);
                                     elementInputFile.current.value = '';
                                 }}>
                                <CloseCircleOutlined />
                            </div>
                        }
                    </div>
                )}

                <input
                    type="file"
                    onChange={handleBase64}
                    hidden
                    ref={elementInputFile}
                    placeholder={'Chọn file'}
                    accept="image/png, image/jpeg"
                />
                <button
                    onClick={() => elementInputFile.current.click()}

                    style={{ height: '35px' }}
                    type={'button'}
                    className={'btn-primary ml-2 cursor-pointer'}
                >
                    <IconCommon type={'icon-attached-file'} />
                    <span className={'ml-2'}> Chọn file</span>
                </button>
            </div>
            {
                ((required || isClear) && !dataFile.file && dataFile.isValidate) &&
                <span className="text-danger mt-2">Bạn cần chọn file</span>
            }
        </div>
    );
};

CardUploadFileIcon.prototype = {
    pzTitle: PropTypes.string,
    required: PropTypes.bool,
    dataFile: PropTypes.shape({
        url: PropTypes.string,
        file: PropTypes.object,
        isValidate: PropTypes.bool || PropTypes.any
    })
}

export default CardUploadFileIcon;