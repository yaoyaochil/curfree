import { useEffect, useRef, useState } from "react";

type TooltipProps = {
    children: React.ReactNode;
    text: string;
};

export const Tooltip = ({ children, text }: TooltipProps) => {
    const [isRight, setIsRight] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkPosition = () => {
            if (tooltipRef.current) {
                const rect = tooltipRef.current.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                setIsRight(rect.right > windowWidth);
            }
        };

        checkPosition();
        window.addEventListener("resize", checkPosition);
        return () => window.removeEventListener("resize", checkPosition);
    }, []);

    return (
        <div className="z-[999] group relative inline-block">
            {children}
            <div
                ref={tooltipRef}
                className={`absolute invisible group-hover:visible -top-8
                    px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md
                    whitespace-nowrap transition-all duration-200
                    ${isRight ? "right-0" : "left-1/2 -translate-x-1/2"}`}
            >
                {text}
                <div
                    className={`absolute -bottom-1 w-2 h-2 bg-popover rotate-45
                        ${isRight ? "right-2" : "left-1/2 -translate-x-1/2"}`}
                />
            </div>
        </div>
    );
};
