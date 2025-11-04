interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value:string) => void;
    onRemove: (value:string) => void;
    value: string[];
    type: "standard" | "profile" | "cover";
    
}

