import { NavLink } from 'react-router-dom';
import classes from './SubHeader.module.css';
import { SubHeaderLink } from '../types/sub-header-link';

const SubHeader:React.FC<{subHeaderNavLinkList:SubHeaderLink[]}> = (props) => {
  return (
    <header className={classes.header}>
      <nav className={classes.navBody}>
        <ul className={classes.list}>
            {props.subHeaderNavLinkList.map(subHeaderLink =>
            (
                <li key={subHeaderLink.navigateText}>
                    <NavLink
                    to={subHeaderLink.navigateTo}
                    className={({ isActive }) =>
                        isActive ? classes.active : undefined
                    }
                    >
              {subHeaderLink.navigateText}
            </NavLink>
          </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}

export default SubHeader;