using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reader.Entities {

    public class UserFeedItem {
        public int UserFeedItemId { get; set; }

        public int UserFeedId { get; set; }
        public UserFeed UserFeed { get; set; }

        public int FeedItemId { get; set; }
        public FeedItem FeedItem { get; set; }

        public bool IsRead { get; set; }
    }
}