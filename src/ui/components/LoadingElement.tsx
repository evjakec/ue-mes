import { Oval } from 'react-loader-spinner';

const LoadingElement: React.FC<{height?:number, width?:number}> = (props) => {
  return (
    <Oval
        height={props.height ? props.height : 80}
        width={props.width ? props.width : 80}
        color='#ff6e00'
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        ariaLabel='oval-loading'
        secondaryColor='#ff9a4d'
        strokeWidth={5}
        strokeWidthSecondary={5}/>
  );
};

export default LoadingElement;
