import { motion } from "framer-motion";

type ConfigItemProps = {
    label: string;
    value: string;
};

export const ConfigItem = ({ label, value }: ConfigItemProps) => (
    <motion.div
        className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
        whileHover={{ x: 5 }}
    >
        <span className="text-xs font-medium">{label}:</span>
        <p className="text-xs text-foreground font-mono mt-0.5 break-all">
            {value || "Loading..."}
        </p>
    </motion.div>
);
