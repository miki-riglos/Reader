using Reader.Entities;
using System.Collections.Generic;
using System.Linq;

namespace Reader.ViewModels {
    public class ReaderViewModel {
        public List<SubscriptionViewModel> Subscriptions { get; set; }

        public ReaderViewModel(List<Subscription> subscriptions) {
            Subscriptions = subscriptions.Select(uf => new SubscriptionViewModel(uf)).ToList();
        }
    }
}