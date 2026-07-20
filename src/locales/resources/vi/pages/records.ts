const I18nRecords = {
    last50: {
        title: "50 lượt gần nhất",
        description: "Các lượt chơi gần đây.",
        reload: "Tải lại",
        showingRecords: "Đang hiển thị {{count}} bản ghi",
    },
    card: {
        untitled: "Không tiêu đề",
        new: "MỚI",
        achievement: "Thành tích",
        dxScore: "Điểm DX",
        trackNo: "Số {{trackNo}}",
        perfectChallenge: "Thử thách Perfect",
        life: "LIFE {{current}} / {{max}}",
    },
    detail: {
        title: "Chi tiết lượt chơi",
        description: "Kết quả chi tiết của lượt chơi này.",
        back: "Quay lại 50 lượt gần nhất",
        reload: "Tải lại",
        recordIdNotFound: "Không tìm thấy id bản ghi.",
        judgeDistribution: {
            title: "Phân bố phán định",
            description: "Số lượng phán định theo từng loại note.",
        },
        accuracyByNoteType: {
            title: "Độ chính xác theo loại note",
            description: "Phần trăm độ chính xác theo từng loại note.",
        },
        overallJudgmentDistribution: {
            title: "Phân bố phán định tổng",
            description: "Tổng số phán định trên tất cả loại note.",
        },
        accuracyLossByNoteType: {
            title: "Mức mất độ chính xác theo loại note",
            description: "Phần trăm thành tích bị mất theo từng loại note.",
        },
        timingBias: {
            title: "Thiên hướng căn thời điểm",
            summary: "Muộn {{late}} - Sớm {{fast}} - Độ lệch {{bias}}",
            even: "Cân bằng",
            adjustmentSuggestion: "Gợi ý điều chỉnh thời điểm",
            timingABRange: "Timing A/B {{range}}",
            disclaimer: "Gợi ý chỉ dựa trên thống kê sớm/muộn.",
            suggestions: {
                balanced: "Thời điểm bấm trông cân bằng. Không khuyến nghị điều chỉnh.",
                fast: {
                    slight: "Bạn có xu hướng bấm hơi sớm. Thử giảm Timing A/B 0.5.",
                    moderate: "Bạn thường xuyên bấm sớm. Thử giảm Timing A/B 0.5–1.0.",
                    strong: "Bạn bấm sớm rất nhiều. Thử giảm Timing A/B 1.0–2.0.",
                },
                late: {
                    slight: "Bạn có xu hướng bấm hơi muộn. Thử tăng Timing A/B 0.5.",
                    moderate: "Bạn thường xuyên bấm muộn. Thử tăng Timing A/B 0.5–1.0.",
                    strong: "Bạn bấm muộn rất nhiều. Thử tăng Timing A/B 1.0–2.0.",
                },
            },
        },
        labels: {
            note: "Note",
            noteType: "Loại note",
            fast: "Sớm",
            late: "Muộn",
            bias: "Độ lệch",
            accuracyPercent: "Độ chính xác %",
            accuracyLoss: "Mức mất độ chính xác",
            totalLossShare: "Tỉ lệ mất tổng",
            total: "Tổng",
        },
        chips: {
            fast: "Sớm {{count}}",
            late: "Muộn {{count}}",
            rating: "Rating {{rating}} ({{delta}})",
            maxCombo: "Max Combo {{current}} / {{max}}",
            maxSync: "Max Sync {{current}} / {{max}}",
            totalNotes: "Tổng note {{count}}",
            accuracyLoss: "Mất độ chính xác {{value}}",
        },
        judgments: {
            criticalPerfect: "Critical Perfect",
            perfect: "Perfect",
            great: "Great",
            good: "Good",
            miss: "Miss",
        },
    },
};

export default I18nRecords;
