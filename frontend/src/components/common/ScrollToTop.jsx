import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    // 1. Scroll to top on page change if there is no hash anchor
    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    // 2. Scroll to hash element on initial mount or after cross-page navigation
    useEffect(() => {
        if (hash) {
            const timer = setTimeout(() => {
                const target = document.getElementById(hash.slice(1));
                target?.scrollIntoView({ behavior: "smooth" });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [pathname, hash]);

    // 3. Intercept same-page clicks to ensure smooth scroll (anchors and Home/Logo links)
    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest("a");
            if (!link) return;

            try {
                const url = new URL(link.href);
                if (url.pathname === window.location.pathname) {
                    e.preventDefault();
                    if (url.hash) {
                        const target = document.getElementById(url.hash.slice(1));
                        target?.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", url.hash);
                    } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        window.history.pushState(null, "", window.location.pathname);
                    }
                }
            } catch { }
        };

        document.addEventListener("click", handleClick, { capture: true });
        return () => document.removeEventListener("click", handleClick, { capture: true });
    }, []);

    return null;
}
