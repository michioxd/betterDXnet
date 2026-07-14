import { Box, Typography } from "@mui/material";

export default function NotReady() {
    return (
        <Box>
            <Typography variant="h4">Not Ready</Typography>
            <Typography color="textSecondary">This page is not ready yet or not found.</Typography>
        </Box>
    );
}
