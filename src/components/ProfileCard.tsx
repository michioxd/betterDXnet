import { ApiMe } from "@/api/me";
import cls from "./ProfileCard.module.scss";

export default function ProfileCard(d: ApiMe) {
    return (
        <>
            <div className={cls.profileCard}></div>
        </>
    );
}
