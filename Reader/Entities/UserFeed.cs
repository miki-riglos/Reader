using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reader.Entities {

    public class UserFeed {
        public int UserFeedId { get; set; }
        public string UserName { get; set; }
        public int FeedId { get; set; }
        public Feed Feed { get; set; }
        public List<UserFeedItem> Items { get; set; }

        public UserFeed() {
            Items = new List<UserFeedItem>();
        }
    }
}