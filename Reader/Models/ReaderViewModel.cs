using Reader.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reader.Models {

    public class ReaderViewModel {
        public List<UserFeedItem> UserFeedItems { get; set; }
        public string UserFeedItemsJSON { get; set; }
    }
}