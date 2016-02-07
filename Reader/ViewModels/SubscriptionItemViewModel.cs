using Reader.Entities;
using System;

namespace Reader.ViewModels {

    public class SubscriptionItemViewModel {
        public int SubscriptionItemId { get; set; }
        public string FullUrl { get; set; }
        public string Title { get; set; }
        public DateTimeOffset PublishDate { get; set; }
        public bool IsRead { get; set; }

        public SubscriptionItemViewModel() { }

        public SubscriptionItemViewModel(SubscriptionItem subscriptionItem) {
            SubscriptionItemId = subscriptionItem.SubscriptionItemId;
            FullUrl = subscriptionItem.FeedItem.GetFullUrl();
            Title = subscriptionItem.FeedItem.Title;
            PublishDate = subscriptionItem.FeedItem.PublishDate;
            IsRead = subscriptionItem.IsRead;
        }
    }
}