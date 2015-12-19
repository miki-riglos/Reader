using System.Data.Entity;

namespace Reader.Entities {

    public class ReaderContext : DbContext {

        public DbSet<Feed> Feeds { get; set; }
        public DbSet<FeedItem> FeedItems { get; set; }
        public DbSet<UserFeed> UserFeeds { get; set; }
        public DbSet<UserFeedItem> UserFeedItems { get; set; }

        public ReaderContext()
            : base("DefaultConnection") {
        }
    }
}