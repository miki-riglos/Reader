
namespace Reader.Entities {

    public class SubscriptionItem {
        public int SubscriptionItemId { get; set; }

        public int SubscriptionId { get; set; }
        public Subscription Subscription { get; set; }

        public int FeedItemId { get; set; }
        public FeedItem FeedItem { get; set; }

        public bool IsRead { get; set; }
    }
}