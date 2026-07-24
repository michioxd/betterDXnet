const I18nLayout = {
    loading: {
        errorTitle: "Đã xảy ra lỗi!",
        close: "Đóng",
        fetchingData: "Vui lòng chờ trong khi chúng tôi đang tải dữ liệu của bạn...",
        errorNetwork: "Không thể kết nối! Có thể bạn cần phải đăng nhập lại.",
        goToLogin: "Đi đến trang đăng nhập",
    },
    toolbar: {
        openSidebar: "Mở thanh bên",
        closeSidebar: "Đóng thanh bên",
        refreshProfile: "Làm mới hồ sơ. Nhấn giữ để tải lại hoàn toàn.",
        refresh: "Làm mới",
        themeModeLabel: "Giao diện: {{mode}}. Nhấn để đổi.",
        themeMode: {
            light: "Sáng",
            dark: "Tối",
            system: "Tự động",
        },
        unload: "Gỡ betterDXnet",
        close: "Đóng",
        dxVersion: "Phiên bản DX: {{version}}",
        unknownVersion: "không rõ",
        openInNewTab: "Mở betterDXnet trong tab mới",
    },
    language: {
        fallbackName: "Tiếng Anh",
    },
    profileCard: {
        iconAlt: "icon",
        badgeAlt: "huy hiệu",
        starAlt: "ngôi sao",
    },
    footer: {
        source: "<0>betterDXnet</0> bởi <1>michioxd</1> với <2>người đóng góp</2> - phiên bản <3>{{appVersion}}</3> (<4>{{branch}}.{{commit}}</4>)",
        techStack: "{{viteVersion}} - React {{reactVersion}} - TypeScript {{typescriptVersion}}",
        buildDate: "Ngày build: {{time}} {{date}}",
        segaDisclaimer:
            "SEGA và maimai là nhãn hiệu đã đăng ký của SEGA. Extension này là không chính thức và không liên kết, được xác nhận, tài trợ hoặc phê duyệt bởi SEGA.",
    },
    disclaimer: {
        title: "Miễn trừ trách nhiệm",
        openSource:
            "betterDXnet là một browser extension <0>mã nguồn mở</0> và không chính thức, cung cấp trải nghiệm Web UI thay thế và tốt hơn. Tất nhiên extension này không liên kết, được xác nhận, tài trợ hoặc phê duyệt bởi SEGA.",
        asIsText:
            'Extension này được cung cấp <0>"nguyên trạng"</0>, không kèm bất kỳ bảo đảm nào. Bằng việc cài đặt hoặc tiếp tục sử dụng betterDXnet, bạn xác nhận rằng bạn tự chịu hoàn toàn rủi ro và chấp nhận toàn bộ trách nhiệm đối với mọi sự cố, hành vi không mong muốn, mất dữ liệu, hậu quả liên quan đến tài khoản hoặc thiệt hại khác có thể phát sinh từ việc sử dụng extension.',
        risk: "Nếu bạn không chắc việc sử dụng extension này có tuân thủ chính sách của SEGA hay không, hoặc nếu bạn không thoải mái với các rủi ro nêu trên, <0>đừng sử dụng extension này và hãy gỡ nó khỏi trình duyệt ngay lập tức.</0>",
        acknowledge:
            'Bằng cách nhấn "Tôi hiểu", bạn xác nhận rằng bạn đã đọc và hiểu miễn trừ trách nhiệm này, đồng thời chấp nhận các rủi ro liên quan đến việc sử dụng betterDXnet.',
        acceptOnce: "Bạn chỉ cần chấp nhận miễn trừ trách nhiệm này một lần.",
        cancel: "Hủy",
        understand: "Tôi hiểu",
        understandCountdown: "Tôi hiểu ({{seconds}}s)",
    },
};

export default I18nLayout;
