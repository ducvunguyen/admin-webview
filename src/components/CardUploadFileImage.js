import { useRef } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import IconCommon from './IconCommon';

import { DEFAULT_OBJECT_FILE } from 'utilities/constants';

const CardUploadFileImage = ({
                                 pzTitle,
                                 onChange,
                                 dataFile,
                                 maxSize = 5600000,
                                 required,
                                 isClear, ...props }) => {

    const elementInputFile = useRef();

    const handleBase64 = pEvent => {
        const file = pEvent.target?.files[0];
        if (file){
            const size = maxSize/1024,
                toastSize = size >= 1024 ? `${Math.round(size/1024)}MB` : `${Math.round(size)}KB`,
                fileSize = file.size/1024,
                currentSize = fileSize >= 1024 ? `${Math.round(fileSize/1024)}MB` : `${Math.round(fileSize)}KB`;

            if (file.size > maxSize)
                return message.warning(`Dung Lượng Ảnh Không Vượt Quá ${toastSize}. Dung lượng ảnh hiện tại của bạn là ${currentSize}`);

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => onChange({
                ...dataFile,
                file,
                url: e.target.result,
            });
        }
    };


    return (
        <div className={'box-upload-file-image'}>
            <div className={'font-label-image'}>
                {pzTitle}
                {required && <span className="text-danger"> *</span>}
            </div>
            <div>
                {!dataFile.url ? (
                    <IconCommon type={'icon-image-default'}/>
                ) : (
                    <img
                        className={'max-size-image cursor-pointer'}
                        src={dataFile.url}
                        alt=""
                    />
                )}
            </div>

            <input
                type="file"
                onChange={handleBase64}
                hidden
                ref={elementInputFile}
                placeholder={'Chọn file'}
                accept="image/png, image/jpeg"
            />
            <div className='flex'>
                {
                    isClear &&
                    <button
                        onClick={() => {
                            onChange(DEFAULT_OBJECT_FILE);
                            elementInputFile.current.value = '';
                        }}
                        type={'button'}
                        className='btn btn-secondary mt-4 ml-2'
                    >
                        <DeleteOutlined />
                        <span className={'ml-2'}>Xóa</span>
                    </button>
                }
                <button
                    onClick={() => elementInputFile.current.click()}
                    type={'button'}
                    className={'btn-primary  mt-4 ml-2'}
                >
                    <IconCommon type={'icon-attached-file'}/>
                    <span className={'ml-2'}> Chọn file</span>
                </button>
            </div>
            {!dataFile.file && dataFile?.isValidate ? (
                <span className="text-danger mt-2">Bạn chưa chọn file</span>
            ) : null}
        </div>
    );
};

CardUploadFileImage.prototype = {
    pzTitle: PropTypes.string,
    dataFile: PropTypes.shape({
        url: PropTypes.string,
        file: PropTypes.object,
        isValidate: PropTypes.bool || PropTypes.any
    }),
    required: PropTypes.bool
}


export default CardUploadFileImage;
