import { Input } from "@/components/ui/input";
import React, { FC } from "react";

export interface Detail {
    [key: string]: string | number | boolean | undefined;
}

interface ClickToAddInputsProps {
    details: Detail[];
    setDetails: React.Dispatch<React.SetStateAction<Detail[]>>;
    header: string;
    initialDetail: Detail;

}

const ClickToAddInputs: FC<ClickToAddInputsProps> = ({
    details,
    setDetails,
    header,
    initialDetail = {},
}) => {
    const PlusButton = ({ onClick }: { onClick: () => void }) => {
        return <button
            type="button"
            title="Add new detail"
            className="group cursor-pointer outline-none hover:rotate-90 duration-300"
            onClick={onClick}
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50px"
            height="50px"
            viewBox="0 0 24 24"
            className="w-8 h-8 stroke-blue-400 fill-none group-hover:fill-blue-primary group-active:stroke-blue-200 group-active:fill-blue-700 group-active:duration-0 duration-300"
            >
                <path
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    strokeWidth="1.5"
                />
                <path d="M8 12H16" strokeWidth="1.5" />
                <path d="M12 16V8" strokeWidth="1.5" />
            </svg>
        </button>
    };

    const MinusButton = ({ onClick }: { onClick: () => void }) => {
        return <button
            type="button"
            title="Remove detail"
            className="group cursor-pointer outline-none hover:rotate-90 duration-300"
            onClick={onClick}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50px"
                height="50px"
                viewBox="0 0 24 24"
                className="w-8 h-8 stroke-blue-400 fill-none group-hover:fill-white group-active:stroke-blue-200 group-active:fill-blue-700 group-active:duration-0 duration-300"
            >
                <path
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    strokeWidth="1.5"
                />
                <path d="M8 12H16" strokeWidth="1.5" />
            </svg>
        </button>
    };

    return <div className="flex flex-col gap-y-4">
        <div>{header}</div>
        {details.length === 0 && <PlusButton onClick={() => {}}/>}
        {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-x-4">
                {
                    Object.keys(detail).map((property, propIndex) => (
                        <div 
                            key={propIndex}
                            className="flex items-center gap-x-4"
                        >
                            <Input
                                className="w-28"
                                type={typeof detail[property]==="number" ? "number" : "text"}
                                name={property}
                                placeholder={property}
                                value={detail[property] as string}
                                min={typeof detail[property] === "number" ? 0 : undefined}
                            />
                        </div>
                    ))
                }
            </div>
        ))}
        <MinusButton onClick={() => {}}/>
        <PlusButton onClick={() => {}}/>
    </div>

}
 
export default ClickToAddInputs;