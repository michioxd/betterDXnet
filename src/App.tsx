import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import cls from "./App.module.scss";
import { Tooltip } from "@mui/material";
import SupportIcon from "@mui/icons-material/Support";
import MainView from "./views/Main";
import DisclaimerDialog from "./components/DisclaimerDialog";

const lastTitle = document.title;
const ACCEPT_TOS_STORAGE_KEY = "bdn.disclaimer.ok";

function App() {
    const [show, setShow] = useState(localStorage.getItem("bdn.show") === "1");
    const [showRiskDialog, setShowRiskDialog] = useState(false);

    const toggle = () => {
        if (!show && localStorage.getItem(ACCEPT_TOS_STORAGE_KEY) !== "1") {
            setShowRiskDialog(true);
            return;
        }

        setShow(!show);
    };

    const acceptRisk = () => {
        localStorage.setItem(ACCEPT_TOS_STORAGE_KEY, "1");
        setShowRiskDialog(false);
        setShow(true);
    };

    useEffect(() => {
        if (show) {
            document.documentElement.setAttribute("data-betterdxnet", "727");
            localStorage.setItem("bdn.show", "1");
        } else {
            document.documentElement.removeAttribute("data-betterdxnet");
            localStorage.removeItem("bdn.show");
            document.title = lastTitle;
        }
    }, [show]);

    return (
        <>
            {show && <MainView closeView={() => setShow(false)} />}
            <Tooltip title="betterDXnet" placement="right" arrow>
                <Fab color="primary" size="large" className={cls.fabControl} onClick={toggle}>
                    <SupportIcon fontWeight="large" />
                </Fab>
            </Tooltip>

            <DisclaimerDialog open={showRiskDialog} onClose={() => setShowRiskDialog(false)} onAccept={acceptRisk} />
        </>
    );
}

export default App;
