namespace CampusAccessibilityBackend.DTO
{  //Για τα στατιστικά που εμφανίζονται στο dashboard του admin
    public record DashboardStatsDTO
    {
        public int NewCount { get; set; }
        public int UnderReviewCount { get; set; }
        public int InProgressCount { get; set; }
        public int PendingCount { get; set; }
        public int ResolvedCount { get; set; }
        public int RejectedCount { get; set; }
    };
}
