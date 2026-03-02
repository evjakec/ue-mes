import { CredentialResponse } from "@react-oauth/google";
import { UserEntity } from "../../models/authorization/user-entity";
import { BillOfMaterialEntity } from "../../models/bill-of-material-entity";
import { BillOfMaterialPartEntity } from "../../models/bill-of-material-part-entity";
import { BillOfProcessEntity } from "../../models/bill-of-process-entity";
import { BillOfProcessProcessEntity } from "../../models/bill-of-process-process-entity";
import { BillOfProcessProcessWorkElementEntity } from "../../models/bill-of-process-process-work-element-entity";
import { EquipmentEntity } from "../../models/global/equipment-entity";
import { ProcessEntity } from "../../models/global/process-entity";
import { SiteEntity } from "../../models/global/site-entity";
import { InventoryItemEntity } from "../../models/inventory-item-entity";
import { InventoryItemTypeEntity } from "../../models/inventory-item-type-entity";
import { InventoryLocationEntity } from "../../models/inventory-location-entity";
import { OrderEntity } from "../../models/order-entity";
import { OrderItemUnitConsumptionEntity } from "../../models/order-item-unit-consumption-entity";
import { OrderItemUnitDataCollectionEntity } from "../../models/order-item-unit-data-collection-entity";
import { OrderItemUnitWorkElementHistoryEntity } from "../../models/order-item-unit-work-element-history-entity";
import { PartEntity } from "../../models/part-entity";
import { UnitOfMeasureEntity } from "../../models/unit-of-measure-entity";
import { WorkElementTypeAttributeEntity } from "../../models/work-element-type-attribute-entity";
import { WorkElementTypeEntity } from "../../models/work-element-type-entity";
import { MoveInventoryItemViewModel } from "../../view-models/move-inventory-item-view-model";
import { OrderItemUnitEquipmentAndUserViewModel } from "../../view-models/order-item-unit-equipment-user-view-model";
import { PartAndOrderItemsViewModel } from "../../view-models/part-order-items-view-model";
import { OrderItemUnitEntity } from "../../models/order-item-unit-entity";
import { StartOrderItemUnitViewModel } from "../../view-models/start-order-item-unit-view-model";
import { SupplierEntity } from "../../models/supplier-entity";
import { ItemAttributeTypeEntity } from "../../models/item-attribute-type-entity";
import { InventoryLocationWithQuantityViewModel } from "../../view-models/inventory-location-with-quantity-view-model";
import { InventoryLocationTypeEntity } from "../../models/inventory-location-type-entity";
import { OrderItemUnitScrapEntity } from "../../models/order-item-unit-scrap-entity";
import { InventoryItemScrapEntity } from "../../models/inventory-item-scrap-entity";
import { DefectCategoryEntity } from "../../models/defect-category-entity";

/* ---------------------------------------  Plant Lineage -------------------------------------------*/
export const fetchLocalSite = async():Promise<SiteEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/PlantLineage/site/GetByDisplayName/' + process.env.REACT_APP_LOCAL_SITE);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as SiteEntity;
}

export const fetchEquipmentData = async ():Promise<EquipmentEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/PlantLineage/equipment/GetBySiteDisplayName/' + process.env.REACT_APP_LOCAL_SITE);
  const resData = await response.json();
  return resData as EquipmentEntity[];
}    

/* ---------------------------------------  Parts ---------------------------------------------------*/
export const fetchPartByPartId = async (partId:string):Promise<PartEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/GetByID/' + partId);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as PartEntity;
}

export const fetchAllActivePartsList = async ():Promise<PartEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/false');
  const resData = await response.json();
  return resData as PartEntity[];
}

export const fetchRawMaterialPartList = async ():Promise<PartEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/GetRawMaterialParts/false');
  const resData = await response.json();
  return resData as PartEntity[];
}

export const fetchRawMaterialAndSubAssemblyPartsList = async():Promise<PartEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/GetRawMaterialAndSubAssemblyParts/false');
  const resData = await response.json();
  return resData as PartEntity[];
}

export const fetchSubAssemblyAndFinishedGoodPartsList = async():Promise<PartEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/GetSubAssemblyAndFinishedGoodParts/false');
  const resData = await response.json();
  return resData as PartEntity[];
}

export const fetchPartTypeData = async ():Promise<{key:number,value:string}[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/PartTypes');
  const resData = await response.json();
  return resData as {key:number,value:string}[];
}

export const fetchUnitOfMeasureData = async ():Promise<UnitOfMeasureEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/UnitsOfMeasure');
  const resData = await response.json();
  return resData as UnitOfMeasureEntity[];
}

export const postPart = async(part:PartEntity) => {
  // assume we are adding a new part to start.
  let url = process.env.REACT_APP_API_BASE_URL + '/Parts/Add';

  // if the partId is passed in the request params, then we know the form is in edit mode.
  if(part.partId && part.partId > 0)
  {
    url = process.env.REACT_APP_API_BASE_URL + '/Parts/' + part.partId;
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(part),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 500)
    throw new Error('There was an error saving the part. Please contact MES support for help.');
}

/* ---------------------------------------  Suppliers -----------------------------------------------*/
export const fetchSupplierBySupplierId = async (supplierId:number):Promise<SupplierEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Suppliers/GetByID/'+ supplierId);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as SupplierEntity;
}

export const fetchSupplierBySupplierName = async (supplierName:string):Promise<SupplierEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Suppliers/GetByName/'+ supplierName);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as SupplierEntity;
}

export const fetchActiveSuppliers = async ():Promise<SupplierEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Suppliers/GetAll/false');
  const resData = await response.json();
  return resData as SupplierEntity[];
}

export const postAddSupplier = async(newSupplier:SupplierEntity) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/Suppliers/Add'

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(newSupplier),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error saving the supplier. Please contact MES support for help.');
}

/* ---------------------------------------  Inventory -----------------------------------------------*/
export const fetchInventoryItemBySerialNumber = async (serialNumber:string):Promise<InventoryItemEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/' + serialNumber);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as InventoryItemEntity;
}

export const fetchInventoryItemTypes = async ():Promise<InventoryItemTypeEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryItemTypes');
  const resData = await response.json();
  return resData as InventoryItemTypeEntity[];
}

export const fetchInventoryLocationTypes = async ():Promise<InventoryLocationTypeEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryLocationTypes');
  const resData = await response.json();
  return resData as InventoryLocationTypeEntity[];
}

export const fetchAllInventoryLocations = async ():Promise<InventoryLocationEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryLocations');
  const resData = await response.json();
  return resData as InventoryLocationEntity[];
};

export const fetchInventoryLocationData = async (sourceLocation:string):Promise<InventoryLocationEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryLocations/' + sourceLocation);
  const resData = await response.json();
  return resData as InventoryLocationEntity[];
};

export const fetchReceivingAndWarehouseInventoryItems = async ():Promise<MoveInventoryItemViewModel[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/ReceivingAndWarehouseItems');
  const resData = await response.json() as InventoryItemEntity[];

  const inventoryItemsToViewModel = resData.map(inventoryItemFromApi =>{
      return {
          inventoryItem:inventoryItemFromApi,
          destinationLocation: {} as InventoryLocationEntity,
          quantityToMove:0,
          moveAllQuantity:false,
          isChanged:false
      } as MoveInventoryItemViewModel;
  });
  
  return inventoryItemsToViewModel;
}

export const fetchInventoryItemsSummed = async():Promise<InventoryItemEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryItemsSummed');
  const resData = await response.json();
  return resData as InventoryItemEntity[];
}

export const fetchInventoryLocationsWithItemsSummed = async():Promise<InventoryLocationWithQuantityViewModel[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryLocationsWithItemsSummed');
  const resData = await response.json();
  return resData as InventoryLocationWithQuantityViewModel[];
}

export const postAddInventory = async(inventoryItem:InventoryItemEntity) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/Inventory/AddInventory'

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(inventoryItem),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error adding the inventory. Please contact MES support for help.');
}

export const postMoveInventory = async(moveInventoryItem:MoveInventoryItemViewModel) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/Inventory/MoveInventory'

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(moveInventoryItem),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error moving the inventory. Please contact MES support for help.');
}

export const postMoveInventories = async(moveInventoryItems:MoveInventoryItemViewModel[]) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/Inventory/MoveInventories'

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(moveInventoryItems),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error moving the inventory. Please contact MES support for help.');
}

export const postUpdateInventoryLocations = async(inventoryLocations:InventoryLocationEntity[]) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/Inventory/InventoryLocations/Update'

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(inventoryLocations),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error updating the inventory locations. Please contact MES support for help.');
}

/* ---------------------------------------  Bill of Material ---------------------------------------*/
export async function fetchBillOfMaterialByPart(partId?:string):Promise<BillOfMaterialEntity|null> {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/BillOfMaterial/GetByPartID/' + partId);
    
    if (response.status === 204)
      return null;

    const resData = await response.json();
    return resData as BillOfMaterialEntity;
}

export async function fetchBillOfMaterialByBillOfMaterialId(inputBillOfMaterialId:number):Promise<BillOfMaterialEntity|null> {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/BillOfMaterial/GetByID/' + inputBillOfMaterialId);

  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as BillOfMaterialEntity;
}


export const postBillOfMaterial = async(billOfMaterial:BillOfMaterialEntity,enteredEffectiveStartDate:Date,enteredEffectiveEndDate:Date,isEditing:boolean) => {
  const billOfMaterialId = billOfMaterial !== undefined ? billOfMaterial.billOfMaterialId : '0'

  // Before posting, set the dates from the strings in useState
  const updatedBillOfMaterialWithDates = {...billOfMaterial, 
      effectiveStartDate: new Date(enteredEffectiveStartDate), 
      effectiveStartDateUtc: new Date(enteredEffectiveStartDate),
      effectivEndDate: new Date(enteredEffectiveEndDate), 
      effectiveEndDateUtc: new Date(enteredEffectiveEndDate)
  };

  // If isEditing is false, then this is a newly added BOM, so use the Add API call.
  // Otherwise, use the Edit API call
  let url = process.env.REACT_APP_API_BASE_URL + '/BillOfMaterial/Add'
  if(isEditing)
  {
      url = process.env.REACT_APP_API_BASE_URL + '/BillOfMaterial/' + billOfMaterialId
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(updatedBillOfMaterialWithDates),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error saving the bill of material. Please contact MES support for help.');
}

export const postBillOfMaterialPartList = async(billOfMaterialId:string, billOfMaterialPartsList:BillOfMaterialPartEntity[]) => {
    const url = process.env.REACT_APP_API_BASE_URL + '/BillOfMaterial/Parts/Replace/' + billOfMaterialId;
  
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(billOfMaterialPartsList),
      headers: {
      'Content-Type': 'application/json',
      },
    }); 

    if (response.status === 500)
      throw new Error('There was an error saving the BOM part list. Please contact MES support for help.');
}

/* ---------------------------------------  Bill of Process  ---------------------------------------*/
export async function fetchBillOfProcessByBillOfProcessId(billOfProcessId:string):Promise<BillOfProcessEntity|null> {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/GetByID/' + billOfProcessId);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as BillOfProcessEntity;
}

export async function fetchBillOfProcessByPart(partId?:string):Promise<BillOfProcessEntity|null> {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/GetByPartID/' + partId);
  
  if (response.status === 204)
    return null;
    
  const resData = await response.json();
  return resData as BillOfProcessEntity;
}

export const fetchProcessesNotAssignedToBillOfProcess = async(billOfProcessId:string):Promise<ProcessEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Process/notInBop/' + process.env.REACT_APP_LOCAL_SITE + '/' + billOfProcessId);
  const resData = await response.json();
  return resData as ProcessEntity[];
}

export const fetchBillOfProcessProcessById = async(billOfProcessProcessId:string):Promise<BillOfProcessProcessEntity|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/Process/GetByID/' + billOfProcessProcessId);
  
  if (response.status === 204)
      return null;

  const resData = await response.json();
  return resData as BillOfProcessProcessEntity;
}

export const fetchWorkElementTypeData = async ():Promise<WorkElementTypeEntity[]> => {
    const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/WorkElement/WorkElementType');
    
    if(!response.ok)
      throw new Error('There was a failure in fetching the work element types.  Please check system logs for more details.');

    const resData = await response.json();
    return resData as WorkElementTypeEntity[];
}    

export const fetchWorkElementTypeAttributeData = async ():Promise<WorkElementTypeAttributeEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/WorkElement/WorkElementTypeAttribute');
  const resData = await response.json() 
  return resData as WorkElementTypeAttributeEntity[];  
}

export const postBillOfProcess = async(billOfProcess:BillOfProcessEntity,enteredEffectiveStartDate:Date,enteredEffectiveEndDate:Date,isEditing:boolean) => {
  const billOfProcessId = billOfProcess !== undefined ? billOfProcess.billOfProcessId : '0'

  // Before posting, set the dates from the strings in useState
  const updatedBillOfProcessWithDates = {...billOfProcess, 
      effectiveStartDate: new Date(enteredEffectiveStartDate), 
      effectiveStartDateUtc: new Date(enteredEffectiveStartDate),
      effectivEndDate: new Date(enteredEffectiveEndDate), 
      effectiveEndDateUtc: new Date(enteredEffectiveEndDate)
  };

  // If isEditing is false, then this is a newly added BOM, so use the Add API call.
  // Otherwise, use the Edit API call
  let url = process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/Add';
  
  // if the billOfProcessId is passed in the request params, then we know the form is in edit mode.
  if(isEditing)
  {
    url = process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/' + billOfProcessId;
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(updatedBillOfProcessWithDates),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error saving the bill of process. Please contact MES support for help.');
}

export const postBillOfProcessProcessList = async(billOfProcessId:string, billOfProcessProcessItems:BillOfProcessProcessEntity[]) => {
    const url = process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/Process/Replace/' + billOfProcessId;
  
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(billOfProcessProcessItems),
      headers: {
      'Content-Type': 'application/json',
      },
    }); 

    if (response.status === 500)
      throw new Error('There was an error saving the BOP process list. Please contact MES support for help.');
  }

export async function postBillOfProcessWorkElementList(billOfProcessProcessId:string, billOfProcessProcessWorkElementList:BillOfProcessProcessWorkElementEntity[]) {
  const url = process.env.REACT_APP_API_BASE_URL + '/BillOfProcess/WorkElement/Replace/' + billOfProcessProcessId;
        
  const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(billOfProcessProcessWorkElementList),
        headers: {
        'Content-Type': 'application/json',
        },
      }); 

      if (response.status === 500)
        throw new Error('There was an error saving the bill of process work elements. Please contact MES support for help.');
}

export const saveWorkElementImage = async (uploadedFile:File, billOfProcessProcessId:number, workElementId:number) => {
  const url = process.env.REACT_APP_API_BASE_URL + '/WorkElement/images/upload/' + billOfProcessProcessId + '/' + workElementId;

  const formImageData = new FormData();
  formImageData.append("file",uploadedFile);

  const response = await fetch(url, {
    method: 'POST',
    body: formImageData,
  });

  if (response.status === 500)
    throw new Error('There was an error saving the image. Please contact MES support for help.');
}

/* ---------------------------------------  Run ----------------------------------------------------*/
export const completeOrderItemUnitWorkElementHistory = async (inputOrderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemWorkElementHistory/Complete', {
    method: 'POST',
    body: JSON.stringify(inputOrderItemUnitWorkElementHistory),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error completing the order item unit work history. Please contact MES support for help.');
} 

export const bypassOrderItemUnitWorkElementHistory = async (inputOrderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemWorkElementHistory/Bypass', {
    method: 'POST',
    body: JSON.stringify(inputOrderItemUnitWorkElementHistory),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error bypassing the order item unit work history. Please contact MES support for help.');
} 

export const pauseOrderItemUnitWorkElementHistory = async (inputOrderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemWorkElementHistory/Pause', {
    method: 'POST',
    body: JSON.stringify(inputOrderItemUnitWorkElementHistory),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error pausing the order item unit work history, please contact MES support for help.');
} 

export const resumeOrderItemUnitWorkElementHistory = async (inputOrderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemWorkElementHistory/Resume', {
    method: 'POST',
    body: JSON.stringify(inputOrderItemUnitWorkElementHistory),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error resuming the order item unit work history. Please contact MES support for help.');
} 

/* ---------------------------------------  Orders --------------------------------------------------*/
export const fetchOrdersByOrderState = async(orderState:string):Promise<OrderEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Orders/' + orderState);
  const resData = await response.json();
  return resData as OrderEntity[];
}

/* ---------------------------------------  Order Items ---------------------------------------------*/
export const fetchPartAndOrderItemsViewModelToStartAtEquipment = async(equipmentName:string):Promise<PartAndOrderItemsViewModel[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/PartAndOrderItemsViewModel/GetByEquipmentName/' + equipmentName);
  const resData = await response.json();
  return resData as PartAndOrderItemsViewModel[];
}


/* ---------------------------------------  Order Item Attribute Types -----------------------------*/
export const fetchItemAttributeTypes = async():Promise<ItemAttributeTypeEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Parts/ItemAttributeTypes/GetAll');
  const resData = await response.json();
  return resData as ItemAttributeTypeEntity[];
}

/* ---------------------------------------  Order Item Unit -----------------------------------------*/
export const fetchOrderItemUnitsByOrderItemIds = async(orderItemIds:number[]):Promise<OrderItemUnitEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemUnit/GetByOrderItemIds', {
    method:'POST',
    body: JSON.stringify(orderItemIds),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 500)
    throw new Error('There was an error fetching the order item units, please contact MES support for help.');

  const resData = await response.json();
  return resData as OrderItemUnitEntity[];
}

export const fetchOrderItemUnitEquipmentAndUserBySerialNumber = async(serialNumber:string):Promise<OrderItemUnitEquipmentAndUserViewModel|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemUnitEquipmentAndUserViewModel/GetBySerialNumber/' + serialNumber)
  
  if (response.status === 500)
    throw new Error('There was an error fetching the order item unit with serial number ' + serialNumber + '. Please check the entry and try again.  If the entry is valid, please contact MES support for help.');

  if (response.status === 204)
    return null;

  const resData = await response.json();
  return resData as OrderItemUnitEquipmentAndUserViewModel;
}

export const fetchOrderItemUnitEquipmentAndUserByEquipment = async(equipmentName:string):Promise<OrderItemUnitEquipmentAndUserViewModel|null> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemUnitEquipmentAndUserViewModel/GetByEquipment/' + equipmentName);
  
  if (response.status === 204)
    return null;

  const resData = await response.json();
  return resData as OrderItemUnitEquipmentAndUserViewModel;
}  

export const postAddOrderItemUnitWorkElementHistory = async (inputOrderItemUnitWorkElementHistory:OrderItemUnitWorkElementHistoryEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemWorkElementHistory/Add', {
    method: 'POST',
    body: JSON.stringify(inputOrderItemUnitWorkElementHistory),
    headers: {
      'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error adding the order item unit work history. Please contact MES support for help.');
}  

export const postStartOrderItemUnit = async (startOrderItemUnitViewModel:StartOrderItemUnitViewModel):Promise<string> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/OrderItemUnit/Start', {
    method: 'POST',
    body: JSON.stringify(startOrderItemUnitViewModel),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error starting the order item unit. Please contact MES support for help.');

  const resData = await response.json();
  return resData as string;
}

/* ---------------------------------------  Data Collection  ---------------------------------------*/
export const postDataCollectionAttributeValues = async (orderItemUnitDataCollections:OrderItemUnitDataCollectionEntity[]):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/DataCollection/Save', {
    method: 'POST',
    body: JSON.stringify(orderItemUnitDataCollections),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error saving the data collection values. Please contact MES support for help.');
} 

/* ---------------------------------------  Consumption  ---------------------------------------*/
export const postConsumptionAttributeValues = async (orderItemUnitConsumptions:OrderItemUnitConsumptionEntity[]):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/OrderItemUnit/Consumption/Save', {
    method: 'POST',
    body: JSON.stringify(orderItemUnitConsumptions),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error saving the consumed parts. Please contact MES support for help.');
} 

export const fetchConsumptionValidationMessages = async(serialNumber:string, attributeValue:string):Promise<{errorMessages:string[], warningMessages:string[]}> => {
  const consumptionIsValidResponse = await fetch(process.env.REACT_APP_API_BASE_URL + '/Inventory/SerialValidForConsumptionMessages/' + serialNumber + '/' + attributeValue);
  const consumptionIsValidResponseData = await consumptionIsValidResponse.json();
  return consumptionIsValidResponseData as {errorMessages:string[], warningMessages:string[]};
}

/* ---------------------------------------  Quality --------------------------------------------*/
export const fetchDefectCategoriesWithDefects = async():Promise<DefectCategoryEntity[]> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Quality/DefectCategory/GetAll/false');
  const resData = await response.json();
  return resData as DefectCategoryEntity[];
}

/* ---------------------------------------  Scrap ----------------------------------------------*/
export const postOrderItemUnitScrap = async (orderItemUnitScrap:OrderItemUnitScrapEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Scrap/OrderItemUnitScrap/Add', {
    method: 'POST',
    body: JSON.stringify(orderItemUnitScrap),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error scrapping the order item unit. Please contact MES support for help.');
}

export const postOrderItemUnitScrapReclassify = async (orderItemUnitScrap:OrderItemUnitScrapEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Scrap/OrderItemUnitScrap/Reclassify', {
    method: 'POST',
    body: JSON.stringify(orderItemUnitScrap),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error reclassifying the order item unit scrap. Please contact MES support for help.');
}

export const postOrderItemUnitScrapReturnToProduction = async (orderItemUnitScrap:OrderItemUnitScrapEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Scrap/OrderItemUnitScrap/ReturnToProduction', {
    method: 'POST',
    body: JSON.stringify(orderItemUnitScrap),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error returning the order item unit to production. Please contact MES support for help.');
}

export const postInventoryItemScrap = async (inventoryItemScrap:InventoryItemScrapEntity):Promise<void> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Scrap/InventoryItemScrap/Add', {
    method: 'POST',
    body: JSON.stringify(inventoryItemScrap),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error scrapping the inventory item. Please contact MES support for help.');
}
/* ---------------------------------------  Users and Authentication ---------------------------*/
export const postGetAuthenticatedUserByToken = async (userTokenCookie:any):Promise<UserEntity> => {
  let user = {} as UserEntity;

  if(userTokenCookie.userToken !== undefined)
  {
    const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Authentication/Authenticate/GetUserFromJwt', {
      method: 'POST',
      body: JSON.stringify(userTokenCookie.userToken ? userTokenCookie.userToken.token : ''),
      headers: {
      'Content-Type': 'application/json',
      },
    }); 

    if (response.status === 500)
      throw new Error('There was an error retrieving the authenticated user. Please contact MES support for help.');

    if(response.ok)
    {
        const responseObject = await response.json() as {user:UserEntity, userPhoto:string};
        user = responseObject.user;
        user.userPhotoLink = responseObject.userPhoto;
    }
  }

  return user;
};

export const postGoogleAuthenticate = async (credentialResponse:CredentialResponse):Promise<string> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Authentication/Authenticate/Google', {
    method: 'POST',
    body: JSON.stringify(credentialResponse.credential),
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error authenticating with Google. Please contact MES support for help.');

  if(response.ok)
  {
      const responseToken = await response.json();
      return responseToken;
  }
  else
  {
      return "Failed to authenticate";
  }
}

export const postNoAuthenticate = async ():Promise<string> => {
  const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/Authentication/Authenticate/HardCodeUser/1', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
  }); 

  if (response.status === 500)
    throw new Error('There was an error authenticating with HardCodeUser. Please contact MES support for help.');

  if(response.ok)
  {
      const responseToken = await response.json();
      return responseToken;
  }
  else
  {
      return "Failed to authenticate";
  }
}
