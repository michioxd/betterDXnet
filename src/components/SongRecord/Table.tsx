import { difficultyColor, GameRecordStatus, type GameRecordSong } from "@/api/records";
import ImgLazyload from "@/components/Img.Lazyload";
import {
    Box,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { formatPercent, getArtworkUrl, getSongKindImageUrl } from "./shared";

function SongRecordsTableImpl({
    records,
    onSelect,
}: {
    records: GameRecordSong[];
    onSelect: (record: GameRecordSong) => void;
}) {
    const { t } = useTranslation("records");

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{t("songRecords.table.song")}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{t("songRecords.table.difficulty")}</TableCell>
                        <TableCell>{t("songRecords.table.achievement")}</TableCell>
                        <TableCell>{t("songRecords.table.dxScore")}</TableCell>
                        <TableCell>{t("songRecords.table.rank")}</TableCell>
                        <TableCell>{t("songRecords.table.rating")}</TableCell>
                        <TableCell>{t("songRecords.table.status")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record, index) => {
                        const color = difficultyColor[record.songdifficulty];

                        return (
                            <TableRow
                                key={`${record.id}-${record.songdifficulty}-${index}`}
                                hover
                                onClick={() => onSelect(record)}
                                sx={{ cursor: "pointer" }}
                            >
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                        {getArtworkUrl(record) && (
                                            <ImgLazyload
                                                src={getArtworkUrl(record)}
                                                alt={record.songTitle}
                                                sx={{ width: 32, height: 32, borderRadius: 1, objectFit: "cover" }}
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 240 }}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" noWrap title={record.songTitle}>
                                                {record.songTitle || t("card.untitled")}{" "}
                                                <ImgLazyload
                                                    src={getSongKindImageUrl(record.songKind)}
                                                    alt={record.songKind}
                                                    sx={{ width: 40, objectFit: "contain", flexShrink: 0, ml: 0.5 }}
                                                />
                                            </Typography>
                                            {record.songFullDetail?.song.artist && (
                                                <Typography variant="caption" color="textSecondary" noWrap>
                                                    {record.songFullDetail.song.artist}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        <Chip
                                            size="small"
                                            label={record.songdifficulty.toUpperCase()}
                                            sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                        />
                                        <Typography variant="body2">
                                            {record.songLevel}
                                            <Typography component="span" color="textSecondary" variant="body2">
                                                {record.songFullDetail
                                                    ? ` (${record.songFullDetail.sheet.internalLevelValue})`
                                                    : ""}
                                            </Typography>
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{formatPercent(record.achievement)}</TableCell>
                                <TableCell>
                                    {record.dxScore.current.toLocaleString()} / {record.dxScore.max.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <ImgLazyload
                                        src={`https://maimaidx-eng.com/maimai-mobile/img/playlog/${record.scoreRank}.png`}
                                        alt={record.scoreRank}
                                        sx={{ height: 32, objectFit: "contain" }}
                                    />
                                </TableCell>
                                <TableCell>{record.rating ?? "-"}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.2} sx={{ alignItems: "center" }}>
                                        {record.status !== GameRecordStatus.FAILED &&
                                            record.status !== GameRecordStatus.CLEARED && (
                                                <ImgLazyload
                                                    src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${record.status.replace("plus", "p")}.png`}
                                                    alt={record.status}
                                                    sx={{ width: 32, height: 32, objectFit: "contain" }}
                                                />
                                            )}
                                        {record.syncStatusShort !== "solo" && (
                                            <ImgLazyload
                                                src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${record.syncStatusShort}.png`}
                                                alt={record.syncStatusShort}
                                                sx={{ width: 32, height: 32, objectFit: "contain" }}
                                            />
                                        )}
                                        {record.status === GameRecordStatus.CLEARED &&
                                            record.syncStatusShort === "solo" && (
                                                <Typography variant="body2" color="textSecondary">
                                                    -
                                                </Typography>
                                            )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export const SongRecordsTable = memo(SongRecordsTableImpl);
