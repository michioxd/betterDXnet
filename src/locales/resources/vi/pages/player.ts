const I18nPlayer = {
    album: {
        title: "Album",
        description: "Ảnh đã tải từ maimai DX NET.",
        reload: "Tải lại",
        showingPhotos: "Đang hiển thị {{count}} ảnh",
        empty: "Không tìm thấy ảnh album.",
        openImage: "Mở ảnh",
        downloadImage: "Tải ảnh",
        viewRecord: "Xem record",
        location: "Địa điểm",
        takenAt: "Chụp lúc",
        untitled: "Không tiêu đề",
    },
    dxrating: {
        title: "DX Rating",
        description: "Các bài hát được dùng để tính DX Rating.",
        reload: "Tải lại",
        showingItems: "Đang hiển thị {{count}} chart. Rating hiện tính được: {{rating}}",
        sectionSummary: "{{count}} chart - {{rating}} rating",
        emptySection: "Không có chart trong mục này.",
        achievement: "Achievement",
        rating: "Rating",
        ratingUnavailable: "Chỉ tính rating khi tìm thấy thông tin bài hát.",
        untitled: "Không tiêu đề",
        tabs: {
            manual: "Tính thủ công",
            dxnet: "DX NET Rating",
        },
        export: {
            generateImage: "Tạo ảnh",
            title: "Đang tạo ảnh",
            assetsLoaded: "Đã tải {{loaded}} / {{total}} asset",
            pleaseWait: "Vui lòng chờ, ảnh sẽ tự động được tải xuống.",
            unresponsiveNote:
                "Nếu trình duyệt bị treo, quá trình xuất ảnh vẫn đang chạy trong nền. Vui lòng chờ đến khi ảnh bắt đầu tải xuống.",
            cancel: "Hủy",
            log: {
                asset: "{{loaded}}/{{total}} {{message}}",
            },
            status: {
                preparingCanvas: "Đang chuẩn bị canvas",
                loadingAssets: "Đang tải asset",
                exportingImage: "Đang xuất ảnh",
                downloadStarted: "Đã bắt đầu tải xuống",
                exportFailed: "Xuất ảnh thất bại",
            },
            error: {
                renderFailed: "Không thể render ảnh",
            },
            firefoxNote:
                "Vì 1 số lý do kỹ thuật, Firefox sẽ không cho phép tải ảnh ngoài nếu không chạy ở chế độ standalone. Vui lòng mở betterDXnet trong tab mới để xuất ảnh bằng cách mở tab mới sau đó nhấn icon betterDXnet ở góc trên bên phải trình duyệt.",
        },
        sections: {
            new: "Songs for Rating (New)",
            old: "Songs for Rating (Others)",
            selectionNew: "Songs for Rating Selection (New)",
            selectionOld: "Songs for Rating Selection (Others)",
        },
    },
};

export default I18nPlayer;
