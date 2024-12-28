import { motion } from "framer-motion";
import { Tooltip } from "./Tooltip";

type ActionButtonProps = {
    icon: string;
    tooltip: string;
    onClick?: () => void;
    isLoading?: boolean;
    hoverAnimation?: "lift" | "rotate";
    isReadOnly?: boolean;
};

export const ActionButton = ({
    icon,
    tooltip,
    onClick,
    isLoading,
    hoverAnimation = "lift",
    isReadOnly = false,
}: ActionButtonProps) => {
    const getHoverAnimation = () => {
        if (isLoading || isReadOnly) return {};
        switch (hoverAnimation) {
            case "rotate":
                return {
                    scale: 1.1,
                    rotate: [0, -15, 15, -15, 15, 0],
                    transition: {
                        duration: 0.6,
                        ease: "easeInOut",
                    },
                };
            case "lift":
            default:
                return {
                    y: -2,
                    transition: { duration: 0.2 },
                };
        }
    };

    const buttonStyles = `
        w-7 h-7 rounded-full 
        ${
        isReadOnly
            ? "bg-red-500/5 cursor-not-allowed"
            : "bg-primary/5 hover:bg-primary/10 cursor-pointer"
    } 
        transition-all flex items-center justify-center relative group
    `;

    const borderStyles = `
        absolute inset-0 rounded-full border-[1.5px] 
        ${
        isReadOnly
            ? "border-red-500/30"
            : "border-primary/30 group-hover:border-primary/50"
    }
    `;

    const blurBorderStyles = `
        absolute inset-0 rounded-full border 
        ${
        isReadOnly
            ? "border-red-500/20"
            : "border-primary/20 group-hover:border-primary/30"
    } 
        blur-[0.5px]
    `;

    return (
        <Tooltip text={isReadOnly ? "Disabled in read-only mode" : tooltip}>
            <motion.button
                className={buttonStyles}
                whileTap={isReadOnly ? {} : { scale: 0.9 }}
                whileHover={getHoverAnimation()}
                onClick={isReadOnly ? undefined : onClick}
                disabled={isLoading || isReadOnly}
            >
                <motion.span
                    className="text-sm relative z-10"
                    animate={isLoading ? { rotate: 360 } : {}}
                    transition={isLoading
                        ? {
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }
                        : {}}
                >
                    {icon}
                </motion.span>
                <div className={borderStyles} />
                <div className={blurBorderStyles} />
                <div className="absolute inset-0 rounded-full shadow-sm group-hover:shadow transition-all" />
            </motion.button>
        </Tooltip>
    );
};
