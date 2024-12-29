import CursorIcon from "@/components/icon/CursorIcon";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function Header() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // 检查系统主题偏好
        const prefersDark =
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
        if (prefersDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <div className="w-full h-12 relative mb-2">
            {/* 右上角 - 主题切换按钮 */}
            <div className="absolute top-1 right-1">
                <button
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    onClick={toggleTheme}
                >
                    {isDark
                        ? <SunIcon className="w-4 h-4" />
                        : <MoonIcon className="w-4 h-4" />}
                </button>
            </div>

            {/* 中心 - 图标 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <CursorIcon className="w-12 h-12" />
            </div>
        </div>
    );
}
