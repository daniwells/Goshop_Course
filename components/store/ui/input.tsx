interface Props {
    name: string;
    value: string | number;
    type: "text" | "number";
    placeholder?: string;
    onChange: (value: string | number) => void;
}

const Input: React.FC<Props> = ({
    name,
    value,
    type,
    placeholder,
    onChange,
}) => {
    return <div className="w-full relative">
        <input 
            type={type}
            className="w-full pr-6 pl-8 py-4 rounded-xl outline-none duration-200 ring-1 ring-transparent focus:ring-[#11BE86]"
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>;
}
 
export default Input;