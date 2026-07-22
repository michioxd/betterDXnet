import { useEffect, useState, type ReactNode } from "react";
import { ResponsiveContainer, type ResponsiveContainerProps } from "recharts";

type SafeResponsiveContainerProps = Omit<ResponsiveContainerProps, "children"> & {
    children: ReactNode;
};

/**
 * Delays Recharts responsive measurement until the next animation frame.
 *
 * Firefox can throw ResizeObserver/requestAnimationFrame related errors when a
 * chart is mounted while its parent layout is still settling. Mounting the real
 * `ResponsiveContainer` one frame later avoids calling Recharts measurement code
 * against an unstable container.
 */
export function SafeResponsiveContainer({ children, ...props }: SafeResponsiveContainerProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const requestFrame = window.requestAnimationFrame.bind(window);
        const cancelFrame = window.cancelAnimationFrame.bind(window);
        const frame = requestFrame(() => setReady(true));

        return () => cancelFrame(frame);
    }, []);

    if (!ready) return null;

    return <ResponsiveContainer {...props}>{children}</ResponsiveContainer>;
}
