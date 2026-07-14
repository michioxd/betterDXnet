import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from "@mui/material";

type DisclaimerDialogProps = {
    open: boolean;
    onClose: () => void;
    onAccept: () => void;
};

function DisclaimerDialog({ open, onClose, onAccept }: DisclaimerDialogProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(5);

    useEffect(() => {
        if (!open) {
            setRemainingSeconds(5);
            return;
        }

        setRemainingSeconds(5);
        const intervalId = window.setInterval(() => {
            setRemainingSeconds((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [open]);

    const canAccept = remainingSeconds === 0;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Disclaimer</DialogTitle>
            <DialogContent>
                <Typography gutterBottom color="textSecondary">
                    betterDXnet is an{" "}
                    <Link color="inherit" target="_blank" href="https://github.com/michioxd/betterDXnet">
                        open source
                    </Link>{" "}
                    and unofficial browser extension to give you an alternative and better Web UI experience. And of
                    course it is not affiliated with, endorsed by, sponsored by, or approved by SEGA.
                </Typography>

                <Typography gutterBottom color="textSecondary">
                    This extension is provided{" "}
                    <Typography component="span" sx={{ fontWeight: "bold" }} color="textSecondary">
                        "as is"
                    </Typography>
                    , without any warranty of any kind. By installing or continuing to use betterDXnet, you acknowledge
                    that you do so entirely at your own risk and accept full responsibility for any issues, unexpected
                    behavior, data loss, account-related consequences, or other damages that may arise from its use.
                </Typography>

                <Typography color="textSecondary" gutterBottom>
                    If you are unsure whether using this extension complies with SEGA's policies, or if you are not
                    comfortable accepting the risks described above,{" "}
                    <Typography component="span" sx={{ fontWeight: "bold" }} color="error">
                        do not use this extension and remove it from your browser immediately.
                    </Typography>
                </Typography>

                <Typography color="textSecondary" gutterBottom>
                    By clicking "I understand", you acknowledge that you have read and understood this disclaimer, and
                    you accept the risks associated with using betterDXnet.
                </Typography>

                <Typography color="textSecondary">You only have to accept this disclaimer once.</Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} autoFocus>
                    Cancel
                </Button>
                <Button onClick={onAccept} disabled={!canAccept}>
                    {canAccept ? "I understand" : `I understand (${remainingSeconds}s)`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DisclaimerDialog;
