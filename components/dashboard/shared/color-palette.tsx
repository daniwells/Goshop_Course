import { Dispatch, SetStateAction, FC, useState } from "react";

// Definition
interface ColorPalleteProps {
  extractedColors?: string[];
  colors?: {color: string}[];
  setColors: Dispatch<SetStateAction<{ color: string }[]>>;
}

const CollorPallete: FC<ColorPalleteProps> = ({
  colors,
  extractedColors,
  setColors,
}) => {
  const [activeColor, setActiveColor] = useState("");

  const handleAddProductColor = (color: string) => {
    if(!color || !setColors) return;

    const currentColorsData = colors ?? [];

    const existingcolor = currentColorsData.find((c) => color === c.color);
    if(existingcolor) return;

    const newColors = currentColorsData.filter((c) => c.color !== "");

    setColors([...newColors, {color: color}]);  
  }

  const Color = ({color}: { color: string}) => {
    return <div 
      className="w-8 h-8 cursor-pointer transition-all duration-100 ease-linear relative hover:w-12 hover:duration-300" 
      style={{backgroundColor: color}}
      onMouseEnter={() => setActiveColor(color)}
      onClick={() => handleAddProductColor(color)}
    >
      <div className="w-full h-8 text-center text-xs font-semibold absolute -top-6 text-black">
        {/* {color} */}
      </div>
    </div>
  }

  return <div className="pt-10 w-full h-20 rounded-b-md overflow-hidden">

    <div className="w-full h-[180px] absolute bottom-0 !flex items-center justify-center">
      {
        extractedColors?.map((color, index) => (
          <Color key={index} color={color}/>
        ))
      }
    </div>
  </div>;
}
 
export default CollorPallete;