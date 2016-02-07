using System.Collections.Generic;

namespace Reader.Entities {

    public class Subscription {
        public int SubscriptionId { get; set; }
        public string UserName { get; set; }
        public int FeedId { get; set; }
        public Feed Feed { get; set; }
        public List<SubscriptionItem> Items { get; set; }

        public Subscription() {
            Items = new List<SubscriptionItem>();
        }
    }
}