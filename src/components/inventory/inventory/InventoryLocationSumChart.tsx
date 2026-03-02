import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { InventoryItemEntity } from "../../../models/inventory-item-entity";
import { useState } from "react";

const aggregateLocationTypeData = (inventoryList:InventoryItemEntity[]):{name:string, value:number}[] => {
  
    let inventoryDataMappedForPieChart = [] as {name:string, value:number}[];
    
    inventoryList.forEach(inventoryItem => {
        const locationTypeIndex = inventoryDataMappedForPieChart.findIndex(pieDataItem => pieDataItem.name === inventoryItem.inventoryLocation.inventoryLocationType.name);
        if(locationTypeIndex !== undefined && locationTypeIndex >= 0)
        {
            inventoryDataMappedForPieChart[locationTypeIndex].value += inventoryItem.quantity;
        }
        else
        {
            inventoryDataMappedForPieChart.push({name:inventoryItem.inventoryLocation.inventoryLocationType.name, value:inventoryItem.quantity});
        }
    });

    return inventoryDataMappedForPieChart;
  }

const InventoryLocationSumChart: React.FC<{inventoryItems:InventoryItemEntity[]}> = (props) => {

  const inventoryPieChartColors = ['#00AA45', '#933393', '#176e9e', '#d62671','#fae153','#ff6e00'];
  const [pieChartActiveIndex, setPieChartActiveIndex] = useState(0);

  const inventoryDataMappedForPieChart = aggregateLocationTypeData(props.inventoryItems);

    const renderActiveShape = (props:{cx:number, cy:number, midAngle:number, innerRadius:number, outerRadius:number, startAngle:number, endAngle:number,fill:string,payload:{name:string, value:number}, percent:number}) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 5) * cos;
        const sy = cy + (outerRadius + 5) * sin;
        const mx = cx + (outerRadius + 15) * cos;
        const my = cy + (outerRadius + 15) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 20;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';
      
        return (
          <g>
            <Sector
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={startAngle}
              endAngle={endAngle}
            //   fill={fill}
              fill={inventoryPieChartColors[pieChartActiveIndex % inventoryPieChartColors.length]}
            />
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 3}
              outerRadius={outerRadius + 5}
              fill={inventoryPieChartColors[pieChartActiveIndex % inventoryPieChartColors.length]}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            {/* <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" /> */}
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#333">{`${payload.value} (${(percent * 100).toFixed(2)}%)`}</text>
            {/* <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
              {`(${(percent * 100).toFixed(2)}%)`}
            </text> */}
          </g>
        );
      };
      
    const onPieEnter = (props:{payload:{name:string, value:number}}, index:number) => {
        setPieChartActiveIndex(index);
      };

    return (
        <ResponsiveContainer width="100%" height="100%">
                <PieChart width={150} height={150}>
                <Pie
                    activeIndex={pieChartActiveIndex}
                    activeShape={renderActiveShape}
                    data={inventoryDataMappedForPieChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={60}
                    // fill="#8884d8"
                    // fill={inventoryPieChartColors[pieChartActiveIndex % inventoryPieChartColors.length]}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                >
                    {inventoryDataMappedForPieChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={inventoryPieChartColors[index % inventoryPieChartColors.length]} />
                        ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
    );
}

export default InventoryLocationSumChart;


