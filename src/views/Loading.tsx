import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export default function LoadingView({ error, closeView }: { error?: Error | null; closeView?: () => void }) {
    return (
        <>
            {error ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        flex: 1,
                        pt: "12.5%",
                        px: 2,
                    }}
                >
                    <ErrorIcon sx={{ fontSize: 100 }} />
                    <Typography align="center" variant="h6" sx={{ mt: 2 }}>
                        An error occurred!
                    </Typography>
                    <Typography align="center" variant="body2" color="textSecondary" sx={{ maxWidth: 400 }}>
                        {error.message}
                    </Typography>
                    {closeView && (
                        <Button variant="contained" onClick={closeView} sx={{ mt: 2 }}>
                            Close
                        </Button>
                    )}
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        flex: 1,
                        pt: "25%",
                        px: 2,
                    }}
                >
                    <CircularProgress />
                    <Typography align="center" variant="body2" sx={{ mt: 2 }} color="textSecondary">
                        Please wait while we are fetching your data...
                    </Typography>
                </Box>
            )}
        </>
    );
}
