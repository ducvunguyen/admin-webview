import {CaretDownOutlined, CaretUpOutlined} from "@ant-design/icons";
import { makeId } from 'utilities/functionCommon';
import './style.scss';
export const CardSort = ({keyName, title, onClose, focus}) => {
    const handleSort = params => onClose(params);
    return <div key={makeId(70)} id='card-sort'>
        <span>{title}</span>
        <div style={{float: 'right', display: 'flex', flexDirection: 'column'}}>
            <CaretUpOutlined onClick={() => handleSort({keyName, param: focus === 'asc' ? null : 'asc'})}
                             className={focus === 'asc'  ? 'custom-icon-svg-active' : 'custom-icon-svg'} />
            <CaretDownOutlined onClick={() => handleSort({keyName, param: focus === 'desc' ? null : 'desc'})}
                               className={focus === 'desc'  ? 'custom-icon-svg-active' : 'custom-icon-svg'} />
        </div>
    </div>
}

export default CardSort;