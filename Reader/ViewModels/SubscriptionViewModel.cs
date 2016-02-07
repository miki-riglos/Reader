using Reader.Entities;
using System.Collections.Generic;
using System.Linq;

namespace Reader.ViewModels {

    public class SubscriptionViewModel {
        public int SubscriptionId { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public List<SubscriptionItemViewModel> Items { get; set; }

        public SubscriptionViewModel(Subscription subscription) {
            SubscriptionId = subscription.SubscriptionId;
            Title = subscription.Feed.Title;
            ImageUrl = subscription.Feed.ImageUrl;
            Items = subscription.Items.Select(ufi => new SubscriptionItemViewModel(ufi)).ToList();
        }
    }
}