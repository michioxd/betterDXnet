import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import cls from "./App.module.scss";
import { Tooltip } from "@mui/material";
import SupportIcon from "@mui/icons-material/Support";

let lastTitle = document.title;

function App() {
    const [show, setShow] = useState(localStorage.getItem("bdn.show") === "1");
    const toggle = () => setShow(!show);

    useEffect(() => {
        if (show) {
            document.documentElement.setAttribute("data-betterdxnet", "727");
            localStorage.setItem("bdn.show", "1");
            document.title = "betterDXnet";
        } else {
            document.documentElement.removeAttribute("data-betterdxnet");
            localStorage.removeItem("bdn.show");
            document.title = lastTitle;
        }
    }, [show]);

    return (
        <>
            <Tooltip title="betterDXnet" placement="right" arrow>
                <Fab color="primary" size="large" className={cls.fabControl} onClick={toggle}>
                    <SupportIcon fontWeight="large" />
                </Fab>
            </Tooltip>
        </>
    );
}

export default App;
