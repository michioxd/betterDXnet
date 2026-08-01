import { difficultyColor, GameRecordStatus, type GameRecordSong } from "@/api/records";
import ImgLazyload from "@/components/Img.Lazyload";
import StarIcon from "@mui/icons-material/Star";
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { formatPercent, getArtworkUrl, getSongKindImageUrl } from "./shared";

function SongRecordCardImpl({
    record,
    onSelect,
}: {
    record: GameRecordSong;
    onSelect: (record: GameRecordSong) => void;
}) {
    const { t } = useTranslation("records");
    const color = difficultyColor[record.songdifficulty];
    const artworkUrl = getArtworkUrl(record);

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 5%, transparent)`,
                cursor: "pointer",
            }}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(record)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(record);
                }
            }}
        >
            <CardActionArea>
                <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                        <Stack direction="row" spacing={2}>
                            {artworkUrl && (
                                <Box sx={{ position: "relative", flexShrink: 0 }}>
                                    <ImgLazyload
                                        src={artworkUrl}
                                        alt={record.songTitle}
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 1,
                                            objectFit: "cover",
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            filter: "blur(8px)",
                                            opacity: 0.55,
                                            transform: "scale(1.05)",
                                        }}
                                    />
                                    <ImgLazyload
                                        src={artworkUrl}
                                        alt={record.songTitle}
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 1,
                                            objectFit: "cover",
                                            position: "relative",
                                        }}
                                    />
                                    <ImgLazyload
                                        src={getSongKindImageUrl(record.songKind)}
                                        alt={record.songKind}
                                        sx={{ position: "absolute", bottom: -5, right: -5, height: 18 }}
                                    />
                                </Box>
                            )}

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                {record.songFullDetail?.song.artist && (
                                    <Typography variant="subtitle2" color="textSecondary" noWrap sx={{ fontSize: 12 }}>
                                        {record.songFullDetail.song.artist}
                                    </Typography>
                                )}
                                <Typography variant="subtitle1" noWrap title={record.songTitle}>
                                    {record.songTitle || t("card.untitled")}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                    <Chip
                                        size="small"
                                        label={record.songdifficulty.toUpperCase()}
                                        sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                    />
                                    {record.songFullDetail ? (
                                        <Tooltip
                                            title={"" + record.songFullDetail.sheet.internalLevelValue}
                                            placement="top"
                                            arrow
                                        >
                                            <Chip size="small" label={`Lv ${record.songLevel}`} />
                                        </Tooltip>
                                    ) : (
                                        <Chip size="small" label={`Lv ${record.songLevel}`} />
                                    )}
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", justifyContent: "space-between" }}
                        >
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    {t("songRecords.achievement")}
                                </Typography>
                                <Typography variant="h6" color="primary.main">
                                    {formatPercent(record.achievement)}
                                </Typography>
                            </Box>

                            <img
                                src={`https://maimaidx-eng.com/maimai-mobile/img/playlog/${record.scoreRank}.png`}
                                alt={record.scoreRank}
                                style={{ height: 44, objectFit: "contain" }}
                            />

                            <Box sx={{ textAlign: "right" }}>
                                <Typography variant="caption" color="textSecondary">
                                    {t("songRecords.rating")}
                                </Typography>
                                <Tooltip
                                    title={record.rating === undefined ? t("songRecords.ratingUnavailable") : ""}
                                    arrow
                                >
                                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <StarIcon
                                            fontSize="small"
                                            color={record.rating === undefined ? "disabled" : "warning"}
                                        />
                                        {record.rating ?? "-"}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                            {record.status !== GameRecordStatus.FAILED &&
                                record.status !== GameRecordStatus.CLEARED && (
                                    <ImgLazyload
                                        src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${record.status.replace("plus", "p")}.png`}
                                        alt={record.status}
                                        sx={{ width: 40, height: 40, objectFit: "contain" }}
                                    />
                                )}
                            {record.syncStatusShort !== "solo" && (
                                <ImgLazyload
                                    src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${record.syncStatusShort}.png`}
                                    alt={record.syncStatusShort}
                                    sx={{ width: 40, height: 40, objectFit: "contain" }}
                                />
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export const SongRecordCard = memo(SongRecordCardImpl);
