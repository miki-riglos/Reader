using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reader.Entities {

    public class Feed {
        public int FeedId { get; set; }
        public string Url { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public DateTimeOffset LastUpdatedTime { get; set; }

        public DateTimeOffset LoadTime { get; set; }

        public List<FeedItem> Items { get; set; }

        public Feed() {
            Items = new List<FeedItem>();
        }
    }
}