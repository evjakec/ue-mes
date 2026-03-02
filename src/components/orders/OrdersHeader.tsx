import { NavLink } from 'react-router-dom';
import classes from './OrdersHeader.module.css';

const OrdersHeader:React.FC =() => {
    return (
      <header className={classes.header}>
        <nav className={classes.navBody}>
          <ul className={classes.list}>
            <li key="created">
              <NavLink
                to="/orders/created"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Created
              </NavLink>
            </li>
            <li key="released">
              <NavLink
                to="/orders/released"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Released
              </NavLink>
            </li>
            <li key="inProgress">
              <NavLink
                to="/orders/inProgress"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                In Progress
              </NavLink>
            </li>
            <li key="hold">
              <NavLink
                to="/orders/hold"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                On Hold
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    );
  }
  
  export default OrdersHeader;