import classes from './CommonStyledText.module.css'
import {splitStringOnUpperCase} from '../scripts/CommonFunctions'

const CommonStyledText:React.FC<{text:string}> = (props) => {
    
    const splitText:string[] = splitStringOnUpperCase(props.text);

    return (
      <div className={`${classes['styledText']} ${classes[props.text]}`}>
        {splitText.map(textItem => textItem + ' ')}
      </div>
    );
  }
  
  export default CommonStyledText;