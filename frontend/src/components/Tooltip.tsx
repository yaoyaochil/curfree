type TooltipProps = {
    children: React.ReactNode;
    text: string;
};

export const Tooltip = ({ children, text }: TooltipProps) => (
    <div className="z-50 group relative inline-block">
        {children}
        <div className="absolute invisible group-hover:visible -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/90 text-white text-xs rounded whitespace-nowrap z-50">
            {text}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary/90 rotate-45" />
        </div>
    </div>
);
