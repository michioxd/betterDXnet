import ProfileCard from "@/components/ProfileCard";
import { rootStore } from "@/stores/root";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";

function PageHome() {
    const { me } = rootStore;
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h5">Welcome to betterDXnet v{import.meta.env.VITE_APP_VERSION}</Typography>
            <Typography color="textSecondary">
                You are logged in as{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                    {me.me?.name}
                </Typography>
            </Typography>
            {me?.me && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ my: 2, maxWidth: 500, width: "100%" }}>
                        <ProfileCard d={me?.me} />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default observer(PageHome);
