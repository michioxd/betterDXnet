import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";

type DisclaimerDialogProps = {
    open: boolean;
    onClose: () => void;
    onAccept: () => void;
};

function DisclaimerDialog({ open, onClose, onAccept }: DisclaimerDialogProps) {
    const { t } = useTranslation("layout");
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
            <DialogTitle>{t("disclaimer.title")}</DialogTitle>
            <DialogContent>
                <Typography gutterBottom color="textSecondary">
                    <Trans
                        ns="layout"
                        i18nKey="disclaimer.openSource"
                        components={[
                            <Link color="inherit" target="_blank" href="https://github.com/michioxd/betterDXnet" />,
                        ]}
                    />
                </Typography>

                <Typography gutterBottom color="textSecondary">
                    <Trans
                        ns="layout"
                        i18nKey="disclaimer.asIsText"
                        components={[<Typography component="span" sx={{ fontWeight: "bold" }} color="textSecondary" />]}
                    />
                </Typography>

                <Typography color="textSecondary" gutterBottom>
                    <Trans
                        ns="layout"
                        i18nKey="disclaimer.risk"
                        components={[<Typography component="span" sx={{ fontWeight: "bold" }} color="error" />]}
                    />
                </Typography>

                <Typography color="textSecondary" gutterBottom>
                    <Trans ns="layout" i18nKey="disclaimer.acknowledge" />
                </Typography>

                <Typography color="textSecondary">
                    <Trans ns="layout" i18nKey="disclaimer.acceptOnce" />
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} autoFocus>
                    {t("disclaimer.cancel")}
                </Button>
                <Button onClick={onAccept} disabled={!canAccept}>
                    {canAccept
                        ? t("disclaimer.understand")
                        : t("disclaimer.understandCountdown", { seconds: remainingSeconds })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DisclaimerDialog;
