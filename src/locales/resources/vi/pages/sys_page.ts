const I18nPages = {
    home: {
        welcome: "Chào mừng đến với betterDXnet v{{version}}",
        loggedInAs: "Bạn đang đăng nhập với tên",
        recentRecords: "Records gần đây",
        recentRecordsDescription: "Các lượt chơi mới nhất từ Last 50.",
        reload: "Tải lại",
        seeAll: "Xem tất cả",
        summary: {
            title: "Tổng hợp",
            description: "Tạo tổng hợp từ 50 lượt chơi gần đây.",
            generate: "Tạo tổng hợp",
            reload: "Tải lại tổng hợp",
            progress: "Đã tải {{loaded}} / {{total}} records.",
            progressFailed: " Lỗi {{failed}}.",
            loadError: "Không tải được {{count}} play log detail. Tổng hợp có thể chưa đầy đủ.",
            accuracyLossByNoteType: {
                title: "Accuracy Loss by Note Type",
                description: "Tổng phần trăm achievement bị mất trên các play log đã tải.",
            },
            accuracyByNoteType: {
                title: "Accuracy by Note Type",
                description: "Phần trăm accuracy có trọng số trên các play log đã tải.",
            },
            overallJudgmentDistribution: {
                title: "Overall Judgment Distribution",
                description: "Tổng số judgment trên các play log đã tải.",
            },
            judgeDistribution: {
                title: "Judge Distribution",
                description: "Tỷ lệ judgment theo từng note type trên các play log đã tải.",
            },
        },
    },
    notReady: {
        title: "Chưa sẵn sàng",
        description: "Trang này chưa sẵn sàng hoặc không tồn tại.",
    },
};

export default I18nPages;
