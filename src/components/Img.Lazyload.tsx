import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { forwardRef, useEffect, useRef, useState } from "react";
import blankSvg from "../assets/blank.svg";

type ImgLazyloadProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src?: string;
    image?: string;
    sx?: SxProps<Theme>;
    rootMargin?: string;
    eager?: boolean;
    placeholderSrc?: string;
};

const ImgLazyload = forwardRef<HTMLImageElement, ImgLazyloadProps>(function ImgLazyload(
    { src, image, sx, rootMargin = "200px", eager = false, placeholderSrc, loading, decoding, onError, ...props },
    ref,
) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const actualSrc = src ?? image;
    const [shouldLoad, setShouldLoad] = useState(eager);
    const [hasError, setHasError] = useState(false);
    const fallbackSrc = placeholderSrc ?? blankSvg;
    const displaySrc = shouldLoad && actualSrc && !hasError ? actualSrc : fallbackSrc;

    useEffect(() => {
        setHasError(false);
    }, [actualSrc]);

    useEffect(() => {
        if (eager || shouldLoad) return;

        const img = imgRef.current;
        if (!img) return;

        if (!("IntersectionObserver" in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                setShouldLoad(true);
                observer.disconnect();
            },
            { rootMargin },
        );

        observer.observe(img);

        return () => observer.disconnect();
    }, [eager, rootMargin, shouldLoad]);

    const setRefs = (node: HTMLImageElement | null) => {
        imgRef.current = node;

        if (typeof ref === "function") {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    return (
        <Box
            component="img"
            ref={setRefs}
            src={displaySrc}
            loading={loading ?? (eager ? "eager" : "lazy")}
            decoding={decoding ?? "async"}
            onError={(event) => {
                setHasError(true);
                onError?.(event);
            }}
            sx={sx}
            {...props}
        />
    );
});

export default ImgLazyload;
