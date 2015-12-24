using Reader.Entities;
using System.Collections.Generic;
using System.Linq;

namespace Reader.ViewModels {

    public class UserFeedViewModel {
        public int UserFeedId { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public List<UserFeedItemViewModel> Items { get; set; }

        public UserFeedViewModel(UserFeed userFeed) {
            UserFeedId = userFeed.UserFeedId;
            Title = userFeed.Feed.Title;
            ImageUrl = userFeed.Feed.ImageUrl;
            Items = userFeed.Items.Select(ufi => new UserFeedItemViewModel(ufi)).ToList();
        }
    }
}