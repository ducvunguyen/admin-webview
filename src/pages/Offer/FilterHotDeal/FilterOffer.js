import { useEffect, useState } from 'react';
import moment from 'moment';
import { Button, Select, Spin, InputNumber, DatePicker, message } from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteHotDealFilter, hotDealFilterCondition, hotDealFilterList, hotDealFilterOrUpdate } from 'services/offer';
import { makeId } from 'utilities/functionCommon';
import { canActivePermission } from 'utilities/permission';
import { ACTIVE_OFFER } from 'utilities/constants';

const FilterOffer = () => {
    const [formArray, setFormArray] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(false);

    const perActiveOffer = canActivePermission([ACTIVE_OFFER]);

    useEffect(() => {
        if (conditions.length > 0)
            loadDataItems();
        else getHotDealCondition();

    }, [conditions])

    const handleAddRow = () => {
        if (!perActiveOffer)
            return message.warn('Bạn không có quyền');

        setFormArray([...formArray, {}]);
    }

    const isCheckRequired = dataUpload => {
        return dataMessage.every(item => {
            if (dataUpload[item.key] == null && (
                (item.key === 'toVal' && dataUpload.dataType === 'BETWEEN') ||
                (item.key === 'fromVal' && dataUpload.dataType && dataUpload.dataType !== 'NOW') ||
                (item.key !== 'fromVal' && item.key !== 'toVal')
            )){
                message.warn(item.message);
                return true;
            }
        });
    }

    const handleSaveData = (item, index) => {
        if (!perActiveOffer)
            return message.warn('Bạn không có quyền');

        const dataUpload = {...item}, cloneFormArray = [...formArray];

        if (isCheckRequired(dataUpload)) return ;

        if (!item.onlyField && item?.dataType && item?.dataType === 'DATE'){
            const fromDate = moment(item?.fromVal), toDate = moment(item?.toVal);
            if (fromDate.format('X') > toDate.format('X'))
                return message.warn('Từ ngày đến ngày không đúng mời bạn chọn lại');

            dataUpload.fromVal = fromDate.format('DD/MM/YYYY');
            dataUpload.toVal = toDate.format('DD/MM/YYYY');
        }

        if (item.onlyField && item?.dataType && item?.dataType === 'DATE'){
            dataUpload.fromVal = moment(item?.fromVal).format('DD/MM/YYYY');
        }

        setLoading(true);
        hotDealFilterOrUpdate(dataUpload).then(({data}) => {
            cloneFormArray[index].id = data.id;
            message.success('Thành công');
            setFormArray(cloneFormArray);
        }).
        finally(() => setLoading(false));
    }

    const loadDataItems = () => {
        hotDealFilterList().then(({data}) => {
            data.forEach(item => {
                const findIndexFieldName = conditions.findIndex(element => item.fieldName === element.fieldName)
                item.indexFieldName = findIndexFieldName;
                item.conditions = conditions[findIndexFieldName]?.hotDealFilterTypeList;
                if (item.conditions){
                    const findIndexDataType = item.conditions.findIndex(element => item?.operator === element?.code);

                    if (findIndexDataType > -1){
                        const {dataTypes, onlyField} = item?.conditions[findIndexDataType];
                        item.onlyField = onlyField;
                        item.indexDataType = findIndexDataType;
                        item.dataTypes = dataTypes;
                        if (item.dataType === 'DATE' && item.operator === 'BETWEEN'){
                            const toVal = item.toVal.split('/'), fromVal = item.fromVal.split('/');
                            item.toVal = `${toVal[2]}-${toVal[1]}-${toVal[0]}`;
                            item.fromVal = `${fromVal[2]}-${fromVal[1]}-${fromVal[0]}`;
                        };

                        if (item.dataType === 'DATE' && item.operator !== 'BETWEEN'){
                            const fromVal = item.fromVal.split('/');
                            item.fromVal = `${fromVal[2]}-${fromVal[1]}-${fromVal[0]}`;
                        };
                    }
                }
            });
            setFormArray(data);
        });
    }

    const getHotDealCondition = () => {
        setLoading(true)
        hotDealFilterCondition().then(({data}) => {
            setConditions(data);
        }).finally(() => setLoading(false));
    }

    const handleSetValueForm = (index, nameControl) => value => {
        const cloneFormArray = [...formArray];
        const resField = () => {
            cloneFormArray[index].operator = null;
            cloneFormArray[index].indexDataType = null;
            cloneFormArray[index].dataTypes = null;
            cloneFormArray[index].dataType = null;
            cloneFormArray[index].toVal = null;
            cloneFormArray[index].fromVal = null;
        }

        if (nameControl === 'fieldName') {
            const {fieldName, hotDealFilterTypeList} = conditions[value];
            cloneFormArray[index][nameControl] = fieldName;
            cloneFormArray[index].indexFieldName = value;
            cloneFormArray[index].conditions = hotDealFilterTypeList;
            cloneFormArray[index].onlyField = true;
            resField();
        }
        else if (nameControl === 'operator'){
            const {dataTypes, onlyField, code} = cloneFormArray[index].conditions[value];
            resField();
            cloneFormArray[index][nameControl] = code;
            cloneFormArray[index].dataTypes = dataTypes || null;
            cloneFormArray[index].onlyField = onlyField || null;
            cloneFormArray[index].indexDataType = value;
        }
        else
            cloneFormArray[index][nameControl] = value;

        setFormArray(cloneFormArray);
    }

    const handleRemoveRow = index => {
        if (!perActiveOffer) return message.warn('Bạn không có quyền');

        const cloneFormArray = [...formArray];
        const formGroup = cloneFormArray[index];

        if (formGroup?.id){
            setLoading(true);
            deleteHotDealFilter(formGroup?.id).then(() => message.success('Xóa thành công')).
            finally(() => setLoading(false));
        }

        cloneFormArray.splice(index, 1);
        setFormArray(cloneFormArray);
    }
  return (
      <Spin spinning={loading}>
          {/*header*/}
          <div className='w-full flex h-10'>
              <div className='w-1/12 border border-solid flex justify-center items-center'>
                  #
              </div>
              <div className='w-2/12 border border-solid flex justify-center items-center'>
                  Hoặc và kết hợp
              </div>
              <div className='w-2/12 border border-solid flex justify-center items-center'>Trường</div>
              <div className='w-2/12 border border-solid flex justify-center items-center'>Điều kiện</div>
              <div className='w-1/12 border border-solid flex justify-center items-center'>Kiểu dữ liệu</div>
              <div className='w-3/12 border border-solid flex justify-center items-center'>Giá trị</div>
              <div className='w-1/12 border border-solid flex justify-center items-center'></div>
          </div>
          {/*header*/}

          {
              formArray.map((item, index) => (
                  <div className='w-full flex h-10' key={index}>
                      <div className='w-1/12 border border-solid flex justify-center items-center'>
                          {index + 1}
                      </div>
                      <div className='w-2/12 p-1 border border-solid flex justify-center items-center'>
                          <Select
                              value={item?.type}
                              onChange={handleSetValueForm(index, 'type')}
                              placeholder={'Chọn hoặc và kết hợp'}
                              style={{
                                  width: '100%',
                              }}
                              options={[
                                  {
                                      value: 'OR',
                                      title: 'Hoặc'
                                  },
                                  {
                                      value: 'AND',
                                      title: 'Kết hợp'
                                  }
                              ]}
                          />
                      </div>
                      <div className='w-2/12 border border-solid flex justify-center p-1 items-center'>
                          <Select
                              value={item?.indexFieldName}
                              onChange={handleSetValueForm(index, 'fieldName')}
                              style={{
                                  width: '100%',
                              }}
                              placeholder={'Chọn trường'}
                          >
                              {
                                  conditions.map((condition, index) =>
                                      <Select.Option key={makeId(60)} value={index}>
                                          {condition.fieldVi}
                                      </Select.Option>
                                  )
                              }
                          </Select>
                      </div>
                      <div className='w-2/12 border border-solid flex justify-start p-1 items-center'>
                          <Select
                              value={item?.indexDataType}
                              onChange={handleSetValueForm(index, 'operator')}
                              placeholder={'Điều kiện'}
                              disabled={item?.conditions ? false : true}
                              style={{
                                  width: '100%',
                              }}
                          >
                              {
                                  item?.conditions?.map((condition, index) =>
                                      <Select.Option key={makeId(60)} value={index}>
                                          {condition?.name}
                                      </Select.Option>
                                  )
                              }
                          </Select>
                      </div>
                      <div className='w-1/12 border border-solid flex justify-start p-1 items-center'>
                          <Select
                              value={item?.dataType}
                              onChange={handleSetValueForm(index, 'dataType')}
                              placeholder={'Chọn'}
                              disabled={item?.operator ? false : true}
                              style={{
                                  width: '100%',
                              }}
                          >
                              {
                                  item?.dataTypes?.map((condition, index) =>
                                      <Select.Option key={makeId(60)} value={condition}>
                                          {condition.name}
                                      </Select.Option>
                                  )
                              }
                          </Select>
                      </div>
                      <div className='w-3/12 border border-solid flex justify-start p-1 items-center'>
                          {
                              (item.onlyField && item?.dataType && item?.dataType === 'LONG') &&
                              <>
                                  <InputNumber
                                      style={{
                                          width: '100%',
                                      }}
                                      min={0}
                                      defaultValue={item?.fromVal || null}
                                      onChange={handleSetValueForm(index, 'fromVal')}
                                      placeholder='Nhập giá trị' />
                              </>
                          }
                          {
                              (item.onlyField && item?.dataType && item?.dataType === 'DATE') &&
                              <>
                                  <DatePicker
                                      style={{
                                          width: '100%',
                                      }}
                                      defaultValue={item?.fromVal ? moment(item?.fromVal) : null}
                                      onChange={handleSetValueForm(index, 'fromVal')}
                                      format='DD/MM/YYYY' />
                              </>
                          }
                          {
                              (!item.onlyField && item?.dataType && item?.dataType === 'DATE') &&
                              <>
                                  <DatePicker
                                      defaultValue={item?.fromVal ? moment(item?.fromVal) : null}
                                      format="DD/MM/YYYY"
                                      placeholder='Từ ngày'
                                      onChange={handleSetValueForm(index, 'fromVal')}
                                      // onOk={onOk}
                                  />
                                  &nbsp;
                                  &nbsp;
                                  <DatePicker
                                      defaultValue={item?.toVal ? moment(item?.toVal) : null}
                                      format="DD/MM/YYYY"
                                      placeholder='Đến ngày'
                                      onChange={handleSetValueForm(index, 'toVal')}
                                      // onOk={onOk}
                                  />
                              </>
                          }
                          {
                              (!item.onlyField && item?.dataType && item?.dataType === 'LONG') &&
                              <>
                                  <InputNumber
                                      style={{
                                          width: '100%',
                                      }}
                                      min={0}
                                      placeholder='Từ khoảng'
                                      defaultValue={item?.fromVal}
                                      onChange={handleSetValueForm(index, 'fromVal')}
                                  />
                                  &nbsp;
                                  &nbsp;
                                  <InputNumber
                                      style={{
                                          width: '100%',
                                      }}
                                      min={0}
                                      defaultValue={item?.toVal}
                                      placeholder='Đến khoảng'
                                      onChange={handleSetValueForm(index, 'toVal')}
                                  />
                              </>
                          }
                      </div>
                      <div className='w-1/12 border border-solid flex justify-center items-center'>
                          <Button
                              type="primary"
                              disabled={!perActiveOffer}
                              icon={<SaveOutlined />}
                              onClick={() => handleSaveData(item, index)} />

                          <Button danger
                                  disabled={!perActiveOffer}
                                  className='ml-2'
                                  onClick={() => handleRemoveRow(index)} icon={<DeleteOutlined />} />
                      </div>
                  </div>
              ))
          }
          <Button
              className='mt-2'
              type="primary"
              disabled={!perActiveOffer}
              icon={<PlusOutlined />}
              onClick={handleAddRow} />
      </Spin>
  )
}

export default FilterOffer;

const dataMessage = [
    {
        key: 'type',
        message: 'Bạn chưa chọn Hoặc và kết hợp',
    },
    {
        key: 'fieldName',
        message: 'Bạn chưa chọn Trường',
    },
    {
        key: 'dataType',
        message: 'Bạn chưa chọn Điều kiện',
    },
    {
        key: 'operator',
        message: 'Bạn chưa chọn Kiểu giá trị',
    },
    {
        key: 'fromVal',
        message: 'Bạn chưa chọn Giá trị ô số 1',
    },
    {
        key: 'toVal',
        message: 'Bạn chưa chọn Giá trị ô số 2',
    },
]