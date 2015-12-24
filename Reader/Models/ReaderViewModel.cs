using Reader.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reader.Models {

    public class UserFeedItemViewModel {
        public int UserFeedItemId { get; set; }
        public string FullUrl { get; set; }
        public string Title { get; set; }
        public DateTimeOffset PublishDate { get; set; }
        public bool IsRead { get; set; }

        public UserFeedItemViewModel() { }

        public UserFeedItemViewModel(UserFeedItem userFeedItem) {
            UserFeedItemId = userFeedItem.UserFeedItemId;
            FullUrl = userFeedItem.FeedItem.GetFullUrl();
            Title = userFeedItem.FeedItem.Title;
            PublishDate = userFeedItem.FeedItem.PublishDate;
            IsRead = userFeedItem.IsRead;
        }
    }

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

    public class ReaderViewModel {
        public List<UserFeedViewModel> UserFeeds { get; set; }

        public ReaderViewModel(List<UserFeed> userFeeds) {
            UserFeeds = userFeeds.Select(uf => new UserFeedViewModel(uf)).ToList();
        }
    }

    public class AddUserFeedViewModel {
        public string FeedUrl { get; set; }
    }
}