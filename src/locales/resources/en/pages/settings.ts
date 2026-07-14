const I18nSettings = {
    common: {
        reset: "Reset",
        save: "Save",
        saveSettings: "Save settings",
        saveSetting: "Save setting",
        change: "Change",
        userTokenNotFound: "User token not found",
    },
    game: {
        title: "Settings / Game options",
        description: "Change speed, display, design, sound, and play options.",
        cardTitle: "Game options",
        loading: "Loading game options...",
        tokenNotFound: "Game option token not found",
        updated: "Game options updated.",
        unsaved: "You have unsaved game option changes.",
        sections: {
            presets: "Presets",
            speed: "Speed",
            game: "Game",
            display: "Display",
            design: "Design",
            sound: "Sound",
        },
        presets: {
            "0": {
                title: "BASIC",
                recommendation: "Recommended for comfortable casual play.",
                summary: "Balanced defaults",
            },
            "1": {
                title: "ADVANCED",
                recommendation: "For players who want more readable notes.",
                summary: "Faster preset",
            },
            "2": {
                title: "EXPERT",
                recommendation: "For experienced players who prefer speed.",
                summary: "High-speed preset",
            },
            "3": {
                title: "DETAILS / CUSTOM",
                recommendation: "Unlock every option and tune settings manually.",
                summary: "Full custom control",
            },
        },
        options: {
            noteSpeed: {
                label: "TAP SPEED",
                description: "Setting of the TAP-Ring speed",
            },
            touchSpeed: {
                label: "TOUCH SPEED",
                description: "Setting of the TOUCH speed",
            },
            slideSpeed: {
                label: "SLIDE TIMING",
                description: "Setting of the SLIDE display timing",
            },
            trackSkip: {
                label: "TRACK SKIP",
                description: "Interrupt the song and move on to the result",
            },
            mirrorMode: {
                label: "MIRROR MODE",
                description: "Reverse left and right and/or up and down",
            },
            starRotate: {
                label: "SLIDE ROTATION",
                description: "Rotation setting : ★",
            },
            adjustTiming: {
                label: "JUDGMENT TIMING A",
                description: "For who judge the timing by listening Adjust the timing of ring-and-line overlap",
            },
            judgeTiming: {
                label: "JUDGMENT TIMING B",
                description: "For who judge the timing by notes Adjust the timing of judgment",
            },
            brightness: {
                label: "MOVIE BRIGHTNESS",
                description: "Adjust brightness of background movie during the game",
            },
            touchEffect: {
                label: "REACTION EFFECT",
                description: "Switch the reaction effect displayed when you touch the screen",
            },
            dispCenter: {
                label: "DISPLAY AT CENTER",
                description: "Switch the information display at the center during the game",
            },
            outFrameType: {
                label: "DISPLAY OUTSIDE THE BOX",
                description: "Switch the information display at the top of the screen",
            },
            dispJudgePos: {
                label: "POSITION OF JUDGMENT TAP",
                description: "Set the position of Judgment(e.g.PERFECT) displayed when hitting the TAP ring",
            },
            dispJudgeTouchPos: {
                label: "POSITION OF JUDGMENT TOUCH",
                description: "Set the position of Judgment(e.g.PERFECT) displayed when hitting the TOUCH",
            },
            dispChain: {
                label: "SYNC/VS",
                description: "Displayed when you play with other players",
            },
            submonitorAchieve: {
                label: "ACHIEVEMENT TYPE(UPPER MONITOR)",
                description: "Switch the achievement type displayed on the upper monitor",
            },
            dispRate: {
                label: "RATING・GRADE・CLASS",
                description: "Switch the RATING/GRADE/CLASS type",
            },
            submonitorAppeal: {
                label: "MESSAGE",
                description: "Comment is displayed on the upper monitor",
            },
            dispJudge: {
                label: "DISPLAY OF JUDGMENT",
                description: "Switch the judgment type",
            },
            tapDesign: {
                label: "TAP DESIGN",
                description: "Switch the TAP design",
            },
            holdDesign: {
                label: "HOLD DESIGN",
                description: "Switch the HOLD design",
            },
            slideDesign: {
                label: "SLIDE DESIGN",
                description: "Switch the SLIDE design",
            },
            starType: {
                label: "SLIDE COLOR",
                description: "Switch ☆ color",
            },
            outlineDesign: {
                label: "LINE DESIGN",
                description: "Switch the LINE design",
            },
            ansVolume: {
                label: "GUIDE SOUND VOLUME",
                description: "Set the volume of guide sound for the right timing",
            },
            tapSe: {
                label: "TAP/HOLD SE (TYPE)",
                description: "Switch the sound effect for a successful TAP",
            },
            criticalSe: {
                label: "TAP/HOLD SE (JUDGEMENT)",
                description: "Set the range of judgements that make the sound effect",
            },
            tapHoldVolume: {
                label: "TAP/HOLD VOLUME",
                description: "Set the TAP/HOLD sound volume",
            },
            breakSe: {
                label: "BREAK SE",
                description: "Switch the sound effect for BREAK",
            },
            breakVolume: {
                label: "BREAK VOLUME",
                description: "Set the BREAK sound volume",
            },
            exSe: {
                label: "EX SE",
                description: "Switch the sound effect for EX",
            },
            exVolume: {
                label: "EX VOLUME",
                description: "Set the EX sound volume",
            },
            slideSe: {
                label: "SLIDE SE",
                description: "Switch the sound effect for SLIDE",
            },
            slideVolume: {
                label: "SLIDE VOLUME",
                description: "Set the SLIDE sound volume",
            },
            breakSlideVolume: {
                label: "BREAK SLIDE VOLUME",
                description: "Set the BREAK SLIDE sound volume",
            },
            touchVolume: {
                label: "TOUCH VOLUME",
                description: "Set the TOUCH/TOUCH HOLD sound volume",
            },
            touchHoldVolume: {
                label: "TOUCH EFFECT VOLUME",
                description: "Set the TOUCH EFFECT sound volume",
            },
            damageSeVolume: {
                label: "DAMAGE VOLUME",
                description: "Set the DAMAGE sound volume in PERFECT CHALLENGE",
            },
        },
    },
    player: {
        title: "Settings / Player",
        description: "Change player name and friend registration skip setting.",
        playerName: "Player name",
        playerNameHelper: "Up to 8 double-byte characters.",
        usableSymbols: "The following symbols can also be used ({{current}}/{{max}}):",
        playerNameUpdated: "Player name updated.",
        friendRegistrationSkipUpdated: "Friend registration skip setting updated.",
        friendRegistrationSkipSetting: "Friend registration skip setting",
        friendRegistration: "Friend registration",
        doNotSkipFriendRegistration: "Do not skip friend registration",
        skipFriendRegistration: "Skip friend registration",
        friendRegistrationDescription:
            "When selecting 'Skip', friend registration screen will skip when playing 2P with a user who is not a friend.",
    },
};

export default I18nSettings;
