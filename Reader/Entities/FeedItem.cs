using System;

namespace Reader.Entities {

    public class FeedItem {
        public int FeedItemId { get; set; }

        public int FeedId { get; set; }
        public Feed Feed { get; set; }

        public string Url { get; set; }
        public string Title { get; set; }
        public DateTimeOffset PublishDate { get; set; }

        public DateTimeOffset LoadTime { get; set; }

        public string GetFullUrl() {
            string fullUrl;
            if (Uri.IsWellFormedUriString(Url, UriKind.Absolute)) {
                fullUrl = Url;
            }
            else {
                var uri = new Uri(new Uri(Feed.Url), Url);
                fullUrl = uri.AbsoluteUri;
            }
            return fullUrl;
        }
    }
}