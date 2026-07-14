import { ApiMe, ratingBgBaseUrl } from "@/api/me";
import cls from "./ProfileCard.module.scss";
import clsx from "clsx";

function ProfileCard({ d, cardProps }: { d: ApiMe; cardProps?: React.HTMLAttributes<HTMLDivElement> }) {
    return (
        <>
            <div
                {...cardProps}
                className={clsx(cls.profileCard, cardProps?.className)}
                style={{ ...cardProps?.style, "--frame-bg": `url(${d.collections.frame.url})` } as React.CSSProperties}
            >
                <div className={cls.content}>
                    <img src={d.collections.icon.url} alt="icon" className={cls.userIcon} />
                    <div className={cls.userInfo}>
                        <div
                            className={cls.trophyBlock}
                            style={{ "--trophy-bg": `url(${d.trophyBg})` } as React.CSSProperties}
                        >
                            <span className={cls.trophyText}>{d.trophy}</span>
                        </div>
                        <div className={cls.info}>
                            <div className={cls.nameBlock}>
                                <span>{d.name}</span>
                            </div>
                            <div
                                className={cls.ratingBlock}
                                style={
                                    {
                                        "--rating-bg": `url(${ratingBgBaseUrl.replace("{}", d.rankType)})`,
                                    } as React.CSSProperties
                                }
                            >
                                <span className={cls.ratingText}>
                                    {String(d.rating)
                                        .split("")
                                        .map((char, index) => (
                                            <span className={cls.ratingDigit} key={index}>
                                                {char}
                                            </span>
                                        ))}
                                </span>
                            </div>
                        </div>
                        <div className={cls.divider}></div>
                        <div className={cls.badge}>
                            <img className={cls.badgeImg} src={d.courseRankImg} alt="badge" />
                            <img className={cls.badgeImg} src={d.classImg} alt="badge" />
                            <div className={cls.stars}>
                                <img className={cls.starImg} src="/maimai-mobile/img/icon_star.png" alt="star" />
                                <span className={cls.starText}>x{d.stars}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfileCard;
