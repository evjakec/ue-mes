import classes from './ProgressBar.module.css';

const ProgressBar: React.FC<{ completedItems: number; totalItems:number  }> = (props) => {
  
  return (
    <>
        <div className={classes.progressContainer}>
            <div className={classes.progressFiller} style={{width: `${((props.completedItems/props.totalItems)*100).toFixed(2)}%`}}></div>
        </div>
        <div className={classes.progressInnerText}>{props.completedItems + '\\' + props.totalItems}</div>
    </>
  );
};

export default ProgressBar;
