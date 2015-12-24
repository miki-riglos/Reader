using Reader.Entities;
using System;

namespace Reader.ViewModels {

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
}