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
                    py: 5,
                }}
            >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Please wait while we are fetching your data...
                </Typography>
            </Box>
        </>
    );
}
