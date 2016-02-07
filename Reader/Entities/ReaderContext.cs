using System.Data.Entity;

namespace Reader.Entities {

    public class ReaderContext : DbContext {

        public DbSet<Feed> Feeds { get; set; }
        public DbSet<FeedItem> FeedItems { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<SubscriptionItem> SubscriptionItems { get; set; }

        public ReaderContext()
            : base("DefaultConnection") {
        }
    }
}