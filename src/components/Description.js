import { memo, useLayoutEffect, useRef } from 'react';

const Description = ({ children, description, title }) => {

  const _descriptionRef = useRef();
  const _descriptionElementRef = useRef();


  useLayoutEffect(() => {
    handleToBrowser(_descriptionElementRef.current?.getElementsByTagName('a'));
  }, [description]);

  const handleToBrowser = elements => {
    //use card a
    // if (isLoginToken && elements && elements.length > 0)
    //   for (let i = 0; i < elements.length; i++){
    //     const url = elements[i].href;
    //   }
  }

  if (!description && !children) return  null;

  return (
    <>
      {title && <div className="text-xs font-semibold pb-4">{title}</div>}
      <div className="bg-white shadow">
        <div
          className="overflow-hidden modal-open px-6 py-5"
        >
          <div className="whitespace-pre-wrap text-xs " ref={_descriptionRef}>
            {description &&
              <div className='default-ckeditor' ref={_descriptionElementRef}
                dangerouslySetInnerHTML={{ __html: description }}></div>}
            {
              children &&
              <div className='w-full default-ckeditor box-html' ref={_descriptionElementRef}>
                {children}
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Description);
