const I18nPages = {
    home: {
        welcome: "Chào mừng bạn trở lại! {{userName}}",
        youAreUsing: "Bạn đang sử dụng betterDXnet v{{version}}",
        recentRecords: "Records gần đây",
        recentRecordsDescription: "Các lượt chơi mới nhất từ Last 50.",
        reload: "Tải lại",
        seeAll: "Xem tất cả",
        quickAccess: {
            title: "Truy cập nhanh",
            description: "Đi nhanh đến các trang thường dùng của betterDXnet.",
            dxRating: {
                title: "DX Rating (B50)",
                description: "Xem các chart dùng để tính DX Rating và xuất ảnh rating (B50).",
            },
            songScores: {
                title: "Song scores",
                description: "Duyệt và lọc toàn bộ các song score bạn đã chơi trước đây.",
            },
            album: {
                title: "Album",
                description: "Xem và tải ảnh đã lưu.",
            },
            gameSetting: {
                title: "Game setting",
                description: "Chỉnh các tùy chọn game và thiết lập.",
            },
        },
        quickAccessNote: "Bạn có thể tìm thấy nhiều tính năng hơn trong thanh điều hướng ở bên trái trang.",
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
