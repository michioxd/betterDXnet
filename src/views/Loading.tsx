import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingView() {
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flex: 1,
                    pt: "25%",
                }}
            >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }} color="textSecondary">
                    Please wait while we are fetching your data...
                </Typography>
            </Box>
        </>
    );
}
