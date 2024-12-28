import { AnimatePresence, motion } from "framer-motion";

type FeedbackState = {
    isVisible: boolean;
    type: "success" | "error";
    message: string;
};

type FeedbackMessageProps = {
    feedback: FeedbackState;
};

export const FeedbackMessage = ({ feedback }: FeedbackMessageProps) => (
    <AnimatePresence>
        {feedback.isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`px-2 py-1 rounded-full text-xs ${
                    feedback.type === "success"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                }`}
            >
                {feedback.message}
            </motion.div>
        )}
    </AnimatePresence>
);
