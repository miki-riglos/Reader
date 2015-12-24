using Reader.Entities;
using System.Collections.Generic;
using System.Linq;

namespace Reader.ViewModels {
    public class ReaderViewModel {
        public List<UserFeedViewModel> UserFeeds { get; set; }

        public ReaderViewModel(List<UserFeed> userFeeds) {
            UserFeeds = userFeeds.Select(uf => new UserFeedViewModel(uf)).ToList();
        }
    }
}