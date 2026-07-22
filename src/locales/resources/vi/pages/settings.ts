const I18nSettings = {
    common: {
        reset: "Đặt lại",
        save: "Lưu",
        saveSettings: "Lưu cài đặt",
        saveSetting: "Lưu cài đặt",
        change: "Thay đổi",
        userTokenNotFound: "Không tìm thấy user token",
    },
    betterDXnet: {
        title: "Cài đặt / betterDXnet",
        description: "Cấu hình nguồn dữ liệu và database cục bộ của betterDXnet.",
        maimaiDataApi: "maimai data API",
        currentDataUrl: "URL maimai data API hiện tại",
        customDataUrl: "URL maimai data API tùy chỉnh",
        customDataUrlHelper: "Dùng URL HTTP hoặc HTTPS tuyệt đối trỏ tới file data.json tương thích.",
        compatibilityNotice:
            "Nếu bạn dùng nguồn dữ liệu tùy chỉnh, hãy đảm bảo nó có cùng cấu trúc và format với nguồn dữ liệu mặc định (<formatLink>xem file TypeScript này để biết thêm chi tiết</formatLink>). Không chỉnh phần này nếu bạn không chắc chắn.",
        defaultDataUrl: "URL mặc định",
        dataSourceFrom: "Nguồn dữ liệu từ",
        invalidUrl: "Nhập URL HTTP hoặc HTTPS hợp lệ.",
        dataUrlSaved: "Đã lưu URL maimai data API.",
        dataUrlReset: "Đã đặt lại URL maimai data API về mặc định.",
        database: "Database",
        databaseDescription: "Tải lại dữ liệu từ URL API hiện tại.",
        lastFetchedAt: "Lần fetch cuối",
        dataUpdateTime: "Thời gian update database",
        notAvailable: "Chưa có dữ liệu",
        reupdateDatabase: "Cập nhật lại database",
        databaseUpdated: "Đã cập nhật database.",
    },
    game: {
        title: "Cài đặt / Tùy chọn game",
        description: "Thay đổi tốc độ, hiển thị, thiết kế, âm thanh và tùy chọn chơi.",
        cardTitle: "Tùy chọn game",
        loading: "Đang tải tùy chọn game...",
        tokenNotFound: "Không tìm thấy token tùy chọn game",
        updated: "Đã cập nhật tùy chọn game.",
        unsaved: "Bạn có thay đổi tùy chọn game chưa được lưu.",
        sections: {
            presets: "Preset",
            speed: "Tốc độ",
            game: "Game",
            display: "Hiển thị",
            design: "Thiết kế",
            sound: "Âm thanh",
        },
        presets: {
            "0": {
                title: "BASIC",
                recommendation: "Đề xuất cho trải nghiệm chơi thoải mái.",
                summary: "Mặc định cân bằng",
            },
            "1": {
                title: "ADVANCED",
                recommendation: "Dành cho người chơi muốn note dễ đọc hơn.",
                summary: "Preset nhanh hơn",
            },
            "2": {
                title: "EXPERT",
                recommendation: "Dành cho người chơi có kinh nghiệm thích tốc độ cao.",
                summary: "Preset tốc độ cao",
            },
            "3": {
                title: "DETAILS / CUSTOM",
                recommendation: "Mở khóa mọi tùy chọn và tự tinh chỉnh thủ công.",
                summary: "Toàn quyền tùy chỉnh",
            },
        },
        options: {
            noteSpeed: {
                label: "TỐC ĐỘ TAP",
                description: "Thiết lập tốc độ vòng TAP",
            },
            touchSpeed: {
                label: "TỐC ĐỘ TOUCH",
                description: "Thiết lập tốc độ TOUCH",
            },
            slideSpeed: {
                label: "THỜI ĐIỂM SLIDE",
                description: "Thiết lập thời điểm hiển thị SLIDE",
            },
            trackSkip: {
                label: "BỎ QUA TRACK",
                description: "Ngắt bài hát và chuyển sang kết quả",
            },
            mirrorMode: {
                label: "CHẾ ĐỘ MIRROR",
                description: "Đảo trái/phải và/hoặc trên/dưới",
            },
            starRotate: {
                label: "XOAY SLIDE",
                description: "Thiết lập xoay: ★",
            },
            adjustTiming: {
                label: "THỜI ĐIỂM PHÁN ĐỊNH A",
                description: "Dành cho người phán định theo âm thanh. Điều chỉnh thời điểm vòng và đường trùng nhau",
            },
            judgeTiming: {
                label: "THỜI ĐIỂM PHÁN ĐỊNH B",
                description: "Dành cho người phán định theo note. Điều chỉnh thời điểm phán định",
            },
            brightness: {
                label: "ĐỘ SÁNG MOVIE",
                description: "Điều chỉnh độ sáng movie nền trong khi chơi",
            },
            touchEffect: {
                label: "HIỆU ỨNG PHẢN HỒI",
                description: "Chuyển hiệu ứng phản hồi hiển thị khi bạn chạm màn hình",
            },
            dispCenter: {
                label: "HIỂN THỊ Ở GIỮA",
                description: "Chuyển thông tin hiển thị ở giữa trong khi chơi",
            },
            outFrameType: {
                label: "HIỂN THỊ NGOÀI KHUNG",
                description: "Chuyển thông tin hiển thị ở phía trên màn hình",
            },
            dispJudgePos: {
                label: "VỊ TRÍ PHÁN ĐỊNH TAP",
                description: "Thiết lập vị trí hiển thị phán định (ví dụ PERFECT) khi đánh vòng TAP",
            },
            dispJudgeTouchPos: {
                label: "VỊ TRÍ PHÁN ĐỊNH TOUCH",
                description: "Thiết lập vị trí hiển thị phán định (ví dụ PERFECT) khi đánh TOUCH",
            },
            dispChain: {
                label: "SYNC/VS",
                description: "Hiển thị khi bạn chơi cùng người chơi khác",
            },
            submonitorAchieve: {
                label: "KIỂU ACHIEVEMENT (MÀN HÌNH TRÊN)",
                description: "Chuyển kiểu achievement hiển thị trên màn hình trên",
            },
            dispRate: {
                label: "RATING・GRADE・CLASS",
                description: "Chuyển kiểu RATING/GRADE/CLASS",
            },
            submonitorAppeal: {
                label: "TIN NHẮN",
                description: "Bình luận được hiển thị trên màn hình trên",
            },
            dispJudge: {
                label: "HIỂN THỊ PHÁN ĐỊNH",
                description: "Chuyển kiểu phán định",
            },
            tapDesign: {
                label: "THIẾT KẾ TAP",
                description: "Chuyển thiết kế TAP",
            },
            holdDesign: {
                label: "THIẾT KẾ HOLD",
                description: "Chuyển thiết kế HOLD",
            },
            slideDesign: {
                label: "THIẾT KẾ SLIDE",
                description: "Chuyển thiết kế SLIDE",
            },
            starType: {
                label: "MÀU SLIDE",
                description: "Chuyển màu ☆",
            },
            outlineDesign: {
                label: "THIẾT KẾ LINE",
                description: "Chuyển thiết kế LINE",
            },
            ansVolume: {
                label: "ÂM LƯỢNG ÂM HƯỚNG DẪN",
                description: "Thiết lập âm lượng âm hướng dẫn cho đúng thời điểm",
            },
            tapSe: {
                label: "SE TAP/HOLD (KIỂU)",
                description: "Chuyển hiệu ứng âm thanh khi TAP thành công",
            },
            criticalSe: {
                label: "SE TAP/HOLD (PHÁN ĐỊNH)",
                description: "Thiết lập phạm vi phán định phát hiệu ứng âm thanh",
            },
            tapHoldVolume: {
                label: "ÂM LƯỢNG TAP/HOLD",
                description: "Thiết lập âm lượng TAP/HOLD",
            },
            breakSe: {
                label: "SE BREAK",
                description: "Chuyển hiệu ứng âm thanh cho BREAK",
            },
            breakVolume: {
                label: "ÂM LƯỢNG BREAK",
                description: "Thiết lập âm lượng BREAK",
            },
            exSe: {
                label: "SE EX",
                description: "Chuyển hiệu ứng âm thanh cho EX",
            },
            exVolume: {
                label: "ÂM LƯỢNG EX",
                description: "Thiết lập âm lượng EX",
            },
            slideSe: {
                label: "SE SLIDE",
                description: "Chuyển hiệu ứng âm thanh cho SLIDE",
            },
            slideVolume: {
                label: "ÂM LƯỢNG SLIDE",
                description: "Thiết lập âm lượng SLIDE",
            },
            breakSlideVolume: {
                label: "ÂM LƯỢNG BREAK SLIDE",
                description: "Thiết lập âm lượng BREAK SLIDE",
            },
            touchVolume: {
                label: "ÂM LƯỢNG TOUCH",
                description: "Thiết lập âm lượng TOUCH/TOUCH HOLD",
            },
            touchHoldVolume: {
                label: "ÂM LƯỢNG HIỆU ỨNG TOUCH",
                description: "Thiết lập âm lượng hiệu ứng TOUCH",
            },
            damageSeVolume: {
                label: "ÂM LƯỢNG DAMAGE",
                description: "Thiết lập âm lượng DAMAGE trong PERFECT CHALLENGE",
            },
        },
    },
    player: {
        title: "Cài đặt / Người chơi",
        description: "Thay đổi tên người chơi và cài đặt bỏ qua đăng ký bạn bè.",
        playerName: "Tên người chơi",
        playerNameHelper: "Tối đa 8 ký tự full-width.",
        usableSymbols: "Cũng có thể dùng các ký hiệu sau ({{current}}/{{max}}):",
        playerNameUpdated: "Đã cập nhật tên người chơi.",
        friendRegistrationSkipUpdated: "Đã cập nhật cài đặt bỏ qua đăng ký bạn bè.",
        friendRegistrationSkipSetting: "Cài đặt bỏ qua đăng ký bạn bè",
        friendRegistration: "Đăng ký bạn bè",
        doNotSkipFriendRegistration: "Không bỏ qua đăng ký bạn bè",
        skipFriendRegistration: "Bỏ qua đăng ký bạn bè",
        friendRegistrationDescription:
            "Khi chọn 'Bỏ qua', màn hình đăng ký bạn bè sẽ được bỏ qua khi chơi 2P với người dùng chưa phải bạn bè.",
    },
};

export default I18nSettings;
