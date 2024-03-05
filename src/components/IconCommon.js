import iconCollection from "resources/icons";

const IconCommon = ({type, ...props}) => {
  const SvgIcon = iconCollection[type], {className, style, ...rest} = props;

  return <span className={className} style={{display: 'flex', alignItems: 'center'}} {...rest}>
    {SvgIcon ? <SvgIcon {...style} /> : <span />}
  </span>
}

export default IconCommon;