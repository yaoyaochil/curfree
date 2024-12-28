import { useEffect, useState } from "react";
import { type CursorConfig, CursorService } from "@service/service";
import { motion } from "framer-motion";
import { ActionButton } from "./ActionButton";
import { ConfigItem } from "./ConfigItem";
import { FeedbackMessage } from "./FeedbackMessage";

// 反馈消息状态接口定义
// Feedback message state interface definition
type FeedbackState = {
    isVisible: boolean;
    type: "success" | "error";
    message: string;
};

export default function Info() {
    // 状态管理
    // State management
    const [cursorConfig, setCursorConfig] = useState<CursorConfig>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>({
        isVisible: false,
        type: "success",
        message: "",
    });

    // 获取 Cursor 配置信息
    // Fetch Cursor configuration
    const getCursorConfig = async () => {
        try {
            const data = await CursorService.GetCursorStorage();
            setCursorConfig(data);
        } catch (err) {
            showFeedback("error", "Failed to load config");
        } finally {
            setIsRefreshing(false);
        }
    };

    // 刷新数据
    // Refresh data
    const refreshData = () => {
        getCursorConfig();
        showFeedback("success", "Refreshed successfully!");
    };

    // 设置只读模式
    // Set read-only mode
    const setReadOnlyMode = (isReadOnly: boolean) => {
        if (!cursorConfig?.configPath) {
            showFeedback("error", "Config path not found");
            return;
        }

        const result = CursorService.SetCursorConfigReadOnly(
            cursorConfig.configPath,
            isReadOnly,
        );

        if (result) {
            getCursorConfig();
            if (isReadOnly) {
                showFeedback("success", "Set read-only mode successfully!");
            } else {
                showFeedback("success", "Set writable mode successfully!");
            }
        } else {
            showFeedback("error", "Failed to set read-only mode");
        }
    };

    // 重置配置
    // Reset configuration
    const resetConfig = () => {
        if (!cursorConfig?.configPath) {
            showFeedback("error", "Config path not found");
            return;
        }

        setIsRefreshing(true);
        const result = CursorService.ResetCursorStorage(
            cursorConfig.configPath,
        );
        if (result) {
            setTimeout(() => {
                getCursorConfig();
                showFeedback("success", "Configuration reset successfully!");
            }, 1000);
        } else {
            showFeedback("error", "Failed to reset configuration");
            setIsRefreshing(false);
        }
    };

    // 备份Storage
    // Backup Storage
    const backupStorage = () => {
        if (!cursorConfig?.configPath) {
            showFeedback("error", "Config path not found");
            return;
        }

        const result = CursorService.BackupCursorStorage(
            cursorConfig.configPath,
        );
        if (result) {
            showFeedback("success", "Backup successfully!");
        } else {
            showFeedback("error", "Failed to backup");
        }
    };

    // 恢复备份
    // Restore backup
    const restoreBackup = () => {
        if (!cursorConfig?.configPath) {
            showFeedback("error", "Config path not found");
            return;
        }

        const result = CursorService.RestoreCursorStorage(
            cursorConfig.configPath,
        );
        if (result) {
            setTimeout(() => {
                getCursorConfig();
                showFeedback("success", "Restore successfully!");
            }, 1000);
        } else {
            showFeedback("error", "Failed to restore");
        }
    };

    // 显示反馈消息
    // Show feedback message
    const showFeedback = (type: "success" | "error", message: string) => {
        setFeedback({ isVisible: true, type, message });
        setTimeout(() => {
            setFeedback((prev) => ({ ...prev, isVisible: false }));
        }, 2000);
    };

    // 组件挂载时获取配置
    // Fetch configuration on component mount
    useEffect(() => {
        getCursorConfig();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col gap-2 overflow-hidden"
        >
            {/* 标题区域 */}
            {/* Title section */}
            <motion.div
                className="flex flex-col border-2 border-primary/20 rounded-lg p-3 hover:border-primary/40 transition-colors scale-95"
                whileHover={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                <div className="flex items-center justify-between gap-3">
                    {/* 标题和图标 */}
                    {/* Title and icon */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-base text-center">🎯</span>
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-primary text-text whitespace-nowrap">
                                    Cursor Free
                                </h1>
                                <p className="text-xs text-secondary whitespace-nowrap">
                                    Cursor Too Many Free Fixed 👹
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 操作反馈消息 */}
                    {/* Operation feedback message */}
                    <FeedbackMessage feedback={feedback} />
                </div>
            </motion.div>

            {/* 配置信息区域 */}
            {/* Configuration information section */}
            <motion.div
                className="flex-1 flex flex-col gap-2 bg-secondary/50 rounded-lg p-3 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {/* 配置头部：标题和操作按钮 */}
                {/* Configuration header: title and action buttons */}
                <div className="flex justify-between items-center relative">
                    {/* 标题和只读模式切换 */}
                    {/* Title and read-only mode toggle */}
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-primary">
                            Cursor Storage
                        </h2>
                        <div className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id="readonly"
                                checked={cursorConfig?.isReadOnly}
                                onChange={(e) =>
                                    setReadOnlyMode(e.target.checked)}
                                className="w-3 h-3 rounded border-primary/30 text-primary focus:ring-primary/30 cursor-pointer"
                            />
                            <label
                                htmlFor="readonly"
                                className="text-xs text-text-secondary cursor-pointer select-none"
                            >
                                Read Only
                            </label>
                        </div>
                    </div>

                    {/* 操作按钮组 */}
                    {/* Action buttons group */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={restoreBackup}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors font-medium ${
                                cursorConfig?.isReadOnly
                                    ? "bg-red-500/10 text-red-500/80 cursor-not-allowed"
                                    : "bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
                            }`}
                            whileHover={cursorConfig?.isReadOnly
                                ? {}
                                : { scale: 1.05 }}
                            whileTap={cursorConfig?.isReadOnly
                                ? {}
                                : { scale: 0.95 }}
                            disabled={cursorConfig?.isReadOnly}
                        >
                            Restore Backup
                        </motion.button>
                        <div className="w-px h-4 bg-primary/20" />
                        <ActionButton
                            icon="💾"
                            tooltip="Backup Config"
                            onClick={backupStorage}
                            hoverAnimation="lift"
                            isReadOnly={cursorConfig?.isReadOnly}
                        />
                        <ActionButton
                            icon="🔄"
                            tooltip="Refresh Config"
                            onClick={refreshData}
                            isLoading={isRefreshing}
                            hoverAnimation="lift"
                            isReadOnly={cursorConfig?.isReadOnly}
                        />
                        <ActionButton
                            icon="✨"
                            tooltip="Generate New Config"
                            onClick={resetConfig}
                            hoverAnimation="rotate"
                            isReadOnly={cursorConfig?.isReadOnly}
                        />
                    </div>
                </div>

                {/* 配置项列表 */}
                {/* Configuration items list */}
                <div className="grid gap-2 overflow-auto">
                    {/* Machine ID 配置项 */}
                    {/* Machine ID configuration item */}
                    <ConfigItem
                        label="Machine ID"
                        value={cursorConfig?.["telemetry.machineId"] ?? ""}
                    />
                    {/* Mac Machine ID 配置项 */}
                    {/* Mac Machine ID configuration item */}
                    <ConfigItem
                        label="Mac Machine ID"
                        value={cursorConfig?.["telemetry.macMachineId"] ?? ""}
                    />
                    {/* Dev Device ID 配置项 */}
                    {/* Dev Device ID configuration item */}
                    <ConfigItem
                        label="Dev Device ID"
                        value={cursorConfig?.["telemetry.devDeviceId"] ?? ""}
                    />
                    {/* SQM ID 配置项 */}
                    {/* SQM ID configuration item */}
                    <ConfigItem
                        label="SQM ID"
                        value={cursorConfig?.["telemetry.sqmId"] ?? ""}
                    />
                    {/* 配置路径 */}
                    {/* Config path */}
                    <ConfigItem
                        label="Config Path"
                        value={cursorConfig?.configPath ?? ""}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
