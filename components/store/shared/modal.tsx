"use client";

import { X } from "lucide-react";
import React, { Dispatch, SetStateAction, useRef } from "react";
import useOnClickOutside from "use-onclickoutside";;

interface Props {
    title?: string;
    show?: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    children: React.ReactNode
}

const Modal: React.FC<Props> = ({
    title,
    show,
    setShow,
    children,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const close = () => setShow(false);
    useOnClickOutside(ref as React.RefObject<HTMLElement>, close);

    if(!show) return null;
 
    return <div className="w-full h-full fixed top-0 right-0 bottom-0 bg-gray-50/65 z-50" >
        <div
            ref={ref}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-10 min-w-[800px] max-w-[900px] py-5 shadow-md rounded-lg">
            <div className="flex items-center justify-between border-b pb-2">
                <h1 className="text-xl font-bold">{title}</h1>
                <X
                    className="w-4 h-4 cursor-poiModal"
                    onClick={() => setShow(false)}
                />
            </div>
            <div className="mt-6">{children}</div>
        </div>
    </div>;
}
 
export default Modal;