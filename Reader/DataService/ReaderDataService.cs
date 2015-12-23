using Reader.Entities;
using Reader.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.ServiceModel.Syndication;
using System.Xml;

namespace Reader.DataService {

    public class ReaderDataService {

        private Feed loadFeed(string feedUrl) {
            var feed = new Feed();
            var loadTime = DateTimeOffset.Now;

            using (var reader = XmlReader.Create(feedUrl)) {
                var syndicationFeed = SyndicationFeed.Load(reader);
                feed.Url = feedUrl;
                feed.Title = syndicationFeed.Title == null ? "Untitled" : syndicationFeed.Title.Text;
                feed.ImageUrl = syndicationFeed.ImageUrl == null ? null : syndicationFeed.ImageUrl.OriginalString;
                feed.LastUpdatedTime = syndicationFeed.LastUpdatedTime;
                feed.LoadTime = loadTime;

                feed.Items = syndicationFeed.Items.Select(i => new FeedItem() {
                    Url = i.Links.Last().Uri.OriginalString, 
                    Title = i.Title.Text,
                    PublishDate = i.PublishDate,
                    LoadTime = loadTime
                }).ToList();
            }

            return feed;
        }

        public List<UserFeed> GetUserFeeds(string userName) {
            using (var ctx = new ReaderContext()) {
                var userFeeds = ctx.UserFeeds
                                    .Include(uf => uf.Feed)
                                    .Where(uf => uf.UserName == userName)
                                    .ToList();

                foreach (var userFeed in userFeeds) {
                    userFeed.Items = ctx.UserFeedItems
                                        .Include(ufi => ufi.FeedItem)
                                        .Where(ufi => ufi.UserFeedId == userFeed.UserFeedId)
                                        .ToList();
                }

                return userFeeds;
            }
        }

        public UserFeed AddUserFeed(string userName, string feedUrl) {
            using (var ctx = new ReaderContext()) {
                // load or create feed
                var feed = ctx.Feeds.Include(f => f.Items).FirstOrDefault(f => f.Url == feedUrl);
                if (feed == null) {
                    feed = loadFeed(feedUrl);
                    ctx.Feeds.Add(feed);
                    ctx.SaveChanges();
                }

                // create user feed, if not exists
                var userFeed = ctx.UserFeeds.FirstOrDefault(uf => uf.UserName == userName && uf.FeedId == feed.FeedId);
                if (userFeed == null) {
                    userFeed = new UserFeed() {
                        UserName = userName,
                        Feed = feed,
                        Items = feed.Items.Select(i => new UserFeedItem() {
                            FeedItemId = i.FeedItemId,
                            IsRead = false
                        }).ToList()
                    };

                    ctx.UserFeeds.Add(userFeed);
                    ctx.SaveChanges();
                }

                return userFeed;
            }
        }

        public UserFeedItem UpdateUserFeedItem(string userName, UserFeedItemViewModel userFeedItemViewModel) {
            using (var ctx = new ReaderContext()) {
                // create user feed, if not exists
                var userFeedItem = ctx.UserFeedItems
                                        .Include(ufi => ufi.FeedItem)
                                        .Include(ufi => ufi.UserFeed)
                                        .First(ufi => ufi.UserFeedItemId == userFeedItemViewModel.UserFeedItemId);

                if (userFeedItem.UserFeed.UserName != userName) {
                    throw new ApplicationException("Invalid Feed Item.");
                }

                userFeedItem.IsRead = userFeedItemViewModel.IsRead;
                ctx.SaveChanges();

                return userFeedItem;
            }
        }
    }
}