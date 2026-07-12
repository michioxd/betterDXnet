import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import cls from "./App.module.scss";
import { Tooltip } from "@mui/material";
import SupportIcon from "@mui/icons-material/Support";
import MainView from "./views/Main";

const lastTitle = document.title;

function App() {
    const [show, setShow] = useState(localStorage.getItem("bdn.show") === "1");
    const toggle = () => setShow(!show);

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
        </>
    );
}

export default App;
