import { apiCollections, type PartnerAvailableListResponse } from "@/api/collections";
import { rootStore } from "@/stores/root";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function PageCollectionsPartner() {
    const { app, me } = rootStore;
    const [partners, setPartners] = useState<PartnerAvailableListResponse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    const loadPartners = useCallback(async (showPageLoading: boolean) => {
        if (showPageLoading) {
            setLoading(true);
        } else {
            setBackgroundLoading(true);
        }
        setError(null);

        try {
            const partnerList = await apiCollections.partner.listAvailable();

            if (disposedRef.current) return;

            setPartners(partnerList);
        } catch (error) {
            if (disposedRef.current) return;

            setError(error as Error);
        } finally {
            if (disposedRef.current) return;

            if (showPageLoading) {
                setLoading(false);
            } else {
                setBackgroundLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        disposedRef.current = false;
        void loadPartners(true);

        return () => {
            disposedRef.current = true;
        };
    }, [loadPartners]);

    useEffect(() => {
        if (loading || backgroundLoading) app.setGlobalLoading(true);
        else app.setGlobalLoading(false);
    }, [loading, backgroundLoading, app]);

    const getRequiredUserToken = () => {
        const token = me.getUserToken();

        if (!token) {
            throw new Error("User token not found");
        }

        return token;
    };

    const handleSetPartner = async (partner: PartnerAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.partner.set(partner.formValue, getRequiredUserToken());
            await loadPartners(false);
            me.refresh();
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const filteredPartners = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return partners.filter((partner) => {
            const matchesText =
                normalizedSearchText.length === 0 ||
                partner.title.toLowerCase().includes(normalizedSearchText) ||
                partner.description.toLowerCase().includes(normalizedSearchText);

            return matchesText;
        });
    }, [partners, searchText]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">Collections / Partner</Typography>
                <Typography color="textSecondary">Change partners for your profile.</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    fullWidth
                    label="Search"
                    placeholder="Filter by title or description"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
            </Stack>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && (
                <>
                    <Typography color="textSecondary">
                        Showing {filteredPartners.length} of {partners.length} partners
                    </Typography>

                    <Grid container spacing={2}>
                        {filteredPartners.map((partner) => (
                            <Grid key={`${partner.formValue}-${partner.title}`} size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        opacity: partner.available ? 1 : 0.55,
                                        borderColor: partner.using ? "primary.main" : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                            <CardMedia
                                                component="img"
                                                image={partner.url}
                                                alt={partner.title}
                                                sx={{ width: 96, height: 96, objectFit: "contain", flexShrink: 0 }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" noWrap title={partner.title}>
                                                    {partner.title || "Untitled"}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    noWrap
                                                    title={partner.description}
                                                >
                                                    {partner.description || "No description"}
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
                                                >
                                                    {partner.using && (
                                                        <Chip size="small" color="primary" label="In-use" />
                                                    )}
                                                    {!partner.available && (
                                                        <Chip size="small" color="default" label="Locked" />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!partner.available || partner.using || backgroundLoading}
                                            onClick={() => void handleSetPartner(partner)}
                                        >
                                            Set
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default PageCollectionsPartner;
