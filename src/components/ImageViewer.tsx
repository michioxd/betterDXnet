import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, IconButton } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export type ImageViewerPhoto = {
    imageUrl: string;
    alt?: string;
};

type ImageViewerProps = {
    photo: ImageViewerPhoto | null;
    onClose: () => void;
    sourceRect?: Pick<DOMRect, "left" | "top" | "width" | "height"> | null;
};

type Point = {
    x: number;
    y: number;
};

const animationMs = 220;

function distance(left: Point, right: Point) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function ImageViewer({ photo, onClose, sourceRect }: ImageViewerProps) {
    const [renderedPhoto, setRenderedPhoto] = useState<ImageViewerPhoto | null>(photo);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [sourceTransform, setSourceTransform] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPreparingOpen, setIsPreparingOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const pointersRef = useRef(new Map<number, Point>());
    const lastDragRef = useRef<{ x: number; y: number } | null>(null);
    const lastPinchDistanceRef = useRef<number | null>(null);
    const closeTimerRef = useRef<number | null>(null);
    const openAnimationStartedRef = useRef(false);
    const pointerStartedOnImageRef = useRef(false);

    const getSourceTransform = useCallback(() => {
        const image = imageRef.current;
        if (!image || !sourceRect) return null;

        const finalRect = image.getBoundingClientRect();
        if (finalRect.width === 0 || finalRect.height === 0) return null;

        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const finalCenterX = finalRect.left + finalRect.width / 2;
        const finalCenterY = finalRect.top + finalRect.height / 2;
        const startScale = Math.min(sourceRect.width / finalRect.width, sourceRect.height / finalRect.height);

        return `translate(${sourceCenterX - finalCenterX}px, ${sourceCenterY - finalCenterY}px) scale(${startScale})`;
    }, [sourceRect]);

    useEffect(() => {
        if (!photo) return;

        setRenderedPhoto(photo);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setSourceTransform(null);
        setIsAnimating(false);
        setIsPreparingOpen(false);
        setIsClosing(false);
        openAnimationStartedRef.current = false;
        pointersRef.current.clear();
        lastDragRef.current = null;
        lastPinchDistanceRef.current = null;
    }, [photo]);

    useEffect(() => {
        if (photo || !renderedPhoto) return;

        setRenderedPhoto(null);
    }, [photo, renderedPhoto]);

    const clampScale = useCallback((value: number) => Math.min(8, Math.max(0.25, value)), []);

    useEffect(() => {
        if (!renderedPhoto || isClosing) return;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.88 : 1.12;

            setScale((current) => clampScale(current * delta));
        };

        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => window.removeEventListener("wheel", handleWheel);
    }, [clampScale, isClosing, renderedPhoto]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current !== null) {
                window.clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    const startOpenAnimation = useCallback(() => {
        if (!sourceRect || isClosing || openAnimationStartedRef.current) return;

        const transform = getSourceTransform();
        if (!transform) return;

        openAnimationStartedRef.current = true;
        setIsAnimating(true);
        setIsPreparingOpen(true);
        setSourceTransform(transform);

        requestAnimationFrame(() => {
            imageRef.current?.getBoundingClientRect();

            requestAnimationFrame(() => {
                setIsPreparingOpen(false);
                setSourceTransform(null);
            });
        });
    }, [getSourceTransform, isClosing, sourceRect]);

    const handleImageRef = useCallback(
        (image: HTMLImageElement | null) => {
            imageRef.current = image;

            if (image?.complete) {
                requestAnimationFrame(startOpenAnimation);
            }
        },
        [startOpenAnimation],
    );

    const handleClose = () => {
        if (isClosing) return;

        const transform = getSourceTransform();
        if (!transform) {
            onClose();
            setRenderedPhoto(null);
            return;
        }

        setIsClosing(true);
        setIsAnimating(true);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setSourceTransform(transform);

        closeTimerRef.current = window.setTimeout(() => {
            onClose();
            setRenderedPhoto(null);
            setIsClosing(false);
            setSourceTransform(null);
            closeTimerRef.current = null;
        }, animationMs);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        pointerStartedOnImageRef.current = event.target instanceof Node && !!imageRef.current?.contains(event.target);
        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        lastDragRef.current = { x: event.clientX, y: event.clientY };

        const pointers = [...pointersRef.current.values()];
        if (pointers.length === 2) {
            lastPinchDistanceRef.current = distance(pointers[0], pointers[1]);
        }
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!pointersRef.current.has(event.pointerId)) return;

        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const pointers = [...pointersRef.current.values()];

        if (pointers.length === 2) {
            const currentDistance = distance(pointers[0], pointers[1]);
            const lastDistance = lastPinchDistanceRef.current;

            if (lastDistance) {
                setScale((current) => clampScale(current * (currentDistance / lastDistance)));
            }

            lastPinchDistanceRef.current = currentDistance;
            return;
        }

        const lastDrag = lastDragRef.current;
        if (!lastDrag) return;

        setOffset((current) => ({
            x: current.x + event.clientX - lastDrag.x,
            y: current.y + event.clientY - lastDrag.y,
        }));
        lastDragRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        pointersRef.current.delete(event.pointerId);
        lastPinchDistanceRef.current = null;

        const pointer = [...pointersRef.current.values()][0];
        lastDragRef.current = pointer ?? null;
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (scale > 1) {
            setScale(1);
            setOffset({ x: 0, y: 0 });
            return;
        }

        const imageRect = imageRef.current?.getBoundingClientRect();
        if (!imageRect) return;

        const nextScale = 2.5;
        const imageCenterX = imageRect.left + imageRect.width / 2;
        const imageCenterY = imageRect.top + imageRect.height / 2;

        setScale(nextScale);
        setOffset({
            x: (event.clientX - imageCenterX) * (1 - nextScale),
            y: (event.clientY - imageCenterY) * (1 - nextScale),
        });
    };

    const handleViewerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (pointerStartedOnImageRef.current) {
            pointerStartedOnImageRef.current = false;
            return;
        }

        if (event.target !== event.currentTarget) return;

        handleClose();
    };

    return (
        <Dialog
            fullScreen
            open={renderedPhoto !== null && !isClosing}
            onClose={handleClose}
            slotProps={{
                backdrop: {
                    sx: {
                        bgcolor: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(10px)",
                        opacity: isClosing ? 0 : 1,
                        transition: `opacity ${animationMs}ms ease`,
                    },
                },
                paper: {
                    sx: {
                        bgcolor: "transparent",
                        boxShadow: "none",
                    },
                },
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{ position: "fixed", top: 12, right: 12, zIndex: 1, color: "common.white", bgcolor: "#0008" }}
            >
                <CloseIcon />
            </IconButton>

            <Box
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleViewerClick}
                onDoubleClick={handleDoubleClick}
                sx={{
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                    cursor: scale > 1 ? "grab" : "zoom-in",
                    touchAction: "none",
                    userSelect: "none",
                }}
            >
                {renderedPhoto && (
                    <Box
                        component="img"
                        src={renderedPhoto.imageUrl}
                        alt={renderedPhoto.alt ?? ""}
                        draggable={false}
                        onLoad={startOpenAnimation}
                        onTransitionEnd={() => setIsAnimating(false)}
                        sx={{
                            maxWidth: "calc(100vw - 32px)",
                            maxHeight: "calc(100vh - 32px)",
                            objectFit: "contain",
                            transform: sourceTransform ?? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transition:
                                isPreparingOpen || (pointersRef.current.size && !isAnimating)
                                    ? "none"
                                    : `transform ${animationMs}ms cubic-bezier(0.2, 0, 0, 1)`,
                        }}
                        ref={handleImageRef}
                    />
                )}
            </Box>
        </Dialog>
    );
}

export default ImageViewer;
