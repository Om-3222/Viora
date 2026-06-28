import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/features/theme/themeSlice";

export default function ThemeToggle() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </Button>
    );
}