const I18nLayout = {
    loading: {
        errorTitle: "Đã xảy ra lỗi!",
        close: "Đóng",
        fetchingData: "Vui lòng chờ trong khi chúng tôi đang tải dữ liệu của bạn...",
    },
    toolbar: {
        openSidebar: "Mở thanh bên",
        closeSidebar: "Đóng thanh bên",
        refreshProfile: "Làm mới hồ sơ. Nhấn giữ để tải lại hoàn toàn.",
        refresh: "Làm mới",
        unload: "Gỡ betterDXnet",
        close: "Đóng",
        dxVersion: "Phiên bản DX: {{version}}",
        unknownVersion: "không rõ",
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
        by: "bởi",
        with: "với",
        contributors: "người đóng góp",
        version: "phiên bản",
        techStack: "{{viteVersion}} - React {{reactVersion}} - TypeScript {{typescriptVersion}}",
        buildDate: "Ngày build: {{time}} {{date}}",
        segaDisclaimer:
            "SEGA và maimai là nhãn hiệu đã đăng ký của SEGA. Extension này là không chính thức và không liên kết, được xác nhận, tài trợ hoặc phê duyệt bởi SEGA.",
    },
    disclaimer: {
        title: "Miễn trừ trách nhiệm",
        openSourcePrefix: "betterDXnet là một browser extension",
        openSourceLink: "mã nguồn mở",
        openSourceSuffix:
            "và không chính thức, cung cấp trải nghiệm Web UI thay thế và tốt hơn. Tất nhiên extension này không liên kết, được xác nhận, tài trợ hoặc phê duyệt bởi SEGA.",
        asIsPrefix: "Extension này được cung cấp",
        asIs: '"nguyên trạng"',
        asIsSuffix:
            ", không kèm bất kỳ bảo đảm nào. Bằng việc cài đặt hoặc tiếp tục sử dụng betterDXnet, bạn xác nhận rằng bạn tự chịu hoàn toàn rủi ro và chấp nhận toàn bộ trách nhiệm đối với mọi sự cố, hành vi không mong muốn, mất dữ liệu, hậu quả liên quan đến tài khoản hoặc thiệt hại khác có thể phát sinh từ việc sử dụng extension.",
        riskPrefix:
            "Nếu bạn không chắc việc sử dụng extension này có tuân thủ chính sách của SEGA hay không, hoặc nếu bạn không thoải mái với các rủi ro nêu trên,",
        riskWarning: "đừng sử dụng extension này và hãy gỡ nó khỏi trình duyệt ngay lập tức.",
        acknowledge:
            'Bằng cách nhấn "Tôi hiểu", bạn xác nhận rằng bạn đã đọc và hiểu miễn trừ trách nhiệm này, đồng thời chấp nhận các rủi ro liên quan đến việc sử dụng betterDXnet.',
        acceptOnce: "Bạn chỉ cần chấp nhận miễn trừ trách nhiệm này một lần.",
        cancel: "Hủy",
        understand: "Tôi hiểu",
        understandCountdown: "Tôi hiểu ({{seconds}}s)",
    },
};

export default I18nLayout;
