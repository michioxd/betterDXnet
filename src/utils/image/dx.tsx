import { getRatingColor, type ApiMe, type ApiMeRankType } from "@/api/me";
import { difficultyColor, GameRecordStatus, type GameRecordSong } from "@/api/records";
import { GameRecordSyncStatusShort, musicIconBaseImg, playlogBaseImg, songKindBaseImg } from "@/api/records/types";
import { getSongArtworkUrl } from "@/db/maimaiDataApi";
import Konva from "konva";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Group, Image, Layer, Rect, Stage, Text } from "react-konva";
import useImage from "use-image";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 2670;

const GRID_WIDTH = 1870;
const GRID_X = (CANVAS_WIDTH - GRID_WIDTH) / 2;

const BG_URL = "https://michioxd.ch/betterDXnet-resources/images/dxrate/base.png";
const GOOGLE_SANS_CSS_URL = "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap";
const EMPTY_IMAGE_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const DX_RATING_BG_URL = "https://michioxd.ch/betterDXnet-resources/images/dxrate/UI_CMN_DXRating_{}.png";

const CARD_GAP = 12;
const CARD_HEIGHT = 205;
const CARD_COLS = 5;
const FONT_FAMILY =
    "Google Sans, ヒラギノ角ゴ Pro W3, メイリオ, Meiryo, ＭＳ Ｐゴシック, MS P Gothic, sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif";
const RATING_BG_INDEX: Record<ApiMeRankType, string> = {
    base: "01",
    blue: "02",
    green: "03",
    yellow: "04",
    red: "05",
    purple: "06",
    bronze: "07",
    silver: "08",
    gold: "09",
    platinum: "10",
    rainbow: "11",
};

interface RatingCanvasProps {
    newItems: GameRecordSong[];
    oldItems: GameRecordSong[];
    profile?: ApiMe;
    onAssetProgress?: (loaded: number, total: number, message?: string) => void;
}

export interface RatingCanvasHandle {
    exportImage: () => string | null;
    destroy: () => void;
}

interface RatingCardProps {
    item: GameRecordSong;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    onAssetLoaded: (message: string) => void;
}

type AssetLoadedHandler = (message: string) => void;

function BlurredCoverImage({ image, width, height }: { image: HTMLImageElement; width: number; height: number }) {
    const imageRef = useRef<Konva.Image>(null);

    useEffect(() => {
        const node = imageRef.current;

        if (!node) return;

        node.cache();
        node.getLayer()?.batchDraw();

        return () => {
            node.clearCache();
        };
    }, [height, image, width]);

    return (
        <Image
            ref={imageRef}
            image={image}
            width={width}
            height={height}
            opacity={0.9}
            filters={[Konva.Filters.Blur]}
            blurRadius={10}
            crop={getCoverCrop(image, width, height)}
        />
    );
}

function fitText(value: string, maxLength: number) {
    if (value.length <= maxLength) return value;

    return `${value.slice(0, maxLength - 1)}…`;
}

function formatPercent(value: number) {
    return `${value.toFixed(4)}%`;
}

function formatGeneratedAt(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, "0");

    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(
        date.getMonth() + 1,
    )}/${date.getFullYear()}`;
}

function getCoverCrop(image: HTMLImageElement, width: number, height: number) {
    const imageRatio = image.width / image.height;
    const targetRatio = width / height;

    if (imageRatio > targetRatio) {
        const cropWidth = image.height * targetRatio;

        return {
            x: (image.width - cropWidth) / 2,
            y: 0,
            width: cropWidth,
            height: image.height,
        };
    }

    const cropHeight = image.width / targetRatio;

    return {
        x: 0,
        y: (image.height - cropHeight) / 2,
        width: image.width,
        height: cropHeight,
    };
}

function getContainSize(image: HTMLImageElement, width: number, height: number) {
    const scale = Math.min(width / image.width, height / image.height);
    const containedWidth = image.width * scale;
    const containedHeight = image.height * scale;

    return {
        x: (width - containedWidth) / 2,
        y: (height - containedHeight) / 2,
        width: containedWidth,
        height: containedHeight,
    };
}

function useTrackedImage(
    url: string,
    onAssetLoaded: AssetLoadedHandler,
    message: string,
): HTMLImageElement | undefined {
    const [image, status] = useImage(url || EMPTY_IMAGE_URL, "anonymous");
    const reportedRef = useRef(false);

    useEffect(() => {
        if (!url) return;
        if (reportedRef.current || (status !== "loaded" && status !== "failed")) return;

        reportedRef.current = true;
        onAssetLoaded(`${status === "loaded" ? "Loaded" : "Skipped"} ${message}`);
    }, [message, onAssetLoaded, status, url]);

    return url ? image : undefined;
}

function useTrackedGoogleSans(onAssetLoaded: AssetLoadedHandler) {
    const reportedRef = useRef(false);

    useEffect(() => {
        if (reportedRef.current) return;

        let cancelled = false;
        const existingLink = document.querySelector<HTMLLinkElement>(`link[href="${GOOGLE_SANS_CSS_URL}"]`);
        const link = existingLink ?? document.createElement("link");
        const stylesheetLoaded = existingLink
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                  link.addEventListener("load", () => resolve(), { once: true });
                  link.addEventListener("error", () => resolve(), { once: true });
              });

        if (!existingLink) {
            link.rel = "stylesheet";
            link.href = GOOGLE_SANS_CSS_URL;
            document.head.appendChild(link);
        }

        stylesheetLoaded
            .then(() =>
                Promise.all([
                    document.fonts.load(`400 24px "Google Sans"`),
                    document.fonts.load(`500 24px "Google Sans"`),
                    document.fonts.load(`700 24px "Google Sans"`),
                ]),
            )
            .catch(() => undefined)
            .finally(() => {
                if (cancelled || reportedRef.current) return;

                reportedRef.current = true;
                onAssetLoaded("Loaded Google Sans font");
            });

        return () => {
            cancelled = true;
        };
    }, [onAssetLoaded]);
}

function getRatingBgUrl(rating: number) {
    return DX_RATING_BG_URL.replace("{}", RATING_BG_INDEX[getRatingColor(rating)]);
}

function ProfileHeader({
    profile,
    rating,
    onAssetLoaded,
}: {
    profile?: ApiMe;
    rating: number;
    onAssetLoaded: AssetLoadedHandler;
}) {
    const avatar = useTrackedImage(profile?.collections.icon.url ?? "", onAssetLoaded, "current user icon");
    const ratingBg = useTrackedImage(getRatingBgUrl(rating), onAssetLoaded, "rating plate");
    const avatarCrop = avatar ? getCoverCrop(avatar, 240, 240) : null;
    const ratingDigits = rating.toString().padStart(5, " ").slice(-5).split("");

    return (
        <>
            {avatar && (
                <Group x={30} y={37} clipFunc={(ctx) => ctx.roundRect(0, 0, 240, 240, 18)}>
                    <Image image={avatar} width={240} height={240} crop={avatarCrop!} />
                </Group>
            )}

            <Text
                x={296}
                y={37}
                width={713.96}
                height={113}
                text={profile?.name ?? ""}
                fontSize={62}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#ffffff"
                align="center"
                verticalAlign="middle"
                wrap="none"
                ellipsis
                shadowColor="black"
                shadowBlur={8}
                shadowOpacity={0.45}
            />

            {ratingBg && <Image image={ratingBg} x={296} y={176} width={546} height={103} />}
            {ratingDigits.map((digit, index) => (
                <Text
                    key={`rating-digit-${index}`}
                    x={548 + index * 44}
                    y={194}
                    width={44}
                    height={65}
                    text={digit}
                    fontSize={50}
                    fontStyle="bold"
                    fontFamily={FONT_FAMILY}
                    fill="#ffffff"
                    align="center"
                    verticalAlign="middle"
                    shadowColor="black"
                    shadowBlur={5}
                    shadowOpacity={0.55}
                />
            ))}
        </>
    );
}

function RatingCard({ item, index, x, y, width, height, onAssetLoaded }: RatingCardProps) {
    const difficulty = difficultyColor[item.songdifficulty];
    const artworkUrl = item.songFullDetail ? getSongArtworkUrl(item.songFullDetail.song) : "";
    const rankUrl = playlogBaseImg.replace("{}", item.scoreRank.toLowerCase());
    const songKindUrl = songKindBaseImg.replace("{}", item.songKind === "std" ? "standard" : item.songKind);
    const statusUrl =
        item.status !== GameRecordStatus.FAILED && item.status !== GameRecordStatus.CLEARED
            ? musicIconBaseImg.replace("{}", item.status)
            : "";
    const syncUrl =
        item.syncStatusShort !== GameRecordSyncStatusShort.SOLO
            ? musicIconBaseImg.replace("{}", item.syncStatusShort)
            : "";
    const artwork = useTrackedImage(artworkUrl, onAssetLoaded, `artwork #${index + 1}`);
    const rank = useTrackedImage(rankUrl, onAssetLoaded, `rank #${index + 1}`);
    const songKind = useTrackedImage(songKindUrl, onAssetLoaded, `song type #${index + 1}`);
    const status = useTrackedImage(statusUrl, onAssetLoaded, `clear status #${index + 1}`);
    const sync = useTrackedImage(syncUrl, onAssetLoaded, `sync status #${index + 1}`);
    const artist = item.songFullDetail?.song.artist ?? "";
    const statusSize = status ? getContainSize(status, 38, 38) : null;
    const syncSize = sync ? getContainSize(sync, 38, 38) : null;

    return (
        <Group x={x} y={y} clipFunc={(ctx) => ctx.roundRect(0, 0, width, height, 16)}>
            <Rect width={width} height={height} fill="rgba(0,0,0,0.55)" />
            {artwork && <BlurredCoverImage image={artwork} width={width} height={height} />}
            <Rect width={width} height={height} fill={difficulty} opacity={0.4} />
            <Rect width={width} height={height} fill="rgba(0,0,0,0.38)" />
            <Rect width={width} height={height} stroke={difficulty} strokeWidth={3} cornerRadius={16} />

            <Text
                x={18}
                y={14}
                text={`#${index + 1}`}
                fontSize={24}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#ffffff"
                opacity={0.8}
            />
            <Text
                x={70}
                y={12}
                width={width - 88}
                height={30}
                text={fitText(item.songTitle || "untitled", 25)}
                fontSize={25}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#ffffff"
                wrap="none"
                ellipsis
            />
            <Text
                x={70}
                y={45}
                width={width - 88}
                height={22}
                text={fitText(artist, 31)}
                fontSize={18}
                fontFamily={FONT_FAMILY}
                fill="rgba(255,255,255,0.78)"
                wrap="none"
                ellipsis
            />

            <Rect x={18} y={78} width={108} height={30} fill={difficulty} cornerRadius={15} />
            <Text
                x={18}
                y={84}
                width={108}
                align="center"
                text={item.songdifficulty.toUpperCase()}
                fontSize={17}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#111111"
            />
            <Rect x={136} y={78} width={75} height={30} fill="rgba(0,0,0,0.45)" cornerRadius={15} />
            <Text
                x={136}
                y={84}
                width={75}
                align="center"
                text={`Lv ${item.songLevel}`}
                fontSize={17}
                fontFamily={FONT_FAMILY}
                fill="#ffffff"
            />
            {songKind && <Image image={songKind} x={222} y={80} width={70} height={24} />}

            <Text
                x={18}
                y={125}
                text={formatPercent(item.achievement)}
                fontSize={28}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#66d9ff"
            />

            {rank && <Image image={rank} x={width / 2 - 10} y={117} width={90} height={45} />}

            <Text
                x={width - 115}
                y={120}
                width={100}
                align="right"
                text={`${item.rating ?? "-"}`}
                fontSize={40}
                fontStyle="bold"
                fontFamily={FONT_FAMILY}
                fill="#ffd54f"
            />

            {status && (
                <Image
                    image={status}
                    x={16 + statusSize!.x}
                    y={height - 48 + statusSize!.y}
                    width={statusSize!.width}
                    height={statusSize!.height}
                />
            )}
            {sync && (
                <Image
                    image={sync}
                    x={(status ? 53 : 16) + syncSize!.x}
                    y={height - 48 + syncSize!.y}
                    width={syncSize!.width}
                    height={syncSize!.height}
                />
            )}
        </Group>
    );
}

interface ChartSectionProps {
    gridY: number;
    items: GameRecordSong[];
    onAssetLoaded: AssetLoadedHandler;
    cols?: number;
}

function ChartSection({ gridY, items, onAssetLoaded, cols = CARD_COLS }: ChartSectionProps) {
    const cardWidth = (GRID_WIDTH - CARD_GAP * (cols - 1)) / cols;

    return items.map((item, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return (
            <RatingCard
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                x={GRID_X + col * (cardWidth + CARD_GAP)}
                y={gridY + row * (CARD_HEIGHT + CARD_GAP)}
                width={cardWidth}
                height={CARD_HEIGHT}
                onAssetLoaded={onAssetLoaded}
            />
        );
    });
}

const RatingCanvas = forwardRef<RatingCanvasHandle, RatingCanvasProps>(function RatingCanvas(
    { newItems, oldItems, profile, onAssetProgress },
    ref,
) {
    const stageRef = useRef<Konva.Stage>(null);
    const [background, backgroundStatus] = useImage(BG_URL, "anonymous");
    const loadedRef = useRef(0);
    const totalRating = useMemo(
        () => [...newItems, ...oldItems].reduce((total, item) => total + (item.rating ?? 0), 0),
        [newItems, oldItems],
    );
    const generatedAt = useMemo(() => formatGeneratedAt(new Date()), []);
    const totalAssets = useMemo(() => {
        const itemAssets = [...newItems, ...oldItems].reduce((total, item) => {
            let count = 2;

            if (item.songFullDetail) count += 1;
            if (item.status !== GameRecordStatus.FAILED && item.status !== GameRecordStatus.CLEARED) count += 1;
            if (item.syncStatusShort !== GameRecordSyncStatusShort.SOLO) count += 1;

            return total + count;
        }, 2);

        return itemAssets + (profile?.collections.icon.url ? 1 : 0) + 1;
    }, [newItems, oldItems, profile?.collections.icon.url]);

    useEffect(() => {
        loadedRef.current = 0;
        onAssetProgress?.(0, totalAssets, `Preparing ${totalAssets} assets`);
    }, [newItems, oldItems, onAssetProgress, totalAssets]);

    useEffect(() => {
        if (backgroundStatus !== "loaded" && backgroundStatus !== "failed") return;

        loadedRef.current += 1;
        onAssetProgress?.(
            Math.min(loadedRef.current, totalAssets),
            totalAssets,
            `${backgroundStatus === "loaded" ? "Loaded" : "Skipped"} background`,
        );
    }, [backgroundStatus, onAssetProgress, totalAssets]);

    const handleAssetLoaded = useCallback(
        (message: string) => {
            loadedRef.current += 1;
            onAssetProgress?.(Math.min(loadedRef.current, totalAssets), totalAssets, message);
        },
        [onAssetProgress, totalAssets],
    );

    useTrackedGoogleSans(handleAssetLoaded);

    useImperativeHandle(ref, () => ({
        exportImage: () => stageRef.current?.toDataURL({ pixelRatio: 1, mimeType: "image/png" }) ?? null,
        destroy: () => stageRef.current?.destroy(),
    }));

    return (
        <Stage ref={stageRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            <Layer>
                {background && <Image image={background} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />}

                <ProfileHeader profile={profile} rating={totalRating} onAssetLoaded={handleAssetLoaded} />

                <ChartSection gridY={300} items={newItems} onAssetLoaded={handleAssetLoaded} />
                <ChartSection gridY={1023} items={oldItems} onAssetLoaded={handleAssetLoaded} />

                <Text
                    x={1310}
                    y={2603}
                    width={500}
                    text={generatedAt}
                    fontSize={30}
                    fontFamily={FONT_FAMILY}
                    fill="rgb(255,255,255)"
                    align="right"
                />
            </Layer>
        </Stage>
    );
});

export default RatingCanvas;
