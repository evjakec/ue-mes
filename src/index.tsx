import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout, {loader as rootLoader} from './routes/RootLayout';
import Home, {loader as homeLoader} from './routes/Home';
import Inventory from './routes/inventory/Inventory';
import Orders, {loader as ordersLoader} from './routes/orders/Orders';
import ErrorPage from './routes/ErrorPage';
import RootOrdersLayout from './routes/orders/RootOrders';
import {action as receiveNewInventoryAction} from './components/inventory/inventory/ReceiveNewInventoryForm'
import {action as warehouseInventoryAction} from './components/inventory/inventory/WarehouseInventoryForm'
import {action as inventoryLocationsAction} from './components/inventory/inventory/InventoryLocationForm'
import {action as supplierAction} from './components/inventory/supplier/SupplierForm'
import {action as partAction} from './components/inventory/part/PartForm'
import {action as billOfMaterialAction} from './components/inventory/bill-of-material/BillOfMaterialForm'
import {action as billOfProcessAction} from './components/inventory/bill-of-process/BillOfProcessForm'
import {action as billOfProcessProcessListAction} from './components/inventory/bill-of-process/BillOfProcessProcessListForm'
import {action as billOfProcessWorkElementAction} from './components/inventory/bill-of-process/BillOfProcessWorkElementForm'
import {action as billOfMaterialPartListAction} from './components/inventory/bill-of-material/BillOfMaterialPartListForm'
import NewPart, {loader as newPartLoader} from './routes/inventory/part/NewPart';
import EditPart, {loader as editPartLoader} from './routes/inventory/part/EditPart';
import InventoryPart, {loader as inventoryPartLoader} from './routes/inventory/part/InventoryPart';
import InventoryMain, {loader as inventoryLoader} from './routes/inventory/inventory/InventoryMain';
import InventoryBillOfMaterial, {loader as bomPartLoader} from './routes/inventory/bill-of-material/InventoryBillOfMaterial';
import InventoryBillOfProcess, {loader as bopPartLoader} from './routes/inventory/bill-of-process/InventoryBillOfProcess';
import NewBillOfProcess, {loader as newBopPartLoader} from './routes/inventory/bill-of-process/NewBillOfProcess';
import EditBillOfProcessProcessList, {loader as bopLoaderForProcessList} from './routes/inventory/bill-of-process/EditBillOfProcessProcessList';
import EditBillOfProcess, {loader as editBopPartLoader} from './routes/inventory/bill-of-process/EditBillOfProcess';
import EditBillOfProcessWorkElements, {loader as editBopWorkElementLoader} from './routes/inventory/bill-of-process/EditBillOfProcessWorkElements';
import EditBillOfMaterial, {loader as editBomPartLoader} from './routes/inventory/bill-of-material/EditBillOfMaterial';
import NewBillOfMaterial, {loader as newBomPartLoader} from './routes/inventory/bill-of-material/NewBillOfMaterial';
import EditBillOfMaterialPartList, {loader as bomLoaderForPartList} from './routes/inventory/bill-of-material/EditBillOfMaterialPartList';
import ReceiveNewInventory from './routes/inventory/inventory/ReceiveNewInventory';
import WarehouseInventory from './routes/inventory/inventory/WarehouseInventory';
import Run, {loader as runLoader} from './routes/run/Run';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { action as logoutAction } from './routes/Logout';
import { action as runLogoutAction } from './routes/run/RunLogout';
import { CookiesProvider } from 'react-cookie';
import UserContextProvider from './store/user-context';
import NewSupplier from './routes/inventory/supplier/NewSupplier';
import InventoryLocations, {loader as inventoryLocationsLoader} from './routes/inventory/inventory/InventoryLocations';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage isRunMode={false} />,
    id:'root',
    loader: rootLoader,
    children: [
      { index: true, element:<Home />, loader:homeLoader},
      {
        path: '/',
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: '/inventory',
        element: <Inventory />,
        children:[
          // { index: true, element:<InventoryMain />, loader:inventoryLoader },
          { index: true, 
            element:<InventoryPart />, 
            loader:inventoryPartLoader 
          },
          { path: '/inventory/dashboard', 
            element:<InventoryMain />,
            loader:inventoryLoader,
            children:[
              { path: '/inventory/dashboard/receive-new-inventory',  
                element:<ReceiveNewInventory />, 
                action: receiveNewInventoryAction,
                children:[
                  { path: '/inventory/dashboard/receive-new-inventory/new-supplier',  
                    element:<NewSupplier />, 
                    action: supplierAction
                  }
                ]
              },
              { path: '/inventory/dashboard/warehouse-inventory',  element:<WarehouseInventory />, action: warehouseInventoryAction},
              { path: '/inventory/dashboard/inventory-locations',  element:<InventoryLocations />, loader:inventoryLocationsLoader, action: inventoryLocationsAction}
            ]
          },
          { path: '/inventory/part', 
            element:<InventoryPart/>,
            loader:inventoryPartLoader,
            children:[
              { path: '/inventory/part/create-part', element: <NewPart />, action: partAction, loader:newPartLoader },
              { path: '/inventory/part/edit-part/:partId', element: <EditPart />, action: partAction, loader:editPartLoader },
            ]
          },
          { path: '/inventory/billOfMaterial', 
            element:<InventoryBillOfMaterial />,
            loader: bomPartLoader,
            children:[
              { path: '/inventory/billOfMaterial/create-bill-of-material/:partId', element: <NewBillOfMaterial />, action: billOfMaterialAction, loader:newBomPartLoader },
              { path: '/inventory/billOfMaterial/edit-bill-of-material/:billOfMaterialId', element: <EditBillOfMaterial />, action: billOfMaterialAction, loader:editBomPartLoader },
              { path: '/inventory/billOfMaterial/edit-bill-of-material-part-list/:billOfMaterialId', element: <EditBillOfMaterialPartList />, action:billOfMaterialPartListAction, loader:bomLoaderForPartList },
            ]
          },
          { path: '/inventory/billOfMaterial/:billOfMaterialId', 
            element:<InventoryBillOfMaterial />, 
            loader: bomPartLoader,
          },
          { path: '/inventory/billOfProcess', 
            element:<InventoryBillOfProcess />, 
            loader: bopPartLoader,
            children:[
              { path: '/inventory/billOfProcess/create-bill-of-process/:partId', element: <NewBillOfProcess />, action: billOfProcessAction, loader:newBopPartLoader },
              { path: '/inventory/billOfProcess/edit-bill-of-process/:billOfProcessId', element: <EditBillOfProcess />, action: billOfProcessAction, loader:editBopPartLoader },
              { path: '/inventory/billOfProcess/edit-bill-of-process-process-list/:billOfProcessId', element: <EditBillOfProcessProcessList />, action:billOfProcessProcessListAction, loader:bopLoaderForProcessList },
              { path: '/inventory/billOfProcess/edit-bill-of-process-work-elements/:billOfProcessId/:billOfProcessProcessId', element: <EditBillOfProcessWorkElements />, action: billOfProcessWorkElementAction, loader:editBopWorkElementLoader },
            ]
          },
          { path: '/inventory/billOfProcess/:billOfProcessId', 
            element:<InventoryBillOfProcess />, 
            loader: bopPartLoader,
          },
        ]
      },
      {
        path: '/orders',
        element: <RootOrdersLayout />,
        children:[
          {
            index:true, 
            element:<Orders  />,
            loader:ordersLoader
          },
          {
            path: 'created',
            element: <Orders />,
            loader: ordersLoader,
          },
          {
            path: 'released',
            element: <Orders />,
            loader: ordersLoader,
          },
          {
            path: 'inProgress',
            element: <Orders />,
            loader: ordersLoader,
          },
          {
            path: 'hold',
            element: <Orders />,
            loader: ordersLoader,
          }
        ]        
      },
    ],
  },
  {
    path: '/run',
    element: <Run />,
    errorElement: <ErrorPage isRunMode={true} />,
  },
  {
    path: '/run/:serialNumberOrEquipment',
    element: <Run />,
    errorElement: <ErrorPage isRunMode={true} />,
    loader: runLoader,
  },
  {
    path: 'logout',
    errorElement: <ErrorPage isRunMode={true} />,
    action: logoutAction,
  },
  {
    path: '/run/logout',
    errorElement: <ErrorPage isRunMode={true} />,
    action: runLogoutAction,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <CookiesProvider defaultSetOptions={{ path: '/' }}>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ? process.env.REACT_APP_GOOGLE_CLIENT_ID : ''}>
        <UserContextProvider>
          <React.StrictMode>
            <RouterProvider router={router} />
          </React.StrictMode>  
        </UserContextProvider>    
    </GoogleOAuthProvider>
  </CookiesProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
